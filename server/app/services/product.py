from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product
from app.models.review import Review


async def get_categories(db: AsyncSession) -> list:
    from app.models.category import Category
    result = await db.execute(select(Category).order_by(Category.name))
    return list(result.scalars().all())


async def get_products(
    db: AsyncSession,
    category_id: str | None = None,
    search: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Product], int]:
    stmt = select(Product)

    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if search:
        stmt = stmt.where(
            Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%")
        )

    count_stmt = select(func.count(Product.id))
    if category_id:
        count_stmt = count_stmt.where(Product.category_id == category_id)
    if search:
        count_stmt = count_stmt.where(
            Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%")
        )
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0

    offset = (page - 1) * per_page
    stmt = stmt.offset(offset).limit(per_page).order_by(Product.name)
    result = await db.execute(stmt)

    return list(result.scalars().all()), total


async def get_product_by_id(db: AsyncSession, product_id: str) -> Product | None:
    stmt = (
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.reviews))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
