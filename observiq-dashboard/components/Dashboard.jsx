'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Header from './Header'
import StatsGrid from './StatsGrid'
import TracesTable from './TracesTable'
import AnalyticsSection from './AnalyticsSection'
import AnomaliesSection from './AnomaliesSection'
import {
  fetchAnomalies
} from '../lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const REFRESH_MS           = 10_000
const ANALYTICS_REFRESH_MS = 30_000
const ANOMALY_REFRESH_MS   = 60_000
const HIGHLIGHT_MS         = 2_000

export default function Dashboard({ apiKey, team, onLogout }) {
  const [traces, setTraces]           = useState([])
  const [total, setTotal]             = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [newIds, setNewIds]           = useState(new Set())
  const [fetchError, setFetchError]   = useState(null)

  const [byModel, setByModel]         = useState([])
  const [byFeature, setByFeature]     = useState([])
  const [daily, setDaily]             = useState([])
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  const [anomalies, setAnomalies]     = useState([])

  const knownIdsRef = useRef(new Set())

  const loadTraces = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/traces?limit=50&page=1`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (res.status === 401) { onLogout(); return }
      if (!res.ok) { setFetchError(`Server error: ${res.status}`); return }

      const data = await res.json()
      const traceList = data.traces || []

      const freshIds = new Set(
        traceList.map(t => t.id).filter(id => !knownIdsRef.current.has(id))
      )
      traceList.forEach(t => knownIdsRef.current.add(t.id))

      setTraces(traceList)
      setTotal(data.total || 0)
      setLastUpdated(new Date().toLocaleTimeString())
      setFetchError(null)

      if (freshIds.size > 0) {
        setNewIds(freshIds)
        setTimeout(() => setNewIds(new Set()), HIGHLIGHT_MS)
      }
    } catch {
      setFetchError('Cannot reach server. Is backend running on port 8000?')
    }
  }, [apiKey, onLogout])

  const loadAnalytics = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${apiKey}` }
      const [r1, r2, r3] = await Promise.all([
        fetch(`${API_URL}/analytics/by-model`,   { headers }),
        fetch(`${API_URL}/analytics/by-feature`, { headers }),
        fetch(`${API_URL}/analytics/daily`,      { headers }),
      ])
      setByModel(r1.ok   ? await r1.json() : [])
      setByFeature(r2.ok ? await r2.json() : [])
      setDaily(r3.ok     ? await r3.json() : [])
    } catch (err) {
      console.error('Analytics fetch failed:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [apiKey])

  const loadAnomalies = useCallback(async () => {
    try {
      const data = await fetchAnomalies(apiKey)
      setAnomalies(data.anomalies || [])
    } catch (err) {
      console.error('Anomalies fetch failed:', err)
    }
  }, [apiKey])

  useEffect(() => {
    loadTraces()
    loadAnalytics()
    loadAnomalies()

    const t1 = setInterval(loadTraces,    REFRESH_MS)
    const t2 = setInterval(loadAnalytics, ANALYTICS_REFRESH_MS)
    const t3 = setInterval(loadAnomalies, ANOMALY_REFRESH_MS)

    return () => {
      clearInterval(t1)
      clearInterval(t2)
      clearInterval(t3)
    }
  }, [loadTraces, loadAnalytics, loadAnomalies])

  return (
    <div className="dashboard">
      <Header team={team} lastUpdated={lastUpdated} onLogout={onLogout} />

      {fetchError && (
        <div style={{
          margin: '1rem 1.5rem 0', padding: '12px 16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, color: '#ef4444', fontSize: 13
        }}>⚠ {fetchError}</div>
      )}

      <StatsGrid traces={traces} total={total} />

      <AnalyticsSection
        byModel={byModel}
        byFeature={byFeature}
        daily={daily}
        loading={analyticsLoading}
      />

      <AnomaliesSection
        anomalies={anomalies}
        apiKey={apiKey}
        onRefresh={loadAnomalies}
      />

      <TracesTable traces={traces} newIds={newIds} />
    </div>
  )
}