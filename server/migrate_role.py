import asyncio
from sqlalchemy import text
from app.database import engine


async def migrate():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50)"))
        await conn.execute(text("UPDATE users SET role = 'customer' WHERE role IS NULL"))
        print("Migration done: role column added, existing users set to customer")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate())
