
import { useMemo, useState } from 'react'
import { Package, Search, Pencil, Trash2 } from 'lucide-react'


import type { Product } from '../types/analytics'
import ProductForm from '../components/ProductForm'
import ProductEditForm from '../components/ProductEditForm'
import DeactivateProductDialog from '../components/DeactivateProductDialog'

interface ProductsPageProps {
  products: Product[] | null
  loading: boolean
  error: string | null
  onRetry: () => void
  onCreated: () => void
}

const formatPrice = (price: string) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(price))

function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      label: 'Agotado',
      color: 'bg-red-100 text-red-700',
    }
  }

  if (stock <= 5) {
    return {
      label: 'Crítico',
      color: 'bg-orange-100 text-orange-700',
    }
  }

  if (stock < 10) {
    return {
      label: 'Bajo',
      color: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    label: 'Disponible',
    color: 'bg-green-100 text-green-700',
  }
}

export default function ProductsPage({
  products,
  loading,
  error,
  onRetry,
  onCreated
}: ProductsPageProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editingProduct, setEditingProduct] =
  useState<Product | null>(null)
  const[saveMessage, setSaveMessage] =
  useState<string | null>(null)
  const [deactivatingProduct, setDeactivatingProduct] =
  useState<Product | null>(null)

  const categories = useMemo(
    () => [...new Set((products ?? []).map(p => p.category))].sort(),
    [products]
  )

  const filteredProducts = useMemo(() => {
    return (products ?? []).filter((product) => {
      const matchesSearch = product.name
        .toLocaleLowerCase('es-MX')
        .includes(search.toLocaleLowerCase('es-MX'))

      const matchesCategory =
        category === 'all' || product.category === category

      return matchesSearch && matchesCategory
    })
  }, [products, search, category])

    function handleProductSaved() {
    setEditingProduct(null)
    setSaveMessage('Producto actualizado correctamente.')
    onRetry()
    }

    function handleProductDeactivated() {
    setDeactivatingProduct(null)
    setEditingProduct(null)
    setSaveMessage('Producto desactivado correctamente.')
    onRetry()
    }

    

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">
          Gestión de productos
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Consulta y organiza el catálogo de CorexBI.
        </p>
      </div>

      <ProductForm onCreated={onCreated} />

      
        {saveMessage && (
        <p
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
            {saveMessage}
        </p>
        )}

        {editingProduct && (
        <ProductEditForm
            key={editingProduct.id}
            product={editingProduct}
            onSaved={handleProductSaved}
            onCancel={() => setEditingProduct(null)}
        />
        )}

        
        {deactivatingProduct && (
        <DeactivateProductDialog
            product={deactivatingProduct}
            onCancel={() => setDeactivatingProduct(null)}
            onDeactivated={handleProductDeactivated}
        />
        )}



      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              aria-label="Buscar producto"
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filtrar por categoría"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p role="status" className="mt-6 text-sm text-slate-500">
            Cargando productos...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-red-50 p-4"
          >
            <p className="flex-1 text-sm text-red-700">
              No se pudo cargar el catálogo: {error}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && products && (
          <>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="pb-4 pr-4 font-medium">Producto</th>
                    <th className="pb-4 pr-4 font-medium">Categoría</th>
                    <th className="pb-4 pr-4 font-medium">Precio</th>
                    <th className="pb-4 pr-4 font-medium">Stock</th>
                    <th className="pb-4 font-medium">Estado</th>
                    <th className="pb-4 pl-4 font-medium">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product.stock)

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                              <Package size={18} />
                            </div>
                            <div>
                              <p className="font-semibold">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                ID: {product.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 pr-4">
                          {product.category}
                        </td>
                        <td className="py-4 pr-4 font-medium">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-4 pr-4">
                          {product.stock}
                        </td>
                        <td className="py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        
                        
                        <td className="py-4 pl-4">
                        <div className="flex items-center gap-2">
                            <button
                            type="button"
                            onClick={() => {
                                setSaveMessage(null)
                                setEditingProduct(product)
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                            aria-label={`Editar ${product.name}`}
                            >
                            <Pencil size={15} />
                            Editar
                            </button>

                            <button
                            type="button"
                            onClick={() => {
                                setSaveMessage(null)
                                setEditingProduct(null)
                                setDeactivatingProduct(product)
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            aria-label={`Desactivar ${product.name}`}
                            >
                            <Trash2 size={15} />
                            Desactivar
                            </button>
                        </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-500">
                  No se encontraron productos con esos filtros.
                </p>
              )}
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Mostrando {filteredProducts.length} de {products.length} productos activos.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
