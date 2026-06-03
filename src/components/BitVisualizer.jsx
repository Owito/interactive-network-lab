import { useMemo } from 'react'
import { toBinary32, getMaskBinary, isValidIP } from '../utils/subnetCalculator'

export default function BitVisualizer({ ip, cidr, onIPChange, onCIDRChange }) {
  const valid = isValidIP(ip)

  const ipBits = useMemo(() => {
    if (!valid) return Array(32).fill(0)
    return toBinary32(ip)
  }, [ip, valid])

  const maskBits = useMemo(() => getMaskBinary(cidr), [cidr])

  // Octetos para desktop
  const octets = useMemo(() => [0, 1, 2, 3].map((o) => ({
    label: `Oct ${o + 1}`,
    ipBits: ipBits.slice(o * 8, o * 8 + 8),
    maskBits: maskBits.slice(o * 8, o * 8 + 8),
    startIdx: o * 8,
  })), [ipBits, maskBits])

  return (
    <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="section-title">⬛ Bit-Wise Visualizer — IPv4 /{cidr}</div>

      {/* ── Inputs ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
        {/* IP input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 160px', maxWidth: '200px' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Dirección IP
          </label>
          <input
            type="text"
            value={ip}
            onChange={(e) => onIPChange(e.target.value)}
            placeholder="192.168.1.1"
            className={`input-base ${!valid && ip !== '' ? 'input-error' : ''}`}
          />
          {!valid && ip !== '' && (
            <span style={{ color: 'var(--neon-magenta)', fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace' }}>
              &gt; IP_INVÁLIDA
            </span>
          )}
        </div>

        {/* CIDR slider + number */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Prefijo CIDR:{' '}
            <span style={{ color: 'var(--neon-cyan)', textShadow: '0 0 6px rgba(0,240,255,0.5)' }}>/{cidr}</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="range" min={1} max={30} value={cidr}
              onChange={(e) => onCIDRChange(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--neon-cyan)', cursor: 'pointer' }}
            />
            <input
              type="number" min={1} max={30} value={cidr}
              onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= 30) onCIDRChange(v) }}
              className="input-base"
              style={{ width: '4rem', textAlign: 'center' }}
            />
          </div>
        </div>
      </div>

      {/* ── Leyenda ── */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Share Tech Mono, monospace' }}>
          <span style={{ width: '10px', height: '10px', background: 'rgba(0,240,255,0.12)', border: '1px solid rgba(0,240,255,0.6)', display: 'inline-block' }} />
          Red ({cidr} bits)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Share Tech Mono, monospace' }}>
          <span style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block' }} />
          Host ({32 - cidr} bits)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Share Tech Mono, monospace' }}>
          <span style={{ width: '10px', height: '10px', border: '1px solid var(--neon-magenta)', boxShadow: '0 0 6px rgba(255,0,85,0.6)', display: 'inline-block' }} />
          Frontera Red/Host
        </span>
      </div>

      {/* ── Grid de bits ──
          Desktop: 4 octetos en fila
          Tablet (sm): 2x2
          Mobile (xs): 1 octeto por fila
      ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '1rem',
      }}>
        {octets.map((oct, oIdx) => (
          <div key={oIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
              {oct.label}
            </span>
            {/* IP bits */}
            <div style={{ display: 'flex', gap: '2px' }}>
              {oct.ipBits.map((bit, bIdx) => {
                const globalIdx = oct.startIdx + bIdx
                const isNetwork = globalIdx < cidr
                const isBoundary = globalIdx === cidr - 1

                return (
                  <div
                    key={bIdx}
                    className={`bit-cell ${isNetwork ? 'bit-network' : 'bit-host'} ${isBoundary ? 'bit-boundary' : ''}`}
                    title={`Bit ${globalIdx + 1} — ${isNetwork ? 'Red' : 'Host'}`}
                  >
                    {bit}
                  </div>
                )
              })}
            </div>
            {/* Máscara bits */}
            <div style={{ display: 'flex', gap: '2px' }}>
              {oct.maskBits.map((bit, bIdx) => (
                <div key={bIdx} style={{ width: '1.6rem', textAlign: 'center', fontSize: '0.6rem', color: bit === 1 ? 'rgba(0,240,255,0.4)' : 'rgba(255,255,255,0.1)', fontFamily: 'Share Tech Mono, monospace' }}>
                  {bit}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', fontFamily: 'Share Tech Mono, monospace' }}>
        // FILA SUPERIOR: bits IP — FILA INFERIOR: bits máscara
      </div>

      {/* ── Barra proporcional ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.06em' }}>
          <span>RED // {cidr} bits</span>
          <span>HOST // {32 - cidr} bits</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${(cidr / 32) * 100}%`,
            background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))',
            boxShadow: '0 0 8px rgba(0,240,255,0.5)',
            transition: 'width 0.2s ease',
          }} />
        </div>
      </div>
    </div>
  )
}
