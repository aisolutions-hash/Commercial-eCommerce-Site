from pydantic import BaseModel

from app.schemas.review import ReviewRead


class ProductRead(BaseModel):
    id: str
    name: str
    description: str | None = None
    long_description: str | None = None
    price: float
    category_id: str
    images: list[str] = []
    rating: float = 0
    features: list[str] | None = None
    is_featured: bool = False
    is_contact_for_price: bool = False
    moq: int | None = None
    uom: str | None = None

    class Config:
        from_attributes = True


class ProductDetail(ProductRead):
    reviews: list[ReviewRead] = []


class ProductList(BaseModel):
    items: list[ProductRead]
    total: int
    page: int = 1
    per_page: int = 20
