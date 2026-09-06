from sqlalchemy import Column, String, Text, Float, Integer, Boolean, DateTime, ARRAY
from sqlalchemy.sql import func
from app.database import Base


class SalesContact(Base):
    __tablename__ = "sales_contacts"

    contact_id = Column(String, primary_key=True)
    
    # Personal information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255))
    phone_primary = Column(String(20))
    phone_secondary = Column(String(20))
    
    # Company information
    company_name = Column(String(255))
    company_type = Column(String(50))  # manufacturer, distributor, retailer, enterprise, startup, government, other
    industry = Column(String(100))
    company_size = Column(String(20))  # 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+
    
    # Address
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    country = Column(String(50), default="India")
    
    # Sales metadata
    lead_source = Column(String(50))  # website, referral, cold_call, linkedin, indiamart, moglix, trade_show, google_ads, meta_ads, whatsapp, other
    lead_status = Column(String(50), default="new")  # new, contacted, qualified, proposal_sent, negotiation, closed_won, closed_lost, dormant
    lead_priority = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Product interest
    product_interest = Column(ARRAY(Text))
    budget_range = Column(String(50))
    expected_order_date = Column(DateTime)
    
    # Interaction tracking
    last_contacted_at = Column(DateTime)
    last_interaction_type = Column(String(50))  # call, email, whatsapp, meeting, demo, other
    next_followup_at = Column(DateTime)
    followup_notes = Column(Text)
    
    # AI automation
    ai_score = Column(Float)  # 0-100
    ai_recommendation = Column(Text)
    ai_segment = Column(String(50))
    
    # Packaging preference
    packaging_preference = Column(ARRAY(Text))  # vci, stretch_film, custom, standard
    
    # Deal tracking
    deal_value = Column(Float)
    deal_currency = Column(String(3), default="INR")
    deal_status = Column(String(50))  # pending, confirmed, shipped, delivered, cancelled
    
    # Internal team
    assigned_to = Column(String(100))
    team_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
