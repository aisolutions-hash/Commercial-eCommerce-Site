from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.review import Review
from app.schemas.review import ReviewCreate


async def create_review(db: AsyncSession, product_id: str, data: ReviewCreate) -> Review:
    review = Review(
        id=str(uuid4()),
        product_id=product_id,
        user_name=data.user_name,
        rating=data.rating,
        comment=data.comment,
        date=datetime.now(timezone.utc),
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    await _update_product_rating(db, product_id)
    return review


async def _update_product_rating(db: AsyncSession, product_id: str) -> None:
    stmt = select(func.avg(Review.rating).label("avg_rating")).where(Review.product_id == product_id)
    result = await db.execute(stmt)
    avg_rating = result.scalar() or 0
    product = await db.get(Product, product_id)
    if product:
        product.rating = round(float(avg_rating), 1)
        await db.commit()
