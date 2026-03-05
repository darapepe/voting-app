-- ============================================================
--  VotoTracker v3 - Esquema con 2 perfiles de usuario
--  Roles: 'admin' (CRUD completo) | 'general' (solo marcar voto)
--  Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. Tabla de votantes ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.votantes (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consecutivo     SERIAL UNIQUE NOT NULL,
    num_cedula      VARCHAR(20)  NOT NULL,
    nombres         VARCHAR(150) NOT NULL,
    responsable     VARCHAR(50)  NOT NULL CHECK (responsable IN ('Euclides', 'Rebeca', 'Nene')),
    puesto_votacion VARCHAR(150),
    mesa            VARCHAR(20),
    municipio       VARCHAR(100),
    direccion       TEXT,
    observacion     TEXT,
    voto            VARCHAR(3) NOT NULL DEFAULT 'NO' CHECK (voto IN ('SI', 'NO')),
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── 2. Tabla de perfiles de usuario ──────────────────────
--  rol: 'admin'   → puede agregar, editar y eliminar votantes
--  rol: 'general' → solo puede marcar/desmarcar el voto
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    num_cedula  VARCHAR(20)  NOT NULL UNIQUE,
    nombres     VARCHAR(150) NOT NULL,
    rol         VARCHAR(10)  NOT NULL DEFAULT 'general' CHECK (rol IN ('admin', 'general')),
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── 3. Índices ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_votantes_num_cedula  ON public.votantes (num_cedula);
CREATE INDEX IF NOT EXISTS idx_votantes_nombres     ON public.votantes (nombres);
CREATE INDEX IF NOT EXISTS idx_votantes_responsable ON public.votantes (responsable);
CREATE INDEX IF NOT EXISTS idx_votantes_voto        ON public.votantes (voto);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id     ON public.user_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_rol         ON public.user_profiles (rol);

-- ── 4. Trigger updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_votantes_updated_at
    BEFORE UPDATE ON public.votantes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. Helper: obtener rol del usuario actual ─────────────
CREATE OR REPLACE FUNCTION public.get_user_rol(uid UUID)
RETURNS TEXT AS $$
    SELECT rol FROM public.user_profiles
    WHERE user_id = uid AND activo = TRUE
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── 6. Row Level Security ─────────────────────────────────
ALTER TABLE public.votantes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Votantes: cualquier usuario autenticado con perfil activo puede leer
CREATE POLICY "votantes_select" ON public.votantes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.user_profiles
                WHERE user_id = auth.uid() AND activo = TRUE)
    );

-- Votantes: solo admins pueden INSERTAR
CREATE POLICY "votantes_insert" ON public.votantes
    FOR INSERT WITH CHECK (
        public.get_user_rol(auth.uid()) = 'admin'
    );

-- Votantes UPDATE:
--   • admin  → puede actualizar cualquier campo
--   • general → solo puede actualizar el campo 'voto'
CREATE POLICY "votantes_update_admin" ON public.votantes
    FOR UPDATE USING (
        public.get_user_rol(auth.uid()) = 'admin'
    );

CREATE POLICY "votantes_update_general" ON public.votantes
    FOR UPDATE USING (
        public.get_user_rol(auth.uid()) = 'general'
    )
    WITH CHECK (
        public.get_user_rol(auth.uid()) = 'general'
    );

-- Votantes: solo admins pueden ELIMINAR
CREATE POLICY "votantes_delete" ON public.votantes
    FOR DELETE USING (
        public.get_user_rol(auth.uid()) = 'admin'
    );

-- Perfiles: cada usuario solo puede ver su propio perfil
CREATE POLICY "profiles_select_own" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- ── 7. Realtime ───────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.votantes;

-- ============================================================
--  CREAR USUARIOS
--
--  PASO 1 — En Supabase Dashboard > Authentication > Users > Add user
--    Email:    {cedula}@vototracker.app   (ej: 1023456789@vototracker.app)
--    Password: contraseña segura
--    ✅ Auto Confirm User
--
--  PASO 2 — Copiar el UUID generado y ejecutar:
--
--  Para un ADMIN:
--  INSERT INTO public.user_profiles (user_id, num_cedula, nombres, rol)
--  VALUES ('UUID-COPIADO', '1023456789', 'NOMBRE ADMIN', 'admin');
--
--  Para un usuario GENERAL:
--  INSERT INTO public.user_profiles (user_id, num_cedula, nombres, rol)
--  VALUES ('UUID-COPIADO', '9876543210', 'NOMBRE USUARIO', 'general');
-- ============================================================

