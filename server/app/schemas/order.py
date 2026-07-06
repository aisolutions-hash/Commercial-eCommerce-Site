from datetime import datetime

from pydantic import BaseModel, Field


class OrderItemInput(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    items: list[OrderItemInput]


class OrderRead(BaseModel):
    id: str
    user_id: str
    items: list[dict]
    total: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
