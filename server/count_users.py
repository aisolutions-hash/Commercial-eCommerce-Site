import asyncio
from sqlalchemy import text
from app.database import engine


async def q():
    async with engine.connect() as conn:
        total = await conn.execute(text("SELECT COUNT(*) FROM users"))
        print(f"Total users: {total.scalar()}")

        google = await conn.execute(text("SELECT COUNT(*) FROM users WHERE google_id IS NOT NULL"))
        print(f"Google OAuth: {google.scalar()}")

        email = await conn.execute(text("SELECT COUNT(*) FROM users WHERE google_id IS NULL AND password_hash != ''"))
        print(f"Email/password: {email.scalar()}")

        rows = await conn.execute(text("""
            SELECT email, name, role,
                CASE WHEN google_id IS NOT NULL THEN 'google' ELSE 'email' END as auth
            FROM users ORDER BY created_at DESC
        """))
        print("\nUsers:")
        for r in rows.all():
            print(f"  {r.name:20s} {r.email:30s} {r.role:10s} {r.auth}")
        print(f"\nAdmin users: {sum(1 for r in rows if r.role == 'admin')}")

    await engine.dispose()


asyncio.run(q())
