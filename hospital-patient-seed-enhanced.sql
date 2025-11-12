-- ============================================================================
-- HospitalGuard: Enhanced Patient Seed Data
-- ============================================================================
-- Additional appointments, medical history, billing, and prescriptions
-- Run AFTER hospital-patient-seed.sql
-- ============================================================================

-- ============================================================================
-- ADDITIONAL APPOINTMENTS (20+ more appointments)
-- ============================================================================

-- Grace Njeri - Multiple appointments
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '4 days', 'YYYYMMDD') || '-008',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient'),
  'consultation',
  NOW() + INTERVAL '4 days 9 hours',
  'scheduled',
  'Annual physical examination'
FROM patients p WHERE p.email = 'grace.njeri@email.com';

INSERT INTO appointments (appointment_number, patient_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '10 days', 'YYYYMMDD') || '-009',
  p.id,
  (SELECT id FROM departments WHERE name = 'Laboratory'),
  'lab',
  NOW() + INTERVAL '10 days 7 hours',
  'scheduled',
  'Follow-up blood work'
FROM patients p WHERE p.email = 'grace.njeri@email.com';

-- Elizabeth Chebet - Cardiology series
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '6 days', 'YYYYMMDD') || '-010',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'nancy.campbell@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Cardiology'),
  'consultation',
  NOW() + INTERVAL '6 days 11 hours',
  'confirmed',
  'Heart palpitations evaluation'
FROM patients p WHERE p.email = 'elizabeth.chebet@email.com';

-- Nancy Wairimu - Dermatology
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '8 days', 'YYYYMMDD') || '-011',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'victoria.price@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Dermatology'),
  'consultation',
  NOW() + INTERVAL '8 days 14 hours',
  'scheduled',
  'Skin rash evaluation'
FROM patients p WHERE p.email = 'nancy.wairimu@email.com';

-- Catherine Muthoni - Oncology screening
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '15 days', 'YYYYMMDD') || '-012',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'susan.rogers@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Oncology'),
  'consultation',
  NOW() + INTERVAL '15 days 10 hours',
  'scheduled',
  'Cancer screening and preventive consultation'
FROM patients p WHERE p.email = 'catherine.muthoni@email.com';

-- Anthony Wekesa - Neurology
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '12 days', 'YYYYMMDD') || '-013',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'barbara.evans@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Neurology'),
  'consultation',
  NOW() + INTERVAL '12 days 13 hours',
  'scheduled',
  'Chronic migraine management'
FROM patients p WHERE p.email = 'anthony.wekesa@email.com';

-- David Omondi - Post-surgery follow-ups
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '7 days', 'YYYYMMDD') || '-014',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'patricia.lewis@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Surgery'),
  'follow_up',
  NOW() + INTERVAL '7 days 10 hours',
  'scheduled',
  'Post-operative cardiac surgery follow-up'
FROM patients p WHERE p.email = 'david.omondi@email.com';

INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '21 days', 'YYYYMMDD') || '-015',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Cardiology'),
  'follow_up',
  NOW() + INTERVAL '21 days 9 hours',
  'scheduled',
  'Cardiac rehabilitation assessment'
FROM patients p WHERE p.email = 'david.omondi@email.com';

-- Robert Muriithi - Pulmonology
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason)
SELECT
  'APT-' || TO_CHAR(NOW() + INTERVAL '5 days', 'YYYYMMDD') || '-016',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'samantha.watson@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Pulmonology'),
  'consultation',
  NOW() + INTERVAL '5 days 15 hours',
  'confirmed',
  'Chronic cough evaluation and pulmonary function test'
FROM patients p WHERE p.email = 'robert.muriithi@email.com';

-- ============================================================================
-- PAST APPOINTMENTS (Completed history)
-- ============================================================================

-- Sarah Wanjiku - Past appointments
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason, notes)
SELECT
  'APT-' || TO_CHAR(NOW() - INTERVAL '60 days', 'YYYYMMDD') || '-101',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'jessica.moore@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient'),
  'consultation',
  NOW() - INTERVAL '60 days',
  'completed',
  'General health checkup',
  'Patient evaluated. All vitals normal. Recommended annual follow-up.'
FROM patients p WHERE p.email = 'sarah.wanjiku@email.com';

-- Michael Kimani - Multiple past cardiology visits
INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason, notes)
SELECT
  'APT-' || TO_CHAR(NOW() - INTERVAL '90 days', 'YYYYMMDD') || '-102',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Cardiology'),
  'follow_up',
  NOW() - INTERVAL '90 days',
  'completed',
  'Hypertension management',
  'BP: 142/90. Medication adjusted. Continue monitoring.'
FROM patients p WHERE p.email = 'michael.kimani@email.com';

INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_type, scheduled_time, status, reason, notes)
SELECT
  'APT-' || TO_CHAR(NOW() - INTERVAL '60 days', 'YYYYMMDD') || '-103',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Cardiology'),
  'follow_up',
  NOW() - INTERVAL '60 days',
  'completed',
  'Diabetes and hypertension review',
  'HbA1c: 7.5%. BP: 138/88. Medication compliance good. Lifestyle modifications reinforced.'
FROM patients p WHERE p.email = 'michael.kimani@email.com';

-- ============================================================================
-- ADDITIONAL PRESCRIPTIONS (10+ more prescriptions)
-- ============================================================================

-- Grace Njeri - Antibiotic prescription
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDD') || '-006',
    p.id,
    (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
    'signed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDDHHMI') || '-006',
    'DR-TAYLOR-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDD'),
    NOW() - INTERVAL '2 days',
    0,
    NOW() + INTERVAL '10 days'
  FROM patients p WHERE p.email = 'grace.njeri@email.com'
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions)
SELECT id, 'Amoxicillin 500mg', '500mg', 'Three times daily', '7 days', 21, 'Take with food. Complete full course even if feeling better.'
FROM new_prescription
UNION ALL
SELECT id, 'Prednisone 20mg', '20mg', 'Once daily in morning', '5 days', 5, 'Take with food. Do not stop abruptly.'
FROM new_prescription;

-- Elizabeth Chebet - Cardiac medication
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until, notes)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '15 days', 'YYYYMMDD') || '-007',
    p.id,
    (SELECT id FROM hospital_staff WHERE email = 'nancy.campbell@hospitalguard.com'),
    'signed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '15 days', 'YYYYMMDDHHMI') || '-007',
    'DR-CAMPBELL-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '15 days', 'YYYYMMDD'),
    NOW() - INTERVAL '15 days',
    2,
    NOW() + INTERVAL '75 days',
    'For atrial fibrillation management. Monitor heart rate.'
  FROM patients p WHERE p.email = 'elizabeth.chebet@email.com'
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions)
SELECT id, 'Metoprolol 50mg', '50mg', 'Twice daily', '90 days', 180, 'Take at same times daily. Do not skip doses.'
FROM new_prescription
UNION ALL
SELECT id, 'Warfarin 5mg', '5mg', 'Once daily at same time', '90 days', 90, 'Regular INR monitoring required. Avoid vitamin K-rich foods.'
FROM new_prescription;

-- Nancy Wairimu - Allergy medication
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDD') || '-008',
    p.id,
    (SELECT id FROM hospital_staff WHERE email = 'victoria.price@hospitalguard.com'),
    'dispensed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDDHHMI') || '-008',
    'DR-PRICE-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDD'),
    NOW() - INTERVAL '7 days',
    3,
    NOW() + INTERVAL '83 days'
  FROM patients p WHERE p.email = 'nancy.wairimu@email.com'
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, dispensed_quantity, instructions)
SELECT id, 'Fluticasone Inhaler', '110mcg', 'Two puffs twice daily', '90 days', 2, 2, 'Rinse mouth after use. Use consistently for best results.'
FROM new_prescription;

-- Anthony Wekesa - Pain management (needs refill)
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until, notes)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '25 days', 'YYYYMMDD') || '-009',
    p.id,
    (SELECT id FROM hospital_staff WHERE email = 'barbara.evans@hospitalguard.com'),
    'partially_dispensed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '25 days', 'YYYYMMDDHHMI') || '-009',
    'DR-EVANS-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '25 days', 'YYYYMMDD'),
    NOW() - INTERVAL '25 days',
    0,
    NOW() + INTERVAL '5 days',
    'Chronic migraine prophylaxis. Follow-up required for refill.'
  FROM patients p WHERE p.email = 'anthony.wekesa@email.com'
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, dispensed_quantity, instructions)
SELECT id, 'Acetaminophen 500mg', '500mg', 'As needed for pain', '30 days', 60, 30, 'Do not exceed 4000mg per day. Take with food.'
FROM new_prescription
UNION ALL
SELECT id, 'Escitalopram 10mg', '10mg', 'Once daily', '30 days', 30, 30, 'Take at same time each day. May cause drowsiness initially.'
FROM new_prescription;

-- Catherine Muthoni - Thyroid medication
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '45 days', 'YYYYMMDD') || '-010',
    p.id,
    (SELECT id FROM hospital_staff WHERE email = 'julie.kelly@hospitalguard.com'),
    'signed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '45 days', 'YYYYMMDDHHMI') || '-010',
    'DR-KELLY-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '45 days', 'YYYYMMDD'),
    NOW() - INTERVAL '45 days',
    2,
    NOW() + INTERVAL '45 days'
  FROM patients p WHERE p.email = 'catherine.muthoni@email.com'
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions)
SELECT id, 'Levothyroxine 100mcg', '100mcg', 'Once daily on empty stomach', '90 days', 90, 'Take 30 minutes before breakfast. Consistent timing is important.'
FROM new_prescription;

