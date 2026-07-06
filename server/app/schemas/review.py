from datetime import datetime

from pydantic import BaseModel, Field


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
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
