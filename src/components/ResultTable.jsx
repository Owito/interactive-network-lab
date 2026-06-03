export default function ResultTable({ subnets = [], showName = false, title = 'Resultado' }) {
  if (!subnets || subnets.length === 0) return null

  return (
    <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="section-title">📋 {title}</div>

      <div style={{ overflowX: 'auto', border: '1px solid rgba(0,240,255,0.15)', boxShadow: '0 0 20px rgba(0,240,255,0.04)' }}>
        <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', fontFamily: 'Share Tech Mono, monospace', minWidth: '560px' }}>
          <thead>
            <tr style={{ background: 'rgba(0,240,255,0.05)', borderBottom: '1px solid rgba(0,240,255,0.2)' }}>
              {['#', showName && 'Nombre', showName && 'Hosts req.', 'Dir. de Red', 'Máscara', 'Primer Host', 'Último Host', 'Broadcast', 'Hosts usables']
                .filter(Boolean)
                .map((h, i) => (
                  <th key={i} style={{
                    padding: '0.6rem 0.75rem',
                    textAlign: i === (showName ? 8 : 6) ? 'right' : 'left',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '0.58rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--neon-cyan)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {subnets.map((s, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? 'var(--panel-bg-alt)' : 'var(--panel-bg)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--panel-bg-alt)' : 'var(--panel-bg)'}
              >
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                {showName && (
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--neon-cyan)', fontWeight: 600 }}>
                    {s.name || '—'}
                  </td>
                )}
                {showName && (
                  <td style={{ padding: '0.5rem 0.75rem', color: '#fbbf24' }}>
                    {s.hostsRequired?.toLocaleString('es') || '—'}
                  </td>
                )}
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--neon-cyan)', textShadow: '0 0 6px rgba(0,240,255,0.3)' }}>
                  {s.networkAddress}/{s.cidr}
                </td>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-main)' }}>{s.mask}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#93c5fd' }}>{s.firstHost}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#93c5fd' }}>{s.lastHost}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--neon-magenta)', textShadow: '0 0 6px rgba(255,0,85,0.3)' }}>
                  {s.broadcast}
                </td>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--neon-green)', textAlign: 'right', textShadow: '0 0 6px rgba(57,255,20,0.3)' }}>
                  {s.totalHosts.toLocaleString('es')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
