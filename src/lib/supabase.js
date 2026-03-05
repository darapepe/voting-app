import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY a tu archivo .env')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Roles disponibles
export const ROLES = {
  ADMIN:   'admin',
  GENERAL: 'general',
}

// Helpers de permisos
export const canManageVotantes = (rol) => rol === ROLES.ADMIN    // agregar, editar, eliminar
export const canToggleVote     = (rol) => rol === ROLES.ADMIN || rol === ROLES.GENERAL
