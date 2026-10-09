from decimal import Decimal

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Product


def seed_products():
    products = [
        {
            "name": "Teclado mecánico",
            "category": "Periféricos",
            "price": Decimal("850.00"),
            "stock": 15,
        },
        {
            "name": "Mouse inalámbrico",
            "category": "Periféricos",
            "price": Decimal("420.00"),
            "stock": 30,
        },
        {
            "name": "Monitor 24 pulgadas",
            "category": "Monitores",
            "price": Decimal("2800.00"),
            "stock": 8,
        },
        {
            "name": "Cable USB-C",
            "category": "Accesorios",
            "price": Decimal("150.00"),
            "stock": 50,
        },
        {
            "name": "Audífonos",
            "category": "Audio",
            "price": Decimal("650.00"),
            "stock": 4,
        },
    ]

    with SessionLocal() as session:
        for item in products:
            existing = session.scalar(
                select(Product).where(Product.name == item["name"])
            )
            if existing is None:
                session.add(Product(**item))

        session.commit()

    print("Productos de demostracion cargados correctamente")


if __name__ == "__main__":
    seed_products()
