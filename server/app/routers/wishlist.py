from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.product import Product
from app.models.user import User
from app.models.wishlist import Wishlist
from app.schemas.wishlist import WishlistRead

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=list[WishlistRead])
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == current_user.id)
    )
    return list(result.scalars().all())


@router.post("/{product_id}", response_model=WishlistRead, status_code=201)
async def add_to_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await db.execute(select(Product).where(Product.id == product_id))
    if not product.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Product not found")

    existing = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already in wishlist")

    entry = Wishlist(user_id=current_user.id, product_id=product_id)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{product_id}", status_code=204)
async def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Not in wishlist")

    await db.delete(entry)
    await db.commit()
