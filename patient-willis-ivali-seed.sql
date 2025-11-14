-- ============================================================================
-- HospitalGuard: Patient Data for Willis Ivali
-- ============================================================================
-- Comprehensive patient profile for Willis Ivali (itsivali@gmail.com)
-- ============================================================================

-- ============================================================================
-- PATIENT RECORD (Linked to existing auth user)
-- ============================================================================

-- Link patient to existing authenticated user
INSERT INTO patients (user_id, first_name, last_name, date_of_birth, gender, blood_type, allergies, emergency_contact_name, emergency_contact_phone, address, phone, email, insurance_provider, insurance_policy_number, national_id)
SELECT
  au.id,
  'Willis',
  'Ivali',
  '1988-07-05',
  'male',
  'A+',
  ARRAY['Sulfa drugs'],
  'Mrs Ivali',
  '+254-705-369-005',
  'Nairobi CBD, Nairobi',
  '+254-712-111-100',
  'itsivali@gmail.com',
  'Britam Insurance',
  'BRI-2024-100',
  'KE-12345100'
FROM auth.users au
WHERE au.email = 'itsivali@gmail.com'
ON CONFLICT (national_id) DO UPDATE SET
  user_id = (SELECT id FROM auth.users WHERE email = 'itsivali@gmail.com'),
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone;


INSERT INTO user_roles (user_id, role)
SELECT id, 'patient'
FROM auth.users
WHERE email = 'itsivali@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- PATIENT VISITS
-- ============================================================================

-- Current Active Visit - Outpatient (Tech-related health issues)
INSERT INTO patient_visits (patient_id, visit_number, admission_type, check_in_time, status, chief_complaint, vital_signs, attending_doctor_id, current_department_id, notes)
SELECT
  p.id,
  'V-OP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-WILLIS',
  'appointment',
  NOW() - INTERVAL '45 minutes',
  'in_consultation',
  'Eye strain, neck pain, and headaches from prolonged computer use',
  '{"temperature": 36.7, "blood_pressure": "128/82", "heart_rate": 74, "respiratory_rate": 16, "oxygen_saturation": 99, "weight": 78.5}'::jsonb,
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient'),
  'Patient reports spending 10-12 hours daily on computer for software development work. Experiencing digital eye strain, cervical neck pain, and tension headaches. Sleep quality poor. Mild stress and anxiety related to work deadlines.'
FROM patients p WHERE p.email = 'itsivali@gmail.com'
ON CONFLICT (visit_number) DO NOTHING;

-- Past Visit - Routine Checkup (3 months ago)
INSERT INTO patient_visits (patient_id, visit_number, admission_type, check_in_time, check_out_time, status, chief_complaint, vital_signs, attending_doctor_id, current_department_id, discharge_summary, follow_up_required)
SELECT
  p.id,
  'V-OP-' || TO_CHAR(NOW() - INTERVAL '90 days', 'YYYYMMDD') || '-WILLIS1',
  'walk_in',
  NOW() - INTERVAL '90 days 2 hours',
  NOW() - INTERVAL '90 days 1 hour',
  'discharged',
  'Annual health checkup and vitamin D screening',
  '{"temperature": 36.8, "blood_pressure": "122/78", "heart_rate": 72, "respiratory_rate": 16, "oxygen_saturation": 99, "weight": 76.2}'::jsonb,
  (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient'),
  'General health good. Vitamin D levels low (18 ng/mL). Recommended supplementation and increased sun exposure. Advised on ergonomic workspace setup for computer work. Follow-up in 3 months.',
  true
FROM patients p WHERE p.email = 'itsivali@gmail.com'
ON CONFLICT (visit_number) DO NOTHING;

-- ============================================================================
-- UPCOMING APPOINTMENTS
-- ============================================================================

-- Follow-up appointment for eye strain
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '7 days', 'YYYYMMDD') || '-WILLIS1',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient'),
  'follow_up',
  NOW() + INTERVAL '7 days 10 hours',
  'scheduled',
  'Follow-up for eye strain and ergonomic assessment review'
FROM patients p WHERE p.email = 'itsivali@gmail.com'
ON CONFLICT (appointment_number) DO NOTHING;

-- Lab appointment for vitamin D recheck
INSERT INTO appointments (appointment_number, patient_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '14 days', 'YYYYMMDD') || '-WILLIS2',
  p.id,
  (SELECT id FROM departments WHERE name = 'Laboratory'),
  'lab',
  NOW() + INTERVAL '14 days 8 hours',
  'scheduled',
  'Vitamin D level recheck after 3 months supplementation'