-- David Omondi - Post-surgery medications
WITH new_prescription AS (
  INSERT INTO prescriptions (prescription_number, patient_id, visit_id, doctor_id, status, qr_code_data, digital_signature, signed_at, refills_allowed, valid_until)
  SELECT
    'RX-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-011',
    p.id,
    pv.id,
    (SELECT id FROM hospital_staff WHERE email = 'patricia.lewis@hospitalguard.com'),
    'signed',
    'QR-RX-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDDHHMI') || '-011',
    'DR-LEWIS-DIGITAL-SIG-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD'),
    NOW() - INTERVAL '1 day',
    1,
    NOW() + INTERVAL '59 days'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'david.omondi@email.com'
    AND pv.visit_number LIKE 'V-ICU-%'
  LIMIT 1
  RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions)
SELECT id, 'Aspirin 81mg', '81mg', 'Once daily', '90 days', 90, 'Take with food. Important for heart health.'
FROM new_prescription
UNION ALL
SELECT id, 'Atorvastatin 20mg', '20mg', 'Once daily at bedtime', '90 days', 90, 'Take before sleep.'
FROM new_prescription
UNION ALL
SELECT id, 'Metoprolol 50mg', '50mg', 'Twice daily', '90 days', 180, 'Take at consistent times.'
FROM new_prescription
UNION ALL
SELECT id, 'Enoxaparin 40mg', '40mg', 'Once daily subcutaneous', '14 days', 14, 'Injection. Training provided. Blood clot prevention.'
FROM new_prescription;

-- ============================================================================
-- ADDITIONAL LAB ORDERS (15+ more lab orders)
-- ============================================================================

-- Grace Njeri - Comprehensive metabolic panel
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '5 days', 'YYYYMMDD') || '-005',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  'Comprehensive Metabolic Panel (CMP)',
  'routine',
  'completed',
  true,
  NOW() - INTERVAL '5 days 2 hours',
  '{"glucose": 95, "calcium": 9.5, "sodium": 140, "potassium": 4.2, "chloride": 102, "co2": 26, "bun": 15, "creatinine": 0.9, "albumin": 4.3, "total_protein": 7.2, "alp": 75, "alt": 28, "ast": 32, "bilirubin": 0.8, "interpretation": "All values within normal limits. Good kidney and liver function.", "reference_ranges": {"glucose": "70-100 mg/dL", "creatinine": "0.6-1.2 mg/dL", "bun": "7-20 mg/dL"}}'::jsonb,
  NOW() - INTERVAL '4 days 22 hours'
FROM patients p WHERE p.email = 'grace.njeri@email.com';

-- Elizabeth Chebet - Cardiac markers
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '14 days', 'YYYYMMDD') || '-006',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'nancy.campbell@hospitalguard.com'),
  'Cardiac Biomarkers and BNP',
  'urgent',
  'completed',
  true,
  NOW() - INTERVAL '14 days 1 hour',
  '{"bnp": 125, "troponin_i": 0.02, "ck_mb": 2.8, "ldl": 142, "hdl": 45, "triglycerides": 165, "total_cholesterol": 220, "interpretation": "BNP mildly elevated suggesting mild heart strain. Lipid panel shows elevated LDL requiring management. No acute cardiac injury.", "reference_ranges": {"bnp": "<100 pg/mL (normal)", "troponin_i": "0-0.04 ng/mL", "ldl": "<100 mg/dL", "total_cholesterol": "<200 mg/dL"}}'::jsonb,
  NOW() - INTERVAL '13 days 22 hours'
FROM patients p WHERE p.email = 'elizabeth.chebet@email.com';

-- Nancy Wairimu - Allergy panel
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '8 days', 'YYYYMMDD') || '-007',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'victoria.price@hospitalguard.com'),
  'Allergy Panel (IgE Specific)',
  'routine',
  'completed',
  true,
  NOW() - INTERVAL '8 days 1 hour',
  '{"total_ige": 245, "dust_mites": "positive (Class 3)", "pollen": "positive (Class 2)", "mold": "negative", "pet_dander": "positive (Class 4)", "interpretation": "Significant allergic sensitization to dust mites and pet dander. Moderate pollen allergy. Recommend environmental control measures and continued antihistamine therapy.", "reference_ranges": {"total_ige": "0-100 IU/mL", "specific_ige": "Class 0-1 (negative), 2-3 (moderate), 4-6 (high)"}}'::jsonb,
  NOW() - INTERVAL '7 days 20 hours'
FROM patients p WHERE p.email = 'nancy.wairimu@email.com';

