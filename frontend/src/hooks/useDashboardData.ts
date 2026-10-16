
import { useEffect, useState } from 'react'

import {
  getTopProducts,
  getLowStock,
  getProducts,
} from '../services/api'

import type {
  TopProductsResponse,
  LowStockResponse,
  Product,
} from '../types/analytics'

export function useDashboardData() {
  const [topProducts, setTopProducts] =
    useState<TopProductsResponse | null>(null)

  const [lowStock, setLowStock] =
    useState<LowStockResponse | null>(null)

  const [products, setProducts] =
    useState<Product[] | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDashboard() {
      setLoading(true)
      setError(null)

      try {
        const [ranking, inventory, catalog] =
          await Promise.all([
            getTopProducts(controller.signal),
            getLowStock(controller.signal),
            getProducts(controller.signal),
          ])

        if (!controller.signal.aborted) {
          setTopProducts(ranking)
          setLowStock(inventory)
          setProducts(catalog)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setTopProducts(null)
          setLowStock(null)
          setProducts(null)

          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el dashboard'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => controller.abort()
  }, [refreshKey])

  return {
    topProducts,
    lowStock,
    products,
    loading,
    error,
    refresh: () => setRefreshKey((value) => value + 1),
  }
}
