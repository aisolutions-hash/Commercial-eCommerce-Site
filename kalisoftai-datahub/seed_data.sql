-- ============================================================================
-- KALISOFT AI DATAHUB - Seed Data
-- Electronics Products, Sales Contacts, Supplier Ads
-- ============================================================================

-- ============================================================================
-- 1. ELECTRONICS PRODUCTS - PCs, GPUs, Cameras with AI Integration
-- ============================================================================

-- Gaming PCs with AI
INSERT INTO electronics_products (product_id, name, description, category, subcategory, base_price, discounted_price, discount_percent, ai_features, specifications, stock_quantity, sku, manufacturer, model, is_featured, packaging_options) VALUES

-- Gaming PCs
('e1a2b3c4-d5e6-7890-abcd-ef1234567801', 
 'Kalika AI Gaming Desktop PC - RTX 4070 Ti Super', 
 'High-performance gaming PC with integrated AI upscaling (DLSS 3.5), AI noise cancellation, and智能 performance optimization. Perfect for gamers and content creators.',
 'pc', 'gaming_pc',
 185000, 166500, 10,
 ARRAY['NVIDIA DLSS 3.5', 'AI Noise Cancellation', 'Smart Performance Boost', 'AI Overclocking'],
 '{"gpu": "NVIDIA RTX 4070 Ti Super 16GB", "cpu": "Intel Core i7-14700K", "ram": "32GB DDR5 5600MHz", "storage": "1TB NVMe Gen4 SSD", "motherboard": "Z790 ATX", "psu": "850W 80+ Gold", "cooling": "240mm AIO Liquid", "case": "Mid Tower RGB"}',
 25, 'KAI-PC-GAM-001', 'Kalika Systems', 'KG-700Ti',
 TRUE, ARRAY['standard', 'custom_box', 'stretch_film']),

('e1a2b3c4-d5e6-7890-abcd-ef1234567802',
 'Kalika AI Workstation PC - RTX 4090 Creative Pro',
 'Professional workstation with AI-accelerated rendering, smart resource allocation, and enterprise-grade reliability for video editing and 3D rendering.',
 'pc', 'workstation_pc',
 345000, 310500, 10,
 ARRAY['AI Render Acceleration', 'Smart Resource Manager', 'AI Color Grading', 'Neural Engine'],
 '{"gpu": "NVIDIA RTX 4090 24GB", "cpu": "Intel Core i9-14900K", "ram": "64GB DDR5 5600MHz", "storage": "2TB NVMe Gen4 SSD + 4TB HDD", "motherboard": "Z790 ATX Workstation", "psu": "1000W 80+ Platinum", "cooling": "360mm AIO Liquid", "case": "Full Tower E-ATX"}',
 10, 'KAI-PC-WS-001', 'Kalika Systems', 'KG-4090WS',
 TRUE, ARRAY['standard', 'custom_box', 'stretch_film', 'vci']),

('e1a2b3c4-d5e6-7890-abcd-ef1234567803',
 'Kalika Budget AI PC - RTX 4060 Smart Entry',
 'Affordable AI-powered PC for everyday use with intelligent task management and AI-enhanced multimedia experience.',
 'pc', 'budget_pc',
 72000, 64800, 10,
 ARRAY['AI Task Manager', 'Smart Power Save', 'AI Photo Enhancement'],
 '{"gpu": "NVIDIA RTX 4060 8GB", "cpu": "Intel Core i5-14400F", "ram": "16GB DDR5 4800MHz", "storage": "512GB NVMe SSD", "motherboard": "B760 mATX", "psu": "650W 80+ Bronze", "cooling": "Tower Cooler", "case": "mATX Compact"}',
 50, 'KAI-PC-BUD-001', 'Kalika Systems', 'KG-4060B',
 FALSE, ARRAY['standard', 'stretch_film']),

-- GPUs
('e1a2b3c4-d5e6-7890-abcd-ef1234567804',
 'NVIDIA GeForce RTX 4090 24GB OC - Kalika Edition',
 'Flagship GPU with AI-powered DLSS 3.5, ray tracing, and neural rendering. Kalika custom cooling solution.',
 'gpu', 'flagship_gpu',
 210000, 189000, 10,
 ARRAY['DLSS 3.5', 'Ray Tracing', 'Neural Rendering', 'AI Noise Cancel'],
 '{"memory": "24GB GDDR6X", "boost_clock": "2520 MHz", "cuda_cores": "16384", "tpu": "Tensor Cores 5th Gen", "rt_cores": "3rd Gen", "power": "450W TDP", "interface": "PCIe 4.0 x16", "outputs": "3x DP 1.4a, 1x HDMI 2.1"}',
 15, 'KAI-GPU-4090-001', 'NVIDIA/Kalika', 'RTX 4090 OC',
 TRUE, ARRAY['standard', 'anti_static', 'stretch_film']),

