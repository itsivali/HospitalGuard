-- ============================================================================
-- HospitalGuard: Appointment Data Verification Script
-- ============================================================================
-- Run this AFTER generate-dummy-appointments.sql to verify data was created
-- ============================================================================

-- ============================================================================
-- VERIFICATION CHECKS
-- ============================================================================

DO $$
DECLARE
  total_appointments INTEGER;
  today_appointments INTEGER;
  future_appointments INTEGER;
  past_appointments INTEGER;
  willis_appointments INTEGER;
  total_patients INTEGER;
  doctors_with_appointments INTEGER;
  appointments_per_doctor DECIMAL(10,2);
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'APPOINTMENT DATA VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Check 1: Total Appointments
  SELECT COUNT(*) INTO total_appointments FROM appointments;
  RAISE NOTICE '✓ Total Appointments: %', total_appointments;

  IF total_appointments < 100 THEN
    RAISE WARNING '⚠️  Expected 120-165 appointments. Run generate-dummy-appointments.sql';
  END IF;

  -- Check 2: Today's Appointments
  SELECT COUNT(*) INTO today_appointments
  FROM appointments
  WHERE DATE(scheduled_time) = CURRENT_DATE;
  RAISE NOTICE '✓ Today''s Appointments: %', today_appointments;

  IF today_appointments = 0 THEN
    RAISE WARNING '⚠️  No appointments for today. Run generate-dummy-appointments.sql';
  END IF;

  -- Check 3: Future Appointments
  SELECT COUNT(*) INTO future_appointments
  FROM appointments
  WHERE DATE(scheduled_time) > CURRENT_DATE;
  RAISE NOTICE '✓ Future Appointments: %', future_appointments;

  -- Check 4: Past Appointments
  SELECT COUNT(*) INTO past_appointments
  FROM appointments
  WHERE DATE(scheduled_time) < CURRENT_DATE;
  RAISE NOTICE '✓ Past Appointments: %', past_appointments;

  RAISE NOTICE '';
  RAISE NOTICE '----------------------------------------';

  -- Check 5: Willis Ivali Appointments
  SELECT COUNT(*) INTO willis_appointments
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  WHERE p.email = 'itsivali@gmail.com';
  RAISE NOTICE '✓ Willis Ivali Appointments: %', willis_appointments;

  IF willis_appointments = 0 THEN
    RAISE WARNING '⚠️  Willis has no appointments. Check patient-willis-ivali-seed.sql';
  END IF;

  -- Check 6: Total Patients
  SELECT COUNT(*) INTO total_patients FROM patients;
  RAISE NOTICE '✓ Total Patients in System: %', total_patients;

  -- Check 7: Doctors with Appointments
  SELECT COUNT(DISTINCT doctor_id) INTO doctors_with_appointments
  FROM appointments
  WHERE doctor_id IS NOT NULL;
  RAISE NOTICE '✓ Doctors with Appointments: %', doctors_with_appointments;

  -- Check 8: Average Appointments per Doctor
  SELECT ROUND(COUNT(*)::DECIMAL / COUNT(DISTINCT doctor_id), 2) INTO appointments_per_doctor
  FROM appointments
  WHERE doctor_id IS NOT NULL;
  RAISE NOTICE '✓ Avg Appointments per Doctor: %', appointments_per_doctor;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATA DISTRIBUTION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

END $$;

-- ============================================================================
-- DETAILED BREAKDOWN
-- ============================================================================

-- Appointments by Status
SELECT
  '📊 APPOINTMENTS BY STATUS' as report_section,
  status,
  COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- Appointments by Type
SELECT
  '📊 APPOINTMENTS BY TYPE' as report_section,
  appointment_type,
  COUNT(*) as count
FROM appointments
GROUP BY appointment_type
ORDER BY count DESC;

-- Appointments by Department
SELECT
  '📊 APPOINTMENTS BY DEPARTMENT' as report_section,
  d.name as department,
  COUNT(a.id) as appointment_count
FROM departments d
LEFT JOIN appointments a ON a.department_id = d.id
WHERE d.name IN ('Outpatient', 'Cardiology', 'Neurology', 'Dermatology',
                 'Orthopedics', 'Psychiatry', 'Pediatrics', 'Laboratory')
GROUP BY d.name
ORDER BY appointment_count DESC;

-- ============================================================================
-- DOCTOR SCHEDULE PREVIEW
-- ============================================================================

-- Show sample of today's appointments
SELECT
  '📅 SAMPLE TODAY''S APPOINTMENTS' as report_section,
  TO_CHAR(a.scheduled_time, 'HH24:MI') as time,
  p.first_name || ' ' || p.last_name as patient,
  hs.first_name || ' ' || hs.last_name as doctor,
  d.name as department,
  a.status,
  a.reason
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN hospital_staff hs ON hs.id = a.doctor_id
JOIN departments d ON d.id = a.department_id
WHERE DATE(a.scheduled_time) = CURRENT_DATE
ORDER BY a.scheduled_time
LIMIT 10;

-- ============================================================================
-- WILLIS IVALI APPOINTMENTS
-- ============================================================================

