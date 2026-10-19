
from collections import Counter
from decimal import Decimal

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Product, Sale, SaleItem


SAMPLE_SALES = [
    [
        ("Teclado mecánico", 2),
        ("Mouse inalámbrico", 1),
    ],
    [
        ("Monitor 24 pulgadas", 1),
        ("Cable USB-C", 2),
    ],
    [
        ("Teclado mecánico", 1),
        ("Mouse inalámbrico", 1),
        ("Audífonos", 1),
    ],
]


def seed_sales():
    with SessionLocal.begin() as session:
        existing_sale = session.scalar(
            select(Sale.id).limit(1)
        )

        if existing_sale is not None:
            print(
                "Ya existen ventas. No se insertaron "
                "datos para evitar duplicados."
            )
            return

        products = {
            product.name: product
            for product in session.scalars(
                select(Product)
            ).all()
        }

        required_stock = Counter()

        for sale_data in SAMPLE_SALES:
            for product_name, quantity in sale_data:
                if product_name not in products:
                    raise ValueError(
                        f"Producto inexistente: {product_name}"
                    )

                if quantity <= 0:
                    raise ValueError(
                        f"Cantidad inválida: {product_name}"
                    )

                required_stock[product_name] += quantity

        # Validar el consumo acumulado de todas las ventas.
        for product_name, quantity in required_stock.items():
            product = products[product_name]

            if not product.is_active:
                raise ValueError(
                    f"Producto inactivo: {product_name}"
                )

            if product.stock < quantity:
                raise ValueError(
                    f"Stock insuficiente para {product_name}. "
                    f"Disponible: {product.stock}, "
                    f"requerido: {quantity}"
                )

        for sale_data in SAMPLE_SALES:
            sale = Sale(status="completed")
            session.add(sale)
            session.flush()

            for product_name, quantity in sale_data:
                product = products[product_name]
                price = Decimal(str(product.price))

                item = SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=price,
                )

                session.add(item)
                product.stock -= quantity

    print(
        "Ventas de demostración registradas "
        "correctamente."
    )


if __name__ == "__main__":
    seed_sales()
