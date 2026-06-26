'use client'

import { useState, useEffect } from 'react'
import { useTraces } from '@/hooks/useTraces'
import TracesTable from '@/components/TracesTable'
import LiveBadge from '@/components/LiveBadge'

export default function TracesPage() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const { traces, total, newTraceIds, isLoading, lastUpdated } = useTraces(apiKey)

  useEffect(() => {
    const key = localStorage.getItem('oiq_api_key')
    setApiKey(key)
  }, [])

  return (
    <div className="p-8 animate-in">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ivory">Traces</h1>
          <p className="text-soft text-sm mt-1">{total} total traces</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge />
          {lastUpdated && (
            <span className="text-xs text-muted">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Traces Table */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading traces...</p>
        </div>
      ) : (
        <TracesTable traces={traces} newTraceIds={newTraceIds} />
      )}
    </div>
  )
}
