-- ============================================================================
-- HospitalGuard: Database Cleanup Script
-- ============================================================================
-- Run this FIRST before running hospital-database.sql
-- This drops all existing tables and functions to start fresh
-- ============================================================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS aftercare_plans CASCADE;
DROP TABLE IF EXISTS telemedicine_sessions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS mental_health_records CASCADE;
DROP TABLE IF EXISTS maternity_records CASCADE;
DROP TABLE IF EXISTS radiology_orders CASCADE;
DROP TABLE IF EXISTS lab_orders CASCADE;
DROP TABLE IF EXISTS medication_dispensing CASCADE;
DROP TABLE IF EXISTS pharmacy_inventory CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS diagnoses CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS visit_department_history CASCADE;
DROP TABLE IF EXISTS patient_visits CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS hospital_staff CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_visit_number() CASCADE;
DROP FUNCTION IF EXISTS generate_prescription_number() CASCADE;
DROP FUNCTION IF EXISTS generate_bill_number() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Completion message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database Cleanup Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All tables and functions have been dropped';
  RAISE NOTICE 'Ready to run hospital-database.sql';
  RAISE NOTICE '========================================';
END $$;
