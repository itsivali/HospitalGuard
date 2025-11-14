-- ============================================================================
-- HospitalGuard: Create Administrator Account
-- ============================================================================
-- Creates a super admin account with full system access
-- Email: itsivali@outlook.com
-- Role: admin (full CRUD access to entire system)
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Auth User (Manual - See Instructions Below)
-- ============================================================================

-- NOTE: Auth user creation MUST be done via Supabase Dashboard or Auth UI
-- You CANNOT create auth.users entries directly via SQL for security reasons
--
-- TO CREATE THE AUTH USER:
-- 1. Go to your HospitalGuard app at /auth
-- 2. Click "Sign Up"
-- 3. Use these credentials:
--    - Email: itsivali@outlook.com
--    - Password: (your secure password)
-- 4. Verify email if required
-- 5. Then run this SQL script to assign admin role
--
-- OR use Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Invite User"
-- 3. Enter: itsivali@outlook.com
-- 4. Then run this SQL script

-- ============================================================================
-- STEP 2: Assign Admin Role
-- ============================================================================

-- This will assign the admin role to the user
-- Run this AFTER creating the auth user

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for itsivali@outlook.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'itsivali@outlook.com';

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User itsivali@outlook.com not found. Please create the auth user first via /auth signup.';
  END IF;

  -- Assign admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Optionally create a hospital_staff record (for admin to appear in staff lists)
  INSERT INTO hospital_staff (
    user_id,
    staff_number,
    first_name,
    last_name,
    email,
    phone,
    staff_type,
    department_id,
    specialization,
    is_active,
    hire_date
  )
  SELECT
    admin_user_id,
    'ADMIN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
    'System',
    'Administrator',
    'itsivali@outlook.com',
    '+254-712-000-000',
    'admin',
    (SELECT id FROM departments WHERE name = 'Administration' LIMIT 1),
    'System Administration',
    true,
    CURRENT_DATE
  ON CONFLICT (email) DO NOTHING;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Administrator Account Created!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Email: itsivali@outlook.com';
  RAISE NOTICE 'Role: admin';
  RAISE NOTICE 'Access Level: Full CRUD on entire system';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'PERMISSIONS GRANTED:';
  RAISE NOTICE '✓ Access to all dashboards';
  RAISE NOTICE '✓ View all patient data';
  RAISE NOTICE '✓ View/Edit all prescriptions';
  RAISE NOTICE '✓ View/Edit all financial data';
  RAISE NOTICE '✓ View/Edit all medical records';
  RAISE NOTICE '✓ View/Edit all appointments';
  RAISE NOTICE '✓ View/Edit all lab/radiology orders';
  RAISE NOTICE '✓ Manage all hospital staff';
  RAISE NOTICE '✓ Full CRUD on all tables';
  RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- STEP 3: Grant Admin RLS Bypass Permissions
-- ============================================================================

-- Update RLS policies to allow admin full access
-- This adds admin role checks to all RLS policies

-- Note: The RLS policies will be updated to include:
-- OR EXISTS (
--   SELECT 1 FROM user_roles
--   WHERE user_roles.user_id = auth.uid()
--   AND user_roles.role = 'admin'
-- )

-- For now, we'll create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Update RLS Policies for Admin Access
-- ============================================================================

-- Patients Table - Admin can see and modify all patients
DROP POLICY IF EXISTS "admin_all_patients" ON patients;
CREATE POLICY "admin_all_patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Prescriptions Table - Admin can see and modify all prescriptions
DROP POLICY IF EXISTS "admin_all_prescriptions" ON prescriptions;
CREATE POLICY "admin_all_prescriptions"
  ON prescriptions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Prescription Items - Admin can see and modify all prescription items
