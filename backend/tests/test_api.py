from decimal import Decimal
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker, Session
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


def test_list_products(client):
    response = client.get("/products")

    assert response.status_code == 200

    products = response.json()

    assert len(products) == 3
    assert products[0]["name"] == "Teclado"


def test_product_not_found(client):
    response = client.get("/products/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_create_product(client):
    new_product = {
        "name": "Webcam Test",
        "category": "Perifericos",
        "price": "950.00",
        "stock": 12,
    }

    response = client.post(
        "/products",
        json=new_product,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Webcam Test"
    assert data["price"] == "950.00"
    assert data["stock"] == 12
    assert isinstance(data["id"], int)

    get_response = client.get(
        f"/products/{data['id']}"
    )

    assert get_response.status_code == 200
    assert get_response.json()["name"] == "Webcam Test"


def test_update_product(client):
    response = client.patch(
        "/products/1",
        json={"price": "999.00", "stock": 20},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["price"] == "999.00"
    assert data["stock"] == 20
    assert data["name"] == "Teclado"

    # Verificar persistencia
    check = client.get("/products/1")

    assert check.status_code == 200
    assert check.json()["price"] == "999.00"
    assert check.json()["stock"] == 20


def test_update_product_not_found(client):
    response = client.patch(
        "/products/999999",
        json={"price": "500.00"},
    )

    assert response.status_code == 404


def test_update_product_invalid_price(client):
    response = client.patch(
        "/products/1",
        json={"price": "-100.00"},
    )

    assert response.status_code == 422

    check = client.get("/products/1")

    assert check.status_code == 200
    assert check.json()["price"] == "850.00"


def test_update_product_null_rejected(client):
    response = client.patch(
        "/products/1",
        json={"name": None},
    )

    assert response.status_code == 422


def test_create_product_blank_name(client):
    response = client.post(
        "/products",
        json={
            "name": "   ",
            "category": "Perifericos",
            "price": "500.00",
            "stock": 10,
        },
    )

    assert response.status_code == 422

    products = client.get("/products").json()
    assert len(products) == 3


def test_create_product_negative_stock(client):
    response = client.post(
        "/products",
        json={
            "name": "Mouse Gamer",
            "category": "Perifericos",
            "price": "750.00",
            "stock": -5,
        },
    )

    assert response.status_code == 422

    products = client.get("/products").json()
    assert len(products) == 3


def test_deactivate_product(client):
    response = client.delete("/products/1")

    assert response.status_code == 204

    products = client.get("/products").json()

    assert len(products) == 2
    assert all(p["id"] != 1 for p in products)

    all_products = client.get(
        "/products?include_inactive=true"
    ).json()

    assert len(all_products) == 3

    product = next(
        p for p in all_products if p["id"] == 1
    )

    assert product["is_active"] is False


def test_get_inactive_product(client):
    client.delete("/products/1")

    response = client.get("/products/1")

    assert response.status_code == 404


def test_update_inactive_product(client):
    client.delete("/products/1")

    response = client.patch(
        "/products/1",
        json={"price": "999.00"},
    )

    assert response.status_code == 404


def test_soft_delete_preserves_sales(client):
    before = client.get(
        "/analytics/summary"
    ).json()

    top_before = client.get(
        "/analytics/top-products?limit=5"
    ).json()

    response = client.delete("/products/1")

    assert response.status_code == 204

    after = client.get(
        "/analytics/summary"
    ).json()

    top_after = client.get(
        "/analytics/top-products?limit=5"
    ).json()

    assert after == before
    assert top_after == top_before

    assert after["total_sales"] == 1
    assert after["total_revenue"] == 4500.0


def test_create_sale_success(client):
    response = client.post(
        "/sales",
        json={
            "items": [
                {"product_id": 1, "quantity": 2},
                {"product_id": 2, "quantity": 1},
            ]
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["status"] == "completed"
    assert data["total"] == "4500.00"
    assert len(data["items"]) == 2

    products = client.get("/products").json()

    by_id = {p["id"]: p for p in products}

    assert by_id[1]["stock"] == 10
    assert by_id[2]["stock"] == 6

    summary = client.get("/analytics/summary").json()

    assert summary["total_sales"] == 2
    assert summary["total_revenue"] == 9000.0


def test_sale_insufficient_stock(client):
    response = client.post(
        "/sales",
        json={
            "items": [
                {"product_id": 1, "quantity": 1000}
            ]
        },
    )

    assert response.status_code == 409

    product = client.get("/products/1").json()
    assert product["stock"] == 12

    summary = client.get("/analytics/summary").json()
    assert summary["total_sales"] == 1


def test_sale_product_not_found(client):
    response = client.post(
        "/sales",
        json={
            "items": [
                {"product_id": 999999, "quantity": 1}
            ]
        },
    )

    assert response.status_code == 404


def test_sale_inactive_product(client):
    delete_response = client.delete("/products/1")
    assert delete_response.status_code == 204

    response = client.post(
        "/sales",
        json={
            "items": [
                {"product_id": 1, "quantity": 1}
            ]
        },
    )

    assert response.status_code == 409


def test_sale_duplicate_product(client):
    response = client.post(
        "/sales",
        json={
            "items": [
                {"product_id": 1, "quantity": 1},
                {"product_id": 1, "quantity": 2},
            ]
        },
    )

    assert response.status_code == 422


def test_sale_is_atomic_when_stock_is_insufficient(client):
    products_before = client.get("/products").json()
    summary_before = client.get("/analytics/summary").json()

    response = client.post(
        "/sales",
        json={
            "items": [
                {"product_id": 1, "quantity": 2},
                {"product_id": 2, "quantity": 1000},
            ]
        },
    )

    assert response.status_code == 409

    products_after = client.get("/products").json()
    assert products_after == products_before

    summary_after = client.get("/analytics/summary").json()
    assert summary_after == summary_before


def test_sale_rollback_when_commit_fails(client, monkeypatch):
    def get_database_snapshot():
        override = client.app.dependency_overrides[get_db]
        session_generator = override()
        db = next(session_generator)

        try:
            sales_count = db.scalar(
                select(func.count()).select_from(Sale)
            )

            items_count = db.scalar(
                select(func.count()).select_from(SaleItem)
            )

            stock = db.execute(
                select(Product.id, Product.stock)
                .order_by(Product.id)
            ).all()

            return {
                "sales": sales_count,
                "items": items_count,
                "stock": list(stock),
            }

        finally:
            session_generator.close()

    before = get_database_snapshot()

    original_rollback = Session.rollback
    rollback_calls = []

    def failing_commit(self):
        raise RuntimeError(
            "Simulated database commit failure"
        )

    def tracking_rollback(self):
        rollback_calls.append(True)
        return original_rollback(self)

    with monkeypatch.context() as patch:
        patch.setattr(
            Session,
            "commit",
            failing_commit,
        )

        patch.setattr(
            Session,
            "rollback",
            tracking_rollback,
        )

        with pytest.raises(
            RuntimeError,
            match="Simulated database commit failure",
        ):
            client.post(
                "/sales",
                json={
                    "items": [
                        {"product_id": 1, "quantity": 2},
                        {"product_id": 2, "quantity": 1},
                    ]
                },
            )

    assert len(rollback_calls) >= 1

    after = get_database_snapshot()

    assert after["sales"] == before["sales"]
    assert after["items"] == before["items"]
    assert after["stock"] == before["stock"]


def test_revenue_over_time(client):
    response = client.get(
        "/analytics/revenue-over-time"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["currency"] == "MXN"
    assert len(data["data"]) == 1

    day = data["data"][0]

    assert day["sales_count"] == 1
    assert day["revenue"] == 4500.0

    date.fromisoformat(day["date"])


def test_revenue_over_time_excludes_cancelled_sales(client):
    override = client.app.dependency_overrides[get_db]
    db_generator = override()
    db = next(db_generator)

    try:
        product = db.query(Product).first()

        cancelled_sale = Sale(status="cancelled")
        db.add(cancelled_sale)
        db.flush()

        db.add(
            SaleItem(
                sale_id=cancelled_sale.id,
                product_id=product.id,
                quantity=1,
                unit_price=Decimal("999.00"),
            )
        )

        db.commit()
    finally:
        db_generator.close()

    response = client.get(
        "/analytics/revenue-over-time"
    )

    assert response.status_code == 200

    data = response.json()

    assert sum(
        day["sales_count"] for day in data["data"]
    ) == 1

    assert sum(
        day["revenue"] for day in data["data"]
    ) == 4500.0


def test_revenue_over_time_date_range(client):
    # Obtener la fecha de la venta creada por el fixture.
    override = client.app.dependency_overrides[get_db]
    db_generator = override()
    db = next(db_generator)

    try:
        sale = db.query(Sale).filter(
            Sale.status == "completed"
        ).first()

        assert sale is not None
        sale_date = sale.sale_date.date().isoformat()
    finally:
        db_generator.close()

    response = client.get(
        "/analytics/revenue-over-time",
        params={
            "start_date": sale_date,
            "end_date": sale_date,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["currency"] == "MXN"
    assert len(data["data"]) == 1
    assert data["data"][0]["date"] == sale_date
    assert data["data"][0]["sales_count"] == 1
    assert data["data"][0]["revenue"] == 4500.0


def test_revenue_over_time_empty_range(client):
    response = client.get(
        "/analytics/revenue-over-time",
        params={
            "start_date": "2000-01-01",
            "end_date": "2000-01-31",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "currency": "MXN",
        "data": [],
    }


def test_revenue_over_time_invalid_range(client):
    response = client.get(
        "/analytics/revenue-over-time",
        params={
            "start_date": "2026-10-12",
            "end_date": "2026-10-09",
        },
    )

    assert response.status_code == 422


def test_revenue_over_time_invalid_date_format(client):
    response = client.get(
        "/analytics/revenue-over-time",
        params={
            "start_date": "fecha-invalida",
        },
    )

    assert response.status_code == 422


def test_low_stock_excludes_inactive_products(client):
    response = client.post(
        "/products",
        json={
            "name": "Producto para prueba de inventario",
            "category": "Pruebas",
            "price": "100.00",
            "stock": 2,
        },
    )

    assert response.status_code == 201

    product_id = response.json()["id"]

    response = client.get(
        "/inventory/low-stock?threshold=5"
    )

    assert response.status_code == 200

    product_ids = [
        product["id"]
        for product in response.json()["products"]
    ]

    assert product_id in product_ids

    response = client.delete(
        f"/products/{product_id}"
    )

    assert response.status_code == 204

    response = client.get(
        "/inventory/low-stock?threshold=5"
    )

    assert response.status_code == 200

    product_ids = [
        product["id"]
        for product in response.json()["products"]
    ]

    assert product_id not in product_ids
    assert response.json()["total_low_stock"] == 1