('e1a2b3c4-d5e6-7890-abcd-ef1234567805',
 'NVIDIA GeForce RTX 4070 Ti Super 16GB - Kalika Tuned',
 'High-end GPU with AI upscaling and content creation acceleration. Kalika factory overclocked.',
 'gpu', 'high_end_gpu',
 82000, 73800, 10,
 ARRAY['DLSS 3.5', 'AV1 Encode', 'AI Photo Enhance', 'Smart Resolution'],
 '{"memory": "16GB GDDR6X", "boost_clock": "2640 MHz", "cuda_cores": "8448", "tpu": "Tensor Cores 4th Gen", "rt_cores": "3rd Gen", "power": "285W TDP", "interface": "PCIe 4.0 x16", "outputs": "3x DP 1.4a, 1x HDMI 2.1"}',
 30, 'KAI-GPU-4070Ti-001', 'NVIDIA/Kalika', 'RTX 4070Ti S',
 TRUE, ARRAY['standard', 'anti_static', 'stretch_film']),

('e1a2b3c4-d5e6-7890-abcd-ef1234567806',
 'NVIDIA GeForce RTX 4060 8GB - Kalika Smart',
 'Entry-level AI GPU for 1080p gaming and AI applications. Perfect for budget builds.',
 'gpu', 'entry_gpu',
 32000, 28800, 10,
 ARRAY['DLSS 3', 'AV1 Encode', 'AI Background Blur'],
 '{"memory": "8GB GDDR6", "boost_clock": "2460 MHz", "cuda_cores": "3072", "tpu": "Tensor Cores 3rd Gen", "rt_cores": "2nd Gen", "power": "115W TDP", "interface": "PCIe 4.0 x8", "outputs": "3x DP 1.4a, 1x HDMI 2.1"}',
 75, 'KAI-GPU-4060-001', 'NVIDIA/Kalika', 'RTX 4060',
 FALSE, ARRAY['standard', 'anti_static']),

-- Camera Systems
('e1a2b3c4-d5e6-7890-abcd-ef1234567807',
 'Kalika AI Pro Camera System - 4K Cinema Kit',
 'Professional cinema camera with AI auto-focus, scene detection, and intelligent color grading. Includes lens kit and accessories.',
 'camera', 'professional_camera',
 485000, 436500, 10,
 ARRAY['AI Auto-Focus', 'Scene Detection', 'AI Color Grading', 'Smart Stabilization', 'Voice Control'],
 '{"sensor": "Full Frame 45MP CMOS", "video": "8K 30fps, 4K 120fps", "iso": "100-51200", "autofocus": "1053 AF Points AI", "stabilization": "5-axis IBIS", "connectivity": "WiFi 6E, Bluetooth 5.3, USB-C", "storage": "CFexpress Type B + SD UHS-II", "battery": "2000 shots / 4K 120min"}',
 8, 'KAI-CAM-PRO-001', 'Kalika Imaging', 'KK-Cinema4K',
 TRUE, ARRAY['standard', 'custom_box', 'vci', 'stretch_film']),

('e1a2b3c4-d5e6-7890-abcd-ef1234567808',
 'Kalika AI Security Camera System - 8 Channel NVR',
 'Smart security system with AI person detection, facial recognition, and automated alerts. 4K resolution with night vision.',
 'camera', 'security_system',
 65000, 58500, 10,
 ARRAY['AI Person Detection', 'Facial Recognition', 'Smart Alerts', 'License Plate Recognition', 'Behavior Analysis'],
 '{"resolution": "4K Ultra HD", "channels": "8 Channel NVR", "cameras": "4x 4K Turret", "night_vision": "30m Color Night Vision", "storage": "4TB HDD Included", "ai_features": "Person/Vehicle Detection", "connectivity": "PoE, WiFi", "mobile_app": "Kalika Vision AI"}',
 20, 'KAI-CAM-SEC-001', 'Kalika Security', 'KK-Secure8',
 TRUE, ARRAY['standard', 'stretch_film']),

