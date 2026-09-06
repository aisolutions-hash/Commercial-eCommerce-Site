-- ============================================================================
-- KALISOFT AI DATAHUB - BigQuery Schema
-- For GCP Migration: Sales Contacts, Electronics Products, AI Integration
-- ============================================================================

-- Dataset: kalika_sales
-- Project: kalisoftai-datahub

-- ============================================================================
-- 1. SALES CONTACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `kalika_sales.sales_contacts` (
    -- Primary identification
    contact_id STRING NOT NULL,
    
    -- Personal information
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    email STRING,
    phone_primary STRING,
    phone_secondary STRING,
    
    -- Company information
    company_name STRING,
    company_type ENUM('manufacturer', 'distributor', 'retailer', 'enterprise', 'startup', 'government', 'other'),
    industry STRING,
    company_size ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'),
    
    -- Address
    address_line1 STRING,
    address_line2 STRING,
    city STRING,
    state STRING,
    pincode STRING,
    country STRING DEFAULT 'India',
    
    -- Sales metadata
    lead_source ENUM('website', 'referral', 'cold_call', 'linkedin', 'indiamart', 'moglix', 'trade_show', 'google_ads', 'meta_ads', 'whatsapp', 'other'),
    lead_status ENUM('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost', 'dormant'),
    lead_priority ENUM('low', 'medium', 'high', 'critical'),
    
    -- Product interest
    product_interest ARRAY<STRING>,
    budget_range STRING,
    expected_order_date DATE,
    
    -- Interaction tracking
    last_contacted_at TIMESTAMP,
    last_interaction_type ENUM('call', 'email', 'whatsapp', 'meeting', 'demo', 'other'),
    next_followup_at TIMESTAMP,
    followup_notes STRING,
    
    -- AI automation
    ai_score FLOAT64,  -- AI-generated lead score 0-100
    ai_recommendation STRING,  -- AI-suggested next action
    ai_segment STRING,  -- AI-assigned segment
    
    -- Packaging preference
    packaging_preference ARRAY<STRING>,  -- 'vci', 'stretch_film', 'custom', 'standard'
    
    -- Deal tracking
    deal_value FLOAT64,
    deal_currency STRING DEFAULT 'INR',
    deal_status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    
    -- Internal team
    assigned_to STRING,  -- Team member responsible
    team_notes STRING,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- GCP metadata
    _partition_date DATE DEFAULT CURRENT_DATE(),
    _batch_id STRING
)
PARTITION BY _partition_date
CLUSTER BY lead_status, company_type, assigned_to
OPTIONS (
    description = 'Kalika sales contacts - all leads and customer data',
    require_partition_filter = false
);

