from datetime import datetime

from pydantic import BaseModel


class ReviewRead(BaseModel):
    id: str
    user_name: str
    rating: int
    comment: str | None = None
    date: datetime

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    user_name: str
    rating: int
    comment: str | None = None
