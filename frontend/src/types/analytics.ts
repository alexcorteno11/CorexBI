export interface AnalyticsSummary {
    total_sales: number
    total_revenue: number
    currency: string
}

export interface TopProduct {
    total_sales: number
    total_revenue: number
    currency: string
}

export interface TopProduct {
    product_id: number
    product_name: string
    units_sold: number
    revenue: number
}

export interface TopProductsResponse {
    products: TopProduct[]
    currency: string
}

export type StockStatus = | 'out_of_stock' | 'critical' | 'low'

export interface LowStockProduct {
    id: number
    name: string
    category: string
    stock: number
    price: number
    status: StockStatus
}

export interface LowStockResponse {
    threshold: number
    total_low_stock: number
    products:LowStockProduct[]
    currency: string
}

export interface Product {
    id: number
    name: string
    category: string
    price: string
    stock: number
    is_active: boolean
}

export interface ProductCreate {
    name: string
    category: string
    price: string
    stock: number
}

export interface ProductUpdate {
    name?: string
    category?: string
    price?: string
    stock?: number
}

export interface DailyRevenue {
    date: string
    sales_count: number
    revenue: number
}

export interface RevenueOverTimeResponse {
    currency: string
    data: DailyRevenue[]
}

export interface SaleItemCreate {
    product_id: number
    quantity: number
}

export interface SaleCreate {
    items: SaleItemCreate[]
}

export interface SaleItemResponse {
    product_id: number
    quantity: number
    unit_price: string
    subtotal: string
}

export interface SaleResponse {
    sale_id: number
    status: string
    total: string
    items: SaleItemResponse[]
}