-- ============================================================================
-- HospitalGuard: Patient Seed Data
-- ============================================================================
-- Comprehensive dummy patient data for testing and demonstration
-- Version: 1.0
-- Last Updated: 2025
-- ============================================================================
-- IMPORTANT: Run hospital-database.sql and hospital-seed.sql first!
-- ============================================================================

-- ============================================================================
-- PATIENTS (15 diverse patients)
-- ============================================================================

INSERT INTO patients (first_name, last_name, date_of_birth, gender, blood_type, allergies, emergency_contact_name, emergency_contact_phone, address, phone, email, insurance_provider, insurance_policy_number, national_id) VALUES
('John', 'Kamau', '1985-03-15', 'male', 'O+', ARRAY['Penicillin'], 'Mary Kamau', '+254-712-345-001', 'Westlands, Nairobi', '+254-712-111-001', 'john.kamau@email.com', 'AAR Insurance', 'AAR-2024-001', 'KE-12345001'),
('Sarah', 'Wanjiku', '1990-07-22', 'female', 'A+', ARRAY[]::TEXT[], 'Peter Wanjiku', '+254-712-345-002', 'Kilimani, Nairobi', '+254-712-111-002', 'sarah.wanjiku@email.com', 'Madison Insurance', 'MAD-2024-002', 'KE-12345002'),
('David', 'Omondi', '1978-11-08', 'male', 'B+', ARRAY['Latex', 'Sulfa drugs'], 'Grace Omondi', '+254-712-345-003', 'Lavington, Nairobi', '+254-712-111-003', 'david.omondi@email.com', 'Jubilee Insurance', 'JUB-2024-003', 'KE-12345003'),
('Mary', 'Akinyi', '1995-02-14', 'female', 'AB+', ARRAY['Aspirin'], 'Joseph Akinyi', '+254-712-345-004', 'Karen, Nairobi', '+254-712-111-004', 'mary.akinyi@email.com', 'CIC Insurance', 'CIC-2024-004', 'KE-12345004'),
('James', 'Mwangi', '1982-09-30', 'male', 'O-', ARRAY[]::TEXT[], 'Jane Mwangi', '+254-712-345-005', 'Parklands, Nairobi', '+254-712-111-005', 'james.mwangi@email.com', 'Britam Insurance', 'BRI-2024-005', 'KE-12345005'),
('Grace', 'Njeri', '1988-05-17', 'female', 'A-', ARRAY['Shellfish'], 'Daniel Njeri', '+254-712-345-006', 'Runda, Nairobi', '+254-712-111-006', 'grace.njeri@email.com', 'AAR Insurance', 'AAR-2024-006', 'KE-12345006'),
('Peter', 'Otieno', '2010-12-25', 'male', 'B+', ARRAY[]::TEXT[], 'Ann Otieno', '+254-712-345-007', 'Muthaiga, Nairobi', '+254-712-111-007', 'ann.otieno@email.com', 'Madison Insurance', 'MAD-2024-007', 'KE-12345007'),
('Lucy', 'Wambui', '1993-08-03', 'female', 'O+', ARRAY['Codeine'], 'Martin Wambui', '+254-712-345-008', 'Spring Valley, Nairobi', '+254-712-111-008', 'lucy.wambui@email.com', 'Resolution Insurance', 'RES-2024-008', 'KE-12345008'),
('Michael', 'Kimani', '1970-01-20', 'male', 'A+', ARRAY['Iodine'], 'Susan Kimani', '+254-712-345-009', 'Lower Kabete, Nairobi', '+254-712-111-009', 'michael.kimani@email.com', 'Jubilee Insurance', 'JUB-2024-009', 'KE-12345009'),
('Elizabeth', 'Chebet', '1998-04-11', 'female', 'AB-', ARRAY[]::TEXT[], 'John Chebet', '+254-712-345-010', 'Loresho, Nairobi', '+254-712-111-010', 'elizabeth.chebet@email.com', 'CIC Insurance', 'CIC-2024-010', 'KE-12345010'),
('Robert', 'Muriithi', '1965-10-05', 'male', 'O+', ARRAY['Penicillin', 'Peanuts'], 'Betty Muriithi', '+254-712-345-011', 'Kileleshwa, Nairobi', '+254-712-111-011', 'robert.muriithi@email.com', 'Britam Insurance', 'BRI-2024-011', 'KE-12345011'),
('Nancy', 'Wairimu', '1992-06-28', 'female', 'B-', ARRAY['Latex'], 'Paul Wairimu', '+254-712-345-012', 'Ridgeways, Nairobi', '+254-712-111-012', 'nancy.wairimu@email.com', 'AAR Insurance', 'AAR-2024-012', 'KE-12345012'),
('Thomas', 'Odhiambo', '2015-03-09', 'male', 'A+', ARRAY[]::TEXT[], 'Alice Odhiambo', '+254-712-345-013', 'Gigiri, Nairobi', '+254-712-111-013', 'alice.odhiambo@email.com', 'Madison Insurance', 'MAD-2024-013', 'KE-12345013'),
('Catherine', 'Muthoni', '1987-11-19', 'female', 'O-', ARRAY['Sulfa drugs'], 'George Muthoni', '+254-712-345-014', 'Runda Estate, Nairobi', '+254-712-111-014', 'catherine.muthoni@email.com', 'Resolution Insurance', 'RES-2024-014', 'KE-12345014'),
('Anthony', 'Wekesa', '1975-07-07', 'male', 'AB+', ARRAY['Aspirin', 'NSAIDs'], 'Helen Wekesa', '+254-712-345-015', 'Riverside, Nairobi', '+254-712-111-015', 'anthony.wekesa@email.com', 'Jubilee Insurance', 'JUB-2024-015', 'KE-12345015')
ON CONFLICT (national_id) DO NOTHING;

