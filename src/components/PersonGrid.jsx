import React from 'react'

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    overflow: 'hidden',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: '0 0 8px',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '3px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text2)',
    flexWrap: 'wrap',
  },
  metaChip: {
    background: 'var(--bg2)',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    border: '1px solid var(--border)',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    border: '1px solid',
    flexShrink: 0,
  },
  consec: {
    fontSize: '11px',
    fontFamily: 'var(--mono)',
    color: 'var(--text3)',
    position: 'absolute',
    top: '8px',
    right: '8px',
  },
  empty: {
    textAlign: 'center',
    padding: '48px 24px',
    color: 'var(--text3)',
  },
  emptyIcon: { fontSize: '32px', marginBottom: '12px' },
  emptyText: { fontSize: '14px' },
  count: {
    fontSize: '12px',
    color: 'var(--text3)',
    marginBottom: '10px',
    textAlign: 'right',
  },
}

export default function PersonGrid({ people, onSelect }) {
  if (!people.length) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🔍</div>
        <div style={styles.emptyText}>No se encontraron resultados</div>
      </div>
    )
  }

  return (
    <div>
      <div style={styles.count}>{people.length} personas</div>
      <div style={styles.wrapper}>
        {people.map((p, i) => {
          const voted = p.voto === 'SI'
          return (
            <div
              key={p.id}
              style={{
                ...styles.card,
                borderLeftColor: voted ? 'var(--green)' : 'var(--red)',
                borderLeftWidth: '3px',
                animationDelay: `${i * 0.03}s`,
              }}
              className="fade-in"
              onClick={() => onSelect(p)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <div style={{
                ...styles.dot,
                background: voted ? 'var(--green)' : 'var(--red)',
                boxShadow: `0 0 8px ${voted ? 'var(--green)' : 'var(--red)'}`,
              }} />
              <div style={styles.main}>
                <div style={styles.name}>{p.nombres}</div>
                <div style={styles.meta}>
                  <span style={styles.metaChip}>{p.responsable}</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>CC {p.num_cedula}</span>
                  {p.municipio && <span>{p.municipio}</span>}
                </div>
              </div>
              <div style={{
                ...styles.badge,
                color: voted ? 'var(--green)' : 'var(--red)',
                background: voted ? 'var(--green-bg)' : 'var(--red-bg)',
                borderColor: voted ? 'var(--green-border)' : 'var(--red-border)',
              }}>
                {voted ? 'Votó' : 'Pendiente'}
              </div>
              <div style={styles.consec}>#{p.consecutivo}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
