import { useState, useCallback } from 'react'
import { calcVLSM, isValidIP, isValidCIDR } from '../utils/subnetCalculator'
import ResultTable from './ResultTable'

function newRow() {
  return { id: crypto.randomUUID(), name: '', hosts: '' }
}

export default function VLSMPlanner() {
  const [baseIP, setBaseIP] = useState('192.168.0.0')
  const [baseCIDR, setBaseCIDR] = useState(24)
  const [rows, setRows] = useState([newRow(), newRow()])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const addRow = () => setRows((r) => [...r, newRow()])
  const removeRow = (id) => setRows((r) => r.length > 1 ? r.filter((row) => row.id !== id) : r)
  const updateRow = (id, field, value) => setRows((r) => r.map((row) => row.id === id ? { ...row, [field]: value } : row))

  const handleCalculate = useCallback(() => {
    setError(null); setResult(null)
    if (!isValidIP(baseIP)) { setError('La dirección base no es una IPv4 válida.'); return }
    if (!isValidCIDR(baseCIDR)) { setError('El CIDR base debe estar entre 1 y 30.'); return }
    const requirements = rows.map((r, i) => ({ name: r.name.trim() || `Subred ${i + 1}`, hosts: parseInt(r.hosts, 10) })).filter((r) => r.hosts > 0)
    if (requirements.length === 0) { setError('Ingresa al menos una subred con hosts requeridos.'); return }
    const res = calcVLSM(baseIP, Number(baseCIDR), requirements)
    if (res.error) setError(res.error)
    else setResult(res)
  }, [baseIP, baseCIDR, rows])

  const handleReset = () => { setRows([newRow(), newRow()]); setResult(null); setError(null) }

  const ipValid = isValidIP(baseIP)
  const usedPct = result?.usedPercent ?? 0
  const barColor = usedPct > 90 ? 'var(--neon-magenta)' : usedPct > 70 ? '#fbbf24' : 'var(--neon-green)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="section-title">🗂 VLSM Planner — Segmentación Variable</div>

        {/* Bloque padre */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 150px', maxWidth: '200px' }}>
            <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              IP Base del bloque padre
            </label>
            <input
              type="text" value={baseIP} placeholder="192.168.0.0"
              onChange={(e) => { setBaseIP(e.target.value); setResult(null); setError(null) }}
              className={`input-base ${!ipValid && baseIP !== '' ? 'input-error' : ''}`}
            />
            {!ipValid && baseIP !== '' && (
              <span style={{ color: 'var(--neon-magenta)', fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace' }}>&gt; IP_INVÁLIDA</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              CIDR del bloque padre
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: 'var(--neon-cyan)', fontFamily: 'Share Tech Mono, monospace', fontSize: '1rem' }}>/</span>
              <input
                type="number" min={1} max={30} value={baseCIDR}
                onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= 30) { setBaseCIDR(v); setResult(null); setError(null) } }}
                className="input-base"
                style={{ width: '5rem', textAlign: 'center' }}
              />
            </div>
          </div>
        </div>

        {/* Lista de subredes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Subredes requeridas ({rows.length})
            </span>
            <button onClick={addRow} className="btn-ghost">+ Agregar subred</button>
          </div>

          {/* Header columnas — oculto en mobile muy pequeño */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', padding: '0 0.25rem' }}>
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Nombre / Departamento</span>
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', minWidth: '80px' }}>Hosts req.</span>
            <span />
          </div>

          {rows.map((row, i) => (
            <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text" placeholder={`Subred ${i + 1} (ej: Ventas)`} value={row.name}
                onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                className="input-base"
              />
              <input
                type="number" placeholder="Hosts" min={1} value={row.hosts}
                onChange={(e) => updateRow(row.id, 'hosts', e.target.value)}
                className="input-base"
                style={{ width: '80px', textAlign: 'center' }}
              />
              <button onClick={() => removeRow(row.id)} className="btn-danger">✕</button>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleCalculate} className="btn-primary">Calcular VLSM</button>
          <button onClick={handleReset} className="btn-ghost">Limpiar</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,0,85,0.08)', border: '1px solid rgba(255,0,85,0.4)',
            padding: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.8rem',
            color: 'var(--neon-magenta)',
          }}>
            &gt; ERROR: {error}
          </div>
        )}

        {/* Estadísticas de uso */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>
                Utilizado:{' '}
                <span style={{ color: 'var(--neon-cyan)' }}>{result.totalUsed.toLocaleString('es')}</span>
                {' '}de{' '}
                <span style={{ color: 'var(--text-main)' }}>{result.totalAvailable.toLocaleString('es')}</span>
                {' '}direcciones
              </span>
              <span style={{ color: barColor, fontFamily: 'Orbitron, sans-serif', fontSize: '0.65rem', fontWeight: 700, textShadow: `0 0 6px ${barColor}` }}>
                {result.usedPercent}% UTILIZADO
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${Math.min(result.usedPercent, 100)}%`,
                background: barColor, boxShadow: `0 0 8px ${barColor}`,
                transition: 'all 0.5s ease',
              }} />
            </div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>
              // Subredes ordenadas automáticamente de mayor a menor (VLSM optimal allocation)
            </div>
          </div>
        )}
      </div>

      {result && (
        <ResultTable
          subnets={result.subnets}
          showName={true}
          title={`Resultado VLSM — ${result.subnets.length} subred${result.subnets.length !== 1 ? 'es' : ''} asignada${result.subnets.length !== 1 ? 's' : ''}`}
        />
      )}
    </div>
  )
}
