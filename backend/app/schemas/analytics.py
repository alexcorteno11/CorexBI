from datetime import date

from pydantic import BaseModel, Field


class DailyRevenue(BaseModel):
    date: date
    sales_count: int = Field(ge=0)
    revenue: float = Field(ge=0)


class RevenueOverTimeResponse(BaseModel):
    currency: str
    data: list[DailyRevenue]
