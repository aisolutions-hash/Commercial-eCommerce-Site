-- ============================================================================
-- KALISOFT AI DATAHUB - PostgreSQL Schema
-- Compatible with BigQuery schema for easy GCP migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SALES CONTACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sales_contacts (
    -- Primary identification
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    
    -- Company information
    company_name VARCHAR(255),
    company_type VARCHAR(50) CHECK (company_type IN ('manufacturer', 'distributor', 'retailer', 'enterprise', 'startup', 'government', 'other')),
    industry VARCHAR(100),
    company_size VARCHAR(20) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(50) DEFAULT 'India',
    
    -- Sales metadata
    lead_source VARCHAR(50) CHECK (lead_source IN ('website', 'referral', 'cold_call', 'linkedin', 'indiamart', 'moglix', 'trade_show', 'google_ads', 'meta_ads', 'whatsapp', 'other')),
    lead_status VARCHAR(50) DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost', 'dormant')),
    lead_priority VARCHAR(20) DEFAULT 'medium' CHECK (lead_priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Product interest (PostgreSQL array)
    product_interest TEXT[],
    budget_range VARCHAR(50),
    expected_order_date DATE,
    
    -- Interaction tracking
    last_contacted_at TIMESTAMP,
    last_interaction_type VARCHAR(50) CHECK (last_interaction_type IN ('call', 'email', 'whatsapp', 'meeting', 'demo', 'other')),
    next_followup_at TIMESTAMP,
    followup_notes TEXT,
    
    -- AI automation
    ai_score DECIMAL(5,2),  -- 0-100
    ai_recommendation TEXT,
    ai_segment VARCHAR(50),
    
    -- Packaging preference
    packaging_preference TEXT[],  -- 'vci', 'stretch_film', 'custom', 'standard'
    
    -- Deal tracking
    deal_value DECIMAL(12,2),
    deal_currency VARCHAR(3) DEFAULT 'INR',
    deal_status VARCHAR(50) CHECK (deal_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    
    -- Internal team
    assigned_to VARCHAR(100),
    team_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. ELECTRONICS PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS electronics_products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Product details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('pc', 'gpu', 'camera', 'monitor', 'accessory', 'ai_solution')),
    subcategory VARCHAR(100),  -- 'gaming_pc', 'workstation_pc', 'professional_camera', etc.
    
    -- Pricing
    base_price DECIMAL(12,2) NOT NULL,
    discounted_price DECIMAL(12,2),
    discount_percent DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- AI integration
    ai_features TEXT[],  -- Features that use AI
    ai_solution_id UUID,  -- Links to AI product if bundled
    
    -- Specifications (JSONB for flexibility)
    specifications JSONB,
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    
    -- Images
    primary_image VARCHAR(500),
    gallery_images TEXT[],
    
    -- Sales metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_contact_for_price BOOLEAN DEFAULT FALSE,
    moq INTEGER DEFAULT 1,
    uom VARCHAR(20) DEFAULT 'NOS',
    
    -- Ratings
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Packaging options
    packaging_options TEXT[],  -- 'vci', 'stretch_film', 'custom_box', 'standard'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. SALES ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sales_orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES sales_contacts(contact_id) ON DELETE RESTRICT,
    
    -- Order details
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
    
    -- Items (JSONB array)
    items JSONB NOT NULL DEFAULT '[]',
    
    -- Pricing
    subtotal DECIMAL(12,2),
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Packaging
    packaging_type VARCHAR(50),  -- 'vci', 'stretch_film', 'custom', 'standard'
    packaging_notes TEXT,
    
    -- Shipping
    shipping_address JSONB,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    
    -- AI automation
    ai_order_score DECIMAL(5,2),
    ai_fraud_check VARCHAR(50),
    
    -- Internal
    assigned_to VARCHAR(100),
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. SUPPLIER ADVERTISEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_ads (
    ad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL,
    
    -- Ad details
    ad_title VARCHAR(255) NOT NULL,
    ad_description TEXT,
    ad_type VARCHAR(50) CHECK (ad_type IN ('banner', 'sponsored_product', 'native', 'featured_supplier', 'category_highlight')),
    
    -- Targeting
    target_audience TEXT[],
    target_categories TEXT[],
    target_locations TEXT[],
    
    -- Media
    media_url VARCHAR(500),
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'carousel', 'text')),
    landing_url VARCHAR(500),
    
    -- Budget & Performance
    budget_daily DECIMAL(10,2),
    budget_total DECIMAL(12,2),
    spend_total DECIMAL(12,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'rejected')),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- AI optimization
    ai_bid_amount DECIMAL(10,2),
    ai_target_cpa DECIMAL(10,2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. SALES INTERACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sales_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES sales_contacts(contact_id) ON DELETE RESTRICT,
    order_id UUID REFERENCES sales_orders(order_id) ON DELETE SET NULL,
    
    -- Interaction details
    interaction_type VARCHAR(50) CHECK (interaction_type IN ('call', 'email', 'whatsapp', 'meeting', 'demo', 'support', 'other')),
    interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Content
    subject VARCHAR(255),
    notes TEXT,
    outcome VARCHAR(255),
    
    -- Follow-up
    followup_required BOOLEAN DEFAULT FALSE,
    followup_date TIMESTAMP,
    followup_notes TEXT,
    
    -- AI
    ai_sentiment VARCHAR(20),  -- 'positive', 'neutral', 'negative'
    ai_summary TEXT,
    
    -- Internal
    created_by VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. AI AUTOMATION LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_automation_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Automation details
    automation_type VARCHAR(100) NOT NULL,  -- 'lead_scoring', 'followup_reminder', 'price_optimization', 'fraud_check'
    trigger_event VARCHAR(100),
    
    -- Input/Output (JSONB)
    input_data JSONB,
    output_data JSONB,
    
    -- Performance
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'timeout')),
    error_message TEXT,
    
    -- Context
    contact_id UUID REFERENCES sales_contacts(contact_id) ON DELETE SET NULL,
    order_id UUID REFERENCES sales_orders(order_id) ON DELETE SET NULL,
    product_id UUID REFERENCES electronics_products(product_id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Sales contacts indexes
CREATE INDEX idx_contacts_email ON sales_contacts(email);
CREATE INDEX idx_contacts_company ON sales_contacts(company_name);
CREATE INDEX idx_contacts_status ON sales_contacts(lead_status);
CREATE INDEX idx_contacts_priority ON sales_contacts(lead_priority);
CREATE INDEX idx_contacts_assigned ON sales_contacts(assigned_to);
CREATE INDEX idx_contacts_ai_score ON sales_contacts(ai_score DESC);
CREATE INDEX idx_contacts_followup ON sales_contacts(next_followup_at);

-- Electronics products indexes
CREATE INDEX idx_products_category ON electronics_products(category);
CREATE INDEX idx_products_active ON electronics_products(is_active);
CREATE INDEX idx_products_featured ON electronics_products(is_featured);
CREATE INDEX idx_products_price ON electronics_products(base_price);

-- Sales orders indexes
CREATE INDEX idx_orders_contact ON sales_orders(contact_id);
CREATE INDEX idx_orders_status ON sales_orders(order_status);
CREATE INDEX idx_orders_date ON sales_orders(order_date DESC);

-- Supplier ads indexes
CREATE INDEX idx_ads_supplier ON supplier_ads(supplier_id);
CREATE INDEX idx_ads_status ON supplier_ads(status);
CREATE INDEX idx_ads_type ON supplier_ads(ad_type);

-- Sales interactions indexes
CREATE INDEX idx_interactions_contact ON sales_interactions(contact_id);
CREATE INDEX idx_interactions_type ON sales_interactions(interaction_type);
CREATE INDEX idx_interactions_date ON sales_interactions(interaction_date DESC);

-- AI automation log indexes
CREATE INDEX idx_ai_log_type ON ai_automation_log(automation_type);
CREATE INDEX idx_ai_log_status ON ai_automation_log(status);
CREATE INDEX idx_ai_log_created ON ai_automation_log(created_at DESC);

-- ============================================================================
-- VIEWS FOR KALIKA USER
-- ============================================================================

-- Active leads dashboard view
CREATE OR REPLACE VIEW v_active_leads AS
SELECT 
    contact_id,
    CONCAT(first_name, ' ', last_name) AS full_name,
    company_name,
    company_type,
    lead_status,
    lead_priority,
    ai_score,
    last_contacted_at,
    next_followup_at,
    deal_value,
    assigned_to
FROM sales_contacts
WHERE lead_status NOT IN ('closed_won', 'closed_lost')
ORDER BY ai_score DESC, next_followup_at ASC;

-- Sales performance view
CREATE OR REPLACE VIEW v_sales_performance AS
SELECT 
    DATE(order_date) AS order_day,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value,
    COUNT(DISTINCT contact_id) AS unique_customers
FROM sales_orders
WHERE order_status != 'cancelled'
GROUP BY DATE(order_date);

-- Electronics inventory view
CREATE OR REPLACE VIEW v_electronics_inventory AS
SELECT 
    product_id,
    name,
    category,
    base_price,
    discounted_price,
    discount_percent,
    stock_quantity,
    rating,
    is_featured
FROM electronics_products
WHERE is_active = TRUE
ORDER BY is_featured DESC, rating DESC;

-- ============================================================================
-- FUNCTIONS FOR AI AUTOMATION
-- ============================================================================

-- Function to calculate AI lead score
CREATE OR REPLACE FUNCTION calculate_lead_score(p_contact_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_score DECIMAL(5,2) := 50.0;  -- Base score
    v_contact RECORD;
BEGIN
    SELECT * INTO v_contact FROM sales_contacts WHERE contact_id = p_contact_id;
    
    -- Company type boost
    IF v_contact.company_type = 'enterprise' THEN v_score := v_score + 20;
    ELSIF v_contact.company_type = 'manufacturer' THEN v_score := v_score + 15;
    ELSIF v_contact.company_type = 'distributor' THEN v_score := v_score + 10;
    END IF;
    
    -- Budget boost
    IF v_contact.budget_range IS NOT NULL THEN v_score := v_score + 10; END IF;
    
    -- Interaction recency
    IF v_contact.last_contacted_at > NOW() - INTERVAL '7 days' THEN
        v_score := v_score + 15;
    ELSIF v_contact.last_contacted_at > NOW() - INTERVAL '30 days' THEN
        v_score := v_score + 5;
    END IF;
    
    -- Follow-up scheduled
    IF v_contact.next_followup_at IS NOT NULL THEN v_score := v_score + 10; END IF;
    
    RETURN LEAST(GREATEST(v_score, 0), 100);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_sales_contacts_updated_at BEFORE UPDATE ON sales_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_electronics_products_updated_at BEFORE UPDATE ON electronics_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_ads_updated_at BEFORE UPDATE ON supplier_ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