-- ============================================================================
-- PATIENT VISITS (Various scenarios: active, discharged, follow-ups)
-- ============================================================================

-- Active Emergency Visit - John Kamau (Chest Pain)
INSERT INTO patient_visits (patient_id, visit_number, admission_type, check_in_time, status, chief_complaint, vital_signs, attending_doctor_id, current_department_id, triage_level, notes)
SELECT
  p.id,
  'V-ER-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
  'emergency',
  NOW() - INTERVAL '2 hours',
  'in_treatment',
  'Chest pain and shortness of breath',
  '{"temperature": 37.2, "blood_pressure": "145/95", "heart_rate": 98, "respiratory_rate": 22, "oxygen_saturation": 96}'::jsonb,
  (SELECT id FROM hospital_staff WHERE email = 'michael.chen@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Emergency'),
  'urgent',
  'Patient presented with acute chest pain radiating to left arm. ECG ordered.'
FROM patients p WHERE p.email = 'john.kamau@email.com';

-- Discharged Visit - Sarah Wanjiku (Routine Checkup)
INSERT INTO patient_visits (patient_id, visit_number, admission_type, check_in_time, check_out_time, status, chief_complaint, vital_signs, attending_doctor_id, current_department_id, discharge_summary, follow_up_required)
SELECT
  p.id,
  'V-OP-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-001',
  'appointment',
  NOW() - INTERVAL '3 days 8 hours',
  NOW() - INTERVAL '3 days 7 hours',
  'discharged',
  'Annual health checkup',
  '{"temperature": 36.8, "blood_pressure": "120/80", "heart_rate": 72, "respiratory_rate": 16, "oxygen_saturation": 99}'::jsonb,
  (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient'),
  'Patient in good health. All vital signs normal. Lab results within normal limits. Continue current medications. Follow up in 6 months.',
  true
FROM patients p WHERE p.email = 'sarah.wanjiku@email.com';

-- Active ICU Visit - David Omondi (Post-Surgery)
INSERT INTO patient_visits (patient_id, visit_number, admission_type, check_in_time, status, chief_complaint, vital_signs, attending_doctor_id, current_department_id, room_number, bed_number, notes)
SELECT
  p.id,
  'V-ICU-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-001',
  'transfer',
  NOW() - INTERVAL '1 day',
  'admitted',
  'Post-operative monitoring after cardiac surgery',
  '{"temperature": 37.0, "blood_pressure": "130/85", "heart_rate": 78, "respiratory_rate": 18, "oxygen_saturation": 97}'::jsonb,
  (SELECT id FROM hospital_staff WHERE email = 'david.anderson@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Intensive Care Unit (ICU)'),
  '301',
  'A',
  'Post-CABG day 1. Patient stable on ventilator support. Hemodynamics stable.'
FROM patients p WHERE p.email = 'david.omondi@email.com';

-- Maternity Visit - Mary Akinyi (Prenatal)
INSERT INTO patient_visits (patient_id, visit_number, admission_type, check_in_time, status, chief_complaint, vital_signs, attending_doctor_id, current_department_id, notes)
SELECT
  p.id,
  'V-MAT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
  'appointment',
  NOW() - INTERVAL '30 minutes',
  'in_consultation',
  'Regular prenatal checkup - 28 weeks',
  '{"temperature": 36.9, "blood_pressure": "118/75", "heart_rate": 82, "respiratory_rate": 18, "oxygen_saturation": 99, "weight": 72.5}'::jsonb,
  (SELECT id FROM hospital_staff WHERE email = 'catherine.king@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Maternity'),
  'Third trimester checkup. Fetal heart rate normal. Patient reports feeling well.'
FROM patients p WHERE p.email = 'mary.akinyi@email.com';

-- Mental Health Visit - James Mwangi
INSERT INTO patient_visits (patient_id, visit_number, admission_type, check_in_time, check_out_time, status, chief_complaint, vital_signs, attending_doctor_id, current_department_id, discharge_summary, follow_up_required, telemedicine_enabled)
SELECT
  p.id,
  'V-MH-' || TO_CHAR(NOW() - INTERVAL '5 days', 'YYYYMMDD') || '-001',
  'appointment',
  NOW() - INTERVAL '5 days 2 hours',
  NOW() - INTERVAL '5 days 1 hour',
  'discharged',
  'Anxiety and sleep disturbances',
  '{"temperature": 36.7, "blood_pressure": "125/82", "heart_rate": 88, "respiratory_rate": 18, "oxygen_saturation": 98}'::jsonb,
  (SELECT id FROM hospital_staff WHERE email = 'jonathan.mitchell@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Mental Health'),
  'Patient diagnosed with Generalized Anxiety Disorder. Started on SSRI. Cognitive behavioral therapy recommended. Follow-up in 2 weeks via telemedicine.',
  true,
  true
FROM patients p WHERE p.email = 'james.mwangi@email.com';

-- Pediatric Visit - Peter Otieno (Fever)
INSERT INTO patient_visits (patient_id, visit_number, admission_type, check_in_time, check_out_time, status, chief_complaint, vital_signs, attending_doctor_id, current_department_id, discharge_summary)
SELECT
  p.id,
  'V-PED-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-001',
  'walk_in',
  NOW() - INTERVAL '1 day 3 hours',
  NOW() - INTERVAL '1 day 2 hours',
  'discharged',
  'Fever and cough for 2 days',
  '{"temperature": 38.5, "blood_pressure": "95/60", "heart_rate": 110, "respiratory_rate": 24, "oxygen_saturation": 97, "weight": 32.5}'::jsonb,
  (SELECT id FROM hospital_staff WHERE email = 'laura.adams@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Pediatrics'),
  'Viral upper respiratory infection. Prescribed antipyretics. Advised rest and fluids. Return if symptoms worsen.'
FROM patients p WHERE p.email = 'ann.otieno@email.com'; -- Parent's email

-- Cardiology Follow-up - Michael Kimani
INSERT INTO patient_visits (patient_id, visit_number, admission_type, check_in_time, status, chief_complaint, vital_signs, attending_doctor_id, current_department_id, notes)
SELECT
  p.id,
  'V-CARD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
  'appointment',
  NOW() - INTERVAL '1 hour',
  'in_consultation',
  'Follow-up for hypertension and diabetes management',
  '{"temperature": 36.6, "blood_pressure": "138/88", "heart_rate": 76, "respiratory_rate": 16, "oxygen_saturation": 98, "weight": 85.2, "blood_glucose": 142}'::jsonb,
  (SELECT id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Cardiology'),
  'Regular follow-up. Blood pressure slightly elevated. Blood glucose controlled. Medication adjustment needed.'
FROM patients p WHERE p.email = 'michael.kimani@email.com';

-- ============================================================================
-- APPOINTMENTS (Upcoming and Past)
-- ============================================================================

-- Upcoming appointment - Sarah Wanjiku (Follow-up)
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '5 days', 'YYYYMMDD') || '-001',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient'),
  'follow_up',
  NOW() + INTERVAL '5 days 10 hours',
  'scheduled',
  'Six-month checkup follow-up appointment'
FROM patients p WHERE p.email = 'sarah.wanjiku@email.com';

-- Upcoming lab appointment - Lucy Wambui
INSERT INTO appointments (appointment_number, patient_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '2 days', 'YYYYMMDD') || '-002',
  p.id,
  (SELECT id FROM departments WHERE name = 'Laboratory'),
  'lab',
  NOW() + INTERVAL '2 days 8 hours',
  'confirmed',
  'Fasting blood work - lipid panel and glucose'
FROM patients p WHERE p.email = 'lucy.wambui@email.com';

-- Upcoming radiology - Robert Muriithi
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '3 days', 'YYYYMMDD') || '-003',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'ryan.rivera@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Radiology'),
  'radiology',
  NOW() + INTERVAL '3 days 14 hours',
  'scheduled',
  'Chest X-ray for persistent cough'
