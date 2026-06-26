'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTraces } from '@/hooks/useTraces'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function AnomaliesPage() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const { traces, isLoading } = useTraces(apiKey)

  useEffect(() => {
    const key = localStorage.getItem('oiq_api_key')
    setApiKey(key)
  }, [])

  // Filter anomalies
  const anomalies = useMemo(() => {
    return traces.filter(trace => 
      trace.status === 'error' || trace.latency_ms > 3000
    ).map(trace => ({
      ...trace,
      anomalyType: trace.status === 'error' ? 'ERROR' : 'SLOW',
      description: trace.status === 'error'
        ? trace.error_message || 'Unknown error'
        : `High latency: ${trace.latency_ms}ms`
    }))
  }, [traces])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading anomalies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 animate-in">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ivory">Anomalies</h1>
        <p className="text-soft text-sm mt-1">Detected issues in your traces</p>
      </div>

      {/* Anomalies List */}
      {anomalies.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4 opacity-40" />
          <h2 className="text-lg font-semibold text-ivory mb-2">All systems healthy</h2>
          <p className="text-muted text-sm">No anomalies detected in your recent traces</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className="bg-card border border-danger/20 rounded-xl p-4 flex items-start gap-4 
                       hover:border-danger/40 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`
                    text-xs font-semibold px-2 py-0.5 rounded
                    ${anomaly.anomalyType === 'ERROR'
                      ? 'bg-danger/10 text-danger border border-danger/20'
                      : 'bg-accent/10 text-accent border border-accent/20'
                    }
                  `}>
                    {anomaly.anomalyType}
                  </span>
                  <h3 className="text-sm font-medium text-ivory">{anomaly.model}</h3>
                  <span className="text-xs text-muted">
                    {new Date(anomaly.created_at).toLocaleString()}
                  </span>
                </div>
                
                <p className="text-sm text-soft mb-1">{anomaly.description}</p>
                
                {anomaly.feature_name && (
                  <span className="text-xs text-muted">
                    Feature: {anomaly.feature_name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
