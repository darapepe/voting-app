import React, { useState, useEffect, useMemo } from 'react'
import { supabase, ROLES, canManageVotantes } from './lib/supabase'
import LoginScreen  from './components/LoginScreen'
import StatsCards   from './components/StatsCards'
import SearchBar    from './components/SearchBar'
import PersonGrid   from './components/PersonGrid'
import PersonModal  from './components/PersonModal'
import VotanteForm  from './components/VotanteForm'
import DeleteConfirm from './components/DeleteConfirm'
import Toast        from './components/Toast'

const TAB_STATS = 'stats'
const TAB_LIST  = 'list'

// Colores e iconos por rol
const ROL_META = {
  admin:   { icon: '👑', label: 'Administrador', color: 'var(--amber)' },
  general: { icon: '🗳️', label: 'General',       color: 'var(--accent2)' },
}

export default function App() {
  const [session,     setSession]     = useState(null)
  const [profile,     setProfile]     = useState(null)   // { rol, nombres, ... }
  const [authLoading, setAuthLoading] = useState(true)

  const [tab,     setTab]     = useState(TAB_STATS)
  const [people,  setPeople]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [selected,     setSelected]     = useState(null)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showForm,     setShowForm]     = useState(false)

  const [updating, setUpdating] = useState(false)
  const [toast,    setToast]    = useState({ message: '', type: 'info' })
  const [filters,  setFilters]  = useState({ search: '', responsable: '', voto: '' })

  // ── Auth ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) fetchProfile(s.user.id)
      else { setProfile(null); setAuthLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .single()
    setProfile(data || null)
    setAuthLoading(false)
  }

  const handleLogin  = ({ user, profile }) => { setSession({ user }); setProfile(profile) }
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  // ── Datos ─────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true); setError(null)
    try {
      const { data, error: err } = await supabase
        .from('votantes').select('*').order('consecutivo', { ascending: true })
      if (err) throw err
      setPeople(data || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (session) loadData() }, [session])

  // Realtime
  useEffect(() => {
    if (!session) return
    const ch = supabase.channel('votantes-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votantes' }, ({ eventType, new: n, old: o }) => {
        if (eventType === 'UPDATE') {
          setPeople(p => p.map(x => x.id === n.id ? n : x))
          setSelected(p => p?.id === n.id ? n : p)
        }
        if (eventType === 'INSERT') setPeople(p => [...p, n].sort((a, b) => a.consecutivo - b.consecutivo))
        if (eventType === 'DELETE') setPeople(p => p.filter(x => x.id !== o.id))
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [session])

  // ── Filtros ───────────────────────────────────────────────
  const filtered = useMemo(() => people.filter(p => {
    const q = filters.search.toLowerCase()
    return (
      (!q || p.nombres?.toLowerCase().includes(q) || p.num_cedula?.includes(q)) &&
      (!filters.responsable || p.responsable === filters.responsable) &&
      (!filters.voto || p.voto === filters.voto)
    )
  }), [people, filters])

  // ── Acciones ──────────────────────────────────────────────
  const handleToggleVote = async (person) => {
    setUpdating(true)
    const newVoto = person.voto === 'SI' ? 'NO' : 'SI'
    try {
      const { error: err } = await supabase
        .from('votantes').update({ voto: newVoto }).eq('id', person.id)
      if (err) throw err
      setPeople(p => p.map(x => x.id === person.id ? { ...x, voto: newVoto } : x))
      setSelected(p => p ? { ...p, voto: newVoto } : null)
      setToast({ message: newVoto === 'SI' ? `✅ ${person.nombres} marcado como votante` : `↩ ${person.nombres} marcado como pendiente`, type: newVoto === 'SI' ? 'success' : 'info' })
      if (newVoto === 'SI') setSelected(null)
    } catch (e) {
      setToast({ message: 'Error: ' + e.message, type: 'error' })
    } finally { setUpdating(false) }
  }

  const handleSaved   = (data, isEdit) => {
    if (isEdit) setPeople(p => p.map(x => x.id === data.id ? data : x))
    else setPeople(p => [...p, data].sort((a, b) => a.consecutivo - b.consecutivo))
  }
  const handleDeleted = (id) => setPeople(p => p.filter(x => x.id !== id))

  // ── Guards ────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗳️</div>
        <div style={{ fontSize: '14px' }}>Cargando...</div>
      </div>
    </div>
  )

  if (!session || !profile) return <LoginScreen onLogin={handleLogin} />

  const rol      = profile.rol
  const rolMeta  = ROL_META[rol] || ROL_META.general
  const isAdmin  = canManageVotantes(rol)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', maxWidth: '100%', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,14,26,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          {/* Logo + perfil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, var(--accent), #2563eb)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>🗳️</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.02em' }}>VotoTracker</div>
              {/* Badge de rol */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', background: `${rolMeta.color}18`, color: rolMeta.color, border: `1px solid ${rolMeta.color}33`, marginTop: '2px' }}>
                {rolMeta.icon} {rolMeta.label}
              </div>
            </div>
          </div>

          {/* Acciones del header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAdmin && (
              <button
                onClick={() => { setEditTarget(null); setShowForm(true) }}
                style={{ background: 'linear-gradient(135deg, var(--accent), #1d4ed8)', color: '#fff', borderRadius: '8px', padding: '7px 13px', fontSize: '12px', fontWeight: '700', boxShadow: '0 2px 8px rgba(59,130,246,0.35)' }}
              >+ Agregar</button>
            )}
            <button
              onClick={handleLogout} title="Cerrar sesión"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text3)', padding: '7px 10px', fontSize: '13px' }}
            >⎋</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex' }}>
          {[{ id: TAB_STATS, label: '📊 Estadísticas' }, { id: TAB_LIST, label: '👥 Votantes' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '10px', background: 'none', fontSize: '13px', fontWeight: '600', color: tab === t.id ? 'var(--accent2)' : 'var(--text3)', borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`, transition: 'all 0.2s', textAlign: 'center' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ flex: 1, padding: '12px clamp(8px, 3vw, 20px)', paddingBottom: '32px' }}>
        {error && (
          <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '16px', fontSize: '14px', color: 'var(--red)', marginBottom: '16px', textAlign: 'center' }}>
            ⚠️ {error}
            <br /><button onClick={loadData} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', marginTop: '8px' }}>Reintentar</button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: '72px', borderRadius: 'var(--radius)' }} className="skeleton" />)}
          </div>
        ) : tab === TAB_STATS ? (
          <StatsCards data={people} />
        ) : (
          <>
            <SearchBar filters={filters} onChange={setFilters} />
            <PersonGrid people={filtered} onSelect={setSelected} />
          </>
        )}
      </div>

      {/* ── Modales ── */}
      {selected && (
        <PersonModal
          person={selected}
          onClose={() => setSelected(null)}
          onToggleVote={handleToggleVote}
          onEdit={(p) => { setEditTarget(p); setShowForm(true) }}
          onDelete={(p) => setDeleteTarget(p)}
          loading={updating}
          rol={rol}
        />
      )}

      {showForm && (
        <VotanteForm
          votante={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSaved={handleSaved}
          onToast={setToast}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          person={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
          onToast={setToast}
        />
      )}

      {toast.message && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
      )}
    </div>
  )
}