('e1a2b3c4-d5e6-7890-abcd-ef1234567809',
 'Kalika AI Webcam Pro - 4K Streaming with AI Background',
 '4K webcam with AI background blur, auto-framing, and noise cancellation for professional streaming.',
 'camera', 'webcam',
 12000, 10800, 10,
 ARRAY['AI Background Blur', 'Auto-Framing', 'Noise Cancellation', 'Auto Exposure'],
 '{"resolution": "4K 30fps / 1080p 60fps", "fov": "90 degrees", "microphone": "Dual Array AI Noise Cancel", "autofocus": "AI Face Tracking", "low_light": "AI HDR", "connectivity": "USB-C", "mount": "Monitor/Tripod"}',
 100, 'KAI-CAM-WEB-001', 'Kalika Imaging', 'KK-Webcam4K',
 FALSE, ARRAY['standard', 'stretch_film']),

-- Monitors
('e1a2b3c4-d5e6-7890-abcd-ef1234567810',
 'Kalika AI Gaming Monitor - 27" 4K 144Hz OLED',
 'Premium gaming monitor with AI upscaling, adaptive sync, and smart brightness. OLED panel for perfect blacks.',
 'monitor', 'gaming_monitor',
 95000, 85500, 10,
 ARRAY['AI Upscaling', 'Smart HDR', 'Adaptive Sync Pro', 'Eye Care AI'],
 '{"size": "27 inch", "panel": "WOLED", "resolution": "3840x2160", "refresh_rate": "144Hz", "response_time": "0.1ms GTG", "hdr": "HDR10+ / Dolby Vision", "color": "99% DCI-P3", "features": "G-Sync Compatible, FreeSync Premium Pro"}',
 18, 'KAI-MON-4K144-001', 'Kalika Displays', 'KK-OLED27',
 TRUE, ARRAY['standard', 'custom_box', 'stretch_film']),

-- AI Solutions Bundles
('e1a2b3c4-d5e6-7890-abcd-ef1234567811',
 'Kalika Smart Office AI Bundle - PC + Camera + Monitor',
 'Complete AI-powered office solution with intelligent PC, security camera, and smart monitor. Pre-configured for productivity.',
 'ai_solution', 'smart_office_bundle',
 320000, 272000, 15,
 ARRAY['AI Office Assistant', 'Smart Security', 'Auto-Optimization', 'Voice Control', 'Energy Management'],
 '{"includes": "Kalika AI Workstation + Security Camera System + 4K Monitor", "software": "Kalika AI Suite 1 Year License", "support": "24/7 Priority Support", "installation": "Free On-Site Setup"}',
 5, 'KAI-BUNDLE-OFFICE-001', 'Kalika Systems', 'KK-SmartOffice',
 TRUE, ARRAY['custom_box', 'stretch_film', 'vci']),

('e1a2b3c4-d5e6-7890-abcd-ef1234567812',
 'Kalika Content Creator AI Bundle - PC + Camera + Webcam',
 'Complete AI-powered content creation suite for YouTubers and streamers. Includes workstation, cinema camera, and streaming webcam.',
 'ai_solution', 'creator_bundle',
 550000, 467500, 15,
 ARRAY['AI Video Editing', 'Smart Scene Detection', 'Auto Color Grading', 'Noise Cancellation', 'Stream Overlay AI'],
 '{"includes": "Kalika AI Workstation + Cinema Camera + Webcam Pro", "software": "Kalika Creator Suite 1 Year License", "support": "Priority Creator Support", "training": "Free 1-on-1 Setup Session"}',
 3, 'KAI-BUNDLE-CREATOR-001', 'Kalika Systems', 'KK-CreatorSuite',
 TRUE, ARRAY['custom_box', 'stretch_film', 'vci']);

-- ============================================================================
-- 2. SALES CONTACTS - Internal Team & Client Data
-- ============================================================================

-- Internal Team Members
INSERT INTO sales_contacts (contact_id, first_name, last_name, email, phone_primary, company_name, company_type, industry, lead_source, lead_status, lead_priority, assigned_to, team_notes, packaging_preference) VALUES

('f1a2b3c4-d5e6-7890-abcd-ef1234567801',
 'Priya', 'Sharma', 'priya.sharma@kalisoftai.com', '+91-9876543210',
 'KaliSoft AI', 'enterprise', 'Technology',
 'website', 'qualified', 'critical',
 'self', 'Sales Head - Enterprise Division', ARRAY['custom_box', 'vci']),

('f1a2b3c4-d5e6-7890-abcd-ef1234567802',
 'Rahul', 'Verma', 'rahul.verma@kalisoftai.com', '+91-9876543211',
 'KaliSoft AI', 'enterprise', 'Technology',
 'website', 'qualified', 'critical',
 'self', 'Sales Manager - SMB Division', ARRAY['stretch_film', 'standard']),

