
import { useEffect, useState } from 'react'

import { getAnalyticsSummary } from '../services/api'
import type { AnalyticsSummary } from '../types/analytics'

export function useAnalyticsSummary() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadSummary() {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const summary = await getAnalyticsSummary(
          controller.signal
        )

        if (!controller.signal.aborted) {
          setData(summary)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudieron cargar los indicadores'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadSummary()

    return () => controller.abort()
  }, [refreshKey])

  return {
    data,
    loading,
    error,
    refresh: () => setRefreshKey((value) => value + 1),
  }
}
