-- Additive sales & marketing views over centralized data.
-- Auto-created at server startup; safe to run manually on GCP Cloud SQL too.
-- Only adds objects; does not alter or break existing tables.

CREATE OR REPLACE VIEW v_sales_pipeline AS
SELECT contact_id,
       first_name || ' ' || last_name AS full_name,
       company_name, company_type, industry,
       lead_status, lead_priority, ai_score,
       deal_value, next_followup_at, assigned_to
FROM sales_contacts;

CREATE OR REPLACE VIEW v_marketing_funnel AS
SELECT lead_source, lead_status,
       COUNT(*) AS leads,
       ROUND(AVG(ai_score)::numeric, 1) AS avg_ai_score
FROM sales_contacts
GROUP BY lead_source, lead_status;

CREATE OR REPLACE VIEW v_monthly_sales AS
SELECT date_trunc('month', created_at)::date AS month,
       COUNT(*) AS orders,
       SUM(total) AS revenue,
       ROUND(AVG(total)::numeric, 2) AS avg_order_value
FROM orders
WHERE status <> 'cancelled'
GROUP BY 1
ORDER BY 1 DESC;

-- BigQuery mirror (run in `kalika_sales` dataset after data transfer):
-- v_sales_pipeline, v_marketing_funnel, v_monthly_sales use the same SQL
-- with TIMESTAMP_TRUNC(created_at, MONTH) instead of date_trunc.