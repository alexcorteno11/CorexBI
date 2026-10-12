from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models import Product, Sale, SaleItem
from app.schemas.sale import SaleCreate, SaleItemResponse, SaleResponse

router = APIRouter(
    prefix="/sales",
    tags=["Sales"],
)


@router.post(
    "",
    response_model=SaleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_sale(
    sale_data: SaleCreate,
    db: Session = Depends(get_db),
):
    try:
        requested_ids = sorted(item.product_id for item in sale_data.items)

        products = db.scalars(
            select(Product)
            .where(Product.id.in_(requested_ids))
            .order_by(Product.id)
            .with_for_update()
        ).all()

        products_by_id = {
            product.id: product
            for product in products
        }

        for item in sale_data.items:
            product = products_by_id.get(item.product_id)

            if product is None:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Product {item.product_id} not found"
                    ),
                )

            if not product.is_active:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"IProduct {product.id} is inactive"
                    ),
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Insufficient stock for product "
                        f"{product.id}"
                    ),
                )

        sale = Sale(status="completed")
        db.add(sale)
        db.flush()

        response_items = []

        total = Decimal("0.00")

        for item in sale_data.items:
            product = products_by_id[item.product_id]

            unit_price = product.price
            subtotal = unit_price * item.quantity

            db.add(
                SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=unit_price,
                )
            )

            product.stock -= item.quantity
            total += subtotal

            response_items.append(
                SaleItemResponse(
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=unit_price,
                    subtotal=subtotal,
                )
            )

        result = SaleResponse(
            sale_id=sale.id,
            status=sale.status,
            total=total,
            items=response_items,
        )

        db.commit()
        return result

    except Exception:
        db.rollback()
        raise