FROM patients p WHERE p.email = 'robert.muriithi@email.com';

-- Upcoming telemedicine - James Mwangi
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '9 days', 'YYYYMMDD') || '-004',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'jonathan.mitchell@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Mental Health'),
  'telemedicine',
  NOW() + INTERVAL '9 days 15 hours',
  'scheduled',
  'Mental health follow-up session'
FROM patients p WHERE p.email = 'james.mwangi@email.com';

-- Upcoming maternity - Mary Akinyi
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '14 days', 'YYYYMMDD') || '-005',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'catherine.king@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Maternity'),
  'consultation',
  NOW() + INTERVAL '14 days 11 hours',
  'scheduled',
  'Prenatal checkup - 30 weeks'
FROM patients p WHERE p.email = 'mary.akinyi@email.com';

-- Upcoming cardiology - Michael Kimani
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '30 days', 'YYYYMMDD') || '-006',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Cardiology'),
  'follow_up',
  NOW() + INTERVAL '30 days 9 hours',
  'scheduled',
  'Monthly hypertension and diabetes review'
FROM patients p WHERE p.email = 'michael.kimani@email.com';

-- Upcoming pediatric checkup - Thomas Odhiambo
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '7 days', 'YYYYMMDD') || '-007',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'laura.adams@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Pediatrics'),
  'consultation',
  NOW() + INTERVAL '7 days 14 hours',
  'scheduled',
  'Routine vaccination and growth assessment'
