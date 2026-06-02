import { useMemo } from 'react'
import { toBinary32, getMaskBinary, isValidIP } from '../utils/subnetCalculator'

const OCTET_LABELS = ['Octeto 1', 'Octeto 2', 'Octeto 3', 'Octeto 4']

export default function BitVisualizer({ ip, cidr, onIPChange, onCIDRChange }) {
  const valid = isValidIP(ip)

  const ipBits = useMemo(() => {
    if (!valid) return Array(32).fill(0)
    return toBinary32(ip)
  }, [ip, valid])

  const maskBits = useMemo(() => getMaskBinary(cidr), [cidr])

  const octets = useMemo(() => {
    return [0, 1, 2, 3].map((o) => ({
      label: OCTET_LABELS[o],
      bits: ipBits.slice(o * 8, o * 8 + 8),
      maskBits: maskBits.slice(o * 8, o * 8 + 8),
    }))
  }, [ipBits, maskBits])

  return (
    <div className="section-card flex flex-col gap-5">
      <div className="section-title">
        <span className="text-indigo-400">⬛</span>
        Visualizador de Bits — IPv4 /{cidr}
      </div>

      {/* Inputs */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Dirección IP</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => onIPChange(e.target.value)}
            placeholder="192.168.1.1"
            className={`input-base w-44 ${!valid && ip !== '' ? 'input-error' : ''}`}
          />
          {!valid && ip !== '' && (
            <span className="text-red-400 text-xs">IP inválida</span>
          )}
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-48">
          <label className="text-xs text-gray-400">
            Prefijo CIDR: <span className="text-indigo-400 font-bold">/{cidr}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={30}
              value={cidr}
              onChange={(e) => onCIDRChange(Number(e.target.value))}
              className="flex-1 accent-indigo-500 cursor-pointer"
            />
            <input
              type="number"
              min={1}
              max={30}
              value={cidr}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (v >= 1 && v <= 30) onCIDRChange(v)
              }}
              className="input-base w-16 text-center"
            />
          </div>
        </div>
      </div>

      {/* Bit grid */}
      <div className="flex flex-col gap-3">
        {/* Leyenda */}
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
            Bits de Red ({cidr})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-700 inline-block" />
            Bits de Host ({32 - cidr})
          </span>
        </div>

        {/* Octetos */}
        <div className="flex flex-wrap gap-4">
          {octets.map((oct, oIdx) => (
            <div key={oIdx} className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 text-center">{oct.label}</span>
              <div className="flex gap-0.5 relative">
                {oct.bits.map((bit, bIdx) => {
                  const globalIdx = oIdx * 8 + bIdx
                  const isNetwork = globalIdx < cidr
                  // Marca la frontera red/host
                  const isBoundary = globalIdx === cidr - 1 && cidr % 8 !== 0
                  return (
                    <div
                      key={bIdx}
                      className={`bit-cell ${isNetwork ? 'bit-network' : 'bit-host'} ${
                        isBoundary ? 'ring-2 ring-red-400' : ''
                      }`}
                      title={`Bit ${globalIdx + 1} — ${isNetwork ? 'Red' : 'Host'}`}
                    >
                      {bit}
                    </div>
                  )
                })}
              </div>
              {/* Máscara debajo */}
              <div className="flex gap-0.5">
                {oct.maskBits.map((bit, bIdx) => (
                  <div
                    key={bIdx}
                    className="w-7 text-center text-xs text-gray-500"
                  >
                    {bit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Etiquetas de posición */}
        <div className="text-xs text-gray-600 mt-1">
          Fila superior: bits de la IP — Fila inferior: bits de la máscara
        </div>
      </div>

      {/* Barra proporcional red/host */}
      <div className="flex flex-col gap-1">
        <div className="flex text-xs justify-between text-gray-400">
          <span>Red ({cidr} bits)</span>
          <span>Host ({32 - cidr} bits)</span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-indigo-600 transition-all duration-200"
            style={{ width: `${(cidr / 32) * 100}%` }}
          />
          <div
            className="h-full bg-gray-500"
            style={{ width: `${((32 - cidr) / 32) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
