import { describe, expect, it, vi } from "vitest";
import { render, screen } from '@testing-library/react'
import userEvent from "@testing-library/user-event"

import InventoryPage from "../pages/InventoryPage"

describe('InventoryPage', () => {
    it('muestra un error y permite reintentar', async () => {
        const user = userEvent.setup()
        const onRetry = vi.fn()

        render(
            <InventoryPage
                products={null}
                lowStock={null}
                loading={false}
                error="No se pudo conectar con FastAPI"
                onRetry={onRetry}
            />
        )

        expect(
            screen.getByRole('alert')
        ).toHaveTextContent(
            'No se pudo conectar con FastAPI'
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Reintentar',
            })
        )

        expect(onRetry).toHaveBeenCalledOnce()
    })
})