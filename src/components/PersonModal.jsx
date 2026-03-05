import React from 'react'
import { canManageVotantes, canToggleVote } from '../lib/supabase'

export default function PersonModal({ person, onClose, onToggleVote, onEdit, onDelete, loading, rol }) {
  if (!person) return null
  const voted   = person.voto === 'SI'
  const canCRUD = canManageVotantes(rol)
  const canVote = canToggleVote(rol)

  return (
    <>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
        <div style={{ background: 'var(--bg2)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '600px', padding: '24px', border: '1px solid var(--border)', borderBottom: 'none', maxHeight: '88vh', overflowY: 'auto', animation: 'slideUp 0.3s ease' }} onClick={e => e.stopPropagation()}>

          {/* Handle */}
          <div style={{ width: '36px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />

          {/* Encabezado */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', lineHeight: 1.2, marginBottom: '4px' }}>{person.nombres}</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>CC {person.num_cedula}</div>
              <div style={{ marginTop: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', border: '1px solid var(--border)', color: 'var(--text3)', background: 'var(--bg)' }}>
                  #{person.consecutivo}
                </span>
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', fontWeight: '600', padding: '6px 12px',
              borderRadius: '20px', border: '1px solid', whiteSpace: 'nowrap',
              color: voted ? 'var(--green)' : 'var(--red)',
              background: voted ? 'var(--green-bg)' : 'var(--red-bg)',
              borderColor: voted ? 'var(--green-border)' : 'var(--red-border)',
            }}>
              {voted ? '✅ Votó' : '⏳ Pendiente'}
            </div>
          </div>

          {/* Detalle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Responsable',      value: person.responsable },
              { label: 'Municipio',        value: person.municipio },
              { label: 'Puesto Votación',  value: person.puesto_votacion },
              { label: 'Mesa',             value: person.mesa, mono: true },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '11px' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: '3px' }}>{f.label}</div>
                <div style={{ fontSize: '14px', fontWeight: '500', fontFamily: f.mono ? 'var(--mono)' : undefined }}>{f.value || '—'}</div>
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '11px' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: '3px' }}>Dirección</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{person.direccion || '—'}</div>
            </div>
            {person.observacion && (
              <div style={{ gridColumn: '1 / -1', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '11px' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: '3px' }}>Observación</div>
                <div style={{ fontSize: '14px', color: 'var(--text2)' }}>{person.observacion}</div>
              </div>
            )}
          </div>

          {/* Botón marcar voto — visible para admin y general */}
          {canVote && (
            <button
              onClick={() => onToggleVote(person)} disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px',
                fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '10px',
                background: voted
                  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  : 'linear-gradient(135deg, #16a34a, #15803d)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : voted ? '0 4px 12px rgba(220,38,38,0.3)' : '0 4px 12px rgba(22,163,74,0.3)',
              }}
            >
              {loading ? '⏳ Actualizando...' : voted ? '↩ Deshacer voto' : '✓ Marcar que votó'}
            </button>
          )}

          {/* Acciones CRUD — solo admin */}
          {canCRUD ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button onClick={onClose} style={btnSecondary}>Cerrar</button>
              <button onClick={() => { onClose(); onEdit(person) }} style={btnBlue}>✏️ Editar</button>
              <button onClick={() => { onClose(); onDelete(person) }} style={btnRed}>🗑️ Eliminar</button>
            </div>
          ) : (
            <button onClick={onClose} style={{ ...btnSecondary, width: '100%' }}>Cerrar</button>
          )}
        </div>
      </div>
    </>
  )
}

const btnSecondary = { padding: '11px', borderRadius: '10px', background: 'var(--surface)', color: 'var(--text2)', fontSize: '13px', fontWeight: '600', border: '1px solid var(--border)' }
const btnBlue      = { padding: '11px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', color: 'var(--accent2)', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(59,130,246,0.3)' }
const btnRed       = { padding: '11px', borderRadius: '10px', background: 'var(--red-bg)', color: 'var(--red)', fontSize: '13px', fontWeight: '600', border: '1px solid var(--red-border)' }