FROM patients p WHERE p.email = 'alice.odhiambo@email.com'; -- Parent's email

-- ============================================================================
-- PRESCRIPTIONS & PRESCRIPTION ITEMS
-- ============================================================================

-- Prescription for John Kamau (Emergency - Cardiac medication)
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, visit_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until)
  SELECT
    'RX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
    p.id,
    pv.id,
    (SELECT id FROM hospital_staff WHERE email = 'michael.chen@hospitalguard.com'),
    'signed',
    'QR-RX-' || TO_CHAR(NOW(), 'YYYYMMDDHHMI') || '-001',
    'DR-CHEN-DIGITAL-SIG-' || TO_CHAR(NOW(), 'YYYYMMDD'),
    NOW(),
    2,
    NOW() + INTERVAL '90 days'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'john.kamau@email.com'
    AND pv.visit_number LIKE 'V-ER-%'
  LIMIT 1
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions)
SELECT id, 'Aspirin 81mg', '81mg', 'Once daily', '90 days', 90, 'Take with food in the morning'
FROM new_prescription
UNION ALL
SELECT id, 'Atorvastatin 20mg', '20mg', 'Once daily at bedtime', '90 days', 90, 'Take before sleep'
FROM new_prescription;

-- Prescription for James Mwangi (Mental Health - Anxiety)
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, visit_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until, notes)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '5 days', 'YYYYMMDD') || '-002',
    p.id,
    pv.id,
    (SELECT id FROM hospital_staff WHERE email = 'jonathan.mitchell@hospitalguard.com'),
    'signed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '5 days', 'YYYYMMDDHHMI') || '-002',
    'DR-MITCHELL-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '5 days', 'YYYYMMDD'),
    NOW() - INTERVAL '5 days',
    3,
    NOW() + INTERVAL '85 days',
    'Start with low dose. Monitor for side effects. Follow-up in 2 weeks.'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'james.mwangi@email.com'
    AND pv.visit_number LIKE 'V-MH-%'
  LIMIT 1
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions)
SELECT id, 'Sertraline 50mg', '50mg', 'Once daily', '90 days', 90, 'Take in the morning with food. May cause drowsiness initially.'
FROM new_prescription
UNION ALL
SELECT id, 'Lorazepam 1mg', '1mg', 'As needed for anxiety', '30 days', 15, 'Do not exceed 2 tablets per day. May cause drowsiness. Do not drive after taking.'
FROM new_prescription;

-- Prescription for Michael Kimani (Cardiology - Chronic conditions)
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '30 days', 'YYYYMMDD') || '-003',
    p.id,
    (SELECT id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com'),
    'partially_dispensed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '30 days', 'YYYYMMDDHHMI') || '-003',
    'DR-PHILLIPS-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '30 days', 'YYYYMMDD'),
    NOW() - INTERVAL '30 days',
    0,
    NOW() + INTERVAL '60 days'
  FROM patients p
  WHERE p.email = 'michael.kimani@email.com'
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, dispensed_quantity, instructions)
SELECT id, 'Lisinopril 10mg', '10mg', 'Once daily', '90 days', 90, 30, 'Take in the morning. Monitor blood pressure regularly.'
FROM new_prescription
UNION ALL
SELECT id, 'Metformin 500mg', '500mg', 'Twice daily with meals', '90 days', 180, 60, 'Take with breakfast and dinner. Monitor blood sugar.'
FROM new_prescription
UNION ALL
SELECT id, 'Atorvastatin 20mg', '20mg', 'Once daily at bedtime', '90 days', 90, 30, 'Take before sleep. Avoid grapefruit juice.'
FROM new_prescription;

