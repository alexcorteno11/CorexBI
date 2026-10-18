
import { useState } from 'react'
import {
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react'

import { createSale } from '../services/api'
import type {
  Product,
  SaleItemCreate,
  SaleResponse,
} from '../types/analytics'

interface SalesPageProps {
  products: Product[] | null
  loading: boolean
  error: string | null
  onRetry: () => void
  onSaleCreated: () => void
}

interface SaleLine {
  productId: number
  quantity: number
}

const money = (amount: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)

export default function SalesPage({
  products,
  loading,
  error,
  onRetry,
  onSaleCreated,
}: SalesPageProps) {
  const [lines, setLines] = useState<SaleLine[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdSale, setCreatedSale] =
    useState<SaleResponse | null>(null)

  const availableProducts = (products ?? []).filter(
    (product) => product.is_active && product.stock > 0
  )

  const productsById = new Map(
    (products ?? []).map((product) => [
      product.id,
      product,
    ])
  )

  const total = lines.reduce((sum, line) => {
    const product = productsById.get(line.productId)
    return sum + Number(product?.price ?? 0) * line.quantity
  }, 0)

  function addProduct() {
    const productId = Number(selectedId)

    if (!productId) return

    const product = availableProducts.find(
      (item) => item.id === productId
    )

    if (!product) return

    if (lines.some((line) => line.productId === productId)) {
      setSubmitError('Ese producto ya está en la venta.')
      return
    }

    setSubmitError(null)
    setCreatedSale(null)
    setLines((current) => [
      ...current,
      { productId, quantity: 1 },
    ])
    setSelectedId('')
  }

  function changeQuantity(productId: number, value: number) {
    setCreatedSale(null)

    setLines((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: value }
          : line
      )
    )
  }

  function removeProduct(productId: number) {
    setCreatedSale(null)
    setLines((current) =>
      current.filter((line) => line.productId !== productId)
    )
  }

  async function handleSubmit() {
    if (submitting) return

    setSubmitError(null)
    setCreatedSale(null)

    if (!products || lines.length === 0) {
      setSubmitError('Agrega al menos un producto.')
      return
    }

    for (const line of lines) {
      const product = productsById.get(line.productId)

      if (!product || !product.is_active) {
        setSubmitError('Uno de los productos ya no está disponible.')
        return
      }

      if (
        !Number.isSafeInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > product.stock
      ) {
        setSubmitError(
          `La cantidad de "${product.name}" debe estar entre 1 y ${product.stock}.`
        )
        return
      }
    }

    const items: SaleItemCreate[] = lines.map((line) => ({
      product_id: line.productId,
      quantity: line.quantity,
    }))

    try {
      setSubmitting(true)

      const sale = await createSale({ items })

      setCreatedSale(sale)
      setLines([])
      setSelectedId('')
      onSaleCreated()
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Registro de ventas
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Registra ventas y actualiza el inventario.
        </p>
      </div>

      {loading && (
        <p role="status" className="text-sm text-slate-500">
          Cargando catálogo...
        </p>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      {createdSale && (
        <div
          role="status"
          className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800"
        >
          <p className="font-semibold">
            Venta #{createdSale.sale_id} registrada correctamente.
          </p>
          <p className="mt-1 text-sm">
            Estado: {createdSale.status} · Total confirmado:{' '}
            {money(Number(createdSale.total))}
          </p>
        </div>
      )}

      {products && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">
            Nueva venta
          </h3>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <select
              aria-label="Seleccionar producto"
              value={selectedId}
              disabled={submitting}
              onChange={(event) => setSelectedId(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">Selecciona un producto</option>

              {availableProducts
                .filter(
                  (product) =>
                    !lines.some(
                      (line) => line.productId === product.id
                    )
                )
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {money(Number(product.price))}
                    {' '}({product.stock} disponibles)
                  </option>
                ))}
            </select>

            <button
              type="button"
              onClick={addProduct}
              disabled={submitting || !selectedId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Plus size={18} />
              Agregar
            </button>
          </div>

          {lines.length === 0 ? (
            <div className="mt-7 rounded-xl bg-slate-50 px-4 py-10 text-center">
              <ShoppingCart
                size={28}
                className="mx-auto text-slate-400"
              />
              <p className="mt-3 text-sm text-slate-500">
                Agrega productos para comenzar una venta.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Producto</th>
                    <th className="pb-3 pr-4">Cantidad</th>
                    <th className="pb-3 pr-4">Subtotal</th>
                    <th className="pb-3">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {lines.map((line) => {
                    const product = productsById.get(line.productId)

                    if (!product) return null

                    return (
                      <tr
                        key={line.productId}
                        className="border-b border-slate-100"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-semibold">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Stock: {product.stock}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          <input
                            type="number"
                            min="1"
                            max={product.stock}
                            step="1"
                            disabled={submitting}
                            value={line.quantity}
                            aria-label={`Cantidad de ${product.name}`}
                            onChange={(event) =>
                              changeQuantity(
                                line.productId,
                                Number(event.target.value)
                              )
                            }
                            className="w-24 rounded-lg border border-slate-200 px-3 py-2"
                          />
                        </td>

                        <td className="py-4 pr-4 font-medium">
                          {money(
                            Number(product.price) * line.quantity
                          )}
                        </td>

                        <td className="py-4">
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => removeProduct(line.productId)}
                            aria-label={`Quitar ${product.name}`}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <div>
              <p className="text-xs text-slate-500">
                Total estimado
              </p>
              <p className="text-2xl font-bold">
                {money(total)}
              </p>
            </div>

            <button
              type="button"
              disabled={submitting || loading || lines.length === 0}
              onClick={() => void handleSubmit()}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Registrando...' : 'Registrar venta'}
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            El total estimado usa los precios cargados.
            FastAPI verifica nuevamente precios y existencias
            antes de confirmar la venta.
          </p>

          {submitError && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {submitError}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
