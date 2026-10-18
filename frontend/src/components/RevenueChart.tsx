import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

import type { TopProductsResponse } from '../types/analytics'

interface RevenueChartProps {
    data: TopProductsResponse | null
    loading: boolean
}

export default function RevenueChart({
    data,
    loading,
}: RevenueChartProps) {
    if (loading) {
    return (
      <p className="py-16 text-center text-slate-500">
        Cargando gráfica...
      </p>
    )
  }

  if (!data || data.products.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        No hay datos de ventas disponibles.
      </p>
    )
  }

  const chartData = data.products.map((product) => ({
    name: product.product_name,
    revenue: product.revenue,
    units: product.units_sold,
  }))

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: data.currency,
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
          />

          <XAxis
            type="number"
            tickFormatter={(value: number) => formatCurrency(value)}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={125}
            tick={{ fontSize: 11 }}
          />

          <Tooltip
            formatter={(value) =>
              formatCurrency(Number(value ?? 0))
            }
          />

          <Bar
            dataKey="revenue"
            name="Ingresos"
            fill="#2563eb"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}