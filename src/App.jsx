import { useState, useMemo, useEffect, useRef } from 'react'
import BitVisualizer from './components/BitVisualizer'
import ResultTable from './components/ResultTable'
import ExplainPanel from './components/ExplainPanel'
import VLSMPlanner from './components/VLSMPlanner'
import { calcSubnet, isValidIP, isValidCIDR } from './utils/subnetCalculator'

const TABS = [
  { id: 'calculator', label: 'Subnet Calc' },
  { id: 'vlsm', label: 'VLSM Planner' },
]

function UptimeClock() {
  const [time, setTime] = useState({ days: 0, hr: 0, min: 0, sec: 0 })
  const start = useRef(Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start.current) / 1000)
      setTime({
        days: Math.floor(elapsed / 86400),
        hr: Math.floor((elapsed % 86400) / 3600),
        min: Math.floor((elapsed % 3600) / 60),
        sec: elapsed % 60,
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const p = (n, l = 2) => String(n).padStart(l, '0')
  return (
    <span style={{ color: 'var(--neon-cyan)', fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', letterSpacing: '0.05em', textShadow: '0 0 8px rgba(0,240,255,0.5)' }}>
      {p(time.days, 3)}:{p(time.hr)}:{p(time.min)}:{p(time.sec)}
    </span>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [ip, setIP] = useState('192.168.1.1')
  const [cidr, setCIDR] = useState(24)

  const subnet = useMemo(() => {
    if (!isValidIP(ip) || !isValidCIDR(cidr)) return null
    return calcSubnet(ip, cidr)
  }, [ip, cidr])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid rgba(0,240,255,0.2)',
        background: 'rgba(12,12,18,0.95)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 30px rgba(0,240,255,0.06)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 0', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Logo + título */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '2.2rem', height: '2.2rem',
                border: '1px solid var(--neon-cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(0,240,255,0.3)',
                fontSize: '1rem',
                flexShrink: 0,
              }}>⚛</div>
              <div>
                <h1 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#fff',
                  textShadow: '1px 1px 0 var(--neon-magenta)',
                  margin: 0,
                  lineHeight: 1.2,
                }}>
                  Interactive Network Lab
                </h1>
                <p style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '0.65rem',
                  color: 'var(--neon-cyan)',
                  margin: 0,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  Subnet Calculator // VLSM Engine
                </p>
              </div>
            </div>

            {/* Badge ONLINE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 6px var(--neon-green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span className="cyber-badge cyber-badge-cyan" style={{ display: 'none' }}>Online</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'var(--neon-green)', letterSpacing: '0.1em' }}>ONLINE</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.6rem 1.25rem',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  textShadow: activeTab === tab.id ? '0 0 8px rgba(0,240,255,0.5)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {activeTab === 'calculator' && (
          <>
            <BitVisualizer ip={ip} cidr={cidr} onIPChange={setIP} onCIDRChange={setCIDR} />

            {subnet && (
              <div className="section-card">
                <div className="section-title">⚡ Resumen Rápido</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'Dir. de Red', value: subnet.networkAddress, color: 'var(--neon-cyan)' },
                    { label: 'Máscara', value: subnet.mask, color: 'var(--text-main)' },
                    { label: 'Primer Host', value: subnet.firstHost, color: '#93c5fd' },
                    { label: 'Último Host', value: subnet.lastHost, color: '#93c5fd' },
                    { label: 'Broadcast', value: subnet.broadcast, color: 'var(--neon-magenta)' },
                    { label: 'Hosts Usables', value: subnet.totalHosts.toLocaleString('es'), color: 'var(--neon-green)' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: 'var(--panel-bg-alt)',
                      border: '1px solid rgba(0,240,255,0.1)',
                      padding: '0.6rem 0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</span>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: item.color, textShadow: item.color !== 'var(--text-main)' ? `0 0 6px ${item.color}40` : 'none' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subnet && <ResultTable subnets={[subnet]} showName={false} title="Tabla de Subred" />}
            {subnet && <ExplainPanel subnet={subnet} />}

            {!subnet && ip !== '' && (
              <div className="section-card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem' }}>
                &gt; ESPERANDO INPUT VÁLIDO // IP + CIDR [1-30]_
              </div>
            )}
          </>
        )}

        {activeTab === 'vlsm' && <VLSMPlanner />}
      </main>

      {/* ── Footer con créditos ── */}
      <footer style={{
        borderTop: '1px solid rgba(0,240,255,0.15)',
        background: 'rgba(10,10,12,0.95)',
        padding: '1.25rem 1rem',
        marginTop: 'auto',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>

          {/* Crédito principal */}
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            DEVELOPED BY{' '}
            <span style={{ color: 'var(--neon-cyan)', textShadow: '0 0 8px rgba(0,240,255,0.5)', fontWeight: 700 }}>
              Carlos G
            </span>
            {' // '}
            <a
              href="https://github.com/Owito/interactive-network-lab"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--neon-magenta)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.target.style.textShadow = '0 0 10px rgba(255,0,85,0.7)' }}
              onMouseLeave={e => { e.target.style.textShadow = 'none' }}
            >
              github.com/Owito/interactive-network-lab
            </a>
          </div>

          {/* Stack + uptime */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              MIT LICENSE · ipaddr.js · React · Tailwind CSS
            </span>
            <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.65rem' }}>|</span>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              UPTIME: <UptimeClock />
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