-- Show Willis's appointments
SELECT
  '👤 WILLIS IVALI APPOINTMENTS' as report_section,
  a.appointment_number,
  TO_CHAR(a.scheduled_time, 'YYYY-MM-DD HH24:MI') as scheduled_time,
  CASE
    WHEN DATE(a.scheduled_time) = CURRENT_DATE THEN 'TODAY'
    WHEN DATE(a.scheduled_time) > CURRENT_DATE THEN 'FUTURE'
    ELSE 'PAST'
  END as timeframe,
  a.status,
  a.appointment_type,
  d.name as department,
  COALESCE(hs.first_name || ' ' || hs.last_name, 'No Doctor Assigned') as doctor,
  a.reason
FROM appointments a
JOIN patients p ON p.id = a.patient_id
LEFT JOIN hospital_staff hs ON hs.id = a.doctor_id
LEFT JOIN departments d ON d.id = a.department_id
WHERE p.email = 'itsivali@gmail.com'
ORDER BY a.scheduled_time;

-- ============================================================================
-- PATIENT COVERAGE
-- ============================================================================

-- Show which patients have appointments
SELECT
  '📋 PATIENT APPOINTMENT COVERAGE' as report_section,
  p.first_name || ' ' || p.last_name as patient_name,
  p.email,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN DATE(a.scheduled_time) = CURRENT_DATE THEN 1 END) as today,
  COUNT(CASE WHEN DATE(a.scheduled_time) > CURRENT_DATE THEN 1 END) as future,
  COUNT(CASE WHEN DATE(a.scheduled_time) < CURRENT_DATE THEN 1 END) as past
FROM patients p
LEFT JOIN appointments a ON a.patient_id = p.id
GROUP BY p.id, p.first_name, p.last_name, p.email
ORDER BY total_appointments DESC;

-- ============================================================================
-- DOCTOR WORKLOAD
-- ============================================================================

-- Show doctor appointment distribution
SELECT
  '👨‍⚕️ DOCTOR APPOINTMENT WORKLOAD' as report_section,
  hs.first_name || ' ' || hs.last_name as doctor_name,
  d.name as department,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN DATE(a.scheduled_time) = CURRENT_DATE THEN 1 END) as today,
  COUNT(CASE WHEN DATE(a.scheduled_time) > CURRENT_DATE THEN 1 END) as future
FROM hospital_staff hs
JOIN departments d ON d.id = hs.department_id
LEFT JOIN appointments a ON a.doctor_id = hs.id
WHERE hs.staff_type = 'doctor' AND hs.is_active = true
GROUP BY hs.id, hs.first_name, hs.last_name, d.name
HAVING COUNT(a.id) > 0
ORDER BY total_appointments DESC
LIMIT 15;

-- ============================================================================
-- FINAL STATUS
-- ============================================================================

DO $$
DECLARE
  total_appointments INTEGER;
  today_appointments INTEGER;
  willis_appointments INTEGER;
  status_message TEXT;
BEGIN
  SELECT COUNT(*) INTO total_appointments FROM appointments;
  SELECT COUNT(*) INTO today_appointments FROM appointments WHERE DATE(scheduled_time) = CURRENT_DATE;
  SELECT COUNT(*) INTO willis_appointments FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE p.email = 'itsivali@gmail.com';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Overall Status
  IF total_appointments >= 100 AND today_appointments > 0 AND willis_appointments >= 3 THEN
    status_message := '✅ PASS - All checks successful!';
  ELSIF total_appointments >= 100 AND today_appointments > 0 THEN
    status_message := '⚠️  PARTIAL - System functional but Willis needs appointments';
  ELSIF total_appointments > 0 THEN
    status_message := '⚠️  PARTIAL - Appointments exist but today''s schedule is empty';
  ELSE
    status_message := '❌ FAIL - No appointments found. Run generate-dummy-appointments.sql';
  END IF;

  RAISE NOTICE 'Status: %', status_message;
  RAISE NOTICE '';

  -- What to Do Next
  IF total_appointments >= 100 AND today_appointments > 0 AND willis_appointments >= 3 THEN
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Login as Willis Ivali (itsivali@gmail.com)';
    RAISE NOTICE '2. Check Patient Dashboard - Should show % appointments', willis_appointments;
    RAISE NOTICE '3. Login as any doctor';
    RAISE NOTICE '4. Check Doctor Dashboard - Should show % today''s appointments', today_appointments;
    RAISE NOTICE '5. Search for "Willis" in All Patients - Should find Willis Ivali';
  ELSE
    RAISE NOTICE 'ACTION REQUIRED:';
    IF total_appointments < 100 THEN
      RAISE NOTICE '• Run: generate-dummy-appointments.sql';
    END IF;
    IF willis_appointments < 3 THEN
      RAISE NOTICE '• Verify Willis exists: SELECT * FROM patients WHERE email = ''itsivali@gmail.com''';
      RAISE NOTICE '• Run: patient-willis-ivali-seed.sql if Willis not found';
    END IF;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';

END $$;