-- Catherine Muthoni - Thyroid function
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '45 days', 'YYYYMMDD') || '-008',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'julie.kelly@hospitalguard.com'),
  'Thyroid Function Panel (TSH, T3, T4)',
  'routine',
  'completed',
  true,
  NOW() - INTERVAL '45 days 1 hour',
  '{"tsh": 3.2, "free_t4": 1.3, "free_t3": 3.1, "thyroid_antibodies": "negative", "interpretation": "Thyroid function within normal limits on current levothyroxine dose. Continue current therapy.", "reference_ranges": {"tsh": "0.4-4.0 mIU/L", "free_t4": "0.8-1.8 ng/dL", "free_t3": "2.3-4.2 pg/mL"}}'::jsonb,
  NOW() - INTERVAL '44 days 22 hours'
FROM patients p WHERE p.email = 'catherine.muthoni@email.com';

-- Anthony Wekesa - Vitamin levels (chronic pain workup)
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '30 days', 'YYYYMMDD') || '-009',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'barbara.evans@hospitalguard.com'),
  'Vitamin D and B12 Levels',
  'routine',
  'completed',
  true,
  NOW() - INTERVAL '30 days 1 hour',
  '{"vitamin_d": 22, "vitamin_b12": 285, "folate": 8.2, "interpretation": "Vitamin D deficiency detected (22 ng/mL). B12 low-normal. Recommend Vitamin D supplementation 2000 IU daily and recheck in 3 months.", "reference_ranges": {"vitamin_d": "30-100 ng/mL (optimal: 40-80)", "vitamin_b12": "200-900 pg/mL", "folate": "2.7-17.0 ng/mL"}}'::jsonb,
  NOW() - INTERVAL '29 days 22 hours'
FROM patients p WHERE p.email = 'anthony.wekesa@email.com';

-- David Omondi - Post-surgery labs
INSERT INTO lab_orders (order_number, patient_id, visit_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '12 hours', 'YYYYMMDD') || '-010',
  p.id,
  pv.id,
  (SELECT id FROM hospital_staff WHERE email = 'david.anderson@hospitalguard.com'),
  'Complete Blood Count and Coagulation Panel',
  'urgent',
  'completed',
  true,
  NOW() - INTERVAL '12 hours',
  '{"wbc": 10.2, "rbc": 4.2, "hemoglobin": 12.8, "hematocrit": 38.5, "platelets": 185, "pt": 13.2, "inr": 1.1, "ptt": 32, "interpretation": "Mild anemia post-surgery (expected). WBC slightly elevated (post-operative inflammation). Coagulation normal. Continue monitoring.", "reference_ranges": {"hemoglobin": "13.5-17.5 g/dL (male)", "platelets": "150-400 x10^9/L", "inr": "0.8-1.2"}}'::jsonb,
  NOW() - INTERVAL '10 hours'
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'david.omondi@email.com'
  AND pv.visit_number LIKE 'V-ICU-%'
LIMIT 1;

-- Robert Muriithi - Pulmonary function labs
INSERT INTO lab_orders (order_number, patient_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at)
SELECT
  'LAB-' || TO_CHAR(NOW() + INTERVAL '3 days', 'YYYYMMDD') || '-011',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'samantha.watson@hospitalguard.com'),
  'Arterial Blood Gas (ABG)',
  'routine',
  'pending',
  false
FROM patients p WHERE p.email = 'robert.muriithi@email.com';

-- Mary Akinyi - Prenatal labs
INSERT INTO lab_orders (order_number, patient_id, visit_id, ordered_by, test_type, urgency, status, sample_collected, sample_collected_at, results, results_available_at)
SELECT
  'LAB-' || TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDD') || '-012',
  p.id,
  pv.id,
  (SELECT id FROM hospital_staff WHERE email = 'catherine.king@hospitalguard.com'),
  'Prenatal Panel - Glucose Screening',
  'routine',
  'completed',
  true,
  NOW() - INTERVAL '7 days 1 hour',
  '{"glucose_1hr": 128, "hemoglobin": 11.8, "hematocrit": 35.2, "blood_type": "AB+", "rh_factor": "positive", "antibody_screen": "negative", "interpretation": "Glucose tolerance test normal (no gestational diabetes). Mild physiologic anemia of pregnancy. Iron supplementation recommended.", "reference_ranges": {"glucose_1hr": "<140 mg/dL", "hemoglobin_pregnancy": "11-14 g/dL"}}'::jsonb,
  NOW() - INTERVAL '6 days 22 hours'
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'mary.akinyi@email.com'
  AND pv.visit_number LIKE 'V-MAT-%'
LIMIT 1;

-- ============================================================================
-- ADDITIONAL RADIOLOGY ORDERS
-- ============================================================================

