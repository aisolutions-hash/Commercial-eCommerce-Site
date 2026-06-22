from pydantic import BaseModel, EmailStr


class ContactInquiry(BaseModel):
    name: str
    email: EmailStr
    message: str


class ContactResponse(BaseModel):
    status: str
    message: str
