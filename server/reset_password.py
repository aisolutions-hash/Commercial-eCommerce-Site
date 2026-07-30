import asyncio, sys
from sqlalchemy import select
from app.database import async_session_factory
from app.models.user import User
from app.services.auth import hash_password


async def reset():
    email = sys.argv[1]
    new_pass = sys.argv[2]
    async with async_session_factory() as session:
        async with session.begin():
            r = await session.execute(select(User).where(User.email == email))
            u = r.scalar_one_or_none()
            if not u:
                print("User not found")
                return
            u.password_hash = hash_password(new_pass)
            await session.commit()
            print(f"Password reset for {email}. New password: {new_pass}")


asyncio.run(reset())
