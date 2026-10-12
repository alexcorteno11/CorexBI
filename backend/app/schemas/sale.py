from decimal import Decimal

from pydantic import BaseModel, Field, model_validator


class SaleItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, strict=True)


class SaleCreate(BaseModel):
    items: list[SaleItemCreate] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_unique_products(self):
        product_ids = [
            item.product_id
            for item in self.items
        ]

        if len(product_ids) != len(set(product_ids)):
            raise ValueError(
                "A product cannot appear twice in the same sale"
            )

        return self


class SaleItemResponse(BaseModel):
    product_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal


class SaleResponse(BaseModel):
    sale_id: int
    status: str
    total: Decimal
    items: list[SaleItemResponse]