FROM patients p WHERE p.email = 'itsivali@gmail.com'
ON CONFLICT (appointment_number) DO NOTHING;

-- Preventive cardiology screening
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '21 days', 'YYYYMMDD') || '-WILLIS3',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Cardiology'),
  'consultation',
  NOW() + INTERVAL '21 days 14 hours',
  'scheduled',
  'Preventive cardiology screening - family history of heart disease'
FROM patients p WHERE p.email = 'itsivali@gmail.com'
ON CONFLICT (appointment_number) DO NOTHING;

-- ============================================================================
-- PRESCRIPTIONS
-- ============================================================================

-- Current prescription for eye strain and headaches
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, visit_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until, notes)
  SELECT
    'RX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-WILLIS1',
    p.id,
    pv.id,
    (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
    'signed',
    'QR-RX-' || TO_CHAR(NOW(), 'YYYYMMDDHHMI') || '-WILLIS1',
    'DR-TAYLOR-DIGITAL-SIG-' || TO_CHAR(NOW(), 'YYYYMMDD'),
    NOW(),
    2,
    NOW() + INTERVAL '90 days',
    'For digital eye strain and tension headaches. Use blue light blocking glasses. Take regular screen breaks (20-20-20 rule).'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'itsivali@gmail.com'
    AND pv.visit_number LIKE 'V-OP-%WILLIS'
  LIMIT 1
  ON CONFLICT (prescription_number) DO NOTHING
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions)
SELECT id, 'Ibuprofen 400mg', '400mg', 'As needed for headache', '30 days', 30, 'Take with food. Do not exceed 3 tablets per day. For tension headaches.'
FROM new_prescription
UNION ALL
SELECT id, 'Vitamin D3 2000IU', '2000 IU', 'Once daily', '90 days', 90, 'Take with a meal for better absorption. Important for bone health and immune function.'
FROM new_prescription
UNION ALL
SELECT id, 'Acetylcysteine 200mg', '200mg', 'Twice daily', '30 days', 60, 'Antioxidant for eye health. Take with water. Supports visual function.'
FROM new_prescription
ON CONFLICT DO NOTHING;

-- Previous prescription - Vitamin D (3 months ago)
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, visit_id, doctor_id, status, qr_code_data, digital_signature, signed_at, valid_until)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '90 days', 'YYYYMMDD') || '-WILLIS2',
    p.id,
    pv.id,
    (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
    'dispensed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '90 days', 'YYYYMMDDHHMI') || '-WILLIS2',
    'DR-MOORE-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '90 days', 'YYYYMMDD'),
    NOW() - INTERVAL '90 days',
    NOW() + INTERVAL '0 days'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'itsivali@gmail.com'
    AND pv.visit_number LIKE 'V-OP-%WILLIS1'
  LIMIT 1
  ON CONFLICT (prescription_number) DO NOTHING
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, dispensed_quantity, instructions)
SELECT id, 'Vitamin D3 2000IU', '2000 IU', 'Once daily', '90 days', 90, 90, 'Take daily with food. Recheck levels in 3 months.'
FROM new_prescription
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LAB ORDERS
-- ============================================================================

