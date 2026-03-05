import React from 'react'

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text2)',
    marginBottom: '6px',
  },
  value: {
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: 'var(--mono)',
    lineHeight: 1,
  },
  sub: {
    fontSize: '12px',
    color: 'var(--text3)',
    marginTop: '4px',
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    borderRadius: '0 3px 0 0',
    transition: 'width 0.8s ease',
  },
  progressRow: {
    gridColumn: '1 / -1',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '13px',
    color: 'var(--text2)',
  },
  progressTrack: {
    height: '8px',
    background: 'var(--bg)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--green), #16a34a)',
    borderRadius: '4px',
    transition: 'width 1s ease',
  },
}

export default function StatsCards({ data }) {
  const total = data.length
  const voted = data.filter(p => p.voto === 'SI').length
  const notVoted = data.filter(p => p.voto === 'NO').length
  const pct = total > 0 ? Math.round((voted / total) * 100) : 0

  const responsables = ['Euclides', 'Rebeca', 'Nene']
  const byResp = responsables.map(r => ({
    name: r,
    voted: data.filter(p => p.responsable === r && p.voto === 'SI').length,
    total: data.filter(p => p.responsable === r).length,
  }))

  return (
    <div>
      <div style={styles.grid}>
        <div style={styles.card} className="fade-in">
          <div style={styles.label}>Total</div>
          <div style={{ ...styles.value, color: 'var(--accent2)' }}>{total}</div>
          <div style={styles.sub}>registrados</div>
          <div style={{ ...styles.bar, width: '100%', background: 'var(--accent)' }} />
        </div>
        <div style={styles.card} className="fade-in">
          <div style={styles.label}>Votaron</div>
          <div style={{ ...styles.value, color: 'var(--green)' }}>{voted}</div>
          <div style={styles.sub}>{pct}% del total</div>
          <div style={{ ...styles.bar, width: `${pct}%`, background: 'var(--green)' }} />
        </div>
        <div style={styles.card} className="fade-in">
          <div style={styles.label}>Pendientes</div>
          <div style={{ ...styles.value, color: 'var(--red)' }}>{notVoted}</div>
          <div style={styles.sub}>{100 - pct}% del total</div>
          <div style={{ ...styles.bar, width: `${100 - pct}%`, background: 'var(--red)' }} />
        </div>
        <div style={styles.card} className="fade-in">
          <div style={styles.label}>Participación</div>
          <div style={{ ...styles.value, color: 'var(--amber)' }}>{pct}%</div>
          <div style={styles.sub}>efectividad</div>
          <div style={{ ...styles.bar, width: `${pct}%`, background: 'var(--amber)' }} />
        </div>

        <div style={styles.progressRow} className="fade-in">
          <div style={styles.progressLabel}>
            <span>Progreso de votación</span>
            <span style={{ fontWeight: 600, color: 'var(--green)' }}>{voted} / {total}</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Por responsable */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: '10px' }}>
          Por responsable
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {byResp.map(r => {
            const p = r.total > 0 ? Math.round((r.voted / r.total) * 100) : 0
            return (
              <div key={r.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{r.name}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{r.voted}/{r.total} <span style={{ color: 'var(--green)' }}>({p}%)</span></span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 1s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
