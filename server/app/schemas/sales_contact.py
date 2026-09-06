from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SalesContactBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    company_name: Optional[str] = None
    company_type: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = "India"
    lead_source: Optional[str] = None
    lead_status: Optional[str] = "new"
    lead_priority: Optional[str] = "medium"
    product_interest: Optional[List[str]] = None
    budget_range: Optional[str] = None
    expected_order_date: Optional[datetime] = None
    last_contacted_at: Optional[datetime] = None
    last_interaction_type: Optional[str] = None
    next_followup_at: Optional[datetime] = None
    followup_notes: Optional[str] = None
    ai_score: Optional[float] = None
    ai_recommendation: Optional[str] = None
    ai_segment: Optional[str] = None
    packaging_preference: Optional[List[str]] = None
    deal_value: Optional[float] = None
    deal_currency: Optional[str] = "INR"
    deal_status: Optional[str] = None
    assigned_to: Optional[str] = None
    team_notes: Optional[str] = None


class SalesContactRead(SalesContactBase):
    contact_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SalesContactCreate(SalesContactBase):
    contact_id: Optional[str] = None


class SalesContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    company_name: Optional[str] = None
    company_type: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    lead_source: Optional[str] = None
    lead_status: Optional[str] = None
    lead_priority: Optional[str] = None
    product_interest: Optional[List[str]] = None
    budget_range: Optional[str] = None
    next_followup_at: Optional[datetime] = None
    followup_notes: Optional[str] = None
    ai_score: Optional[float] = None
    ai_recommendation: Optional[str] = None
    ai_segment: Optional[str] = None
    packaging_preference: Optional[List[str]] = None
    deal_value: Optional[float] = None
    deal_status: Optional[str] = None
    assigned_to: Optional[str] = None
    team_notes: Optional[str] = None


class SalesContactList(BaseModel):
    items: List[SalesContactRead]
    total: int
    page: int
    per_page: int
