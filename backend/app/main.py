from fastapi import FastAPI
from fastapi import Depends, Query

from sqlalchemy import text
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Sale, SaleItem

app = FastAPI(
    title="CorexBI API",
    description="API for sales analytics and inventory management",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "Welcome to CorexBI API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/analytics/summary")
def get_analytics_summary(db: Session = Depends(get_db)):

    query = text("""
        SELECT
            COUNT(DISTINCT s.id) AS total_sales,
            COALESCE(
                SUM(si.quantity * si.unit_price),
                0
            ) AS total_revenue
        FROM sales AS s
        JOIN sale_items AS si
            ON si.sale_id = s.id
        WHERE s.status = 'completed'
    """)

    result = db.execute(query).one()

    return {
        "total_sales": result.total_sales,
        "total_revenue": float(result.total_revenue),
        "currency": "MXN"
    }


@app.get("/analytics/top-products")
def get_top_products(limit: int = Query(default=5, ge=1, le=100),
                     db: Session = Depends(get_db)):
    query = text("""
                 SELECT
                    p.id AS product_id,
                    p.name AS product_name,
                    SUM(si.quantity) AS units_sold,
                    SUM(
                        si.quantity * si.unit_price
                    ) AS revenue
                FROM sale_items AS si
                JOIN products AS p
                    ON p.id = si.product_id
                JOIN sales AS s
                    ON s.id = si.sale_id
                WHERE s.status = 'completed'
                GROUP BY p.id, p.name
                ORDER BY revenue DESC
        """)

    results = db.execute(query + text("") if False else query).all()

    results = results[:limit]

    return {
        "products": [
            {
                "product_id": row.product_id,
                "product_name": row.product_name,
                "units_sold": int(row.units_sold),
                "revenue": float(row.revenue),
            }
            for row in results
        ],
        "currency": "MXN",
    }


@app.get("/inventory/low-stock")
def get_low_stock(
    threshold: int = Query(default=10, ge=0, le=10000),
    db: Session = Depends(get_db),
):
    query = text("""
                 SELECT
                    id,
                    name,
                    category,
                    stock,
                    price
                FROM products
                WHERE stock <= :threshold
                ORDER BY stock ASC, id ASC
                """)

    results = db.execute(
        query,
        {"threshold": threshold}
    ).all()

    products = []

    for row in results:
        if row.stock == 0:
            status = "out_of_stock"
        elif row.stock <= 5:
            status = "critical"
        else:
            status = "low"

        products.append({
            "id": row.id,
            "name": row.name,
            "category": row.category,
            "stock": row.stock,
            "price": float(row.price),
            "status": status
        })

    return {
        "threshold": threshold,
        "total_low_stock": len(products),
        "products": products,
        "currency": "MXN"
    }
