// src/lib/db.js — Todas las operaciones de base de datos con Supabase
import { supabase } from './supabase'

// ─── AUTH ──────────────────────────────────────────────────────────────────
export const auth = {
  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUp: (email, password) =>
    supabase.auth.signUp({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (cb) => supabase.auth.onAuthStateChange(cb),
}

// ─── SANITIZE ──────────────────────────────────────────────────────────────
const DATE_FIELDS = [
  'fecha_nacimiento', 'fecha_inicio', 'fecha_eclosion_esperada',
  'fecha', 'proxima_revision', 'fecha_vencimiento',
]

function sanitize(obj) {
  const result = { ...obj }
  for (const field of DATE_FIELDS) {
    if (field in result && result[field] === '') result[field] = null
  }
  return result
}

// ─── GENERIC CRUD ──────────────────────────────────────────────────────────
export const db = {
  get: async (table, userId) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  add: async (table, item, userId) => {
    const { id, ...rest } = item // strip any local id
    const { data, error } = await supabase
      .from(table)
      .insert({ ...sanitize(rest), user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  update: async (table, id, updates) => {
    const { user_id, created_at, ...safe } = updates
    const { data, error } = await supabase
      .from(table)
      .update(sanitize(safe))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  delete: async (table, id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
  },

  find: async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  },
}

// ─── STATS ─────────────────────────────────────────────────────────────────
export const getStats = (aves, alertas, reproducciones, ventas) => ({
  total: aves.length,
  machos: aves.filter(a => a.sexo === 'Macho').length,
  hembras: aves.filter(a => a.sexo === 'Hembra').length,
  pollitos: aves.filter(a => a.estado === 'Pollito').length,
  tratamiento: aves.filter(a => a.estado === 'Tratamiento').length,
  echadas: aves.filter(a => a.estado === 'Echada').length,
  razas: [...new Set(aves.map(a => a.raza))].length,
  alertas: (alertas || []).filter(a => a.estado === 'Pendiente').length,
  ventas_total: (ventas || []).reduce((s, v) => s + (v.precio || 0), 0),
  reproducciones_activas: (reproducciones || []).filter(r => r.estado === 'En Incubación').length,
})
