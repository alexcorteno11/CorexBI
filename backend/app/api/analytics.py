from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.dependencies import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
):
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
        "currency": "MXN",
    }


@router.get("/top-products")
def get_top_products(
    limit: int = Query(default=5, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = text("""
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        SUM(si.quantity) AS units_sold,
        SUM(si.quantity * si.unit_price) AS revenue
    FROM sale_items AS si
    JOIN products AS p ON p.id = si.product_id
    JOIN sales AS s ON s.id = si.sale_id
    WHERE s.status = 'completed'
    GROUP BY p.id, p.name
    ORDER BY revenue DESC, p.id ASC
    LIMIT :limit
    """)

    results = db.execute(query, {"limit": limit}).all()

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