-- Prescription for Peter Otieno (Pediatric - Fever)
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, visit_id, doctor_id, status, qr_code_data, digital_signature, signed_at, valid_until)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-004',
    p.id,
    pv.id,
    (SELECT id FROM hospital_staff WHERE email = 'laura.adams@hospitalguard.com'),
    'dispensed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDDHHMI') || '-004',
    'DR-ADAMS-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD'),
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '7 days'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'ann.otieno@email.com' -- Parent's email
    AND pv.visit_number LIKE 'V-PED-%'
  LIMIT 1
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, dispensed_quantity, instructions)
SELECT id, 'Ibuprofen 400mg', '200mg', 'Every 6 hours as needed', '5 days', 15, 15, 'Give with food. For fever above 38.5°C. Do not exceed 4 doses per day.'
FROM new_prescription;

-- Prescription for Lucy Wambui (Outpatient - Pain management)
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMMDD') || '-005',
    p.id,
    (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
    'signed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMMDDHHMI') || '-005',
    'DR-TAYLOR-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMMDD'),
    NOW() - INTERVAL '10 days',
    1,
    NOW() + INTERVAL '50 days'
  FROM patients p
  WHERE p.email = 'lucy.wambui@email.com'
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions)
SELECT id, 'Ibuprofen 400mg', '400mg', 'Three times daily with food', '14 days', 42, 'Take after meals. Stop if stomach upset occurs.'
FROM new_prescription
UNION ALL
SELECT id, 'Omeprazole 20mg', '20mg', 'Once daily before breakfast', '14 days', 14, 'Take 30 minutes before first meal of the day.'
FROM new_prescription;

-- ============================================================================
-- LAB ORDERS & RESULTS
-- ============================================================================

-- Lab order for John Kamau (Emergency - Cardiac panel)
INSERT INTO lab_orders (order_number, patient_id, visit_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
  p.id,
  pv.id,
  (SELECT id FROM hospital_staff WHERE email = 'michael.chen@hospitalguard.com'),
  'Cardiac Enzymes Panel (Troponin, CK-MB)',
  'stat',
  'completed',
  true,
  NOW() - INTERVAL '90 minutes',
  '{"troponin_i": 0.04, "ck_mb": 3.2, "ck_total": 85, "interpretation": "Troponin I within normal limits. No evidence of acute myocardial infarction.", "reference_ranges": {"troponin_i": "0-0.04 ng/mL", "ck_mb": "0-5 ng/mL", "ck_total": "30-200 U/L"}}'::jsonb,
  NOW() - INTERVAL '30 minutes'
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'john.kamau@email.com'
  AND pv.visit_number LIKE 'V-ER-%'
LIMIT 1;

-- Lab order for Sarah Wanjiku (Outpatient - Complete blood count)
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-002',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
  'Complete Blood Count (CBC)',
  'routine',
  'completed',
  true,
  NOW() - INTERVAL '3 days 2 hours',
  '{"wbc": 7.2, "rbc": 4.8, "hemoglobin": 13.5, "hematocrit": 40.2, "platelets": 250, "interpretation": "All values within normal limits. No abnormalities detected.", "reference_ranges": {"wbc": "4-11 x10^9/L", "rbc": "4.2-5.4 x10^12/L", "hemoglobin": "12-16 g/dL", "hematocrit": "36-46%", "platelets": "150-400 x10^9/L"}}'::jsonb,
  NOW() - INTERVAL '3 days'
FROM patients p
WHERE p.email = 'sarah.wanjiku@email.com'
LIMIT 1;

-- Lab order for Lucy Wambui (Pending - Lipid panel)
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected)
SELECT
  'LAB-' || TO_CHAR(NOW() + INTERVAL '2 days', 'YYYYMMDD') || '-003',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  'Lipid Panel (Fasting)',
  'routine',
  'pending',
  false
FROM patients p
WHERE p.email = 'lucy.wambui@email.com';

-- Lab order for Michael Kimani (Cardiology - HbA1c and glucose)
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDD') || '-004',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com'),
  'HbA1c and Fasting Blood Glucose',
  'routine',
  'completed',
  true,
  NOW() - INTERVAL '7 days 1 hour',
  '{"hba1c": 7.2, "fasting_glucose": 142, "interpretation": "HbA1c indicates fair glycemic control. Fasting glucose slightly elevated. Continue current diabetes management and monitor closely.", "reference_ranges": {"hba1c": "<5.7% (normal), 5.7-6.4% (prediabetes), ≥6.5% (diabetes)", "fasting_glucose": "70-100 mg/dL"}}'::jsonb,
  NOW() - INTERVAL '6 days 22 hours'
