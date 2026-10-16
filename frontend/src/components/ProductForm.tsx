
import { useState, type FormEvent } from 'react'
import { Plus, Save } from 'lucide-react'

import { createProduct } from '../services/api'

interface ProductFormProps {
  onCreated: () => void
}

export default function ProductForm({
  onCreated,
}: ProductFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    setError(null)
    setSuccess(null)

    const cleanName = name.trim()
    const cleanCategory = category.trim()
    const cleanPrice = price.trim()

    if (!cleanName || !cleanCategory) {
      setError('Nombre y categoría son obligatorios.')
      return
    }

    if (!/^\d+(\.\d{1,2})?$/.test(cleanPrice)) {
      setError('Introduce un precio válido con máximo dos decimales.')
      return
    }

    const normalizedPrice = Number(cleanPrice)

    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      setError('El precio no puede ser negativo.')
      return
    }

    const stockNumber = Number(stock)

    if (
      !Number.isSafeInteger(stockNumber) ||
      stockNumber < 0 ||
      stock.trim() === ''
    ) {
      setError('El stock debe ser un número entero no negativo.')
      return
    }

    try {
      setSubmitting(true)

      const created = await createProduct({
        name: cleanName,
        category: cleanCategory,
        price: cleanPrice,
        stock: stockNumber,
      })

      setSuccess(
        `Producto "${created.name}" registrado correctamente (ID ${created.id}).`
      )

      setName('')
      setCategory('')
      setPrice('')
      setStock('0')
      setOpen(false)

      onCreated()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al registrar el producto.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Registra nuevos productos en el inventario.
        </p>

        <button
          type="button"
          onClick={() => {
            setOpen((value) => !value)
            setError(null)
          }}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Plus size={18} />
          {open ? 'Cerrar formulario' : 'Nuevo producto'}
        </button>
      </div>

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {open && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h4 className="mb-5 text-lg font-semibold">
            Registrar producto
          </h4>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium">
                Nombre del producto
              </span>
              <input
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Adaptador HDMI"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">
                Categoría
              </span>
              <input
                required
                maxLength={80}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Ej. Accesorios"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">
                Precio (MXN)
              </span>
              <input
                required
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="299.90"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <span className="block text-xs text-slate-400">
                Utiliza un punto para los decimales.
              </span>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">
                Existencias iniciales
              </span>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {submitting ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
