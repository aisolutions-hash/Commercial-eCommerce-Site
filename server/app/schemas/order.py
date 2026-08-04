from datetime import datetime

from pydantic import BaseModel, Field


class OrderItemInput(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)


class ShippingInput(BaseModel):
    name: str = Field(min_length=1)
    phone: str = Field(min_length=7)
    address: str = Field(min_length=1)
    city: str = Field(min_length=1)
    zip: str = Field(min_length=1)


class OrderCreate(BaseModel):
    items: list[OrderItemInput]
    shipping: ShippingInput


class OrderRead(BaseModel):
    id: str
    user_id: str
    items: list[dict]
    total: float
    status: str
    shipping_name: str | None = None
    shipping_phone: str | None = None
    shipping_address: str | None = None
    shipping_city: str | None = None
    shipping_zip: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
