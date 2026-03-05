import React, { useEffect } from 'react'

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null

  const colors = {
    success: { bg: 'var(--green-bg)', border: 'var(--green-border)', color: 'var(--green)', icon: '✅' },
    error: { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', icon: '❌' },
    info: { bg: 'var(--accent-glow)', border: 'rgba(59,130,246,0.3)', color: 'var(--accent2)', icon: 'ℹ️' },
  }
  const c = colors[type] || colors.info

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      background: 'var(--bg2)',
      border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.color}`,
      borderRadius: 'var(--radius-sm)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      boxShadow: 'var(--shadow)',
      animation: 'fadeIn 0.2s ease',
      maxWidth: '320px',
      width: 'calc(100vw - 48px)',
    }}>
      <span>{c.icon}</span>
      <span style={{ color: 'var(--text)', flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', color: 'var(--text3)', fontSize: '16px', padding: '2px' }}
      >×</button>
    </div>
  )
}
