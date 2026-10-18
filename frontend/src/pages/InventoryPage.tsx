
import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Package,
  PackageX,
  RefreshCw,
  Search,
} from 'lucide-react'

import type {
  Product,
  LowStockResponse,
  StockStatus,
} from '../types/analytics'

interface InventoryPageProps {
  products: Product[] | null
  lowStock: LowStockResponse | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

type InventoryStatus = StockStatus | 'available'
type StatusFilter = InventoryStatus | 'all'


interface InventoryProduct extends Product {
  inventoryStatus: InventoryStatus
}


const statusStyles: Record<
  InventoryStatus,
  { label: string; className: string }
> = {
  out_of_stock: {
    label: 'Agotado',
    className: 'bg-red-100 text-red-700',
  },
  critical: {
    label: 'Crítico',
    className: 'bg-orange-100 text-orange-700',
  },
  low: {
    label: 'Bajo',
    className: 'bg-amber-100 text-amber-700',
  },
  available: {
    label: 'Disponible',
    className: 'bg-green-100 text-green-700',
  },
}

export default function InventoryPage({
  products,
  lowStock,
  loading,
  error,
  onRetry,
}: InventoryPageProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all')

  const statusById = useMemo(() => {
    return new Map(
      (lowStock?.products ?? []).map((product) => [
        product.id,
        product.status,
      ])
    )
  }, [lowStock])

  const activeProducts = useMemo(
    () => (products ?? []).filter((p) => p.is_active),
    [products]
  )


    const inventory = useMemo<InventoryProduct[]>(() => {
    return activeProducts.map((product) => ({
        ...product,
        inventoryStatus:
        statusById.get(product.id) ?? 'available',
    }))
    }, [activeProducts, statusById])


  const filteredInventory = useMemo(() => {
    const searchText = search.trim().toLocaleLowerCase('es-MX')

    return inventory.filter((product) => {
      const matchesSearch =
        product.name.toLocaleLowerCase('es-MX').includes(searchText) ||
        product.category.toLocaleLowerCase('es-MX').includes(searchText)

      const matchesStatus =
        statusFilter === 'all' ||
        product.inventoryStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [inventory, search, statusFilter])

  const outOfStock = inventory.filter(
    (product) => product.inventoryStatus === 'out_of_stock'
  ).length

  const alerts = inventory.filter(
    (product) => product.inventoryStatus !== 'available'
  ).length

  const ready = !loading && !error && products && lowStock

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Control de inventario
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Consulta existencias y detecta productos que requieren atención.
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      {loading && (
        <p role="status" className="text-sm text-slate-500">
          Cargando inventario...
        </p>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-4">
          <p className="text-sm text-red-700">
            No se pudo cargar el inventario: {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      {ready && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              label="Productos activos"
              value={activeProducts.length}
              icon={<Package size={21} />}
              color="text-blue-600"
            />
            <Metric
              label="Alertas de inventario"
              value={alerts}
              icon={<AlertTriangle size={21} />}
              color="text-amber-600"
            />
            <Metric
              label="Productos agotados"
              value={outOfStock}
              icon={<PackageX size={21} />}
              color="text-red-600"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  aria-label="Buscar en inventario"
                  placeholder="Buscar producto o categoría..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                />
              </div>

              <select
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="all">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="low">Bajo</option>
                <option value="critical">Crítico</option>
                <option value="out_of_stock">Agotado</option>
              </select>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="pb-4 pr-4 font-medium">Producto</th>
                    <th className="pb-4 pr-4 font-medium">Categoría</th>
                    <th className="pb-4 pr-4 font-medium">Existencias</th>
                    <th className="pb-4 font-medium">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInventory.map((product) => {
                    const status = statusStyles[product.inventoryStatus]

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-4 pr-4 font-medium">
                          {product.name}
                        </td>
                        <td className="py-4 pr-4">
                          {product.category}
                        </td>
                        <td className="py-4 pr-4 font-semibold">
                          {product.stock}
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredInventory.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-500">
                  No se encontraron productos con estos filtros.
                </p>
              )}
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Mostrando {filteredInventory.length} de {inventory.length}
              {' '}productos activos. Umbral de alerta: {lowStock.threshold}
              {' '}unidades o menos.
            </p>
          </div>
        </>
      )}
    </section>
  )
}

interface MetricProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

function Metric({ label, value, icon, color }: MetricProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={color}>{icon}</div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}
