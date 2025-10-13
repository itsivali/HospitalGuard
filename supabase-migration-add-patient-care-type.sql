-- ============================================
-- MIGRATION: Add Patient Care Type Classification
-- ============================================
-- This migration adds the ability to classify doctors as:
-- - outpatient: Handles outpatient consultations only
-- - inpatient: Handles admitted/hospitalized patients only
-- - both: Handles both outpatient and inpatient care

-- Add the patient_care_type column to hospital_staff table
ALTER TABLE hospital_staff
ADD COLUMN IF NOT EXISTS patient_care_type TEXT
CHECK (patient_care_type IN ('outpatient', 'inpatient', 'both'))
DEFAULT 'both';

-- Add comment to explain the column
COMMENT ON COLUMN hospital_staff.patient_care_type IS
'Specifies whether the doctor handles outpatient only, inpatient only, or both types of patients';

-- Create an index for faster queries when filtering by patient care type
CREATE INDEX IF NOT EXISTS idx_staff_patient_care_type
ON hospital_staff(patient_care_type)
WHERE staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist');

-- Update existing outpatient department doctors to be outpatient-focused
UPDATE hospital_staff
SET patient_care_type = 'outpatient'
WHERE department_id IN (
  SELECT id FROM departments WHERE name = 'Outpatient'
)
AND staff_type = 'doctor';

-- Update ICU, Emergency, and Surgery doctors to handle both
UPDATE hospital_staff
SET patient_care_type = 'both'
WHERE department_id IN (
  SELECT id FROM departments
  WHERE name IN ('Emergency', 'Intensive Care Unit (ICU)', 'Surgery', 'Maternity')
)
AND staff_type IN ('doctor', 'obstetrician');

-- Specialty doctors (Cardiology, Neurology, etc.) typically see both
UPDATE hospital_staff
SET patient_care_type = 'both'
WHERE department_id IN (
  SELECT id FROM departments
  WHERE name IN ('Cardiology', 'Neurology', 'Orthopedics', 'Oncology',
                 'Nephrology', 'Gastroenterology', 'Pulmonology',
                 'Endocrinology', 'Dermatology')
)
AND staff_type = 'doctor';

-- Pediatrics and Mental Health can see both outpatient and inpatient
UPDATE hospital_staff
SET patient_care_type = 'both'
WHERE department_id IN (
  SELECT id FROM departments WHERE name IN ('Pediatrics', 'Mental Health')
)
AND staff_type IN ('doctor', 'psychiatrist');

-- Display summary
DO $$
DECLARE
  outpatient_count INTEGER;
  inpatient_count INTEGER;
  both_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO outpatient_count
  FROM hospital_staff
  WHERE patient_care_type = 'outpatient'
  AND staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist');

  SELECT COUNT(*) INTO inpatient_count
  FROM hospital_staff
  WHERE patient_care_type = 'inpatient'
  AND staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist');

  SELECT COUNT(*) INTO both_count
  FROM hospital_staff
  WHERE patient_care_type = 'both'
  AND staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist');

  RAISE NOTICE '========================================';
  RAISE NOTICE 'PATIENT CARE TYPE MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Outpatient-only doctors: %', outpatient_count;
  RAISE NOTICE 'Inpatient-only doctors: %', inpatient_count;
  RAISE NOTICE 'Both outpatient & inpatient: %', both_count;
  RAISE NOTICE '========================================';
END $$;
