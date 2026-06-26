import { useState, useEffect, useCallback, useRef } from 'react'
import { getTraces } from '@/lib/api'
import { Trace } from '@/lib/types'

export function useTraces(apiKey: string | null) {
  const [traces, setTraces] = useState<Trace[]>([])
  const [total, setTotal] = useState(0)
  const [newTraceIds, setNewTraceIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const knownIdsRef = useRef<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    if (!apiKey) return

    try {
      const data = await getTraces(apiKey, 1, 50)
      
      // Find new trace IDs
      const freshIds = new Set<string>()
      data.traces.forEach(trace => {
        if (!knownIdsRef.current.has(trace.id)) {
          freshIds.add(trace.id)
          knownIdsRef.current.add(trace.id)
        }
      })

      setTraces(data.traces)
      setTotal(data.total)
      setLastUpdated(new Date())
      setIsLoading(false)

      // Highlight new traces for 2 seconds
      if (freshIds.size > 0) {
        setNewTraceIds(freshIds)
        setTimeout(() => setNewTraceIds(new Set()), 2000)
      }
    } catch (error) {
      console.error('Failed to fetch traces:', error)
      setIsLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    fetchData()

    // Poll every 10 seconds
    const interval = setInterval(fetchData, 10000)

    return () => clearInterval(interval)
  }, [fetchData])

  return {
    traces,
    total,
    newTraceIds,
    isLoading,
    lastUpdated
  }
}
