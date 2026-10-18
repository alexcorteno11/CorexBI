
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import DeactivateProductDialog from '../components/DeactivateProductDialog'
import { deactivateProduct } from '../services/api'
import type { Product } from '../types/analytics'

vi.mock('../services/api', () => ({
  deactivateProduct: vi.fn(),
}))

const product: Product = {
  id: 10,
  name: 'Monitor de prueba',
  category: 'Monitores',
  price: '2800.00',
  stock: 5,
  is_active: true,
}

describe('DeactivateProductDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('permite cancelar sin desactivar el producto', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onDeactivated = vi.fn()

    render(
      <DeactivateProductDialog
        product={product}
        onCancel={onCancel}
        onDeactivated={onDeactivated}
      />
    )

    expect(
      screen.getByText('¿Desactivar producto?')
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Cancelar',
      })
    )

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onDeactivated).not.toHaveBeenCalled()
    expect(deactivateProduct).not.toHaveBeenCalled()
  })
})
