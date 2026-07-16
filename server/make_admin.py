import asyncio
import sys
from app.database import async_session_factory
from app.models.user import User
from sqlalchemy import select


async def set_admin(email: str):
    async with async_session_factory() as session:
        async with session.begin():
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            if not user:
                print(f"User '{email}' not found.")
                return
            user.role = "admin"
            await session.commit()
            print(f"User '{email}' is now admin.")

    async with async_session_factory() as session:
        async with session.begin():
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            # Also set any existing users without role to customer
            result2 = await session.execute(select(User).where(User.role.is_(None)))
            for u in result2.scalars().all():
                u.role = "customer"
            await session.commit()
            print(f"Set all existing users without role to 'customer'.")


if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else ""
    if not email:
        print("Usage: python make_admin.py <email>")
        sys.exit(1)
    asyncio.run(set_admin(email))