('f1a2b3c4-d5e6-7890-abcd-ef1234567803',
 'Anita', 'Patel', 'anita.patel@kalisoftai.com', '+91-9876543212',
 'KaliSoft AI', 'enterprise', 'Technology',
 'website', 'qualified', 'high',
 'self', 'Technical Sales Engineer', ARRAY['standard', 'custom_box']),

-- Client Leads - Enterprise
('f1a2b3c4-d5e6-7890-abcd-ef1234567804',
 'Vikram', 'Singh', 'vikram.singh@tataindustries.com', '+91-9812345001',
 'Tata Industries', 'manufacturer', 'Manufacturing',
 'trade_show', 'negotiation', 'critical',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567801',
 'Interested in AI Workstations + Security Systems for 3 factories. Budget: Rs. 50L+',
 ARRAY['vci', 'custom_box', 'stretch_film']),

('f1a2b3c4-d5e6-7890-abcd-ef1234567805',
 'Meera', 'Reddy', 'meera.reddy@reliance-retail.com', '+91-9812345002',
 'Reliance Retail', 'retailer', 'Retail',
 'referral', 'proposal_sent', 'high',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567801',
 'Needs 50 Gaming PCs for office + 100 Security Cameras for stores',
 ARRAY['stretch_film', 'standard']),

('f1a2b3c4-d5e6-7890-abcd-ef1234567806',
 'Arjun', 'Nair', 'arjun.nair@infosys.com', '+91-9812345003',
 'Infosys Limited', 'enterprise', 'IT Services',
 'linkedin', 'qualified', 'high',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567802',
 'AI Workstations for ML team. Volume: 200+ units',
 ARRAY['vci', 'custom_box']),

-- Client Leads - Manufacturing
('f1a2b3c4-d5e6-7890-abcd-ef1234567807',
 'Suresh', 'Gupta', 'suresh.gupta@mahindra-mfg.com', '+91-9812345004',
 'Mahindra Manufacturing', 'manufacturer', 'Automotive',
 'indiamart', 'contacted', 'medium',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567803',
 'Factory automation - needs Industrial PCs + Security',
 ARRAY['vci', 'stretch_film']),

('f1a2b3c4-d5e6-7890-abcd-ef1234567808',
 'Deepika', 'Iyer', 'deepika.iyer@bajaj-auto.com', '+91-9812345005',
 'Bajaj Auto', 'manufacturer', 'Automotive',
 'moglix', 'new', 'medium',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567803',
 'Inquiry via Moglix for Workstation PCs',
 ARRAY['standard', 'vci']),

-- Client Leads - Startups
('f1a2b3c4-d5e6-7890-abcd-ef1234567809',
 'Aditya', 'Joshi', 'aditya.joshi@techstartup.io', '+91-9812345006',
 'TechStartup India', 'startup', 'Technology',
 'google_ads', 'qualified', 'medium',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567802',
 'Gaming PCs for dev team. 10 units, budget Rs. 15L',
 ARRAY['standard', 'stretch_film']),

('f1a2b3c4-d5e6-7890-abcd-ef1234567810',
 'Neha', 'Kapoor', 'neha.kapoor@designstudio.co', '+91-9812345007',
 'Design Studio Co', 'startup', 'Creative',
 'whatsapp', 'proposal_sent', 'high',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567802',
 'Content Creator Bundle for 5 video editors',
 ARRAY['custom_box', 'stretch_film']),

-- Client Leads - Government
('f1a2b3c4-d5e6-7890-abcd-ef1234567811',
 'Rajesh', 'Kumar', 'rajesh.kumar@karnataka.gov.in', '+91-9812345008',
 'Karnataka State IT Dept', 'government', 'Government',
 'cold_call', 'negotiation', 'critical',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567801',
 'Smart city project - 500+ Security Cameras + AI Analytics. Tenders pending.',
 ARRAY['vci', 'custom_box', 'stretch_film']),

-- Dormant Leads
('f1a2b3c4-d5e6-7890-abcd-ef1234567812',
 'Karthik', 'Menon', 'karthik.menon@oldclient.com', '+91-9812345009',
 'Old Client Corp', 'distributor', 'Distribution',
 'referral', 'dormant', 'low',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567803',
 'Last order 8 months ago. Follow-up needed.',
 ARRAY['standard']),