-- Elizabeth Chebet - Echocardiogram
INSERT INTO radiology_orders (order_number, patient_id, ordered_by, imaging_type, body_part, urgency, status, scheduled_time, completed_at, findings, radiologist_id)
SELECT
  'RAD-' || TO_CHAR(NOW() - INTERVAL '14 days', 'YYYYMMDD') || '-003',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'nancy.campbell@hospitalguard.com'),
  'ultrasound',
  'Heart (Echocardiogram)',
  'urgent',
  'completed',
  NOW() - INTERVAL '14 days 2 hours',
  NOW() - INTERVAL '14 days',
  'Left ventricular ejection fraction: 55% (normal). Mild left atrial enlargement noted. No significant valvular abnormalities. Mild diastolic dysfunction. Findings consistent with atrial fibrillation. Recommend continued anticoagulation and rate control.',
  (SELECT id FROM hospital_staff WHERE email = 'ryan.rivera@hospitalguard.com')
FROM patients p WHERE p.email = 'elizabeth.chebet@email.com';

-- Nancy Wairimu - Sinus CT
INSERT INTO radiology_orders (order_number, patient_id, ordered_by, imaging_type, body_part, urgency, status, scheduled_time)
SELECT
  'RAD-' || TO_CHAR(NOW() + INTERVAL '8 days', 'YYYYMMDD') || '-004',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'victoria.price@hospitalguard.com'),
  'ct_scan',
  'Paranasal Sinuses',
  'routine',
  'scheduled',
  NOW() + INTERVAL '8 days 16 hours'
FROM patients p WHERE p.email = 'nancy.wairimu@email.com';

-- Anthony Wekesa - Brain MRI
INSERT INTO radiology_orders (order_number, patient_id, ordered_by, imaging_type, body_part, urgency, status, scheduled_time)
SELECT
  'RAD-' || TO_CHAR(NOW() + INTERVAL '12 days', 'YYYYMMDD') || '-005',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'barbara.evans@hospitalguard.com'),
  'mri',
  'Brain',
  'routine',
  'scheduled',
  NOW() + INTERVAL '12 days 9 hours'
FROM patients p WHERE p.email = 'anthony.wekesa@email.com';

-- Catherine Muthoni - Mammography
INSERT INTO radiology_orders (order_number, patient_id, ordered_by, imaging_type, body_part, urgency, status, scheduled_time)
SELECT
  'RAD-' || TO_CHAR(NOW() + INTERVAL '20 days', 'YYYYMMDD') || '-006',
  p.id,
  (SELECT id FROM hospital_staff WHERE email = 'susan.rogers@hospitalguard.com'),
  'mammography',
  'Breast (Bilateral)',
  'routine',
  'scheduled',
  NOW() + INTERVAL '20 days 10 hours'
FROM patients p WHERE p.email = 'catherine.muthoni@email.com';

-- David Omondi - Post-op chest X-ray
INSERT INTO radiology_orders (order_number, patient_id, visit_id, ordered_by, imaging_type, body_part, urgency, status, scheduled_time, completed_at, findings, radiologist_id)
SELECT
  'RAD-' || TO_CHAR(NOW() - INTERVAL '18 hours', 'YYYYMMDD') || '-007',
  p.id,
  pv.id,
  (SELECT id FROM hospital_staff WHERE email = 'david.anderson@hospitalguard.com'),
  'x_ray',
  'Chest (Post-operative)',
  'stat',
  'completed',
  NOW() - INTERVAL '18 hours',
  NOW() - INTERVAL '17 hours',
  'Post-operative chest radiograph. Sternotomy wires intact and well-aligned. Mediastinal contours normal. No pneumothorax or significant pleural effusion. Small left basilar atelectasis. Cardiac silhouette mildly enlarged (expected post-cardiac surgery). Impression: Satisfactory post-CABG appearance.',
  (SELECT id FROM hospital_staff WHERE email = 'brandon.richardson@hospitalguard.com')
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'david.omondi@email.com'
  AND pv.visit_number LIKE 'V-ICU-%'
LIMIT 1;

-- ============================================================================
-- ADDITIONAL MEDICAL RECORDS (Detailed history)
-- ============================================================================

