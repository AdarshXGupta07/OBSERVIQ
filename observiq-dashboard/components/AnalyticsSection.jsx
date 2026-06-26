'use client'

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

const ACCENT  = '#6366f1'
const COLORS  = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']
const BG_CARD = '#1a1d27'
const BORDER  = '#2a2d3e'
const MUTED   = '#64748b'
const SUCCESS = '#22c55e'
const WARNING = '#f59e0b'

function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#21253a', border: `1px solid ${BORDER}`,
      borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#e2e8f0'
    }}>
      <p style={{ color: MUTED, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1.25rem' }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', marginBottom: 2 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 11, color: MUTED, marginBottom: '1rem' }}>{subtitle}</p>}
      <div style={{ marginTop: subtitle ? 0 : '1rem' }}>{children}</div>
    </div>
  )
}

// Custom bar shape that picks color by index
function ColoredBar(colors) {
  return function CustomShape(props) {
    const { x, y, width, height, index } = props
    return <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={4} fill={colors[index % colors.length]} />
  }
}

export default function AnalyticsSection({ byModel, byFeature, daily, loading }) {
  if (loading) {
    return (
      <div style={{ padding: '0 1.5rem 1.5rem' }}>
        <p style={{ fontSize: 13, color: MUTED }}>Loading analytics...</p>
      </div>
    )
  }

  const hasData = byModel.length > 0 || byFeature.length > 0 || daily.length > 0

  if (!hasData) {
    return (
      <div style={{
        margin: '0 1.5rem 1.5rem', background: BG_CARD,
        border: `1px solid ${BORDER}`, borderRadius: 10,
        padding: '2rem', textAlign: 'center', color: MUTED, fontSize: 13
      }}>
        No analytics yet. Run some AI calls first!
      </div>
    )
  }

  return (
    <div style={{ padding: '0 1.5rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>Analytics</h2>
        <span style={{ fontSize: 11, color: MUTED }}>Last 7 days</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>

        {/* Daily AI Calls */}
        <ChartCard title="Daily AI Calls" subtitle="Call volume over last 7 days">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip suffix=" calls" />} />
              <Line type="monotone" dataKey="call_count" name="Calls" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cost by Model */}
        <ChartCard title="Cost by Model" subtitle="Total spend per AI model (USD)">
          {byModel.length === 0 ? (
            <p style={{ color: MUTED, fontSize: 12, textAlign: 'center', padding: '2rem 0' }}>No model data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byModel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(4)}`} />
                <YAxis type="category" dataKey="model" tick={{ fontSize: 9, fill: MUTED }} axisLine={false} tickLine={false} width={100} tickFormatter={v => v.length > 14 ? v.slice(0, 14) + '…' : v} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Bar dataKey="total_cost_usd" name="Cost" shape={ColoredBar(COLORS)} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Calls by Feature */}
        <ChartCard title="Calls by Feature" subtitle="Which feature uses AI the most">
          {byFeature.length === 0 ? (
            <p style={{ color: MUTED, fontSize: 12, textAlign: 'center', padding: '2rem 0' }}>No feature data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byFeature}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="feature_name" tick={{ fontSize: 9, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={v => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip suffix=" calls" />} />
                <Bar dataKey="call_count" name="Calls" shape={ColoredBar(COLORS)} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>

      {/* Model table */}
      {byModel.length > 0 && (
        <div style={{ marginTop: 16, background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: `1px solid ${BORDER}`, fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>
            Model Breakdown
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Model', 'Calls', 'Avg Latency', 'Total Cost', 'Success Rate'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', color: MUTED, borderBottom: `1px solid ${BORDER}`, fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byModel.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#e2e8f0', borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 8 }} />
                      {row.model}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#e2e8f0', borderBottom: `1px solid ${BORDER}` }}>{row.call_count.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#e2e8f0', borderBottom: `1px solid ${BORDER}` }}>{row.avg_latency_ms}ms</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#e2e8f0', borderBottom: `1px solid ${BORDER}` }}>${row.total_cost_usd.toFixed(6)}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: `1px solid ${BORDER}`, color: row.success_rate >= 90 ? SUCCESS : WARNING, fontWeight: 500 }}>{row.success_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
