from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator, field_validator


class ProductCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)
    price: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )
    stock: int = Field(ge=0, strict=True)

    @field_validator("name", "category")
    @classmethod
    def validate_text(cls, value: str) -> str:
        cleaned = value.strip()

        if not cleaned:
            raise ValueError(
                "Field cannot be empty or blank"
            )

        return cleaned


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    price: Decimal
    stock: int
    is_active: bool


class ProductUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=120,
    )
    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=80,
    )
    price: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=10,
        decimal_places=2,
    )
    stock: int | None = Field(
        default=None,
        ge=0,
        strict=True,
    )

    @model_validator(mode="after")
    def validate_updates(self):
        provided_fields = self.model_fields_set

        for field in provided_fields:
            if getattr(self, field) is None:
                raise ValueError(
                    f"{field} cannot be null"
                )

        for field in ("name", "category"):
            if field in provided_fields:
                value = getattr(self, field)

                if not value.strip():
                    raise ValueError(
                        f"{field} cannot be blank"
                    )

        return self