-- Grace Njeri - Previous visit
INSERT INTO medical_records (patient_id, record_type, title, description, doctor_id, department_id, created_at)
SELECT
  p.id,
  'consultation',
  'Upper Respiratory Infection Treatment',
  'Patient presented with sore throat, nasal congestion, and mild fever. Physical exam revealed pharyngeal erythema without exudate. Lungs clear. Diagnosed with viral upper respiratory infection. Prescribed supportive care with prednisone taper and antibiotics (Amoxicillin) due to concurrent sinusitis symptoms. Patient advised to rest, hydrate, and follow up if symptoms worsen.',
  (SELECT id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Outpatient'),
  NOW() - INTERVAL '3 days'
FROM patients p WHERE p.email = 'grace.njeri@email.com';

-- Elizabeth Chebet - Cardiology consult
INSERT INTO medical_records (patient_id, record_type, title, description, doctor_id, department_id, created_at)
SELECT
  p.id,
  'consultation',
  'New Onset Atrial Fibrillation Management',
  'Patient presented with palpitations and irregular heart rhythm. ECG confirmed atrial fibrillation with rapid ventricular response (rate 110-145 bpm). Echocardiogram showed preserved EF with mild LA enlargement. CHA2DS2-VASc score: 2 (warrants anticoagulation). Started on Metoprolol for rate control and Warfarin for stroke prevention. Patient educated on INR monitoring, dietary considerations, and signs of bleeding. Close follow-up arranged.',
  (SELECT id FROM hospital_staff WHERE email = 'nancy.campbell@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Cardiology'),
  NOW() - INTERVAL '15 days'
FROM patients p WHERE p.email = 'elizabeth.chebet@email.com';

-- Anthony Wekesa - Neurology assessment
INSERT INTO medical_records (patient_id, record_type, title, description, doctor_id, department_id, created_at)
SELECT
  p.id,
  'diagnosis',
  'Chronic Migraine without Aura',
  'Patient has 4-year history of recurrent headaches, occurring 15+ days per month. Headaches described as unilateral, throbbing, moderate-to-severe intensity, lasting 4-72 hours. Associated with photophobia and nausea. Triggers include stress, lack of sleep, certain foods. Neurological exam normal. No red flags for secondary headache. Diagnosis: Chronic Migraine without Aura. Treatment plan includes prophylactic therapy with Escitalopram, acute treatment with Acetaminophen, lifestyle modifications, and stress management. Vitamin D supplementation recommended for deficiency. Brain MRI ordered to rule out structural causes.',
  (SELECT id FROM hospital_staff WHERE email = 'barbara.evans@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Neurology'),
  NOW() - INTERVAL '26 days'
FROM patients p WHERE p.email = 'anthony.wekesa@email.com';

-- David Omondi - Surgery note
INSERT INTO medical_records (patient_id, visit_id, record_type, title, description, doctor_id, department_id, created_at)
SELECT
  p.id,
  pv.id,
  'surgery',
  'Coronary Artery Bypass Graft (CABG) Procedure Note',
  'PROCEDURE: Triple vessel coronary artery bypass grafting (CABG x3)\n\nINDICATION: Severe triple vessel coronary artery disease with unstable angina\n\nPROCEDURE DETAILS: Patient underwent sternotomy under general anesthesia. Cardiopulmonary bypass established. Aortic cross-clamp applied. Grafts: LIMA to LAD, SVG to OM, SVG to RCA. All anastomoses completed successfully. Excellent flow through all grafts confirmed. Cross-clamp time: 65 minutes. Total bypass time: 98 minutes.\n\nCOMPLICATIONS: None\n\nEBL: 450 mL\n\nPOST-OP PLAN: ICU monitoring, mechanical ventilation weaning, hemodynamic management, cardiac rehabilitation consult. Discharged ICU on post-op day 3.',
  (SELECT id FROM hospital_staff WHERE email = 'patricia.lewis@hospitalguard.com'),
  (SELECT id FROM departments WHERE name = 'Surgery'),
  NOW() - INTERVAL '2 days'
FROM patients p
JOIN patient_visits pv ON pv.patient_id = p.id
WHERE p.email = 'david.omondi@email.com'
  AND pv.visit_number LIKE 'V-ICU-%'
LIMIT 1;

-- ============================================================================
-- ADDITIONAL BILLS & FINANCIAL DATA (Comprehensive billing)
-- ============================================================================

-- Grace Njeri - Outpatient consultation bill (Pending)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, total_amount, amount_paid, amount_due, insurance_covered, status, due_date)
  SELECT
    'BILL-' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDD') || '-004',
    p.id,
    7500.00,
    0.00,
    7500.00,
    5250.00,
    'insurance_pending',
    NOW() + INTERVAL '28 days'
  FROM patients p WHERE p.email = 'grace.njeri@email.com'
  RETURNING id
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'consultation',
  'General Medical Consultation',
  1,
  4000.00,
  4000.00,
  (SELECT id FROM departments WHERE name = 'Outpatient')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'medication',
  'Antibiotic Prescription (Amoxicillin)',
  1,
  1500.00,
  1500.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'medication',
  'Corticosteroid (Prednisone)',
  1,
  2000.00,
  2000.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb;

-- Elizabeth Chebet - Cardiology workup (Partially paid)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, total_amount, amount_paid, amount_due, insurance_covered, status, due_date)
  SELECT
    'BILL-' || TO_CHAR(NOW() - INTERVAL '14 days', 'YYYYMMDD') || '-005',
    p.id,
    45000.00,
    20000.00,
    25000.00,
    20000.00,
    'partially_paid',
    NOW() + INTERVAL '16 days'
  FROM patients p WHERE p.email = 'elizabeth.chebet@email.com'
  RETURNING id, patient_id
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'consultation',
  'Cardiology Specialist Consultation',
  1,
  8000.00,
  8000.00,
  (SELECT id FROM departments WHERE name = 'Cardiology')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'radiology',
  'Echocardiogram',
  1,
  15000.00,
  15000.00,
  (SELECT id FROM departments WHERE name = 'Radiology')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Cardiac Biomarkers Panel',
  1,
  8000.00,
  8000.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Lipid Panel',
  1,
  4000.00,
  4000.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'medication',
  'Cardiac Medications (3-month supply)',
  1,
  10000.00,
  10000.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb;

