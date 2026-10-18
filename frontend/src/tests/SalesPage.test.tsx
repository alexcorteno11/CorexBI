
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SalesPage from '../pages/SalesPage'
import type { Product } from '../types/analytics'
import { createSale } from '../services/api'

vi.mock('../services/api', () => ({
  createSale: vi.fn(),
}))

const products: Product[] = [
  {
    id: 1,
    name: 'Monitor de prueba',
    category: 'Monitores',
    price: '2800.00',
    stock: 5,
    is_active: true,
  },
]

describe('SalesPage', () => {
  it('rechaza una venta si la cantidad supera el stock', async () => {
    const user = userEvent.setup()

    render(
      <SalesPage
        products={products}
        loading={false}
        error={null}
        onRetry={vi.fn()}
        onSaleCreated={vi.fn()}
      />
    )

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Seleccionar producto',
      }),
      '1'
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Agregar',
      })
    )

    const quantityInput = screen.getByRole('spinbutton', {
      name: 'Cantidad de Monitor de prueba',
    })

    await user.clear(quantityInput)
    await user.type(quantityInput, '8')

    await user.click(
      screen.getByRole('button', {
        name: 'Registrar venta',
      })
    )

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent(
      'debe estar entre 1 y 5'
    )

    expect(createSale).not.toHaveBeenCalled()
  })
})
