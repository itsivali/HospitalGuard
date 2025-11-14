-- ============================================================================
-- Auto-Assign Doctor to New Patients
-- ============================================================================
-- This script automatically assigns a general practitioner to new patients
-- when they complete registration
-- ============================================================================

-- Function to auto-assign a doctor to a new patient
CREATE OR REPLACE FUNCTION auto_assign_doctor_to_patient()
RETURNS TRIGGER AS $$
DECLARE
  selected_doctor_id UUID;
  outpatient_dept_id UUID;
BEGIN
  -- Get the Outpatient department ID
  SELECT id INTO outpatient_dept_id
  FROM departments
  WHERE name = 'Outpatient'
  LIMIT 1;

  -- Find an available general practitioner in Outpatient department
  -- Select doctor with least number of current patients for load balancing
  SELECT hs.id INTO selected_doctor_id
  FROM hospital_staff hs
  LEFT JOIN (
    SELECT attending_doctor_id, COUNT(*) as patient_count
    FROM patient_visits
    WHERE status IN ('checked_in', 'in_triage', 'in_consultation', 'in_treatment')
    GROUP BY attending_doctor_id
  ) pv ON pv.attending_doctor_id = hs.id
  WHERE hs.staff_type = 'doctor'
    AND hs.is_active = true
    AND hs.department_id = outpatient_dept_id
  ORDER BY COALESCE(pv.patient_count, 0) ASC, RANDOM()
  LIMIT 1;

  -- If we found a doctor, create an initial consultation visit
  IF selected_doctor_id IS NOT NULL THEN
    INSERT INTO patient_visits (
      patient_id,
      visit_number,
      admission_type,
      check_in_time,
      status,
      chief_complaint,
      attending_doctor_id,
      current_department_id,
      notes
    ) VALUES (
      NEW.id,
      'V-INIT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8),
      'walk_in',
      NOW(),
      'discharged', -- Mark as discharged since this is just for doctor assignment
      'Initial registration - Welcome to HospitalGuard',
      selected_doctor_id,
      outpatient_dept_id,
      'Patient registered and assigned to primary care physician. This visit establishes the patient-doctor relationship.'
    );

    -- Log the assignment
    RAISE NOTICE 'Patient % assigned to doctor %', NEW.id, selected_doctor_id;
  ELSE
    -- Log if no doctor was found
    RAISE WARNING 'No available doctors found for patient %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run after patient insert
DROP TRIGGER IF EXISTS trigger_auto_assign_doctor ON patients;

CREATE TRIGGER trigger_auto_assign_doctor
  AFTER INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_doctor_to_patient();

-- ============================================================================
-- Verification
-- ============================================================================

-- To test: Create a test patient and verify doctor assignment
/*
-- Create test patient (after auth user exists)
INSERT INTO patients (user_id, first_name, last_name, date_of_birth, gender, email, phone, national_id)
SELECT
  au.id,
  'Test',
  'Patient',
  '1990-01-01',
  'male',
  'test.patient@example.com',
  '+254-700-000-000',
  'KE-TEST-001'
FROM auth.users au
WHERE au.email = 'test.patient@example.com'
LIMIT 1;

-- Check if doctor was assigned
SELECT
  p.first_name,
  p.last_name,
  pv.visit_number,
  hs.first_name || ' ' || hs.last_name as assigned_doctor,
  d.name as department
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
JOIN hospital_staff hs ON hs.id = pv.attending_doctor_id
JOIN departments d ON d.id = pv.current_department_id
WHERE p.email = 'test.patient@example.com'
AND pv.visit_number LIKE 'V-INIT-%';
*/

COMMENT ON FUNCTION auto_assign_doctor_to_patient() IS
'Automatically assigns a general practitioner from the Outpatient department to newly registered patients. Uses load balancing to distribute patients evenly among available doctors.';

COMMENT ON TRIGGER trigger_auto_assign_doctor ON patients IS
'Triggers automatic doctor assignment when a new patient record is created.';
