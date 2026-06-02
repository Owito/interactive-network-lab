import { useState, useCallback } from 'react'
import { calcVLSM, isValidIP, isValidCIDR } from '../utils/subnetCalculator'
import ResultTable from './ResultTable'

const EMPTY_ROW = { name: '', hosts: '' }

function newRow() {
  return { ...EMPTY_ROW, id: crypto.randomUUID() }
}

export default function VLSMPlanner() {
  const [baseIP, setBaseIP] = useState('192.168.0.0')
  const [baseCIDR, setBaseCIDR] = useState(24)
  const [rows, setRows] = useState([newRow(), newRow()])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const addRow = () => setRows((r) => [...r, newRow()])

  const removeRow = (id) =>
    setRows((r) => (r.length > 1 ? r.filter((row) => row.id !== id) : r))

  const updateRow = (id, field, value) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)))

  const handleCalculate = useCallback(() => {
    setError(null)
    setResult(null)

    if (!isValidIP(baseIP)) {
      setError('La dirección base no es una IPv4 válida.')
      return
    }
    if (!isValidCIDR(baseCIDR)) {
      setError('El CIDR base debe estar entre 1 y 30.')
      return
    }

    const requirements = rows
      .map((r) => ({ name: r.name.trim() || `Subred`, hosts: parseInt(r.hosts, 10) }))
      .filter((r) => r.hosts > 0)

    if (requirements.length === 0) {
      setError('Ingresa al menos una subred con hosts requeridos.')
      return
    }

    const res = calcVLSM(baseIP, Number(baseCIDR), requirements)
    if (res.error) {
      setError(res.error)
    } else {
      setResult(res)
    }
  }, [baseIP, baseCIDR, rows])

  const handleReset = () => {
    setRows([newRow(), newRow()])
    setResult(null)
    setError(null)
  }

  const ipValid = isValidIP(baseIP)

  return (
    <div className="flex flex-col gap-5">
      <div className="section-card flex flex-col gap-5">
        <div className="section-title">
          <span>🗂️</span>
          VLSM Planner — Segmentación Variable
        </div>

        {/* Bloque padre */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">IP Base del bloque padre</label>
            <input
              type="text"
              value={baseIP}
              onChange={(e) => { setBaseIP(e.target.value); setResult(null); setError(null) }}
              placeholder="192.168.0.0"
              className={`input-base w-44 ${!ipValid && baseIP !== '' ? 'input-error' : ''}`}
            />
            {!ipValid && baseIP !== '' && (
              <span className="text-red-400 text-xs">IP inválida</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Prefijo CIDR del bloque padre</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">/</span>
              <input
                type="number"
                min={1}
                max={30}
                value={baseCIDR}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (v >= 1 && v <= 30) { setBaseCIDR(v); setResult(null); setError(null) }
                }}
                className="input-base w-20 text-center"
              />
            </div>
          </div>
        </div>

        {/* Lista de subredes */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              Subredes requeridas ({rows.length})
            </span>
            <button onClick={addRow} className="btn-ghost">
              + Agregar subred
            </button>
          </div>

          {/* Encabezado tabla de entrada */}
          <div className="grid grid-cols-[2fr_1fr_auto] gap-2 text-xs text-gray-500 uppercase tracking-wider px-1">
            <span>Nombre / Departamento</span>
            <span>Hosts requeridos</span>
            <span />
          </div>

          {rows.map((row, i) => (
            <div key={row.id} className="grid grid-cols-[2fr_1fr_auto] gap-2 items-center">
              <input
                type="text"
                placeholder={`Subred ${i + 1} (ej: Ventas)`}
                value={row.name}
                onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                className="input-base"
              />
              <input
                type="number"
                placeholder="Hosts"
                min={1}
                value={row.hosts}
                onChange={(e) => updateRow(row.id, 'hosts', e.target.value)}
                className="input-base text-center"
              />
              <button
                onClick={() => removeRow(row.id)}
                className="btn-danger"
                title="Eliminar fila"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 items-center flex-wrap">
          <button onClick={handleCalculate} className="btn-primary">
            Calcular VLSM
          </button>
          <button onClick={handleReset} className="btn-ghost">
            Limpiar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Estadísticas de uso */}
        {result && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>
                Espacio utilizado:{' '}
                <span className="text-indigo-300 font-semibold">
                  {result.totalUsed.toLocaleString('es')} dirs.
                </span>{' '}
                de{' '}
                <span className="text-gray-300">
                  {result.totalAvailable.toLocaleString('es')} disponibles
                </span>
              </span>
              <span
                className={`font-bold ${
                  result.usedPercent > 90
                    ? 'text-red-400'
                    : result.usedPercent > 70
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                {result.usedPercent}% utilizado
              </span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  result.usedPercent > 90
                    ? 'bg-red-500'
                    : result.usedPercent > 70
                    ? 'bg-yellow-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(result.usedPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              Subredes ordenadas automáticamente de mayor a menor (optimización VLSM)
            </div>
          </div>
        )}
      </div>

      {/* Tabla de resultados VLSM */}
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
