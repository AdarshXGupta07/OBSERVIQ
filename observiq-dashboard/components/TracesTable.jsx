'use client'

import { useState, useMemo } from 'react'

// ── helpers ───────────────────────────────────────────────
function truncate(text, maxLen) {
  if (!text) return '—'
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const COLUMNS = ['Time', 'Model', 'Input', 'Output', 'Latency', 'Tokens', 'Cost', 'Status']

// ── Filter bar ────────────────────────────────────────────
function FilterBar({ traces, statusFilter, setStatusFilter, modelFilter, setModelFilter }) {
  // Unique models from traces
  const uniqueModels = useMemo(() => {
    const models = [...new Set(traces.map(t => t.model).filter(Boolean))]
    return models
  }, [traces])

  const btnStyle = (active) => ({
    background: active ? 'rgba(99,102,241,0.2)' : 'transparent',
    border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : '#2a2d3e'}`,
    color: active ? '#6366f1' : '#64748b',
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: active ? 500 : 400,
    transition: 'all 0.2s'
  })

  const selectStyle = {
    background: '#0f1117',
    border: '1px solid #2a2d3e',
    color: '#e2e8f0',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    outline: 'none'
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0.75rem 1.25rem',
      borderBottom: '1px solid #2a2d3e',
      flexWrap: 'wrap'
    }}>
      <span style={{ fontSize: 11, color: '#64748b', marginRight: 4 }}>STATUS</span>

      {['all', 'success', 'error'].map(s => (
        <button
          key={s}
          style={btnStyle(statusFilter === s)}
          onClick={() => setStatusFilter(s)}
        >
          {s === 'all' ? 'All' : s === 'success' ? '✓ Success' : '✕ Error'}
        </button>
      ))}

      <div style={{ width: 1, height: 20, background: '#2a2d3e', margin: '0 4px' }} />

      <span style={{ fontSize: 11, color: '#64748b', marginRight: 4 }}>MODEL</span>

      <select
        style={selectStyle}
        value={modelFilter}
        onChange={e => setModelFilter(e.target.value)}
      >
        <option value="all">All Models</option>
        {uniqueModels.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export default function TracesTable({ traces, newIds }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [modelFilter, setModelFilter]   = useState('all')

  // Filter traces based on selected filters
  const filteredTraces = useMemo(() => {
    return traces.filter(t => {
      const statusOk = statusFilter === 'all' || t.status === statusFilter
      const modelOk  = modelFilter === 'all'  || t.model === modelFilter
      return statusOk && modelOk
    })
  }, [traces, statusFilter, modelFilter])

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Recent Traces</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {filteredTraces.length} / {traces.length} traces
          </span>
          <span className="live-badge">● Live</span>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        traces={traces}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        modelFilter={modelFilter}
        setModelFilter={setModelFilter}
      />

      {filteredTraces.length === 0 ? (
        <p className="empty-state">
          {traces.length === 0
            ? 'No traces yet. Run the SDK example to generate your first AI trace!'
            : 'No traces match the selected filters.'}
        </p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {COLUMNS.map(col => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredTraces.map(trace => (
                <TraceRow
                  key={trace.id}
                  trace={trace}
                  isNew={newIds.has(trace.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Single row ────────────────────────────────────────────
function TraceRow({ trace, isNew }) {
  const time   = new Date(trace.created_at).toLocaleTimeString()
  const tokens = `${trace.prompt_tokens || 0} + ${trace.completion_tokens || 0}`
  const cost   = trace.cost_usd
    ? `$${parseFloat(trace.cost_usd).toFixed(5)}`
    : '$0.00000'

  return (
    <tr className={isNew ? 'new-row' : ''}>
      <td>{time}</td>
      <td>{trace.model}</td>
      <td className="truncate" title={escapeHtml(trace.input || '')}>
        {truncate(trace.input, 40)}
      </td>
      <td className="truncate" title={escapeHtml(trace.output || '')}>
        {truncate(trace.output, 40)}
      </td>
      <td>{trace.latency_ms || 0}ms</td>
      <td>{tokens}</td>
      <td>{cost}</td>
      <td>
        <span className={trace.status === 'success' ? 'badge-success' : 'badge-error'}>
          {trace.status}
        </span>
      </td>
    </tr>
  )
}