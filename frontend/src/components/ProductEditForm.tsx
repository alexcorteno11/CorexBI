
import { useState, type FormEvent } from 'react'
import { Save, X } from 'lucide-react'

import { updateProduct } from '../services/api'
import type {
  Product,
  ProductUpdate,
} from '../types/analytics'

interface ProductEditFormProps {
  product: Product
  onSaved: () => void
  onCancel: () => void
}

export default function ProductEditForm({
  product,
  onSaved,
  onCancel,
}: ProductEditFormProps) {
  const [name, setName] = useState(product.name)
  const [category, setCategory] = useState(product.category)
  const [price, setPrice] = useState(product.price)
  const [stock, setStock] = useState(String(product.stock))

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    setError(null)

    const cleanName = name.trim()
    const cleanCategory = category.trim()
    const cleanPrice = price.trim()
    const cleanStock = stock.trim()

    if (!cleanName || !cleanCategory) {
      setError('Nombre y categoría son obligatorios.')
      return
    }

    if (!/^\d+(\.\d{1,2})?$/.test(cleanPrice)) {
      setError('El precio debe ser válido y tener máximo dos decimales.')
      return
    }

    if (
      !Number.isFinite(Number(cleanPrice)) ||
      Number(cleanPrice) > 99999999.99
    ) {
      setError('El precio está fuera del rango permitido.')
      return
    }

    if (!/^\d+$/.test(cleanStock)) {
      setError('El stock debe ser un número entero no negativo.')
      return
    }

    const stockNumber = Number(cleanStock)

    if (!Number.isSafeInteger(stockNumber)) {
      setError('Las existencias están fuera del rango permitido.')
      return
    }

    const changes: ProductUpdate = {}

    if (cleanName !== product.name) {
      changes.name = cleanName
    }

    if (cleanCategory !== product.category) {
      changes.category = cleanCategory
    }

    if (Number(cleanPrice) !== Number(product.price)) {
      changes.price = cleanPrice
    }

    if (stockNumber !== product.stock) {
      changes.stock = stockNumber
    }

    if (Object.keys(changes).length === 0) {
      setError('No has realizado cambios.')
      return
    }

    try {
      setSaving(true)
      await updateProduct(product.id, changes)
      onSaved()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al actualizar el producto.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">
            Editar producto
          </h4>
          <p className="text-sm text-slate-500">
            ID: {product.id}
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          aria-label="Cancelar edición"
          className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-sm font-medium">Nombre</span>
          <input
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>

        <label className="space-y-2">
          <span className="block text-sm font-medium">Categoría</span>
          <input
            required
            maxLength={80}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>

        <label className="space-y-2">
          <span className="block text-sm font-medium">
            Existencias
          </span>
          <input
            required
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
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

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