-- International Leads
('f1a2b3c4-d5e6-7890-abcd-ef1234567813',
 'James', 'Wilson', 'james.wilson@globaltech.ae', '+971-50-1234567',
 'Global Tech Trading', 'distributor', 'Technology',
 'trade_show', 'qualified', 'high',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567801',
 'Dubai-based distributor. Wants GPU + PC distribution rights for UAE.',
 ARRAY['vci', 'stretch_film', 'custom_box']),

('f1a2b3c4-d5e6-7890-abcd-ef1234567814',
 'Sarah', 'Chen', 'sarah.chen@techdist.sg', '+65-91234567',
 'Tech Distribution SG', 'distributor', 'Technology',
 'linkedin', 'contacted', 'medium',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567802',
 'Singapore distributor interested in Camera Systems',
 ARRAY['standard', 'vci']);

-- ============================================================================
-- 3. SUPPLIER ADS - For Display on Platform
-- ============================================================================

INSERT INTO supplier_ads (ad_id, supplier_id, ad_title, ad_description, ad_type, target_audience, target_categories, media_type, status, budget_daily, budget_total) VALUES

('g1a2b3c4-d5e6-7890-abcd-ef1234567801',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567804',
 'Kalika AI Gaming PCs - Festival Season Offer',
 'Get 10% off on all Kalika AI Gaming PCs. Powered by NVIDIA RTX 40 series with AI upscaling.',
 'sponsored_product',
 ARRAY['gamers', 'content_creators', 'developers'],
 ARRAY['pc', 'gpu'],
 'image',
 'active',
 5000, 150000),

('g1a2b3c4-d5e6-7890-abcd-ef1234567802',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567805',
 'Smart Security Solutions - AI Powered Cameras',
 'Kalika AI Security Cameras with person detection, facial recognition. 4K quality.',
 'banner',
 ARRAY['business_owners', 'facility_managers', 'security_teams'],
 ARRAY['camera', 'ai_solution'],
 'image',
 'active',
 3000, 90000),

('g1a2b3c4-d5e6-7890-abcd-ef1234567803',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567806',
 'Kalika Creator Bundle - Perfect for YouTubers',
 'Complete content creation setup: AI Workstation + Cinema Camera + Webcam. Save 15%!',
 'native',
 ARRAY['youtubers', 'streamers', 'content_creators'],
 ARRAY['camera', 'ai_solution'],
 'carousel',
 'active',
 4000, 120000),

('g1a2b3c4-d5e6-7890-abcd-ef1234567804',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567807',
 'Enterprise AI Workstations - Bulk Orders Welcome',
 'Kalika Workstation PCs for AI/ML teams. Volume discounts available for 10+ units.',
 'featured_supplier',
 ARRAY['enterprises', 'ai_ml_teams', 'research_institutions'],
 ARRAY['pc', 'gpu', 'ai_solution'],
 'image',
 'active',
 2500, 75000),

('g1a2b3c4-d5e6-7890-abcd-ef1234567805',
 'f1a2b3c4-d5e6-7890-abcd-ef1234567811',
 'Government Projects - Kalika Authorized Partner',
 'Special pricing for government tenders. AI surveillance, smart city solutions.',
 'category_highlight',
 ARRAY['government', 'public_sector'],
 ARRAY['camera', 'ai_solution'],
 'text',
 'active',
 1000, 30000);

-- ============================================================================
-- 4. INITIAL AI AUTOMATION LOG ENTRIES
-- ============================================================================

INSERT INTO ai_automation_log (log_id, automation_type, trigger_event, input_data, output_data, status) VALUES

('h1a2b3c4-d5e6-7890-abcd-ef1234567801',
 'lead_scoring', 'new_lead_created',
 '{"contact_id": "f1a2b3c4-d5e6-7890-abcd-ef1234567804", "source": "trade_show"}',
 '{"score": 85, "segment": "enterprise", "recommendation": "Schedule demo within 48 hours"}',
 'success'),

('h1a2b3c4-d5e6-7890-abcd-ef1234567802',
 'followup_reminder', 'followup_overdue',
 '{"contact_id": "f1a2b3c4-d5e6-7890-abcd-ef1234567812", "days_overdue": 5}',
 '{"action": "send_whatsapp", "template": "reengagement_v1"}',
 'success'),

('h1a2b3c4-d5e6-7890-abcd-ef1234567803',
 'price_optimization', 'competitor_price_change',
 '{"product_id": "e1a2b3c4-d5e6-7890-abcd-ef1234567801", "competitor": "mdcomputers", "old_price": 190000}',
 '{"suggested_price": 166500, "reason": "Match market rate + 10% discount positioning"}',
 'success');
