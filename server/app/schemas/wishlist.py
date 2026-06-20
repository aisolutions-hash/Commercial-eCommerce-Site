from pydantic import BaseModel


class WishlistRead(BaseModel):
    id: str
    user_id: str
    product_id: str

    class Config:
        from_attributes = True
