import { useState } from 'react'
import { generateExplanation } from '../utils/subnetCalculator'

export default function ExplainPanel({ subnet }) {
  const [open, setOpen] = useState(true)
  if (!subnet) return null

  const steps = generateExplanation(subnet)

  return (
    <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 0, width: '100%',
        }}
      >
        <div className="section-title" style={{ margin: 0 }}>
          🔍 Motor de Explicación — AND Bit a Bit
        </div>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {open ? '▲ HIDE' : '▼ SHOW'}
        </span>
      </button>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ border: '1px solid rgba(255,0,85,0.2)', overflow: 'hidden' }}>
              <div style={{
                background: 'rgba(255,0,85,0.06)',
                padding: '0.5rem 0.75rem',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--neon-magenta)',
                borderLeft: '3px solid var(--neon-magenta)',
              }}>
                {step.titulo}
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '0.75rem' }}>
                <pre style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '0.75rem',
                  color: 'var(--neon-green)',
                  textShadow: '0 0 4px rgba(57,255,20,0.2)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  lineHeight: 1.7,
                  margin: 0,
                  overflowX: 'auto',
                }}>
                  {step.lineas.join('\n')}
                </pre>
              </div>
            </div>
          ))}

          {/* Resumen visual de bits por octeto */}
          <div style={{ background: 'var(--bg-color)', border: '1px solid rgba(0,240,255,0.12)', padding: '1rem' }}>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              // Resumen visual AND por octeto
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', overflowX: 'auto' }}>
              {[0, 1, 2, 3].map((o) => {
                const ipOct = subnet.ipBits.slice(o * 8, o * 8 + 8)
                const maskOct = subnet.maskBits.slice(o * 8, o * 8 + 8)
                const netOct = subnet.networkBits.slice(o * 8, o * 8 + 8)
                const cellStyle = (color, glow) => ({
                  width: '1.2rem', height: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontFamily: 'Share Tech Mono, monospace',
                  border: `1px solid ${color}40`,
                  background: `${color}15`,
                  color,
                  textShadow: glow ? `0 0 4px ${color}` : 'none',
                })

                return (
                  <div key={o} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Oct {o + 1}</span>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {ipOct.map((b, bi) => <span key={bi} style={cellStyle('var(--neon-cyan)', false)}>{b}</span>)}
                    </div>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: 'var(--text-muted)' }}>AND</span>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {maskOct.map((b, bi) => <span key={bi} style={cellStyle('rgba(255,255,255,0.3)', false)}>{b}</span>)}
                    </div>
                    <div style={{ width: '100%', height: '1px', background: 'rgba(0,240,255,0.2)' }} />
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {netOct.map((b, bi) => (
                        <span key={bi} style={b === 1 ? cellStyle('var(--neon-green)', true) : cellStyle('rgba(255,255,255,0.1)', false)}>{b}</span>
                      ))}
                    </div>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: 'var(--neon-green)' }}>= Red</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
