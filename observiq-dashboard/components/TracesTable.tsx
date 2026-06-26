import { Trace } from '@/lib/types'
import StatusBadge from './StatusBadge'
import { Activity } from 'lucide-react'

interface TracesTableProps {
  traces: Trace[]
  newTraceIds: Set<string>
}

export default function TracesTable({ traces, newTraceIds }: TracesTableProps) {
  if (traces.length === 0) {
    return (
      <div className="py-16 text-center">
        <Activity className="w-12 h-12 mx-auto mb-4 text-muted opacity-20" />
        <p className="text-muted font-medium mb-1">No traces yet</p>
        <p className="text-soft text-sm">Run the SDK to see your first AI trace</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark/60 border-b border-border">
            <tr>
              {['Time', 'Model', 'Input', 'Output', 'Latency', 'Tokens', 'Cost', 'Status'].map((header) => (
                <th
                  key={header}
                  className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted font-medium"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {traces.map((trace) => {
              const isNew = newTraceIds.has(trace.id)
              const latency = trace.latency_ms
              const latencyColor =
                latency < 500 ? 'text-primary' : latency < 2000 ? 'text-accent' : 'text-danger'

              return (
                <tr
                  key={trace.id}
                  className={`
                    border-b border-border/40 hover:bg-border/30 transition-colors
                    ${isNew ? 'animate-pulse bg-primary/5 border-l-2 border-l-primary' : ''}
                  `}
                >
                  <td className="px-4 py-3 text-sm text-soft whitespace-nowrap">
                    {new Date(trace.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-ivory font-medium">
                    {trace.model}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted max-w-[160px] truncate" title={trace.input || ''}>
                    {trace.input || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted max-w-[160px] truncate" title={trace.output || ''}>
                    {trace.output || '—'}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${latencyColor}`}>
                    {trace.latency_ms}ms
                  </td>
                  <td className="px-4 py-3 text-sm text-soft">
                    {trace.prompt_tokens + trace.completion_tokens}
                  </td>
                  <td className="px-4 py-3 text-sm text-soft font-mono">
                    ${parseFloat(String(trace.cost_usd)).toFixed(5)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={trace.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
