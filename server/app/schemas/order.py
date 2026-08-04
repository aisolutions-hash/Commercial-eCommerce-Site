from datetime import datetime

from pydantic import BaseModel, Field


class OrderItemInput(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)


class ShippingInput(BaseModel):
    name: str = ""
    phone: str = ""
    address: str = ""
    city: str = ""
    zip: str = ""


class OrderCreate(BaseModel):
    items: list[OrderItemInput]
    shipping: ShippingInput = ShippingInput()


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