FROM patients p
WHERE p.email = 'michael.kimani@email.com'
LIMIT 1;

-- ============================================================================
-- RADIOLOGY ORDERS
-- ============================================================================

-- Radiology for John Kamau (Emergency - Chest X-ray)
INSERT INTO radiology_orders (order_number, patient_id, visit_id, ordered_by, imaging_type, body_part, urgency, status, scheduled_time, completed_at, findings, radiologist_id)
SELECT
  'RAD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
  p.id,
  pv.id,
  (SELECT id FROM hospital_staff WHERE email = 'michael.chen@hospitalguard.com'),
  'x_ray',
  'Chest',
  'stat',
  'completed',
  NOW() - INTERVAL '1 hour 30 minutes',
  NOW() - INTERVAL '45 minutes',
  'No acute cardiopulmonary disease. Heart size normal. Lungs clear. No pleural effusion or pneumothorax. Impression: Normal chest radiograph.',
  (SELECT id FROM hospital_staff WHERE email = 'ryan.rivera@hospitalguard.com')
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'john.kamau@email.com'
  AND pv.visit_number LIKE 'V-ER-%'
LIMIT 1;

-- Radiology for Robert Muriithi (Scheduled - Chest X-ray)
INSERT INTO radiology_orders (order_number, patient_id, ordered_by, imaging_type, body_part, urgency, status, scheduled_time)
SELECT
  'RAD-' || TO_CHAR(NOW() + INTERVAL '3 days', 'YYYYMMDD') || '-002',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
  'x_ray',
  'Chest',
  'routine',
  'scheduled',
  NOW() + INTERVAL '3 days 14 hours'
FROM patients p
WHERE p.email = 'robert.muriithi@email.com';

-- ============================================================================
-- MEDICAL RECORDS
-- ============================================================================

