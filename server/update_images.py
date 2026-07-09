import asyncio
from app.database import async_session_factory
from app.models.product import Product


async def update():
    async with async_session_factory() as session:
        async with session.begin():
            stretch = await session.get(Product, "p-stretch-film")
            if stretch:
                stretch.images = ["/images/stretch-film-new.png"]
            vci = await session.get(Product, "p-vci-polybag")
            if vci:
                vci.images = ["/images/vci-new.png"]
        await session.commit()
    print("Updated images for p-stretch-film and p-vci-polybag.")


if __name__ == "__main__":
    asyncio.run(update())
