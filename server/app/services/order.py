from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.services.email import (
    send_admin_new_order_email,
    send_order_confirmation,
)


async def create_order(db: AsyncSession, user: User, items: list[dict], shipping: dict) -> Order:
    product_ids = [item["product_id"] for item in items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = {p.id: p for p in result.scalars().all()}

    total = Decimal("0.00")
    order_items = []
    for item in items:
        pid = item["product_id"]
        qty = item["quantity"]
        product = products.get(pid)
        if not product:
            raise ValueError(f"Product {pid} not found")
        price = float(product.price)
        total += Decimal(str(price)) * Decimal(str(qty))
        order_items.append({
            "product_id": pid,
            "product_name": product.name,
            "quantity": qty,
            "price": price,
        })

    order = Order(
        user_id=user.id,
        items=order_items,
        total=float(total),
        status="pending",
        shipping_name=shipping.get("name") or None,
        shipping_phone=shipping.get("phone") or None,
        shipping_address=shipping.get("address") or None,
        shipping_city=shipping.get("city") or None,
        shipping_zip=shipping.get("zip") or None,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    send_order_confirmation(order, user.email, user.name)
    send_admin_new_order_email(order, user.name, user.email, shipping)

    return order


async def get_user_orders(db: AsyncSession, user_id: str) -> list[Order]:
    stmt = select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())
