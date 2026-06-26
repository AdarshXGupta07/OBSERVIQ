'use client'

import { useState } from 'react'
import { triggerAnalysis, resolveAnomaly } from '../lib/api'

const SEVERITY_COLORS = {
  high:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
  medium: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  text: '#f59e0b' },
  low:    { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  text: '#6366f1' },
}

const BG_CARD = '#1a1d27'
const BORDER  = '#2a2d3e'
const MUTED   = '#64748b'

export default function AnomaliesSection({ anomalies, apiKey, onRefresh }) {
  const [analyzing, setAnalyzing]   = useState(false)
  const [resolving, setResolving]   = useState(null)
  const [message, setMessage]       = useState('')

  async function handleAnalyze() {
    setAnalyzing(true)
    setMessage('')
    try {
      await triggerAnalysis(apiKey)
      setMessage('Analysis started! Results will appear in ~30 seconds.')
      // 30 sec baad refresh karo
      setTimeout(() => {
        onRefresh()
        setMessage('')
      }, 30000)
    } catch {
      setMessage('Analysis failed. Is backend running?')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleResolve(anomalyId) {
    setResolving(anomalyId)
    try {
      await resolveAnomaly(apiKey, anomalyId)
      onRefresh()
    } catch {
      console.error('Resolve failed')
    } finally {
      setResolving(null)
    }
  }

  return (
    <div style={{ padding: '0 1.5rem 1.5rem' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>
            Anomaly Detection
          </h2>
          {anomalies.length > 0 && (
            <span style={{
              background: 'rgba(239,68,68,0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 20,
              fontSize: 11,
              padding: '2px 8px',
              fontWeight: 600
            }}>
              {anomalies.length} active
            </span>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          style={{
            background: analyzing ? 'rgba(99,102,241,0.1)' : '#6366f1',
            border: '1px solid rgba(99,102,241,0.5)',
            color: 'white',
            padding: '6px 16px',
            borderRadius: 6,
            fontSize: 12,
            cursor: analyzing ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            opacity: analyzing ? 0.7 : 1
          }}
        >
          {analyzing ? '⏳ Analyzing...' : '🔍 Run Analysis'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 8,
          fontSize: 12,
          color: '#6366f1',
          marginBottom: 12
        }}>
          {message}
        </div>
      )}

      {/* No anomalies */}
      {anomalies.length === 0 ? (
        <div style={{
          background: BG_CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: '2rem',
          textAlign: 'center',
          color: MUTED,
          fontSize: 13
        }}>
          ✅ No anomalies detected. Click "Run Analysis" to check your traces.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {anomalies.map(anomaly => {
            const colors = SEVERITY_COLORS[anomaly.severity] || SEVERITY_COLORS.low
            return (
              <div key={anomaly.id} style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      background: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 4,
                      fontSize: 10,
                      padding: '2px 6px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {anomaly.severity}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>
                      {anomaly.title}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                    {anomaly.description}
                  </p>
                  <p style={{ fontSize: 11, color: MUTED, margin: '4px 0 0', opacity: 0.6 }}>
                    {new Date(anomaly.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleResolve(anomaly.id)}
                  disabled={resolving === anomaly.id}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${BORDER}`,
                    color: MUTED,
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {resolving === anomaly.id ? '...' : 'Resolve'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}