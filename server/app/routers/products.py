from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.product import ProductDetail, ProductList, ProductRead
from app.services.product import get_product_by_id, get_products

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=ProductList)
async def list_products(
    category_id: str | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_products(db, category_id, search, page, per_page)
    return ProductList(items=items, total=total, page=page, per_page=per_page)


@router.get("/{product_id}", response_model=ProductDetail)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    product = await get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
