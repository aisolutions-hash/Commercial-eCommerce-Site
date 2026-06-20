from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserRead

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/profile", response_model=UserRead)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
