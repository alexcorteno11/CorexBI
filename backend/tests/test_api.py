from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.models import Product, SaleItem, Sale
from app.main import app
from app.core.dependencies import get_db


@pytest.fixture
def client():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    Base.metadata.create_all(bind=test_engine)

    TestingSession = sessionmaker(bind=test_engine)

    with TestingSession() as db:
        teclado = Product(
            name="Teclado",
            category="Perifericos",
            price=Decimal("850.00"),
            stock=12,
        )

        monitor = Product(
            name="Monitor",
            category="Monitores",
            price=Decimal("2800.00"),
            stock=7,
        )

        audifonos = Product(
            name="Audifonos",
            category="Audio",
            price=Decimal("650.00"),
            stock=3,
        )

        db.add_all([teclado, monitor, audifonos])
        db.flush()

        venta = Sale(status="completed")
        db.add(venta)
        db.flush()

        db.add_all([
            SaleItem(
                sale_id=venta.id,
                product_id=teclado.id,
                quantity=2,
                unit_price=Decimal("850.00"),
            ),
            SaleItem(
                sale_id=venta.id,
                product_id=monitor.id,
                quantity=1,
                unit_price=Decimal("2800.00"),
            ),
        ])

        db.commit()

    def override_get_db():
        with TestingSession() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_db, None)
        test_engine.dispose()


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analytics_summary(client):
    response = client.get("/analytics/summary")

    assert response.status_code == 200

    data = response.json()

    assert data["total_sales"] == 1
    assert data["total_revenue"] == 4500.0
    assert data["currency"] == "MXN"


def test_top_products_limit(client):
    response = client.get(
        "/analytics/top-products?limit=1"
    )

    assert response.status_code == 200

    products = response.json()["products"]

    assert len(products) == 1
    assert products[0]["product_name"] == "Monitor"
    assert products[0]["revenue"] == 2800.0


def test_low_stock(client):
    response = client.get(
        "/inventory/low-stock?threshold=5"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_low_stock"] == 1
    assert data["products"][0]["name"] == "Audifonos"
    assert data["products"][0]["status"] == "critical"


def test_invalid_limit(client):
    response = client.get(
        "/analytics/top-products?limit=-1"
    )

    assert response.status_code == 422
