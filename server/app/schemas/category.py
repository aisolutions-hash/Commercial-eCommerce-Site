from pydantic import BaseModel


class CategoryRead(BaseModel):
    id: str
    name: str
    description: str | None = None
    image: str | None = None
    section: str | None = None

    class Config:
        from_attributes = True
