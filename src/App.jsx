import { useState, useMemo } from 'react'
import BitVisualizer from './components/BitVisualizer'
import ResultTable from './components/ResultTable'
import ExplainPanel from './components/ExplainPanel'
import VLSMPlanner from './components/VLSMPlanner'
import { calcSubnet, isValidIP, isValidCIDR } from './utils/subnetCalculator'

const TABS = [
  { id: 'calculator', label: 'Calculadora de Subred' },
  { id: 'vlsm', label: 'VLSM Planner' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [ip, setIP] = useState('192.168.1.1')
  const [cidr, setCIDR] = useState(24)

  const subnet = useMemo(() => {
    if (!isValidIP(ip) || !isValidCIDR(cidr)) return null
    return calcSubnet(ip, cidr)
  }, [ip, cidr])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              IP
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                Interactive Network Lab
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Visualizador educativo de IPv4 — Subnetting & VLSM
              </p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ipaddr.js · React · Tailwind CSS
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* ── Pestaña: Calculadora ── */}
        {activeTab === 'calculator' && (
          <>
            {/* BitVisualizer — siempre visible, inputs de IP/CIDR dentro */}
            <BitVisualizer
              ip={ip}
              cidr={cidr}
              onIPChange={setIP}
              onCIDRChange={setCIDR}
            />

            {/* Datos rápidos de la subred actual */}
            {subnet && (
              <div className="section-card">
                <div className="section-title">
                  <span>⚡</span>
                  Resumen Rápido
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Dir. de Red', value: subnet.networkAddress, color: 'text-emerald-400' },
                    { label: 'Máscara', value: subnet.mask, color: 'text-gray-300' },
                    { label: 'Primer Host', value: subnet.firstHost, color: 'text-blue-300' },
                    { label: 'Último Host', value: subnet.lastHost, color: 'text-blue-300' },
                    { label: 'Broadcast', value: subnet.broadcast, color: 'text-red-400' },
                    {
                      label: 'Hosts Usables',
                      value: subnet.totalHosts.toLocaleString('es'),
                      color: 'text-yellow-400',
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className={`font-mono text-sm font-semibold ${item.color}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabla de resultado básico */}
            {subnet && (
              <ResultTable
                subnets={[subnet]}
                showName={false}
                title={`Tabla de Subred — ${ip}/${cidr}`}
              />
            )}

            {/* Explicación paso a paso */}
            {subnet && <ExplainPanel subnet={subnet} />}

            {/* Placeholder si IP inválida */}
            {!subnet && ip !== '' && (
              <div className="section-card text-center text-gray-600 py-8">
                Ingresa una IP válida y un CIDR entre 1 y 30 para ver los resultados.
              </div>
            )}
          </>
        )}

        {/* ── Pestaña: VLSM ── */}
        {activeTab === 'vlsm' && <VLSMPlanner />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-10 py-6 text-center text-xs text-gray-600">
        Interactive Network Lab · MIT License ·{' '}
        <a
          href="https://github.com/Owito/interactive-network-lab"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:text-indigo-400 transition-colors"
        >
          github.com/Owito/interactive-network-lab
        </a>
      </footer>
    </div>
  )
}
