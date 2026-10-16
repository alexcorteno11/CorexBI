

import type {
  AnalyticsSummary,
  TopProductsResponse,
  LowStockResponse,
  Product,
  ProductCreate,
  ProductUpdate
} from '../types/analytics'

const API_BASE_URL = '/api'

async function apiGet<T>(
  endpoint: string,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    { signal }
  )

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status} en ${endpoint}`
    )
  }

  return (await response.json()) as T
}

export function getAnalyticsSummary(
  signal?: AbortSignal
): Promise<AnalyticsSummary> {
  return apiGet<AnalyticsSummary>(
    '/analytics/summary',
    signal
  )
}

export function getTopProducts(
  signal?: AbortSignal
): Promise<TopProductsResponse> {
  return apiGet<TopProductsResponse>(
    '/analytics/top-products?limit=5',
    signal
  )
}

export function getLowStock(
  signal?: AbortSignal
): Promise<LowStockResponse> {
  return apiGet<LowStockResponse>(
    '/inventory/low-stock?threshold=10',
    signal
  )
}

export function getProducts(
  signal?: AbortSignal
): Promise<Product[]> {
  return apiGet<Product[]>(
    '/products',
    signal
  )
}

export async function createProduct(product: ProductCreate): Promise<Product> 
{
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })
  
  if(!response.ok) {
    if(response.status === 422) {
      throw new Error(
        'Los datos del producto no son validos'
      )
    }

    throw new Error(
      `No se pudo crear el producto (HTTP ${response.status})`
    )
  }
  return (await response.json()) as Product
}

export async function updateProduct(
  productId: number,
  changes: ProductUpdate
): Promise<Product> {
  const response = await fetch(
    `/api/products/${productId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes),
    }
  )
  
  if(!response.ok) {
    if (response.status === 404) {
      throw new Error(
        'El producto no existe o esta desactivado'
      )
    }

    if (response.status === 422) {
      throw new Error(
        'Los datos enviados no son validos'
      )
    }

    throw new Error(
      `No se pudo actualizar el producto (HTTP ${response.status})`
    )
  }

  return (await response.json()) as Product
}


export async function deactivateProduct(
  productId: number
): Promise<void> {
  const response = await fetch(
    `/api/products/${productId}`,
    {
      method: 'DELETE',
    }
  )

  if (response.status === 404) {
    throw new Error(
      'El producto no existe o ya está desactivado.'
    )
  }

  if (!response.ok) {
    throw new Error(
      `No se pudo desactivar el producto (HTTP ${response.status})`
    )
  }
}