-- Payment for Elizabeth Chebet
INSERT INTO payments (payment_number, bill_id, amount, payment_method, payment_reference, payment_status, received_by, created_at)
SELECT
  'PAY-' || TO_CHAR(NOW() - INTERVAL '14 days', 'YYYYMMDD') || '-002',
  b.id,
  20000.00,
  'mobile_money',
  'MPESA-' || TO_CHAR(NOW() - INTERVAL '14 days', 'YYYYMMDDHHMI'),
  'completed',
  (SELECT id FROM hospital_staff WHERE email = 'olivia.ross@hospitalguard.com'),
  NOW() - INTERVAL '14 days'
FROM bills b
JOIN patients p ON p.id = b.patient_id
WHERE p.email = 'elizabeth.chebet@email.com'
  AND b.bill_number LIKE 'BILL-%14%'
LIMIT 1;

-- David Omondi - Major surgery bill (Insurance pending, high-cost case)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, visit_id, total_amount, amount_paid, amount_due, insurance_covered, status, due_date, notes)
  SELECT
    'BILL-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-006',
    p.id,
    pv.id,
    2850000.00,
    50000.00,
    2800000.00,
    2565000.00,
    'insurance_pending',
    NOW() + INTERVAL '60 days',
    'Major cardiac surgery. Insurance pre-authorization obtained. 90% coverage. Patient responsible for 10% co-payment.'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'david.omondi@email.com'
    AND pv.visit_number LIKE 'V-ICU-%'
  LIMIT 1
  RETURNING id
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'surgery',
  'Coronary Artery Bypass Graft (CABG x3) - Surgical Fee',
  1,
  1500000.00,
  1500000.00,
  (SELECT id FROM departments WHERE name = 'Surgery')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'room_charge',
  'ICU Room & Monitoring (3 days)',
  3,
  150000.00,
  450000.00,
  (SELECT id FROM departments WHERE name = 'Intensive Care Unit (ICU)')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'procedure',
  'Anesthesiology Services',
  1,
  200000.00,
  200000.00,
  (SELECT id FROM departments WHERE name = 'Surgery')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'procedure',
  'Cardiopulmonary Bypass',
  1,
  300000.00,
  300000.00,
  (SELECT id FROM departments WHERE name = 'Surgery')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Pre-operative & Post-operative Lab Tests',
  1,
  50000.00,
  50000.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'radiology',
  'Cardiac Imaging Studies',
  1,
  80000.00,
  80000.00,
  (SELECT id FROM departments WHERE name = 'Radiology')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'medication',
  'Post-operative Medications & Supplies',
  1,
  120000.00,
  120000.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'other',
  'Medical Equipment & Disposables',
  1,
  150000.00,
  150000.00,
  (SELECT id FROM departments WHERE name = 'Surgery')
FROM new_bill nb;

-- Initial payment for David Omondi (Deposit)
INSERT INTO payments (payment_number, bill_id, amount, payment_method, payment_reference, payment_status, received_by, notes, created_at)
SELECT
  'PAY-' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDD') || '-003',
  b.id,
  50000.00,
  'card',
  'CARD-' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDDHHMI'),
  'completed',
  (SELECT id FROM hospital_staff WHERE email = 'olivia.ross@hospitalguard.com'),
  'Initial deposit for cardiac surgery. Balance pending insurance processing.',
  NOW() - INTERVAL '2 days'
FROM bills b
JOIN patients p ON p.id = b.patient_id
WHERE p.email = 'david.omondi@email.com'
  AND b.bill_number LIKE 'BILL-%' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '%'
LIMIT 1;

-- Nancy Wairimu - Dermatology consultation (Fully paid)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, total_amount, amount_paid, amount_due, insurance_covered, status, due_date)
  SELECT
    'BILL-' || TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDD') || '-007',
    p.id,
    12000.00,
    12000.00,
    0.00,
    8400.00,
    'paid',
    NOW() - INTERVAL '7 days'
  FROM patients p WHERE p.email = 'nancy.wairimu@email.com'
  RETURNING id
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'consultation',
  'Dermatology Consultation',
  1,
  5000.00,
  5000.00,
  (SELECT id FROM departments WHERE name = 'Dermatology')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Allergy Panel Testing',
  1,
  5000.00,
  5000.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'medication',
  'Allergy Medication (Inhaler)',
  1,
  2000.00,
  2000.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb;

