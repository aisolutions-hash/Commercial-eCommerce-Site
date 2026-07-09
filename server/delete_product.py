import asyncio
from app.database import async_session_factory
from app.models.product import Product
from app.models.review import Review


async def delete():
    async with async_session_factory() as session:
        async with session.begin():
            reviews = await session.execute(
                Review.__table__.delete().where(Review.product_id == "p-masking-tape")
            )
            prod = await session.execute(
                Product.__table__.delete().where(Product.id == "p-masking-tape")
            )
        await session.commit()
    print("Deleted p-masking-tape from DB.")


if __name__ == "__main__":
    asyncio.run(delete())
