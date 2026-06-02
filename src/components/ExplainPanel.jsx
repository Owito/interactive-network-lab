import { useState } from 'react'
import { generateExplanation } from '../utils/subnetCalculator'

export default function ExplainPanel({ subnet }) {
  const [open, setOpen] = useState(true)

  if (!subnet) return null

  const steps = generateExplanation(subnet)

  return (
    <div className="section-card flex flex-col gap-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="section-title w-full flex items-center justify-between cursor-pointer hover:text-indigo-300 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>🔍</span>
          Motor de Explicación — AND Bit a Bit
        </span>
        <span className="text-gray-500 text-xs font-normal">
          {open ? '▲ ocultar' : '▼ mostrar'}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-4">
          {steps.map((step, i) => (
            <div key={i} className="border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-indigo-900/40 px-4 py-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                {step.titulo}
              </div>
              <div className="bg-gray-950 px-4 py-3">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-6">
                  {step.lineas.join('\n')}
                </pre>
              </div>
            </div>
          ))}

          {/* Resumen visual de bits: IP AND Máscara = Red */}
          <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">
              Resumen visual de bits por octeto
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((o) => {
                const ipOct = subnet.ipBits.slice(o * 8, o * 8 + 8)
                const maskOct = subnet.maskBits.slice(o * 8, o * 8 + 8)
                const netOct = subnet.networkBits.slice(o * 8, o * 8 + 8)
                return (
                  <div key={o} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-600">Oct {o + 1}</span>
                    {/* IP row */}
                    <div className="flex gap-px">
                      {ipOct.map((b, bi) => (
                        <span
                          key={bi}
                          className="w-5 h-5 flex items-center justify-center text-xs rounded-sm bg-indigo-900/60 text-indigo-300 font-mono"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">AND</span>
                    {/* Máscara row */}
                    <div className="flex gap-px">
                      {maskOct.map((b, bi) => (
                        <span
                          key={bi}
                          className="w-5 h-5 flex items-center justify-center text-xs rounded-sm bg-gray-800 text-gray-400 font-mono"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    <div className="w-full h-px bg-gray-700" />
                    {/* Red row */}
                    <div className="flex gap-px">
                      {netOct.map((b, bi) => (
                        <span
                          key={bi}
                          className={`w-5 h-5 flex items-center justify-center text-xs rounded-sm font-mono ${
                            b === 1
                              ? 'bg-emerald-900/60 text-emerald-400'
                              : 'bg-gray-800 text-gray-600'
                          }`}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-emerald-600">= Red</span>
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