-- ── Script de verificación ────────────────────────────────
-- SELECT au.email, up.nombres, up.rol, up.activo
-- FROM auth.users au
-- JOIN public.user_profiles up ON up.user_id = au.id
-- ORDER BY up.rol, up.nombres;

-- ============================================================
--  DATOS DE EJEMPLO
-- ============================================================
INSERT INTO public.votantes
    (num_cedula, nombres, responsable, puesto_votacion, mesa, municipio, direccion, observacion, voto)
VALUES
    ('1023456789','CARLOS ANDRÉS MARTÍNEZ LÓPEZ',   'Euclides','IE Simón Bolívar',     '001','Bogotá',      'Cra 15 # 45-20',      NULL,                     'NO'),
    ('1098765432','MARÍA FERNANDA GÓMEZ RUIZ',       'Rebeca',  'Colegio La Merced',    '003','Medellín',    'Cll 80 # 30-10',      'Necesita transporte',    'SI'),
    ('1145678901','JUAN PABLO RODRÍGUEZ SILVA',      'Nene',    'IE General Santander', '005','Cali',        'Av 3N # 12-50',       NULL,                     'NO'),
    ('1167890123','ANA LUCÍA TORRES HERRERA',        'Euclides','IE Simón Bolívar',     '001','Bogotá',      'Cra 20 # 60-15',      'Llamar con anticipación','SI'),
    ('1189012345','PEDRO ANTONIO VARGAS MORA',       'Rebeca',  'Colegio La Merced',    '002','Medellín',    'Cll 50 # 45-30',      NULL,                     'NO'),
    ('1201234567','LAURA PATRICIA DÍAZ JIMÉNEZ',     'Nene',    'IE General Santander', '006','Cali',        'Transversal 5 # 20-8',NULL,                     'SI'),
    ('1223456789','SANTIAGO ALBERTO PÉREZ CASTRO',   'Euclides','IE Técnica Industrial','002','Barranquilla','Cll 72 # 50-20',      'Adulto mayor',           'NO'),
    ('1245678901','VALENTINA SOFÍA MUÑOZ REYES',     'Rebeca',  'Colegio Nacional',     '004','Cartagena',   'Av del Lago # 10-15', NULL,                     'NO'),
    ('1267890123','ANDRÉS FELIPE CASTILLO RAMOS',    'Nene',    'IE Simón Bolívar',     '003','Bogotá',      'Cra 8 # 35-40',       NULL,                     'SI'),
    ('1289012345','DANIELA ALEJANDRA RÍOS SUÁREZ',   'Euclides','IE Técnica Industrial','003','Barranquilla','Cll 45 # 30-10',      'Tiene discapacidad',     'NO'),
    ('1301234567','CAMILO ESTEBAN MENDOZA VEGA',     'Rebeca',  'Colegio La Merced',    '005','Medellín',    'Cra 65 # 80-25',      NULL,                     'SI'),
    ('1323456789','ISABELA CAROLINA ROMERO FUENTES', 'Nene',    'IE General Santander', '007','Cali',        'Cll 25N # 8-30',      NULL,                     'NO'),
    ('1345678901','SEBASTIÁN MAURICIO ÁLVAREZ PONCE','Euclides','IE Simón Bolívar',     '004','Bogotá',      'Diagonal 40 # 15-20', NULL,                     'SI'),
    ('1367890123','NATALIA PAOLA GUERRERO ORTIZ',    'Rebeca',  'Colegio Nacional',     '001','Cartagena',   'Cll 32 # 22-10',      'Pendiente confirmar',    'NO'),
    ('1389012345','DAVID ALEJANDRO MORA PIZARRO',    'Nene',    'IE Técnica Industrial','004','Barranquilla','Av Circunvalar 50',   NULL,                     'SI');

SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE voto='SI') AS votaron,
       COUNT(*) FILTER (WHERE voto='NO') AS pendientes
FROM public.votantes;
