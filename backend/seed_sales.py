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
        existing_sale = session.scalar(select(Sale.id).limit(1))

        if existing_sale is not None:
            print(
                "Ya existen ventas. No se insertaron datos para evitar duplicarlos"
            )
            return

        products = {
            product.name: product
            for product in session.scalars(select(Product)).all()
        }

        for sale_data in SAMPLE_SALES:
            for product_name, quantity in sale_data:
                if product_name not in products:
                    raise ValueError(
                        f"No existe el producto : {product_name}"
                    )

                if products[product_name].stock < quantity:
                    raise ValueError(
                        f"Stock insuficiente : {product_name}"
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

        print("Ventas de demostracion registradas correctamente")


if __name__ == "__main__":
    seed_sales()
