import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginScreen({ onLogin }) {
  const [cedula, setCedula]   = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async () => {
    if (!cedula.trim() || !password) { setError('Completa todos los campos'); return }
    setLoading(true)
    setError('')
    try {
      const email = `${cedula.trim()}@vototracker.app`
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) throw authErr

      // Cargar perfil con rol
      const { data: profile, error: profErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('activo', true)
        .single()

      if (profErr || !profile) throw new Error('Usuario sin perfil asignado. Contacta al administrador.')
      onLogin({ user: data.user, profile })
    } catch (e) {
      const msg = e.message
      setError(
        msg === 'Invalid login credentials'
          ? 'Cédula o contraseña incorrectos'
          : msg
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  const ROLE_INFO = [
    { icon: '👑', label: 'Admin', desc: 'Agregar · Editar · Eliminar' },
    { icon: '🗳️', label: 'General', desc: 'Marcar votos' },
  ]

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      {/* Decoración de fondo */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-15%', width: '55vw', height: '55vw', maxWidth: '420px', maxHeight: '420px', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '45vw', height: '45vw', maxWidth: '360px', maxHeight: '360px', background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '380px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '68px', height: '68px',
            background: 'linear-gradient(135deg, var(--accent), #1d4ed8)',
            borderRadius: '20px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '30px', margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
          }}>🗳️</div>
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em' }}>VotoTracker</div>
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '4px' }}>Panel de Control Electoral</div>
        </div>

        {/* Card de login */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px 24px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Iniciar Sesión</div>
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '24px' }}>Solo personal autorizado</div>

          {/* Cédula */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Número de Cédula</label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>🪪</span>
              <input
                type="number" placeholder="Ej: 1023456789"
                value={cedula} onChange={e => setCedula(e.target.value)} onKeyDown={handleKey}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>🔒</span>
              <input
                type={showPass ? 'text' : 'password'} placeholder="digite su clave"
                value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text3)', fontSize: '15px', padding: '4px' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--red)', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Botón */}
          <button
            onClick={handleSubmit} disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700', color: '#fff',
              background: loading ? 'var(--surface2)' : 'linear-gradient(135deg, var(--accent), #1d4ed8)',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(59,130,246,0.35)',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            }}
          >{loading ? '⏳ Verificando...' : '→ Ingresar'}</button>
        </div>

        {/* Info de perfiles */}
        {/* <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {ROLE_INFO.map(r => (
            <div key={r.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{r.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>{r.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{r.desc}</div>
            </div>
          ))}
        </div> */}

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: 'var(--text3)' }}>
          Acceso restringido · Solo personal autorizado
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: '11px', fontWeight: '600', color: 'var(--text2)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }
const iconStyle  = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none' }
const inputStyle = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '15px', padding: '12px 12px 12px 38px', transition: 'border-color 0.2s', fontFamily: 'var(--font)' }
