import { describe, expect, it, vi } from "vitest";
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ProductsPage from "../pages/ProductsPage";
import type { Product } from "../types/analytics";

const products: Product[] = [
  {
    id: 1,
    name: 'Teclado mecánico',
    category: 'Periféricos',
    price: '850.00',
    stock: 15,
    is_active: true,
  },
  {
    id: 2,
    name: 'Monitor 24 pulgadas',
    category: 'Monitores',
    price: '2800.00',
    stock: 8,
    is_active: true,
  },
  {
    id: 3,
    name: 'Audífonos',
    category: 'Audio',
    price: '650.00',
    stock: 4,
    is_active: true,
  },
]

describe('ProductsPage', () => {
  it('filtra productos por nombre', async () => {
    const user = userEvent.setup()

    render(
      <ProductsPage
        products={products}
        loading={false}
        error={null}
        onRetry={vi.fn()}
        onCreated={vi.fn()}
      />
    )

    expect(
      screen.getByText('Teclado mecánico')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Monitor 24 pulgadas')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Audífonos')
    ).toBeInTheDocument()


    const searchInput = screen.getByRole('searchbox', {
      name: 'Buscar producto',
    })

    await user.type(searchInput, 'Monitor')

    expect(
      screen.getByText('Monitor 24 pulgadas')
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Teclado mecánico')
    ).not.toBeInTheDocument()

    expect(
      screen.queryByText('Audífonos')
    ).not.toBeInTheDocument()
  })
})