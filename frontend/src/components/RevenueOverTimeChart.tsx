
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { RevenueOverTimeResponse } from '../types/analytics'

interface RevenueOverTimeChartProps {
  data: RevenueOverTimeResponse | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

export default function RevenueOverTimeChart({
  data,
  loading,
  error,
  onRetry,
}: RevenueOverTimeChartProps) {
  if (loading) {
    return (
      <p role="status" className="py-16 text-center text-sm text-slate-500">
        Cargando evolución de ingresos...
      </p>
    )
  }

  if (error) {
    return (
      <div role="alert" className="space-y-3 py-8 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">
        No hay ventas completadas para visualizar.
      </p>
    )
  }

  const money = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: data.currency,
    maximumFractionDigits: 2,
  })

  const chartData = data.data.map((item) => ({
    date: item.date,
    revenue: item.revenue,
    sales: item.sales_count,
  }))

  return (
    <div className="space-y-4">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 24,
              left: 8,
              bottom: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(value: string) =>
                value.slice(5)
              }
            />

            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(value: number) =>
                `$${value.toLocaleString('es-MX')}`
              }
            />

            <Tooltip
              labelFormatter={(label) =>
                `Fecha: ${String(label)}`
              }
              formatter={(value) => [
                money.format(Number(value ?? 0)),
                'Ingresos',
              ]}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-center text-xs text-slate-500">
        Ingresos diarios de ventas completadas · {data.currency}
      </p>
    </div>
  )
}
