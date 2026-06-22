import asyncio
import json
import os
import subprocess
import sys
import platform
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

    # Cross-platform npm/npx command
    npm_cmd = "npm.cmd" if platform.system() == "Windows" else "npm"
    
    try:
        result = subprocess.run(
            [npm_cmd, "exec", "tsx", "--", "-e",
             "import {categories, products} from './src/data.ts'; console.log(JSON.stringify({categories, products}))"],
            cwd=client_dir,
            capture_output=True,
            text=True,
            check=True,
        )
    except FileNotFoundError:
        print(f"Error: '{npm_cmd}' not found. Ensure Node.js is installed and in PATH.")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"Error running tsx: {e.stderr}")
        sys.exit(1)
    
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON output: {e}")
        print(f"stdout: {result.stdout}")
        print(f"stderr: {result.stderr}")
        sys.exit(1)

    async with async_session_factory() as session:
        async with session.begin():
            # Check if database is already seeded
            existing = await session.get(Category, list(data["categories"])[0]["id"])
            if existing:
                print("Database already seeded. Skipping.")
                return

            # Add categories
            for cat in data["categories"]:
                session.add(Category(
                    id=cat["id"],
                    name=cat["name"],
                    description=cat.get("description", ""),
                    image=cat.get("image", ""),
                    section=cat.get("section"),
                ))

            # Add products and reviews
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
