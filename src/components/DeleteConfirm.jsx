import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DeleteConfirm({ person, onClose, onDeleted, onToast }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from('votantes').delete().eq('id', person.id)
      if (error) throw error
      onToast({ message: `🗑️ ${person.nombres} eliminado`, type: 'info' })
      onDeleted(person.id)
      onClose()
    } catch (e) {
      onToast({ message: '❌ Error: ' + e.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', backdropFilter: 'blur(4px)',
    }}
      onClick={onClose}
    >
      <div style={{
        background: 'var(--bg2)', borderRadius: '16px',
        width: '100%', maxWidth: '360px', padding: '24px',
        border: '1px solid var(--red-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.2s ease',
      }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
          <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>
            Eliminar votante
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.5 }}>
            ¿Estás seguro de eliminar a<br />
            <strong style={{ color: 'var(--text)' }}>{person.nombres}</strong>?<br />
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Esta acción no se puede deshacer.</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{ padding: '12px', borderRadius: '10px', background: 'var(--surface)', color: 'var(--text2)', fontSize: '14px', fontWeight: '600', border: '1px solid var(--border)' }}
          >Cancelar</button>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', color: '#fff',
              background: loading ? 'var(--surface2)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳...' : '🗑️ Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
