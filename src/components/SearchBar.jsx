import React from 'react'

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px',
  },
  inputWrap: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text3)',
    pointerEvents: 'none',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    fontSize: '14px',
    padding: '11px 12px 11px 38px',
    transition: 'border-color 0.2s',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  select: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    fontSize: '13px',
    padding: '10px 12px',
    appearance: 'none',
    cursor: 'pointer',
  },
}

export default function SearchBar({ filters, onChange }) {
  const handleInput = (e) => onChange({ ...filters, [e.target.name]: e.target.value })

  return (
    <div style={styles.wrapper}>
      <div style={styles.inputWrap}>
        <span style={styles.icon}>🔍</span>
        <input
          style={styles.input}
          type="text"
          name="search"
          placeholder="Buscar por nombre o cédula..."
          value={filters.search}
          onChange={handleInput}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
      <div style={styles.row}>
        <select
          style={styles.select}
          name="responsable"
          value={filters.responsable}
          onChange={handleInput}
        >
          <option value="">Todos los responsables</option>
          <option>Euclides</option>
          <option>Rebeca</option>
          <option>Nene</option>
        </select>
        <select
          style={styles.select}
          name="voto"
          value={filters.voto}
          onChange={handleInput}
        >
          <option value="">Todos los estados</option>
          <option value="SI">✅ Votaron</option>
          <option value="NO">⏳ Pendientes</option>
        </select>
      </div>
    </div>
  )
}