-- Medical record for Sarah Wanjiku (Annual checkup note)
INSERT INTO medical_records (patient_id, visit_id, record_type, title, description, doctor_id, department_id)
SELECT
  p.id,
  pv.id,
  'consultation',
  'Annual Health Assessment 2025',
  'Patient underwent comprehensive annual health evaluation. All vital signs within normal limits. Laboratory results show no abnormalities. Patient reports no current health concerns. Maintaining healthy lifestyle with regular exercise and balanced diet. No medication changes required. Continue current preventive care. Next checkup scheduled in 6 months.',
  (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient')
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'sarah.wanjiku@email.com'
  AND pv.visit_number LIKE 'V-OP-%'
LIMIT 1;

-- Medical record for James Mwangi (Mental health assessment)
INSERT INTO medical_records (patient_id, visit_id, record_type, title, description, doctor_id, department_id, is_confidential)
SELECT
  p.id,
  pv.id,
  'diagnosis',
  'Generalized Anxiety Disorder Diagnosis',
  'Patient presents with persistent worry, restlessness, and sleep disturbances for the past 6 months. Mental status exam shows anxious affect, coherent thought process. No suicidal ideation. Diagnosed with Generalized Anxiety Disorder (GAD). Treatment plan: Start Sertraline 50mg daily, Lorazepam 1mg PRN for acute anxiety. Cognitive Behavioral Therapy recommended. Patient counseled on stress management techniques. Follow-up via telemedicine in 2 weeks.',
  (SELECT id FROM hospital_staff WHERE email = 'jonathan.mitchell@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Mental Health'),
  true
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'james.mwangi@email.com'
  AND pv.visit_number LIKE 'V-MH-%'
LIMIT 1;

-- Medical record for Michael Kimani (Cardiology follow-up)
INSERT INTO medical_records (patient_id, record_type, title, description, doctor_id, department_id)
SELECT
  p.id,
  'consultation',
  'Hypertension & Diabetes Management Follow-up',
  'Patient follows up for chronic disease management. Current medications: Lisinopril 10mg daily, Metformin 500mg BID, Atorvastatin 20mg daily. Recent HbA1c: 7.2% (target <7.0%). Blood pressure today: 138/88 mmHg (target <130/80). Patient reports good medication compliance. Dietary adherence variable. Increased physical activity recommended. Plan: Increase Lisinopril to 20mg daily for better BP control. Continue current diabetes regimen. Dietitian referral provided. Follow-up in 4 weeks.',
  (SELECT id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Cardiology')
FROM patients p
WHERE p.email = 'michael.kimani@email.com'
LIMIT 1;

-- ============================================================================
-- DIAGNOSES
-- ============================================================================

-- Diagnosis for John Kamau (Emergency)
INSERT INTO diagnoses (visit_id, icd_code, diagnosis_name, diagnosis_type, notes, diagnosed_by)
SELECT
  pv.id,
  'I20.0',
  'Unstable Angina',
  'primary',
  'Patient presenting with chest pain and elevated cardiac risk factors. ECG shows ST-segment changes consistent with unstable angina. Troponin negative ruling out MI. Patient requires cardiology consultation and possible intervention.',
  (SELECT id FROM hospital_staff WHERE email = 'michael.chen@hospitalguard.com')
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.email = 'john.kamau@email.com'
  AND pv.visit_number LIKE 'V-ER-%'
LIMIT 1;

-- Diagnosis for James Mwangi (Mental Health)
INSERT INTO diagnoses (visit_id, icd_code, diagnosis_name, diagnosis_type, notes, diagnosed_by)
SELECT
  pv.id,
  'F41.1',
  'Generalized Anxiety Disorder',
  'primary',
  'Patient meets DSM-5 criteria for Generalized Anxiety Disorder with persistent worry, sleep disturbance, and somatic symptoms lasting >6 months. No comorbid depression at this time.',
  (SELECT id FROM hospital_staff WHERE email = 'jonathan.mitchell@hospitalguard.com')
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.email = 'james.mwangi@email.com'
  AND pv.visit_number LIKE 'V-MH-%'
LIMIT 1;

-- Diagnosis for Peter Otieno (Pediatric)
INSERT INTO diagnoses (visit_id, icd_code, diagnosis_name, diagnosis_type, notes, diagnosed_by)
SELECT
  pv.id,
  'J06.9',
  'Acute Upper Respiratory Infection, unspecified',
  'primary',
  'Viral upper respiratory infection with fever, cough, and rhinorrhea. No signs of bacterial infection. Symptomatic treatment recommended.',
  (SELECT id FROM hospital_staff WHERE email = 'laura.adams@hospitalguard.com')
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.email = 'ann.otieno@email.com' -- Parent's email
  AND pv.visit_number LIKE 'V-PED-%'
LIMIT 1;

-- ============================================================================
-- BILLING & PAYMENTS
-- ============================================================================

-- Bill for Sarah Wanjiku (Outpatient visit - Fully paid)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, visit_id, total_amount, amount_paid, amount_due, insurance_covered, status, due_date)
  SELECT
    'BILL-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-001',
    p.id,
    pv.id,
    15000.00,
    15000.00,
    0.00,
    10500.00,
    'paid',
    NOW() - INTERVAL '3 days'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'sarah.wanjiku@email.com'
    AND pv.visit_number LIKE 'V-OP-%'
  LIMIT 1
  RETURNING id, patient_id, amount_paid
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'consultation',
  'General Health Checkup',
  1,
  5000.00,
  5000.00,
  (SELECT id FROM departments WHERE name = 'Outpatient')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Complete Blood Count (CBC)',
  1,
  3000.00,
  3000.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Comprehensive Metabolic Panel',
  1,
  4000.00,
  4000.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Lipid Panel',
  1,
  3000.00,
  3000.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb;

-- Payment for Sarah Wanjiku
INSERT INTO payments (payment_number, bill_id, amount, payment_method, payment_reference, payment_status, received_by)
SELECT
  'PAY-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-001',
  b.id,
  4500.00,
  'insurance',
  'MAD-CLM-2025-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD'),
  'completed',
  (SELECT id FROM hospital_staff WHERE email = 'olivia.ross@hospitalguard.com')
FROM bills b
JOIN patients p ON p.id = b.patient_id
WHERE p.email = 'sarah.wanjiku@email.com'
  AND b.bill_number LIKE 'BILL-%'
LIMIT 1;

-- Bill for James Mwangi (Mental Health - Partially paid)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, visit_id, total_amount, amount_paid, amount_due, insurance_covered, status, due_date)
  SELECT
    'BILL-' || TO_CHAR(NOW() - INTERVAL '5 days', 'YYYYMMDD') || '-002',
    p.id,
    pv.id,
    8000.00,
    5000.00,
    3000.00,
    5000.00,
    'partially_paid',
    NOW() + INTERVAL '25 days'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'james.mwangi@email.com'
    AND pv.visit_number LIKE 'V-MH-%'
  LIMIT 1
  RETURNING id
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'consultation',
  'Psychiatric Consultation',
  1,
  6000.00,
  6000.00,
  (SELECT id FROM departments WHERE name = 'Mental Health')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'medication',
  'Mental Health Medications',
  1,
  2000.00,
  2000.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb;

