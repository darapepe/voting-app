# 🗳️ VotoTracker v3 — Control Electoral con Roles

## 🔐 Perfiles de usuario

| Rol | Icono | Puede hacer |
|-----|-------|-------------|
| **admin** | 👑 | Ver estadísticas · Consultar votantes · Marcar voto · **Agregar · Editar · Eliminar** |
| **general** | 🗳️ | Ver estadísticas · Consultar votantes · **Marcar/desmarcar voto** |

---

## 🚀 Setup en 5 pasos

### 1. Instalar y configurar
```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### 2. Ejecutar el SQL
En Supabase Dashboard → **SQL Editor** → pegar y ejecutar `schema.sql`

### 3. Crear usuarios en Supabase Auth
Dashboard → Authentication → Users → **Add user**
- Email: `{cedula}@vototracker.app`   *(ej: `1023456789@vototracker.app`)*
- Password: contraseña segura
- ✅ Auto Confirm User

### 4. Asignar perfil y rol (SQL Editor)

**Admin:**
```sql
INSERT INTO public.user_profiles (user_id, num_cedula, nombres, rol)
VALUES (
  'UUID-COPIADO-DE-AUTH',   -- UUID del usuario
  '1023456789',              -- su cédula
  'NOMBRE COMPLETO',
  'admin'
);
```

**Usuario general:**
```sql
INSERT INTO public.user_profiles (user_id, num_cedula, nombres, rol)
VALUES (
  'UUID-COPIADO-DE-AUTH',
  '9876543210',
  'NOMBRE COMPLETO',
  'general'
);
```

### 5. Publicar en Vercel
```bash
vercel --prod
# O conectar el repo de GitHub en vercel.com
# Agregar en Environment Variables:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
```

---

## 🗄️ Estructura de tablas

### `votantes`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| consecutivo | SERIAL | Número correlativo |
| num_cedula | VARCHAR | Cédula del votante |
| nombres | VARCHAR | Nombre completo |
| responsable | VARCHAR | Euclides / Rebeca / Nene |
| puesto_votacion | VARCHAR | Nombre del puesto |
| mesa | VARCHAR | Número de mesa |
| municipio | VARCHAR | Ciudad |
| direccion | TEXT | Dirección del puesto |
| observacion | TEXT | Notas |
| voto | VARCHAR | SI / NO |

### `user_profiles`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| user_id | UUID | Referencia a auth.users |
| num_cedula | VARCHAR | Cédula del operador |
| nombres | VARCHAR | Nombre del operador |
| rol | VARCHAR | `admin` o `general` |
| activo | BOOLEAN | Para desactivar acceso sin borrar |

---

## ⚙️ Stack
React 18 · Vite 5 · Supabase (Auth + Realtime + RLS) · Vercel
