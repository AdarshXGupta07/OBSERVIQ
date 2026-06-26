export default function StatsGrid({ traces, total }) {
  const avgLatency =
    traces.length > 0
      ? Math.round(
          traces.reduce((sum, t) => sum + (t.latency_ms || 0), 0) / traces.length
        )
      : null

  const totalCost = traces.reduce(
    (sum, t) => sum + (parseFloat(t.cost_usd) || 0),
    0
  )

  const successRate =
    traces.length > 0
      ? (
          (traces.filter(t => t.status === 'success').length / traces.length) * 100
        ).toFixed(1)
      : null

  const stats = [
    { label: 'Total AI Calls', value: total.toLocaleString() },
    { label: 'Avg Latency',    value: avgLatency !== null ? `${avgLatency}ms` : '—' },
    { label: 'Total Cost',     value: `$${totalCost.toFixed(4)}` },
    { label: 'Success Rate',   value: successRate !== null ? `${successRate}%` : '—' },
  ]

  return (
    <div className="stats-grid">
      {stats.map(stat => (
        <div key={stat.label} className="stat-card">
          <p className="stat-label">{stat.label}</p>
          <p className="stat-value">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}