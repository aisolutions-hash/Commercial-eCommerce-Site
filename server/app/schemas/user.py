from datetime import datetime

from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    email: str
    password: str = Field(min_length=8)
    name: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserRead(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
