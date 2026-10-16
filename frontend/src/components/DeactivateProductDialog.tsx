
import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

import { deactivateProduct } from '../services/api'
import type { Product } from '../types/analytics'

interface DeactivateProductDialogProps {
  product: Product
  onCancel: () => void
  onDeactivated: () => void
}

export default function DeactivateProductDialog({
  product,
  onCancel,
  onDeactivated,
}: DeactivateProductDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDeactivate() {
    if (submitting) return

    setError(null)
    setSubmitting(true)

    try {
      await deactivateProduct(product.id)
      onDeactivated()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al desactivar el producto.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="deactivate-title"
        aria-describedby="deactivate-description"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
            <AlertTriangle size={24} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Cerrar confirmación"
            className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <h3
          id="deactivate-title"
          className="mt-5 text-xl font-bold"
        >
          ¿Desactivar producto?
        </h3>

        <p
          id="deactivate-description"
          className="mt-3 text-sm leading-6 text-slate-600"
        >
          El producto <strong>{product.name}</strong> dejará
          de aparecer en el catálogo activo y no podrá
          utilizarse en nuevas ventas.
        </p>

        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          El registro permanecerá en PostgreSQL y las
          ventas históricas se conservarán.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleDeactivate()}
            className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting
              ? 'Desactivando...'
              : 'Sí, desactivar'}
          </button>
        </div>
      </section>
    </div>
  )
}