-- Current lab order - Comprehensive health panel
INSERT INTO lab_orders (order_number, patient_id, visit_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-WILLIS1',
  p.id,
  pv.id,
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  'Complete Blood Count (CBC) and Metabolic Panel',
  'routine',
  'completed',
  true,
  NOW() - INTERVAL '30 minutes',
  '{"wbc": 7.8, "rbc": 5.1, "hemoglobin": 14.8, "hematocrit": 44.2, "platelets": 245, "glucose": 92, "creatinine": 0.95, "bun": 14, "alt": 32, "ast": 28, "total_cholesterol": 195, "ldl": 115, "hdl": 58, "triglycerides": 110, "interpretation": "All values within normal limits. Excellent overall health markers. Lipid panel shows good cardiovascular health. Continue healthy lifestyle.", "reference_ranges": {"hemoglobin": "13.5-17.5 g/dL", "glucose": "70-100 mg/dL", "total_cholesterol": "<200 mg/dL", "ldl": "<100 mg/dL (optimal)", "hdl": ">40 mg/dL"}}'::jsonb,
  NOW() - INTERVAL '10 minutes'
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'itsivali@gmail.com'
  AND pv.visit_number LIKE 'V-OP-%WILLIS'
LIMIT 1
ON CONFLICT (order_number) DO NOTHING;

-- Previous lab - Vitamin D level (3 months ago)
INSERT INTO lab_orders (order_number, patient_id, visit_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '90 days', 'YYYYMMDD') || '-WILLIS2',
  p.id,
  pv.id,
  (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
  'Vitamin D Level (25-OH Vitamin D)',
  'routine',
  'completed',
  true,
  NOW() - INTERVAL '90 days 1 hour',
  '{"vitamin_d": 18, "interpretation": "Vitamin D deficiency detected (18 ng/mL). Supplementation strongly recommended. Common in individuals with indoor work. Target level: 40-80 ng/mL. Recheck in 3 months.", "reference_ranges": {"vitamin_d": "30-100 ng/mL (sufficient), 20-29 (insufficient), <20 (deficient)"}}'::jsonb,
  NOW() - INTERVAL '89 days 23 hours'
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'itsivali@gmail.com'
  AND pv.visit_number LIKE 'V-OP-%WILLIS1'
LIMIT 1
ON CONFLICT (order_number) DO NOTHING;

-- Upcoming lab - Vitamin D recheck
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected)
SELECT
  'LAB-' || TO_CHAR(NOW() + INTERVAL '14 days', 'YYYYMMDD') || '-WILLIS3',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  'Vitamin D Level (25-OH Vitamin D) - Follow-up',
  'routine',
  'pending',
  false
FROM patients p WHERE p.email = 'itsivali@gmail.com'
ON CONFLICT (order_number) DO NOTHING;

-- ============================================================================
-- RADIOLOGY ORDERS
-- ============================================================================

-- Cervical spine X-ray for neck pain
INSERT INTO radiology_orders (order_number, patient_id, visit_id, ordered_by, imaging_type, body_part, urgency, status, scheduled_time, completed_at, findings, radiologist_id)
SELECT
  'RAD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-WILLIS1',
  p.id,
  pv.id,
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  'x_ray',
  'Cervical Spine',
  'routine',
  'completed',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour',
  'Cervical spine X-ray (AP and lateral views): Normal cervical lordosis. No fractures or dislocations. Disc spaces preserved. Mild straightening of cervical spine suggesting muscle spasm/poor posture. No degenerative changes. Impression: Postural abnormality consistent with prolonged desk work. Recommend physical therapy and ergonomic assessment.',
  (SELECT id FROM hospital_staff WHERE email = 'ryan.rivera@hospitalguard.com')
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'itsivali@gmail.com'
  AND pv.visit_number LIKE 'V-OP-%WILLIS'
LIMIT 1
ON CONFLICT (order_number) DO NOTHING;

-- ============================================================================
-- MEDICAL RECORDS
-- ============================================================================

-- Current consultation note
INSERT INTO medical_records (patient_id, visit_id, record_type, title, description, doctor_id, department_id)
SELECT
  p.id,
  pv.id,
  'consultation',
  'Occupational Health Assessment - Tech Worker Syndrome',
  'CHIEF COMPLAINT: Eye strain, neck pain, and headaches from prolonged computer use

HISTORY OF PRESENT ILLNESS:
29-year-old male software developer presenting with complaints of digital eye strain, cervical neck pain, and tension headaches. Patient reports working 10-12 hours daily on computer. Symptoms worse in evenings. Sleep quality poor (5-6 hours nightly). Denies visual changes, numbness, or weakness. Moderate work-related stress.

PHYSICAL EXAMINATION:
- Vitals: BP 128/82, HR 74, Temp 36.7°C, SpO2 99%
- Eyes: Mild conjunctival injection bilaterally. No discharge. PERRLA. EOM intact.
- Neck: Tenderness over cervical paraspinal muscles. Reduced ROM with lateral flexion. No lymphadenopathy.
- Neurological: Cranial nerves II-XII intact. No focal deficits.

ASSESSMENT:
1. Digital Eye Strain (Computer Vision Syndrome)
2. Cervical Strain (Tech Neck)
3. Tension-Type Headaches
4. Vitamin D Deficiency (previous diagnosis, on supplementation)
5. Work-related stress

DIAGNOSTIC STUDIES:
- CBC and Metabolic Panel: Normal
- Cervical Spine X-ray: Postural abnormality, no acute pathology

TREATMENT PLAN:
1. Medications: Ibuprofen PRN for headaches, continue Vitamin D3, NAC for antioxidant support
2. Ergonomic assessment and workspace optimization
3. Blue light blocking glasses for computer work
4. 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds
5. Physical therapy referral for neck exercises and posture correction
6. Sleep hygiene counseling - target 7-8 hours
7. Stress management techniques (meditation, regular breaks)
8. Follow-up in 1 week to assess response to treatment

PATIENT EDUCATION:
Counseled on importance of ergonomic workspace, regular screen breaks, proper monitor positioning (eye level, 20-28 inches away), adequate lighting, and maintaining good posture. Discussed risks of prolonged sedentary behavior. Recommended standing desk or regular movement breaks every hour.

DISPOSITION: Discharged home in stable condition with prescriptions and follow-up arranged.',
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient')
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'itsivali@gmail.com'
  AND pv.visit_number LIKE 'V-OP-%WILLIS'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Previous checkup record
INSERT INTO medical_records (patient_id, visit_id, record_type, title, description, doctor_id, department_id, created_at)
SELECT
  p.id,
  pv.id,
  'consultation',
  'Annual Health Checkup - Young Professional',
  'Patient presented for annual health screening. No major health concerns. Works as software developer with sedentary lifestyle. Reports low energy levels. Examination unremarkable. Labs ordered showed Vitamin D deficiency (18 ng/mL). Counseled on importance of sun exposure, outdoor activities, and supplementation. General health excellent. Advised on preventive care, regular exercise, and work-life balance. BMI: 23.8 (normal). Encouraged to maintain healthy lifestyle habits.',
  (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient'),
  NOW() - INTERVAL '90 days'
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'itsivali@gmail.com'
  AND pv.visit_number LIKE 'V-OP-%WILLIS1'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DIAGNOSES
-- ============================================================================

-- Current diagnoses
INSERT INTO diagnoses (visit_id, icd_code, diagnosis_name, diagnosis_type, notes, diagnosed_by)
SELECT
  pv.id,
  'H53.14',
  'Computer Vision Syndrome (Digital Eye Strain)',
  'primary',
  'Chronic eye strain from prolonged computer use. Recommend blue light filtering and regular breaks.',
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com')
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.email = 'itsivali@gmail.com'
  AND pv.visit_number LIKE 'V-OP-%WILLIS'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO diagnoses (visit_id, icd_code, diagnosis_name, diagnosis_type, notes, diagnosed_by)
SELECT
  pv.id,
  'M54.2',
  'Cervicalgia (Neck Pain)',
  'secondary',
  'Postural neck pain from prolonged desk work. Physical therapy and ergonomic modifications recommended.',
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com')
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.email = 'itsivali@gmail.com'
  AND pv.visit_number LIKE 'V-OP-%WILLIS'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO diagnoses (visit_id, icd_code, diagnosis_name, diagnosis_type, notes, diagnosed_by)
SELECT
  pv.id,
  'G44.209',
  'Tension-Type Headache',
  'secondary',
  'Related to muscle tension from poor posture and eye strain. Respond well to NSAIDs and lifestyle modifications.',
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com')
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.email = 'itsivali@gmail.com'
  AND pv.visit_number LIKE 'V-OP-%WILLIS'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BILLING & PAYMENTS
-- ============================================================================

-- Current visit bill (Partially paid - insurance pending)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, visit_id, total_amount, amount_paid, amount_due, insurance_covered, status, due_date, notes)
  SELECT
    'BILL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-WILLIS1',
    p.id,
    pv.id,
    18500.00,
    5550.00,
    12950.00,
    12950.00,
    'insurance_pending',
    NOW() + INTERVAL '30 days',
    'Comprehensive health assessment with imaging and lab work. Insurance pre-authorized. 70% coverage expected.'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'itsivali@gmail.com'
    AND pv.visit_number LIKE 'V-OP-%WILLIS'
  LIMIT 1
  ON CONFLICT (bill_number) DO NOTHING
  RETURNING id
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'consultation',
  'Outpatient Medical Consultation',
  1,
  5000.00,
  5000.00,
  (SELECT id FROM departments WHERE name = 'Outpatient')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'radiology',
  'Cervical Spine X-ray (2 views)',
  1,
  6000.00,
  6000.00,
  (SELECT id FROM departments WHERE name = 'Radiology')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Complete Blood Count',
  1,
  2500.00,
  2500.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Comprehensive Metabolic Panel',
  1,
  3500.00,
  3500.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'medication',
  'Prescription Medications',
  1,
  1500.00,
  1500.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb
ON CONFLICT DO NOTHING;

-- Payment - Initial co-payment
INSERT INTO payments (payment_number, bill_id, amount, payment_method, payment_reference, payment_status, received_by, notes)
SELECT
  'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-WILLIS1',
  b.id,
  5550.00,
  'mobile_money',
  'MPESA-' || TO_CHAR(NOW(), 'YYYYMMDDHHMI') || '-WILLIS',
  'completed',
  (SELECT id FROM hospital_staff WHERE email = 'olivia.ross@hospitalguard.com'),
  'Patient co-payment (30%). Insurance claim submitted for remaining 70%.'
FROM bills b
JOIN patients p ON p.id = b.patient_id
WHERE p.email = 'itsivali@gmail.com'
  AND b.bill_number LIKE 'BILL-%WILLIS1'
LIMIT 1
ON CONFLICT (payment_number) DO NOTHING;

-- Previous visit bill (Fully paid)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, visit_id, total_amount, amount_paid, amount_due, insurance_covered, status, due_date, created_at)
  SELECT
    'BILL-' || TO_CHAR(NOW() - INTERVAL '90 days', 'YYYYMMDD') || '-WILLIS2',
    p.id,
    pv.id,
    8000.00,
    8000.00,
    0.00,
    5600.00,
    'paid',
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'itsivali@gmail.com'
    AND pv.visit_number LIKE 'V-OP-%WILLIS1'
  LIMIT 1
  ON CONFLICT (bill_number) DO NOTHING
  RETURNING id
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'consultation',
  'Annual Health Checkup',
  1,
  4500.00,
  4500.00,
  (SELECT id FROM departments WHERE name = 'Outpatient')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Vitamin D Level Test',
  1,
  2500.00,
  2500.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'medication',
  'Vitamin D Supplement',
  1,
  1000.00,
  1000.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb
