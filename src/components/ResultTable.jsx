export default function ResultTable({ subnets = [], showName = false, title = 'Resultado' }) {
  if (!subnets || subnets.length === 0) return null

  return (
    <div className="section-card flex flex-col gap-4">
      <div className="section-title">
        <span>📋</span>
        {title}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-indigo-900/60 text-indigo-300 text-xs uppercase tracking-wider">
              <th className="px-3 py-2">#</th>
              {showName && <th className="px-3 py-2">Nombre</th>}
              {showName && <th className="px-3 py-2">Hosts req.</th>}
              <th className="px-3 py-2">Dir. de Red</th>
              <th className="px-3 py-2">Máscara</th>
              <th className="px-3 py-2">Primer Host</th>
              <th className="px-3 py-2">Último Host</th>
              <th className="px-3 py-2">Broadcast</th>
              <th className="px-3 py-2 text-right">Hosts usables</th>
            </tr>
          </thead>
          <tbody>
            {subnets.map((s, i) => (
              <tr
                key={i}
                className={`border-t border-gray-800 ${
                  i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/40'
                } hover:bg-indigo-900/20 transition-colors`}
              >
                <td className="px-3 py-2 text-gray-500 font-mono">{i + 1}</td>
                {showName && (
                  <td className="px-3 py-2 text-indigo-300 font-semibold">
                    {s.name || '—'}
                  </td>
                )}
                {showName && (
                  <td className="px-3 py-2 text-yellow-400 font-mono">
                    {s.hostsRequired?.toLocaleString('es') || '—'}
                  </td>
                )}
                <td className="px-3 py-2 font-mono text-emerald-400">
                  {s.networkAddress}/{s.cidr}
                </td>
                <td className="px-3 py-2 font-mono text-gray-300">{s.mask}</td>
                <td className="px-3 py-2 font-mono text-blue-300">{s.firstHost}</td>
                <td className="px-3 py-2 font-mono text-blue-300">{s.lastHost}</td>
                <td className="px-3 py-2 font-mono text-red-400">{s.broadcast}</td>
                <td className="px-3 py-2 font-mono text-right text-gray-200">
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
