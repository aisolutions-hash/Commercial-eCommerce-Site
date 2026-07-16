from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.category import Category
from app.models.contact import ContactInquiry
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.category import CategoryRead
from app.schemas.order import OrderRead
from app.schemas.product import ProductListItem, ProductList, ProductRead

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/products", response_model=ProductList)
async def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    stmt = select(Product).offset((page - 1) * per_page).limit(per_page).order_by(Product.name)
    result = await db.execute(stmt)
    items = result.scalars().all()

    count_result = await db.execute(select(func.count(Product.id)))
    total = count_result.scalar() or 0

    return ProductList(items=items, total=total, page=page, per_page=per_page)


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductRead,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    cat = await db.get(Category, body.category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    product = Product(
        id=body.id,
        name=body.name,
        description=body.description,
        long_description=None,
        price=body.price,
        category_id=body.category_id,
        images=body.images,
        rating=body.rating,
        features=body.features,
        is_featured=body.is_featured,
        is_contact_for_price=body.is_contact_for_price,
        moq=body.moq,
        uom=body.uom,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: str,
    body: ProductRead,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field in ["name", "description", "price", "category_id", "images", "rating", "features", "is_featured", "is_contact_for_price", "moq", "uom"]:
        setattr(product, field, getattr(body, field))

    await db.commit()
    await db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(product)
    await db.commit()


@router.get("/categories", response_model=list[CategoryRead])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(Category).order_by(Category.name))
    return result.scalars().all()


@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryRead,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    cat = Category(
        id=body.id,
        name=body.name,
        description=body.description,
        image=body.image,
        section=body.section,
    )
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.put("/categories/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: str,
    body: CategoryRead,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    cat = await db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field in ["name", "description", "image", "section"]:
        setattr(cat, field, getattr(body, field))
    await db.commit()
    await db.refresh(cat)
    return cat


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    cat = await db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(cat)
    await db.commit()


@router.get("/orders", response_model=list[OrderRead])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    await db.commit()
    return {"status": "ok"}


@router.get("/inquiries")
async def list_inquiries(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(ContactInquiry).order_by(ContactInquiry.created_at.desc()))
    return result.scalars().all()


@router.delete("/inquiries/{inquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inquiry(
    inquiry_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    inquiry = await db.get(ContactInquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    await db.delete(inquiry)
    await db.commit()
