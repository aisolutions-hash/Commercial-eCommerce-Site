from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.sales_contact import SalesContact
from app.models.user import User
from app.schemas.sales_contact import (
    SalesContactRead,
    SalesContactCreate,
    SalesContactUpdate,
    SalesContactList,
)

router = APIRouter(prefix="/api/admin/sales-contacts", tags=["sales-contacts"])


@router.get("", response_model=SalesContactList)
async def list_sales_contacts(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    lead_status: str = Query(None),
    lead_priority: str = Query(None),
    company_type: str = Query(None),
    assigned_to: str = Query(None),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    stmt = select(SalesContact)
    count_stmt = select(func.count(SalesContact.contact_id))

    # Filters
    if search:
        search_filter = or_(
            SalesContact.first_name.ilike(f"%{search}%"),
            SalesContact.last_name.ilike(f"%{search}%"),
            SalesContact.company_name.ilike(f"%{search}%"),
            SalesContact.email.ilike(f"%{search}%"),
        )
        stmt = stmt.where(search_filter)
        count_stmt = count_stmt.where(search_filter)

    if lead_status:
        stmt = stmt.where(SalesContact.lead_status == lead_status)
        count_stmt = count_stmt.where(SalesContact.lead_status == lead_status)

    if lead_priority:
        stmt = stmt.where(SalesContact.lead_priority == lead_priority)
        count_stmt = count_stmt.where(SalesContact.lead_priority == lead_priority)

    if company_type:
        stmt = stmt.where(SalesContact.company_type == company_type)
        count_stmt = count_stmt.where(SalesContact.company_type == company_type)

    if assigned_to:
        stmt = stmt.where(SalesContact.assigned_to == assigned_to)
        count_stmt = count_stmt.where(SalesContact.assigned_to == assigned_to)

    # Pagination
    stmt = stmt.offset((page - 1) * per_page).limit(per_page).order_by(SalesContact.ai_score.desc().nullslast())

    result = await db.execute(stmt)
    items = result.scalars().all()

    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0

    return SalesContactList(items=items, total=total, page=page, per_page=per_page)


@router.get("/stats")
async def get_sales_stats(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    # Total contacts
    total_result = await db.execute(select(func.count(SalesContact.contact_id)))
    total = total_result.scalar() or 0

    # By status
    status_result = await db.execute(
        select(SalesContact.lead_status, func.count(SalesContact.contact_id))
        .group_by(SalesContact.lead_status)
    )
    by_status = {row[0]: row[1] for row in status_result.all()}

    # By priority
    priority_result = await db.execute(
        select(SalesContact.lead_priority, func.count(SalesContact.contact_id))
        .group_by(SalesContact.lead_priority)
    )
    by_priority = {row[0]: row[1] for row in priority_result.all()}

    # Total deal value
    deal_result = await db.execute(
        select(func.sum(SalesContact.deal_value))
        .where(SalesContact.deal_status.in_(["pending", "confirmed", "shipped"]))
    )
    total_deal_value = deal_result.scalar() or 0

    # Average AI score
    ai_result = await db.execute(
        select(func.avg(SalesContact.ai_score))
        .where(SalesContact.ai_score.isnot(None))
    )
    avg_ai_score = ai_result.scalar() or 0

    return {
        "total": total,
        "by_status": by_status,
        "by_priority": by_priority,
        "total_deal_value": total_deal_value,
        "avg_ai_score": round(avg_ai_score, 1),
    }


@router.get("/{contact_id}", response_model=SalesContactRead)
async def get_sales_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    contact = await db.get(SalesContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.post("", response_model=SalesContactRead, status_code=status.HTTP_201_CREATED)
async def create_sales_contact(
    body: SalesContactCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    contact_id = body.contact_id or str(uuid4())
    contact = SalesContact(contact_id=contact_id, **body.model_dump(exclude={"contact_id"}))
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


@router.put("/{contact_id}", response_model=SalesContactRead)
async def update_sales_contact(
    contact_id: str,
    body: SalesContactUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    contact = await db.get(SalesContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)

    await db.commit()
    await db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sales_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    contact = await db.get(SalesContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    await db.delete(contact)
    await db.commit()
