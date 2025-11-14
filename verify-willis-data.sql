-- ============================================================================
-- Verification Script: Check Willis Ivali's Patient Data
-- ============================================================================
-- Run this in Supabase SQL Editor to verify all data is loaded correctly
-- ============================================================================

-- Check 1: Auth User Exists
SELECT
  'Auth User' as check_type,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ FOUND'
    ELSE '❌ NOT FOUND - Please register Willis at /auth first'
  END as status,
  email,
  id as user_id
FROM auth.users
WHERE email = 'itsivali@gmail.com'
GROUP BY email, id;

-- Check 2: Patient Role Assigned
SELECT
  'Patient Role' as check_type,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ FOUND'
    ELSE '❌ NOT FOUND - Run patient-willis-ivali-seed.sql'
  END as status,
  ur.role
FROM user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'itsivali@gmail.com'
GROUP BY ur.role;

-- Check 3: Patient Record
SELECT
  'Patient Record' as check_type,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ FOUND'
    ELSE '❌ NOT FOUND - Run patient-willis-ivali-seed.sql'
  END as status,
  p.id as patient_id,
  p.first_name,
  p.last_name,
  p.email
FROM patients p
WHERE p.email = 'itsivali@gmail.com'
GROUP BY p.id, p.first_name, p.last_name, p.email;

-- Check 4: Patient Visits
SELECT
  'Patient Visits' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ FOUND'
    ELSE '❌ NOT FOUND - Run patient-willis-ivali-seed.sql'
  END as status
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.email = 'itsivali@gmail.com';

-- Check 5: Detailed Visit Information
SELECT
  pv.visit_number,
  pv.status,
  pv.chief_complaint,
  pv.check_in_time,
  hs.first_name || ' ' || hs.last_name as attending_doctor,
  hs.specialization,
  d.name as department
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
LEFT JOIN hospital_staff hs ON hs.id = pv.attending_doctor_id
LEFT JOIN departments d ON d.id = pv.current_department_id
WHERE p.email = 'itsivali@gmail.com'
ORDER BY pv.check_in_time DESC;

-- Check 6: Prescriptions
SELECT
  'Prescriptions' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ FOUND'
    ELSE '❌ NOT FOUND - Run patient-willis-ivali-seed.sql'
  END as status
FROM prescriptions pr
JOIN patients p ON p.id = pr.patient_id
WHERE p.email = 'itsivali@gmail.com';

-- Check 7: Detailed Prescription Information
SELECT
  pr.prescription_number,
  pr.status,
  pr.refills_allowed,
  pr.valid_until,
  COUNT(pi.id) as medication_count,
  hs.first_name || ' ' || hs.last_name as prescribed_by
FROM prescriptions pr
JOIN patients p ON p.id = pr.patient_id
LEFT JOIN prescription_items pi ON pi.prescription_id = pr.id
LEFT JOIN hospital_staff hs ON hs.id = pr.doctor_id
WHERE p.email = 'itsivali@gmail.com'
GROUP BY pr.id, pr.prescription_number, pr.status, pr.refills_allowed, pr.valid_until, hs.first_name, hs.last_name
ORDER BY pr.created_at DESC;

-- Check 8: Lab Orders
SELECT
  'Lab Orders' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ FOUND'
    ELSE '❌ NOT FOUND - Run patient-willis-ivali-seed.sql'
  END as status
FROM lab_orders lo
JOIN patients p ON p.id = lo.patient_id
WHERE p.email = 'itsivali@gmail.com';

-- Check 9: Medical Records
SELECT
  'Medical Records' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ FOUND'
    ELSE '❌ NOT FOUND - Run patient-willis-ivali-seed.sql'
  END as status
FROM medical_records mr
JOIN patients p ON p.id = mr.patient_id
WHERE p.email = 'itsivali@gmail.com';

-- Check 10: Appointments
SELECT
  'Appointments' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ FOUND'
    ELSE '❌ NOT FOUND - Run patient-willis-ivali-seed.sql'
  END as status
FROM appointments a
JOIN patients p ON p.id = a.patient_id
WHERE p.email = 'itsivali@gmail.com';

-- Check 11: Care Team (Attending Doctors)
SELECT
  'Care Team Doctors' as check_type,
  COUNT(DISTINCT pv.attending_doctor_id) as unique_doctor_count,
  CASE
    WHEN COUNT(DISTINCT pv.attending_doctor_id) > 0 THEN '✅ FOUND'
    ELSE '❌ NOT FOUND - No doctors assigned to visits'
  END as status
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.email = 'itsivali@gmail.com'
  AND pv.attending_doctor_id IS NOT NULL;

-- Check 12: List All Assigned Doctors
SELECT DISTINCT
  hs.id,
  hs.first_name,
  hs.last_name,
  hs.first_name || ' ' || hs.last_name as doctor_name,
  hs.specialization,
  hs.email as doctor_email,
  d.name as department
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
JOIN hospital_staff hs ON hs.id = pv.attending_doctor_id
LEFT JOIN departments d ON d.id = hs.department_id
WHERE p.email = 'itsivali@gmail.com'
ORDER BY hs.first_name, hs.last_name;

-- Summary Report
SELECT
  '==================== WILLIS IVALI DATA SUMMARY ====================' as summary;

SELECT
  (SELECT COUNT(*) FROM auth.users WHERE email = 'itsivali@gmail.com') as auth_user_exists,
  (SELECT COUNT(*) FROM patients WHERE email = 'itsivali@gmail.com') as patient_record_exists,
  (SELECT COUNT(*) FROM patient_visits pv JOIN patients p ON p.id = pv.patient_id WHERE p.email = 'itsivali@gmail.com') as total_visits,
  (SELECT COUNT(*) FROM patient_visits pv JOIN patients p ON p.id = pv.patient_id WHERE p.email = 'itsivali@gmail.com' AND pv.status IN ('checked_in', 'in_triage', 'in_consultation', 'in_treatment')) as active_visits,
  (SELECT COUNT(*) FROM prescriptions pr JOIN patients p ON p.id = pr.patient_id WHERE p.email = 'itsivali@gmail.com') as total_prescriptions,
  (SELECT COUNT(*) FROM prescriptions pr JOIN patients p ON p.id = pr.patient_id WHERE p.email = 'itsivali@gmail.com' AND pr.status IN ('signed', 'partially_dispensed')) as active_prescriptions,
  (SELECT COUNT(*) FROM lab_orders lo JOIN patients p ON p.id = lo.patient_id WHERE p.email = 'itsivali@gmail.com') as total_lab_orders,
  (SELECT COUNT(*) FROM medical_records mr JOIN patients p ON p.id = mr.patient_id WHERE p.email = 'itsivali@gmail.com') as total_medical_records,
  (SELECT COUNT(*) FROM appointments a JOIN patients p ON p.id = a.patient_id WHERE p.email = 'itsivali@gmail.com') as total_appointments,
  (SELECT COUNT(DISTINCT pv.attending_doctor_id) FROM patient_visits pv JOIN patients p ON p.id = pv.patient_id WHERE p.email = 'itsivali@gmail.com' AND pv.attending_doctor_id IS NOT NULL) as care_team_count;