ON CONFLICT DO NOTHING;

-- Payment for previous visit
INSERT INTO payments (payment_number, bill_id, amount, payment_method, payment_reference, payment_status, received_by, created_at)
SELECT
  'PAY-' || TO_CHAR(NOW() - INTERVAL '90 days', 'YYYYMMDD') || '-WILLIS2',
  b.id,
  2400.00,
  'card',
  'CARD-' || TO_CHAR(NOW() - INTERVAL '90 days', 'YYYYMMDDHHMI'),
  'completed',
  (SELECT id FROM hospital_staff WHERE email = 'nathan.henderson@hospitalguard.com'),
  NOW() - INTERVAL '90 days'
FROM bills b
JOIN patients p ON p.id = b.patient_id
WHERE p.email = 'itsivali@gmail.com'
  AND b.bill_number LIKE 'BILL-%WILLIS2'
LIMIT 1
ON CONFLICT (payment_number) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
  patient_name TEXT;
  visit_count INTEGER;
  appointment_count INTEGER;
  prescription_count INTEGER;
  lab_count INTEGER;
  bill_total DECIMAL(12,2);
BEGIN
  SELECT first_name || ' ' || last_name INTO patient_name
  FROM patients WHERE email = 'itsivali@gmail.com';

  SELECT COUNT(*) INTO visit_count
  FROM patient_visits pv
  JOIN patients p ON p.id = pv.patient_id
  WHERE p.email = 'itsivali@gmail.com';

  SELECT COUNT(*) INTO appointment_count
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  WHERE p.email = 'itsivali@gmail.com';

  SELECT COUNT(*) INTO prescription_count
  FROM prescriptions pr
  JOIN patients p ON p.id = pr.patient_id
  WHERE p.email = 'itsivali@gmail.com';

  SELECT COUNT(*) INTO lab_count
  FROM lab_orders lo
  JOIN patients p ON p.id = lo.patient_id
  WHERE p.email = 'itsivali@gmail.com';

  SELECT COALESCE(SUM(total_amount), 0) INTO bill_total
  FROM bills b
  JOIN patients p ON p.id = b.patient_id
  WHERE p.email = 'itsivali@gmail.com';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Patient Profile: %', patient_name;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Email: itsivali@gmail.com';
  RAISE NOTICE 'Patient Visits: %', visit_count;
  RAISE NOTICE 'Appointments: %', appointment_count;
  RAISE NOTICE 'Prescriptions: %', prescription_count;
  RAISE NOTICE 'Lab Orders: %', lab_count;
  RAISE NOTICE 'Total Billed: KES %', bill_total;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CURRENT STATUS:';
  RAISE NOTICE '- Active consultation for digital eye strain';
  RAISE NOTICE '- Upcoming appointments: 3 scheduled';
  RAISE NOTICE '- Active prescription: Eye care & supplements';
  RAISE NOTICE '- Insurance pending: KES 12,950';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Willis Ivali profile created successfully!';
  RAISE NOTICE '========================================';
END $$;