DROP POLICY IF EXISTS "admin_all_prescription_items" ON prescription_items;
CREATE POLICY "admin_all_prescription_items"
  ON prescription_items
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Bills Table - Admin can see and modify all bills
DROP POLICY IF EXISTS "admin_all_bills" ON bills;
CREATE POLICY "admin_all_bills"
  ON bills
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Bill Items - Admin can see and modify all bill items
DROP POLICY IF EXISTS "admin_all_bill_items" ON bill_items;
CREATE POLICY "admin_all_bill_items"
  ON bill_items
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Payments - Admin can see and modify all payments
DROP POLICY IF EXISTS "admin_all_payments" ON payments;
CREATE POLICY "admin_all_payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Patient Visits - Admin can see and modify all visits
DROP POLICY IF EXISTS "admin_all_patient_visits" ON patient_visits;
CREATE POLICY "admin_all_patient_visits"
  ON patient_visits
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Medical Records - Admin can see and modify all records
DROP POLICY IF EXISTS "admin_all_medical_records" ON medical_records;
CREATE POLICY "admin_all_medical_records"
  ON medical_records
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Appointments - Admin can see and modify all appointments
DROP POLICY IF EXISTS "admin_all_appointments" ON appointments;
CREATE POLICY "admin_all_appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Lab Orders - Admin can see and modify all lab orders
DROP POLICY IF EXISTS "admin_all_lab_orders" ON lab_orders;
CREATE POLICY "admin_all_lab_orders"
  ON lab_orders
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Radiology Orders - Admin can see and modify all radiology orders
DROP POLICY IF EXISTS "admin_all_radiology_orders" ON radiology_orders;
CREATE POLICY "admin_all_radiology_orders"
  ON radiology_orders
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Hospital Staff - Admin can see and modify all staff
DROP POLICY IF EXISTS "admin_all_hospital_staff" ON hospital_staff;
CREATE POLICY "admin_all_hospital_staff"
  ON hospital_staff
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Pharmacy Inventory - Admin can see and modify all inventory
DROP POLICY IF EXISTS "admin_all_pharmacy_inventory" ON pharmacy_inventory;
CREATE POLICY "admin_all_pharmacy_inventory"
  ON pharmacy_inventory
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Dispensing Log - Admin can see and modify all dispensing logs
DROP POLICY IF EXISTS "admin_all_dispensing_log" ON dispensing_log;
CREATE POLICY "admin_all_dispensing_log"
  ON dispensing_log
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Departments - Admin can see and modify all departments
DROP POLICY IF EXISTS "admin_all_departments" ON departments;
CREATE POLICY "admin_all_departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Telemedicine Sessions - Admin can see and modify all sessions
DROP POLICY IF EXISTS "admin_all_telemedicine_sessions" ON telemedicine_sessions;
CREATE POLICY "admin_all_telemedicine_sessions"
  ON telemedicine_sessions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Aftercare Plans - Admin can see and modify all aftercare plans
DROP POLICY IF EXISTS "admin_all_aftercare_plans" ON aftercare_plans;
CREATE POLICY "admin_all_aftercare_plans"
  ON aftercare_plans
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Maternity Records - Admin can see and modify all maternity records
DROP POLICY IF EXISTS "admin_all_maternity_records" ON maternity_records;
CREATE POLICY "admin_all_maternity_records"
  ON maternity_records
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Mental Health Records - Admin can see and modify all mental health records
DROP POLICY IF EXISTS "admin_all_mental_health_records" ON mental_health_records;
CREATE POLICY "admin_all_mental_health_records"
  ON mental_health_records
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- User Roles - Admin can see and modify all user roles
DROP POLICY IF EXISTS "admin_all_user_roles" ON user_roles;
CREATE POLICY "admin_all_user_roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
  admin_role_count INTEGER;
  admin_staff_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ADMINISTRATOR ACCOUNT VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Check if user exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'itsivali@outlook.com';

  IF admin_user_id IS NULL THEN
    RAISE NOTICE '❌ Auth user not found';
    RAISE NOTICE '   Create user at /auth first';
  ELSE
    RAISE NOTICE '✓ Auth user exists: %', admin_user_id;
  END IF;

  -- Check if admin role is assigned
  SELECT COUNT(*) INTO admin_role_count
  FROM user_roles
  WHERE user_id = admin_user_id AND role = 'admin';

  IF admin_role_count > 0 THEN
    RAISE NOTICE '✓ Admin role assigned';
  ELSE
    RAISE NOTICE '❌ Admin role not assigned';
  END IF;

  -- Check if staff record exists
  SELECT EXISTS (
    SELECT 1 FROM hospital_staff
    WHERE email = 'itsivali@outlook.com'
  ) INTO admin_staff_exists;

  IF admin_staff_exists THEN
    RAISE NOTICE '✓ Staff record created';
  ELSE
    RAISE NOTICE '⚠️  Staff record not created (optional)';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '1. Login at /auth with itsivali@outlook.com';
  RAISE NOTICE '2. Access Admin Dashboard at /admin-dashboard';
  RAISE NOTICE '3. View all patient data, financials, prescriptions';
  RAISE NOTICE '4. Full CRUD operations on all tables';
  RAISE NOTICE '========================================';

END $$;