-- Payment for Nancy Wairimu
INSERT INTO payments (payment_number, bill_id, amount, payment_method, payment_reference, payment_status, received_by, created_at)
SELECT
  'PAY-' || TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDD') || '-004',
  b.id,
  3600.00,
  'cash',
  'CASH-' || TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDDHHMI'),
  'completed',
  (SELECT id FROM hospital_staff WHERE email = 'nathan.henderson@hospitalguard.com'),
  NOW() - INTERVAL '7 days'
FROM bills b
JOIN patients p ON p.id = b.patient_id
WHERE p.email = 'nancy.wairimu@email.com'
  AND b.bill_number LIKE 'BILL-%7%'
LIMIT 1;

-- Mary Akinyi - Maternity care (Ongoing billing)
WITH new_bill AS (
  INSERT INTO bills (bill_number, patient_id, visit_id, total_amount, amount_paid, amount_due, insurance_covered, status, due_date, notes)
  SELECT
    'BILL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-008',
    p.id,
    pv.id,
    9000.00,
    6300.00,
    2700.00,
    6300.00,
    'partially_paid',
    NOW() + INTERVAL '30 days',
    'Prenatal care visit. Part of maternity package. Insurance covering 70%.'
  FROM patients p
  JOIN patient_visits pv ON pv.patient_id = p.id
  WHERE p.email = 'mary.akinyi@email.com'
    AND pv.visit_number LIKE 'V-MAT-%'
  LIMIT 1
  RETURNING id
)
INSERT INTO bill_items (bill_id, item_type, description, quantity, unit_price, total_price, department_id)
SELECT
  nb.id,
  'consultation',
  'Prenatal Consultation - 28 weeks',
  1,
  5000.00,
  5000.00,
  (SELECT id FROM departments WHERE name = 'Maternity')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'lab_test',
  'Glucose Screening Test',
  1,
  3000.00,
  3000.00,
  (SELECT id FROM departments WHERE name = 'Laboratory')
FROM new_bill nb
UNION ALL
SELECT
  nb.id,
  'other',
  'Prenatal Vitamins',
  1,
  1000.00,
  1000.00,
  (SELECT id FROM departments WHERE name = 'Pharmacy')
FROM new_bill nb;

-- Payment for Mary Akinyi (Insurance)
INSERT INTO payments (payment_number, bill_id, amount, payment_method, payment_reference, payment_status, received_by, created_at)
SELECT
  'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-005',
  b.id,
  6300.00,
  'insurance',
  'CIC-CLM-' || TO_CHAR(NOW(), 'YYYYMMDD'),
  'completed',
  (SELECT id FROM hospital_staff WHERE email = 'emma.coleman@hospitalguard.com'),
  NOW()
FROM bills b
JOIN patients p ON p.id = b.patient_id
WHERE p.email = 'mary.akinyi@email.com'
  AND b.bill_number LIKE 'BILL-%' || TO_CHAR(NOW(), 'YYYYMMDD') || '%'
LIMIT 1;

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================

DO $$
DECLARE
  total_appointments INTEGER;
  total_prescriptions INTEGER;
  total_labs INTEGER;
  total_radiology INTEGER;
  total_bills INTEGER;
  total_revenue DECIMAL(12,2);
  pending_revenue DECIMAL(12,2);
BEGIN
  SELECT COUNT(*) INTO total_appointments FROM appointments WHERE appointment_number LIKE 'APT-%';
  SELECT COUNT(*) INTO total_prescriptions FROM prescriptions WHERE prescription_number LIKE 'RX-%';
  SELECT COUNT(*) INTO total_labs FROM lab_orders WHERE order_number LIKE 'LAB-%';
  SELECT COUNT(*) INTO total_radiology FROM radiology_orders WHERE order_number LIKE 'RAD-%';
  SELECT COUNT(*) INTO total_bills FROM bills WHERE bill_number LIKE 'BILL-%';
  SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue FROM bills WHERE bill_number LIKE 'BILL-%';
  SELECT COALESCE(SUM(amount_due), 0) INTO pending_revenue FROM bills WHERE bill_number LIKE 'BILL-%' AND status IN ('pending', 'partially_paid', 'insurance_pending');

  RAISE NOTICE '========================================';
  RAISE NOTICE 'ENHANCED Patient Data Summary';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Appointments: %', total_appointments;
  RAISE NOTICE 'Total Prescriptions: %', total_prescriptions;
  RAISE NOTICE 'Total Lab Orders: %', total_labs;
  RAISE NOTICE 'Total Radiology Orders: %', total_radiology;
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'FINANCIAL SUMMARY';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Total Bills: %', total_bills;
  RAISE NOTICE 'Total Revenue: KES %', total_revenue;
  RAISE NOTICE 'Pending Collections: KES %', pending_revenue;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Enhanced Data Loaded Successfully!';
  RAISE NOTICE '========================================';
END $$;
