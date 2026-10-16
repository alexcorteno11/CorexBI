import {
    AlertTriangle,
    PackageX,
    Package,
} from 'lucide-react'

import type {
    LowStockResponse,
    StockStatus,
} from '../types/analytics'

interface LowStockPanelProps {
    data: LowStockResponse | null
    loading: boolean
}

const statusConfig: Record<StockStatus,
{label: string; className: string}
> = {
    out_of_stock: {
        label: 'Agotado',
        className: 'bg-red-100 text-red-700',
    },
    critical : {
        label: 'critico',
        className: 'bg-orange-100 text-orange-700',
    },
    low: {
        label: 'Bajo',
        className: 'bg-amber-100 text-amber-700',
    },
}

export default function LowStockPanel({
    data,
    loading,
}: LowStockPanelProps) {
    return(
        <section className="rounded-2x1 border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
                <div className= "rounded-xl bg-amber-50 p-3 text-amber-600">
                    <AlertTriangle size={22} />
                </div>

                <div>
                    <h3 className="text-lg font-semibold">
                        Alertas de Inventario
                    </h3>
                    <p className="text-sm text-slate-500">
                        Productos que requieren atencion
                    </p>
                </div>
            </div>

            {loading && (
                <p className="mt-6 text-sm text-slate-500">
                Cargando inventario...
                </p>
            )}

            {!loading && !data && (
                <p className="mt-6 text-sm text-slate-500">
                No hay información disponible.
                </p>
            )}

            {!loading && data && (
                <>
                <p className="mt-5 text-sm text-slate-500">
                    {data.total_low_stock} productos con existencias
                    por debajo del umbral de {data.threshold}.
                </p>

                {data.products.length === 0 ? (
                    <p className="mt-5 text-sm text-green-700">
                    No hay alertas de inventario.
                    </p>
                ) : (
                    <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                            <th className="pb-3 pr-4 font-medium">
                            Producto
                            </th>
                            <th className="pb-3 pr-4 font-medium">
                            Stock
                            </th>
                            <th className="pb-3 font-medium">
                            Estado
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {data.products.map((product) => {
                            const status =
                            statusConfig[product.status]

                            return (
                            <tr
                                key={product.id}
                                className="border-b border-slate-100 last:border-0"
                            >
                                <td className="py-4 pr-4">
                                <div className="flex items-center gap-3">
                                    {product.stock === 0 ? (
                                    <PackageX
                                        size={18}
                                        className="shrink-0 text-red-500"
                                    />
                                    ) : (
                                    <Package
                                        size={18}
                                        className="shrink-0 text-slate-400"
                                    />
                                    )}
                                    <div>
                                    <p className="font-medium">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {product.category}
                                    </p>
                                    </div>
                                </div>
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
                    </div>
                )}
                </>
            )}
        </section>
    )
}