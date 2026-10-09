
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.dependencies import get_db


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


@router.get("/low-stock")
def get_low_stock(
    threshold: int = Query(default=10, ge=0, le=10000),
    db: Session = Depends(get_db),
):
    query = text("""
        SELECT id, name, category, stock, price
        FROM products
        WHERE stock <= :threshold
        ORDER BY stock ASC, id ASC
    """)

    results = db.execute(
        query,
        {"threshold": threshold},
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
            "status": status,
        })

    return {
        "threshold": threshold,
        "total_low_stock": len(products),
        "products": products,
        "currency": "MXN",
    }