-- Bill for Peter Otieno (Pediatric - Pending)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, visit_id, total_amount, amount_paid, amount_due, status, due_date)
  SELECT
    'BILL-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-003',
    p.id,
    pv.id,
    4500.00,
    0.00,
    4500.00,
    'pending',
    NOW() + INTERVAL '29 days'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'ann.otieno@email.com' -- Parent's email
    AND pv.visit_number LIKE 'V-PED-%'
  LIMIT 1
  RETURNING id
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'consultation',
  'Pediatric Consultation',
  1,
  3500.00,
  3500.00,
  (SELECT id FROM departments WHERE name = 'Pediatrics')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'medication',
  'Antipyretic Medication',
  1,
  1000.00,
  1000.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb;

-- ============================================================================
-- TELEMEDICINE SESSIONS
-- ============================================================================

-- Upcoming telemedicine session for James Mwangi
INSERT INTO telemedicine_sessions (session_number, patient_id, original_visit_id, doctor_id, session_type, scheduled_time, status, meeting_link)
SELECT
  'TELE-' || TO_CHAR(NOW() + INTERVAL '9 days', 'YYYYMMDD') || '-001',
  p.id,
  pv.id,
  (SELECT id FROM hospital_staff WHERE email = 'jonathan.mitchell@hospitalguard.com'),
  'follow_up',
  NOW() + INTERVAL '9 days 15 hours',
  'scheduled',
  'https://hospitalguard.telehealth.com/session/' || gen_random_uuid()
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'james.mwangi@email.com'
  AND pv.visit_number LIKE 'V-MH-%'
LIMIT 1;

-- ============================================================================
-- MATERNITY RECORDS
-- ============================================================================

-- Maternity record for Mary Akinyi
INSERT INTO maternity_records (patient_id, visit_id, pregnancy_number, lmp_date, edd_date, blood_group, rhesus_factor, hiv_status, hepatitis_b_status, antenatal_visits, obstetrician_id, notes)
SELECT
  p.id,
  pv.id,
  1,
  NOW() - INTERVAL '28 weeks',
  NOW() + INTERVAL '12 weeks',
  'AB+',
  'positive',
  'negative',
  'negative',
  5,
  (SELECT id FROM hospital_staff WHERE email = 'catherine.king@hospitalguard.com'),
  'First pregnancy progressing well. No complications noted. Fetal growth appropriate for gestational age. All routine prenatal tests within normal limits. Patient educated on warning signs and birth plan. Continue monthly antenatal visits.'
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'mary.akinyi@email.com'
  AND pv.visit_number LIKE 'V-MAT-%'
LIMIT 1;

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================

DO $$
DECLARE
  patient_count INTEGER;
  visit_count INTEGER;
  appointment_count INTEGER;
  prescription_count INTEGER;
  lab_count INTEGER;
  bill_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO patient_count FROM patients WHERE national_id LIKE 'KE-12345%';
  SELECT COUNT(*) INTO visit_count FROM patient_visits WHERE visit_number LIKE 'V-%';
  SELECT COUNT(*) INTO appointment_count FROM appointments WHERE appointment_number LIKE 'APT-%';
  SELECT COUNT(*) INTO prescription_count FROM prescriptions WHERE prescription_number LIKE 'RX-%';
  SELECT COUNT(*) INTO lab_count FROM lab_orders WHERE order_number LIKE 'LAB-%';
  SELECT COUNT(*) INTO bill_count FROM bills WHERE bill_number LIKE 'BILL-%';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'HospitalGuard Patient Seed Data Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Patients Created: %', patient_count;
  RAISE NOTICE 'Patient Visits: %', visit_count;
  RAISE NOTICE 'Appointments: %', appointment_count;
  RAISE NOTICE 'Prescriptions: %', prescription_count;
  RAISE NOTICE 'Lab Orders: %', lab_count;
  RAISE NOTICE 'Bills Generated: %', bill_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Patient Portal Ready for Testing!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'TEST PATIENTS:';
  RAISE NOTICE '- john.kamau@email.com (Emergency - Active cardiac case)';
  RAISE NOTICE '- sarah.wanjiku@email.com (Outpatient - Completed checkup)';
  RAISE NOTICE '- james.mwangi@email.com (Mental Health - Active with telemedicine)';
  RAISE NOTICE '- mary.akinyi@email.com (Maternity - Active pregnancy)';
  RAISE NOTICE '- lucy.wambui@email.com (Has upcoming lab appointment)';
  RAISE NOTICE '========================================';
END $$;
