
import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
  TrendingUp,
  X,
} from 'lucide-react'
import { useAnalyticsSummary } from './hooks/useAnalyticsSummary'
import { useDashboardData } from './hooks/useDashboardData'
import LowStockPanel from './components/LowStockPanel'
import ProductsPage from './pages/ProductsPage'
import RevenueChart from './components/RevenueChart'
import { useRevenueOverTime } from './hooks/useRevenueOverTime'
import RevenueOverTimeChart from './components/RevenueOverTimeChart'
import InventoryPage from './pages/InventoryPage'
import SalesPage from './pages/SalesPage'

type Section = 'Dashboard' | 'Productos' | 'Ventas' | 'Inventario'

const navigation = [
  { name: 'Dashboard' as Section, icon: LayoutDashboard },
  { name: 'Productos' as Section, icon: Package },
  { name: 'Ventas' as Section, icon: ShoppingCart },
  { name: 'Inventario' as Section, icon: Boxes },
]

function App() {
  const [activeSection, setActiveSection] =
    useState<Section>('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [startDate, setStartDate] = useState('2026-10-09')
  const [endDate, setEndDate] = useState('2026-10-12')

  const [appliedStartDate, setAppliedStartDate] =
    useState('2026-10-09')

  const [appliedEndDate, setAppliedEndDate] =
    useState('2026-10-12')

  const invalidDateRange = Boolean(
    startDate &&
    endDate &&
    startDate > endDate
  )

  const datesHaveChanged =
    startDate !== appliedStartDate ||
    endDate !== appliedEndDate


  const {
    data: summary,
    loading,
    error,
    refresh,
  } = useAnalyticsSummary()


  const {
    topProducts,
    lowStock,
    products,
    loading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard,
  } = useDashboardData()


  const {
    data: revenueOverTime,
    loading: revenueOverTimeLoading,
    error: revenueOverTimeError,
    refresh: refreshRevenueOverTime,
  } = useRevenueOverTime(
    appliedStartDate,
    appliedEndDate
  )

  function handleSaleCreated() {
  refresh()
  refreshDashboard()
  refreshRevenueOverTime()
  }



  const revenue = summary
    ? new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: summary.currency,
      }).format(summary.total_revenue)
    : '—'

  const metrics = [
    {
      label: 'Ingresos totales',
      value: revenue,
      description: summary ? summary.currency : 'Sin datos',
      icon: TrendingUp,
    },
    {
      label: 'Ventas registradas',
      value: summary
        ? summary.total_sales.toLocaleString('es-MX')
        : '—',
      description: 'Datos reales de CorexBI',
      icon: ShoppingCart,
    },
    {
      label: 'Productos activos',
      value: products
        ? products.filter((product) => product.is_active).length.toString()
        : '—',
      description: 'Catálogo actual',
      icon: Package,
    },
    {
      label: 'Inventario bajo',
      value: lowStock
        ? lowStock.total_low_stock.toString()
        : '—',
      description: lowStock
        ? `Umbral: ${lowStock.threshold} unidades`
        : 'Sin datos',
      icon: AlertTriangle,
    },

  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64
          transform bg-slate-950 text-white transition-transform
          lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">CorexBI</h1>
              <p className="text-xs text-slate-400">
                Business Intelligence
              </p>
            </div>
          </div>

          <button
            className="lg:hidden"
            aria-label="Cerrar menú"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 p-4">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => {
                setActiveSection(name)
                setSidebarOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl
                px-4 py-3 text-left text-sm font-medium transition ${
                  activeSection === name
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
            >
              <Icon size={20} />
              {name}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-white/5 p-4">
          <p className="text-sm font-semibold">CorexBI v0.1</p>
          <p className="mt-1 text-xs text-slate-400">
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden"
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <p className="text-xs text-slate-500">
                CorexBI / {activeSection}
              </p>
              <h2 className="text-xl font-bold">{activeSection}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            <Activity size={15} />
            Modo demostración
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-7 p-5 md:p-8">
          {activeSection === 'Dashboard' ? (
            <>
              <section>
              <p className="mt-1 text-sm text-slate-500">
                Indicadores obtenidos de la API de CorexBI.
              </p>

              {loading && (
                <p role="status" className="mt-3 text-sm text-blue-600">
                  Cargando indicadores...
                </p>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <p className="flex-1 text-sm text-red-700">
                    No se pudieron cargar los indicadores: {error}
                  </p>

                  <button
                    type="button"
                    onClick={refresh}
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
                  >
                    Reintentar
                  </button>
                </div>

              )}

              {dashboardLoading && (
                <p role="status" className="mt-3 text-sm text-blue-600">
                  Cargando productos e inventario...
                </p>
              )}

              {dashboardError && (
                <div
                  role="alert"
                  className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <p className="flex-1 text-sm text-red-700">
                    Error al cargar inventario y productos: {dashboardError}
                  </p>
                  <button
                    type="button"
                    onClick={refreshDashboard}
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white"
                  >
                    Reintentar
                  </button>
                </div>
              )}


              {!loading && !error && summary && (
                <p role="status" className="mt-3 text-sm font-medium text-green-700">
                  Datos actualizados desde FastAPI
                </p>
              )}


              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map(({ label, value, description, icon: Icon }) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">{label}</p>
                      <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                        <Icon size={20} />
                      </div>
                    </div>
                    <p className="mt-5 text-3xl font-bold">{value}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {description}
                    </p>
                  </article>
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">
                        Ingresos por producto
                      </h4>
                    </div>
                    <BarChart3 className="text-blue-600" />
                  </div>

                  <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                    <RevenueChart
                      data={topProducts}
                      loading={dashboardLoading}
                    />
                  </div>
                </article>


                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Evolución de ingresos
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Ingresos diarios de las ventas completadas.
                    </p>
                  </div>


                  <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="block text-sm font-medium text-slate-700">
                          Fecha inicial
                        </span>

                        <input
                          type="date"
                          value={startDate}
                          onChange={(event) => setStartDate(event.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="block text-sm font-medium text-slate-700">
                          Fecha final
                        </span>

                        <input
                          type="date"
                          value={endDate}
                          onChange={(event) => setEndDate(event.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </label>
                    </div>

                    {invalidDateRange && (
                      <p role="alert" className="mt-3 text-sm text-red-600">
                        La fecha inicial no puede ser posterior a la fecha final.
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Los límites son inclusivos. Puedes dejar una fecha vacía.
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStartDate('')
                            setEndDate('')
                            setAppliedStartDate('')
                            setAppliedEndDate('')
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Ver todo
                        </button>

                        <button
                          type="button"
                          disabled={invalidDateRange || !datesHaveChanged}
                          onClick={() => {
                            setAppliedStartDate(startDate)
                            setAppliedEndDate(endDate)
                          }}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Aplicar filtros
                        </button>
                      </div>
                    </div>
                  </div>


                  <RevenueOverTimeChart
                    data={revenueOverTime}
                    loading={revenueOverTimeLoading}
                    error={revenueOverTimeError}
                    onRetry={refreshRevenueOverTime}
                  />
                </section>


                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-lg font-semibold">
                    Productos destacados
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Productos con mayor ganancia
                  </p>
                    <div className="mt-6 space-y-5">
                      {topProducts?.products.length === 0 && (
                        <p className="text-sm text-slate-500">
                          Todavía no hay ventas registradas.
                        </p>
                      )}

                      {topProducts?.products.map((product, index) => (
                        <div
                          key={product.product_id}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-semibold text-blue-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {product.product_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.units_sold} unidades vendidas
                            </p>
                          </div>

                          <span className="text-sm font-semibold">
                            {new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: topProducts.currency,
                              maximumFractionDigits: 0,
                            }).format(product.revenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                </article>
                <LowStockPanel
                data={lowStock}
                loading={dashboardLoading}
              />
              </section>
            </>
          ) : activeSection === 'Productos' ? (
            <ProductsPage
              products={products}
              loading={dashboardLoading}
              error={dashboardError}
              onRetry={refreshDashboard}
              onCreated={refreshDashboard}
            />

          ) : activeSection === 'Inventario' ? (
            <InventoryPage
              products={products}
              lowStock={lowStock}
              loading={dashboardLoading}
              error={dashboardError}
              onRetry={refreshDashboard}
            />

          ) : activeSection === 'Ventas' ? (
            <SalesPage
              products={products}
              loading={dashboardLoading}
              error={dashboardError}
              onRetry={refreshDashboard}
              onSaleCreated={handleSaleCreated}
            />
          ) : null}

          <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
            CorexBI · Plataforma de análisis de ventas e inventario
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App