-- ============================================================================
-- 2. ELECTRONICS PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `kalika_sales.electronics_products` (
    product_id STRING NOT NULL,
    
    -- Product details
    name STRING NOT NULL,
    description STRING,
    category ENUM('pc', 'gpu', 'camera', 'monitor', 'accessory', 'ai_solution'),
    subcategory STRING,  -- 'gaming_pc', 'workstation_pc', 'professional_camera', etc.
    
    -- Pricing
    base_price FLOAT64 NOT NULL,
    discounted_price FLOAT64,
    discount_percent FLOAT64 DEFAULT 0,
    currency STRING DEFAULT 'INR',
    
    -- AI integration
    ai_features ARRAY<STRING>,  -- Features that use AI
    ai_solution_id STRING,  -- Links to AI product if bundled
    
    -- Specifications (JSON for flexibility)
    specifications JSON,  -- GPU specs, PC specs, camera specs, etc.
    
    -- Inventory
    stock_quantity INT64 DEFAULT 0,
    sku STRING,
    manufacturer STRING,
    model STRING,
    
    -- Images
    primary_image STRING,
    gallery_images ARRAY<STRING>,
    
    -- Sales metadata
    is_active BOOL DEFAULT TRUE,
    is_featured BOOL DEFAULT FALSE,
    is_contact_for_price BOOL DEFAULT FALSE,
    moq INT64 DEFAULT 1,
    uom STRING DEFAULT 'NOS',
    
    -- Ratings
    rating FLOAT64 DEFAULT 0,
    review_count INT64 DEFAULT 0,
    
    -- Packaging options
    packaging_options ARRAY<STRING>,  -- 'vci', 'stretch_film', 'custom_box', 'standard'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. SALES ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `kalika_sales.sales_orders` (
    order_id STRING NOT NULL,
    contact_id STRING NOT NULL,
    
    -- Order details
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'),
    
    -- Items
    items ARRAY<STRUCT<
        product_id STRING,
        product_name STRING,
        quantity INT64,
        unit_price FLOAT64,
        discount_percent FLOAT64,
        final_price FLOAT64
    >>,
    
    -- Pricing
    subtotal FLOAT64,
    discount_amount FLOAT64 DEFAULT 0,
    tax_amount FLOAT64 DEFAULT 0,
    shipping_cost FLOAT64 DEFAULT 0,
    total_amount FLOAT64,
    currency STRING DEFAULT 'INR',
    
    -- Packaging
    packaging_type STRING,  -- 'vci', 'stretch_film', 'custom', 'standard'
    packaging_notes STRING,
    
    -- Shipping
    shipping_address JSON,
    shipping_method STRING,
    tracking_number STRING,
    
    -- AI automation
    ai_order_score FLOAT64,
    ai_fraud_check STRING,
    
    -- Internal
    assigned_to STRING,
    internal_notes STRING,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. SUPPLIER ADVERTISEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `kalika_sales.supplier_ads` (
    ad_id STRING NOT NULL,
    supplier_id STRING NOT NULL,
    
    -- Ad details
    ad_title STRING NOT NULL,
    ad_description STRING,
    ad_type ENUM('banner', 'sponsored_product', 'native', 'featured_supplier', 'category_highlight'),
    
    -- Targeting
    target_audience ARRAY<STRING>,
    target_categories ARRAY<STRING>,
    target_locations ARRAY<STRING>,
    
    -- Media
    media_url STRING,
    media_type ENUM('image', 'video', 'carousel', 'text'),
    landing_url STRING,
    
    -- Budget & Performance
    budget_daily FLOAT64,
    budget_total FLOAT64,
    spend_total FLOAT64 DEFAULT 0,
    impressions INT64 DEFAULT 0,
    clicks INT64 DEFAULT 0,
    conversions INT64 DEFAULT 0,
    
    -- Status
    status ENUM('draft', 'pending_approval', 'active', 'paused', 'completed', 'rejected'),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- AI optimization
    ai_bid_amount FLOAT64,
    ai_target_cpa FLOAT64,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. SALES INTERACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `kalika_sales.sales_interactions` (
    interaction_id STRING NOT NULL,
    contact_id STRING NOT NULL,
    order_id STRING,  -- Optional, linked to order
    
    -- Interaction details
    interaction_type ENUM('call', 'email', 'whatsapp', 'meeting', 'demo', 'support', 'other'),
    interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Content
    subject STRING,
    notes STRING,
    outcome STRING,
    
    -- Follow-up
    followup_required BOOL DEFAULT FALSE,
    followup_date TIMESTAMP,
    followup_notes STRING,
    
    -- AI
    ai_sentiment STRING,  -- 'positive', 'neutral', 'negative'
    ai_summary STRING,
    
    -- Internal
    created_by STRING,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. AI AUTOMATION LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `kalika_sales.ai_automation_log` (
    log_id STRING NOT NULL,
    
    -- Automation details
    automation_type STRING NOT NULL,  -- 'lead_scoring', 'followup_reminder', 'price_optimization', 'fraud_check'
    trigger_event STRING,
    
    -- Input/Output
    input_data JSON,
    output_data JSON,
    
    -- Performance
    execution_time_ms INT64,
    status ENUM('success', 'failure', 'timeout'),
    error_message STRING,
    
    -- Context
    contact_id STRING,
    order_id STRING,
    product_id STRING,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VIEWS FOR KALIKA USER
-- ============================================================================

-- Active leads dashboard view
CREATE OR REPLACE VIEW `kalika_sales.v_active_leads` AS
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
FROM `kalika_sales.sales_contacts`
WHERE lead_status NOT IN ('closed_won', 'closed_lost')
ORDER BY ai_score DESC, next_followup_at ASC;

-- Sales performance view
CREATE OR REPLACE VIEW `kalika_sales.v_sales_performance` AS
SELECT 
    DATE(order_date) AS order_day,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value,
    COUNT(DISTINCT contact_id) AS unique_customers
FROM `kalika_sales.sales_orders`
WHERE order_status != 'cancelled'
GROUP BY DATE(order_date);

-- Electronics inventory view
CREATE OR REPLACE VIEW `kalika_sales.v_electronics_inventory` AS
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
FROM `kalika_sales.electronics_products`
WHERE is_active = TRUE
ORDER BY is_featured DESC, rating DESC;
