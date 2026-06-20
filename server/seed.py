import asyncio
import json
import os
import subprocess
import sys
from pathlib import Path

from datetime import datetime

from app.database import async_session_factory, engine, Base
from app.models.category import Category
from app.models.order import Order
from app.models.product import Product
from app.models.review import Review
from app.models.user import User
from app.models.wishlist import Wishlist


async def seed():
    client_dir = Path(__file__).resolve().parent.parent / "client"

    if not (client_dir / "node_modules").exists():
        print("client/node_modules not found. Run `npm install` in client/ first.")
        sys.exit(1)

    if not (client_dir / "src" / "data.ts").exists():
        print("client/src/data.ts not found.")
        sys.exit(1)

    result = subprocess.run(
        ["npx", "tsx", "-e",
         "import {categories, products} from './src/data.ts'; console.log(JSON.stringify({categories, products}))"],
        cwd=client_dir,
        capture_output=True,
        text=True,
        check=True,
    )
    data = json.loads(result.stdout)

    async with async_session_factory() as session:
        async with session.begin():
            existing = await session.get(Category, list(data["categories"])[0]["id"])
            if existing:
                print("Database already seeded. Skipping.")
                return

            for cat in data["categories"]:
                session.add(Category(
                    id=cat["id"],
                    name=cat["name"],
                    description=cat.get("description", ""),
                    image=cat.get("image", ""),
                    section=cat.get("section"),
                ))

            for prod in data["products"]:
                features = prod.get("features") if prod.get("features") else None
                session.add(Product(
                    id=prod["id"],
                    name=prod["name"],
                    description=prod.get("description", ""),
                    long_description=prod.get("longDescription"),
                    price=float(prod["price"]),
                    category_id=prod["categoryId"],
                    images=prod.get("images", []),
                    rating=float(prod.get("rating", 0)),
                    features=features,
                    is_featured=prod.get("isFeatured", False),
                    is_contact_for_price=prod.get("isContactForPrice", False),
                    moq=prod.get("moq"),
                    uom=prod.get("uom"),
                ))
                for r in prod.get("reviews", []):
                    review_date = datetime.fromisoformat(r["date"]) if r.get("date") else None
                    session.add(Review(
                        id=r["id"],
                        product_id=prod["id"],
                        user_name=r["userName"],
                        rating=r["rating"],
                        comment=r.get("comment", ""),
                        date=review_date,
                    ))

        await session.commit()

    print(f"Seeded {len(data['categories'])} categories, {len(data['products'])} products.")


async def main():
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables ready. Seeding data...")
    await seed()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
