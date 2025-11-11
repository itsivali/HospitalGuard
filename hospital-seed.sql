-- ============================================================================
-- HospitalGuard: Comprehensive Seed Data
-- ============================================================================
-- Level 1 Trauma Center - Complete hospital setup with departments, staff,
-- and pharmacy inventory
-- Version: 1.0
-- Last Updated: 2025
-- ============================================================================

-- ============================================================================
-- DEPARTMENTS (20 Total)
-- ============================================================================

INSERT INTO departments (name, description, floor_number, department_type, phone) VALUES
('Emergency', 'Emergency Department - 24/7 trauma and emergency care with Level 1 capabilities', 1, 'emergency', '+1-555-0100'),
('Intensive Care Unit (ICU)', 'Critical care unit for severely ill patients requiring constant monitoring', 3, 'icu', '+1-555-0103'),
('Outpatient', 'Outpatient services for consultations and minor procedures', 1, 'outpatient', '+1-555-0101'),
('Surgery', 'Surgical department with multiple operating rooms and specialized surgical teams', 4, 'surgery', '+1-555-0104'),
('Maternity', 'Comprehensive maternity and obstetrics care including NICU', 2, 'maternity', '+1-555-0102'),
('Pediatrics', 'Specialized care for infants, children, and adolescents', 2, 'pediatrics', '+1-555-0112'),
('Mental Health', 'Psychiatric and mental health services with crisis intervention', 5, 'mental_health', '+1-555-0105'),
('Laboratory', 'Clinical laboratory with advanced diagnostic capabilities', 1, 'laboratory', '+1-555-0106'),
('Radiology', 'Medical imaging including CT, MRI, X-Ray, and ultrasound', 1, 'radiology', '+1-555-0107'),
('Pharmacy', 'Hospital pharmacy with 24/7 medication dispensing', 1, 'pharmacy', '+1-555-0108'),
('Billing', 'Patient financial services and insurance processing', 1, 'billing', '+1-555-0109'),
('Cardiology', 'Specialized cardiac care and intervention', 3, 'outpatient', '+1-555-0113'),
('Neurology', 'Neurological care and stroke unit', 3, 'outpatient', '+1-555-0114'),
('Orthopedics', 'Bone, joint, and musculoskeletal care', 4, 'surgery', '+1-555-0115'),
('Oncology', 'Cancer treatment and care', 5, 'outpatient', '+1-555-0116'),
('Nephrology', 'Kidney disease and dialysis services', 3, 'outpatient', '+1-555-0117'),
('Gastroenterology', 'Digestive system and liver care', 2, 'outpatient', '+1-555-0118'),
('Pulmonology', 'Respiratory and lung care', 3, 'outpatient', '+1-555-0119'),
('Endocrinology', 'Hormone and metabolic disorders', 2, 'outpatient', '+1-555-0120'),
('Dermatology', 'Skin care and dermatological procedures', 2, 'outpatient', '+1-555-0121')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  floor_number = EXCLUDED.floor_number,
  department_type = EXCLUDED.department_type,
  phone = EXCLUDED.phone;

-- ============================================================================
-- EMERGENCY DEPARTMENT STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Michael', 'Chen', 'michael.chen@hospitalguard.com', '+1-555-1001', 'doctor', 'Emergency Medicine', 'MD-EM-001', id, 'both', true
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Sarah', 'Williams', 'sarah.williams@hospitalguard.com', '+1-555-1002', 'doctor', 'Emergency Medicine', 'MD-EM-002', id, 'both', true
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'James', 'Martinez', 'james.martinez@hospitalguard.com', '+1-555-1003', 'doctor', 'Trauma Surgery', 'MD-EM-003', id, 'both', true
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Emily', 'Johnson', 'emily.johnson@hospitalguard.com', '+1-555-1004', 'doctor', 'Emergency Medicine', 'MD-EM-004', id, 'both', true
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- Emergency Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Jennifer', 'Davis', 'jennifer.davis@hospitalguard.com', '+1-555-1005', 'nurse', 'Emergency Nursing', 'RN-EM-001', id, 'both', true
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Robert', 'Brown', 'robert.brown@hospitalguard.com', '+1-555-1006', 'nurse', 'Trauma Nursing', 'RN-EM-002', id, 'both', true
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- ICU STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'David', 'Anderson', 'david.anderson@hospitalguard.com', '+1-555-2001', 'doctor', 'Critical Care Medicine', 'MD-ICU-001', id, 'both', true
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Lisa', 'Thompson', 'lisa.thompson@hospitalguard.com', '+1-555-2002', 'doctor', 'Pulmonology & Critical Care', 'MD-ICU-002', id, 'both', true
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Mark', 'Garcia', 'mark.garcia@hospitalguard.com', '+1-555-2003', 'doctor', 'Critical Care Medicine', 'MD-ICU-003', id, 'both', true
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ICU Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Amanda', 'Wilson', 'amanda.wilson@hospitalguard.com', '+1-555-2004', 'nurse', 'Critical Care Nursing', 'RN-ICU-001', id, 'both', true
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Christopher', 'Lee', 'christopher.lee@hospitalguard.com', '+1-555-2005', 'nurse', 'Critical Care Nursing', 'RN-ICU-002', id, 'both', true
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- OUTPATIENT STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Jessica', 'Moore', 'jessica.moore@hospitalguard.com', '+1-555-3001', 'doctor', 'General Practice', 'MD-OP-001', id, 'outpatient', true
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Daniel', 'Taylor', 'daniel.taylor@hospitalguard.com', '+1-555-3002', 'doctor', 'Internal Medicine', 'MD-OP-002', id, 'outpatient', true
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Rachel', 'White', 'rachel.white@hospitalguard.com', '+1-555-3003', 'doctor', 'Family Medicine', 'MD-OP-003', id, 'outpatient', true
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Kevin', 'Harris', 'kevin.harris@hospitalguard.com', '+1-555-3004', 'doctor', 'General Practice', 'MD-OP-004', id, 'outpatient', true
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- SURGERY STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Richard', 'Clark', 'richard.clark@hospitalguard.com', '+1-555-4001', 'doctor', 'General Surgery', 'MD-SG-001', id, 'both', true
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Patricia', 'Lewis', 'patricia.lewis@hospitalguard.com', '+1-555-4002', 'doctor', 'Cardiothoracic Surgery', 'MD-SG-002', id, 'both', true
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Thomas', 'Walker', 'thomas.walker@hospitalguard.com', '+1-555-4003', 'doctor', 'Neurosurgery', 'MD-SG-003', id, 'both', true
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Michelle', 'Hall', 'michelle.hall@hospitalguard.com', '+1-555-4004', 'doctor', 'Orthopedic Surgery', 'MD-SG-004', id, 'both', true
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Steven', 'Allen', 'steven.allen@hospitalguard.com', '+1-555-4005', 'doctor', 'Vascular Surgery', 'MD-SG-005', id, 'both', true
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- Surgical Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Nicole', 'Young', 'nicole.young@hospitalguard.com', '+1-555-4006', 'nurse', 'Perioperative Nursing', 'RN-SG-001', id, 'both', true
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- MATERNITY STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Catherine', 'King', 'catherine.king@hospitalguard.com', '+1-555-5001', 'obstetrician', 'Obstetrics & Gynecology', 'MD-OB-001', id, 'both', true
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Andrew', 'Wright', 'andrew.wright@hospitalguard.com', '+1-555-5002', 'obstetrician', 'Maternal-Fetal Medicine', 'MD-OB-002', id, 'both', true
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Maria', 'Lopez', 'maria.lopez@hospitalguard.com', '+1-555-5003', 'obstetrician', 'Obstetrics & Gynecology', 'MD-OB-003', id, 'both', true
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- Maternity Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Karen', 'Scott', 'karen.scott@hospitalguard.com', '+1-555-5004', 'nurse', 'Labor & Delivery', 'RN-OB-001', id, 'both', true
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Donna', 'Green', 'donna.green@hospitalguard.com', '+1-555-5005', 'nurse', 'Neonatal Nursing', 'RN-OB-002', id, 'both', true
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- PEDIATRICS STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Laura', 'Adams', 'laura.adams@hospitalguard.com', '+1-555-6001', 'doctor', 'Pediatrics', 'MD-PD-001', id, 'both', true
FROM departments WHERE name = 'Pediatrics'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Brian', 'Baker', 'brian.baker@hospitalguard.com', '+1-555-6002', 'doctor', 'Pediatric Emergency Medicine', 'MD-PD-002', id, 'both', true
FROM departments WHERE name = 'Pediatrics'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Angela', 'Nelson', 'angela.nelson@hospitalguard.com', '+1-555-6003', 'doctor', 'Pediatrics', 'MD-PD-003', id, 'both', true
FROM departments WHERE name = 'Pediatrics'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- Pediatric Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Melissa', 'Carter', 'melissa.carter@hospitalguard.com', '+1-555-6004', 'nurse', 'Pediatric Nursing', 'RN-PD-001', id, 'both', true
FROM departments WHERE name = 'Pediatrics'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- MENTAL HEALTH STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Jonathan', 'Mitchell', 'jonathan.mitchell@hospitalguard.com', '+1-555-7001', 'psychiatrist', 'General Psychiatry', 'MD-PSY-001', id, 'both', true
FROM departments WHERE name = 'Mental Health'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Elizabeth', 'Perez', 'elizabeth.perez@hospitalguard.com', '+1-555-7002', 'psychiatrist', 'Child & Adolescent Psychiatry', 'MD-PSY-002', id, 'both', true
FROM departments WHERE name = 'Mental Health'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Anthony', 'Roberts', 'anthony.roberts@hospitalguard.com', '+1-555-7003', 'psychiatrist', 'Addiction Psychiatry', 'MD-PSY-003', id, 'both', true
FROM departments WHERE name = 'Mental Health'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- Mental Health Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Sandra', 'Turner', 'sandra.turner@hospitalguard.com', '+1-555-7004', 'nurse', 'Psychiatric Nursing', 'RN-PSY-001', id, 'both', true
FROM departments WHERE name = 'Mental Health'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- CARDIOLOGY STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'William', 'Phillips', 'william.phillips@hospitalguard.com', '+1-555-8001', 'doctor', 'Cardiology', 'MD-CAR-001', id, 'both', true
FROM departments WHERE name = 'Cardiology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Nancy', 'Campbell', 'nancy.campbell@hospitalguard.com', '+1-555-8002', 'doctor', 'Interventional Cardiology', 'MD-CAR-002', id, 'both', true
FROM departments WHERE name = 'Cardiology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'George', 'Parker', 'george.parker@hospitalguard.com', '+1-555-8003', 'doctor', 'Electrophysiology', 'MD-CAR-003', id, 'both', true
FROM departments WHERE name = 'Cardiology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- NEUROLOGY STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Barbara', 'Evans', 'barbara.evans@hospitalguard.com', '+1-555-9001', 'doctor', 'Neurology', 'MD-NEU-001', id, 'both', true
FROM departments WHERE name = 'Neurology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Paul', 'Edwards', 'paul.edwards@hospitalguard.com', '+1-555-9002', 'doctor', 'Stroke & Vascular Neurology', 'MD-NEU-002', id, 'both', true
FROM departments WHERE name = 'Neurology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Helen', 'Collins', 'helen.collins@hospitalguard.com', '+1-555-9003', 'doctor', 'Neurology', 'MD-NEU-003', id, 'both', true
FROM departments WHERE name = 'Neurology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- ORTHOPEDICS STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Charles', 'Stewart', 'charles.stewart@hospitalguard.com', '+1-555-1101', 'doctor', 'Orthopedic Surgery', 'MD-ORT-001', id, 'both', true
FROM departments WHERE name = 'Orthopedics'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Margaret', 'Sanchez', 'margaret.sanchez@hospitalguard.com', '+1-555-1102', 'doctor', 'Sports Medicine', 'MD-ORT-002', id, 'both', true
FROM departments WHERE name = 'Orthopedics'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Joseph', 'Morris', 'joseph.morris@hospitalguard.com', '+1-555-1103', 'doctor', 'Joint Replacement', 'MD-ORT-003', id, 'both', true
FROM departments WHERE name = 'Orthopedics'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- ONCOLOGY STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Susan', 'Rogers', 'susan.rogers@hospitalguard.com', '+1-555-1201', 'doctor', 'Medical Oncology', 'MD-ONC-001', id, 'both', true
FROM departments WHERE name = 'Oncology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Donald', 'Reed', 'donald.reed@hospitalguard.com', '+1-555-1202', 'doctor', 'Radiation Oncology', 'MD-ONC-002', id, 'both', true
FROM departments WHERE name = 'Oncology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Carol', 'Cook', 'carol.cook@hospitalguard.com', '+1-555-1203', 'doctor', 'Surgical Oncology', 'MD-ONC-003', id, 'both', true
FROM departments WHERE name = 'Oncology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- LABORATORY STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Timothy', 'Morgan', 'timothy.morgan@hospitalguard.com', '+1-555-1301', 'lab_tech', 'Clinical Laboratory Science', 'MLT-001', id, 'both', true
FROM departments WHERE name = 'Laboratory'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Betty', 'Bell', 'betty.bell@hospitalguard.com', '+1-555-1302', 'lab_tech', 'Hematology', 'MLT-002', id, 'both', true
FROM departments WHERE name = 'Laboratory'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Jason', 'Murphy', 'jason.murphy@hospitalguard.com', '+1-555-1303', 'lab_tech', 'Microbiology', 'MLT-003', id, 'both', true
FROM departments WHERE name = 'Laboratory'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Dorothy', 'Bailey', 'dorothy.bailey@hospitalguard.com', '+1-555-1304', 'lab_tech', 'Chemistry', 'MLT-004', id, 'both', true
FROM departments WHERE name = 'Laboratory'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- RADIOLOGY STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Ryan', 'Rivera', 'ryan.rivera@hospitalguard.com', '+1-555-1401', 'radiologist', 'Diagnostic Radiology', 'MD-RAD-001', id, 'both', true
FROM departments WHERE name = 'Radiology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Deborah', 'Cooper', 'deborah.cooper@hospitalguard.com', '+1-555-1402', 'radiologist', 'Interventional Radiology', 'MD-RAD-002', id, 'both', true
FROM departments WHERE name = 'Radiology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Brandon', 'Richardson', 'brandon.richardson@hospitalguard.com', '+1-555-1403', 'radiologist', 'Neuroradiology', 'MD-RAD-003', id, 'both', true
FROM departments WHERE name = 'Radiology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- PHARMACY STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Amy', 'Cox', 'amy.cox@hospitalguard.com', '+1-555-1501', 'pharmacist', 'Clinical Pharmacy', 'RPH-001', id, 'both', true
FROM departments WHERE name = 'Pharmacy'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Adam', 'Howard', 'adam.howard@hospitalguard.com', '+1-555-1502', 'pharmacist', 'Hospital Pharmacy', 'RPH-002', id, 'both', true
FROM departments WHERE name = 'Pharmacy'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Stephanie', 'Ward', 'stephanie.ward@hospitalguard.com', '+1-555-1503', 'pharmacist', 'Oncology Pharmacy', 'RPH-003', id, 'both', true
FROM departments WHERE name = 'Pharmacy'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Benjamin', 'Torres', 'benjamin.torres@hospitalguard.com', '+1-555-1504', 'pharmacist', 'Critical Care Pharmacy', 'RPH-004', id, 'both', true
FROM departments WHERE name = 'Pharmacy'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- ADDITIONAL SPECIALTY STAFF
-- ============================================================================

-- Nephrology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Rebecca', 'Peterson', 'rebecca.peterson@hospitalguard.com', '+1-555-1601', 'doctor', 'Nephrology', 'MD-NEP-001', id, 'both', true
FROM departments WHERE name = 'Nephrology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Eric', 'Gray', 'eric.gray@hospitalguard.com', '+1-555-1602', 'doctor', 'Nephrology & Dialysis', 'MD-NEP-002', id, 'both', true
FROM departments WHERE name = 'Nephrology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- Gastroenterology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Christine', 'Ramirez', 'christine.ramirez@hospitalguard.com', '+1-555-1701', 'doctor', 'Gastroenterology', 'MD-GAS-001', id, 'both', true
FROM departments WHERE name = 'Gastroenterology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Peter', 'James', 'peter.james@hospitalguard.com', '+1-555-1702', 'doctor', 'Hepatology', 'MD-GAS-002', id, 'both', true
FROM departments WHERE name = 'Gastroenterology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- Pulmonology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Samantha', 'Watson', 'samantha.watson@hospitalguard.com', '+1-555-1801', 'doctor', 'Pulmonology', 'MD-PUL-001', id, 'both', true
FROM departments WHERE name = 'Pulmonology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Gary', 'Brooks', 'gary.brooks@hospitalguard.com', '+1-555-1802', 'doctor', 'Pulmonary Critical Care', 'MD-PUL-002', id, 'both', true
FROM departments WHERE name = 'Pulmonology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- Endocrinology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Julie', 'Kelly', 'julie.kelly@hospitalguard.com', '+1-555-1901', 'doctor', 'Endocrinology', 'MD-END-001', id, 'both', true
FROM departments WHERE name = 'Endocrinology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Scott', 'Sanders', 'scott.sanders@hospitalguard.com', '+1-555-1902', 'doctor', 'Diabetes & Metabolism', 'MD-END-002', id, 'both', true
FROM departments WHERE name = 'Endocrinology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- Dermatology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Victoria', 'Price', 'victoria.price@hospitalguard.com', '+1-555-2001', 'doctor', 'Dermatology', 'MD-DER-001', id, 'both', true
FROM departments WHERE name = 'Dermatology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Kyle', 'Bennett', 'kyle.bennett@hospitalguard.com', '+1-555-2002', 'doctor', 'Dermatopathology', 'MD-DER-002', id, 'both', true
FROM departments WHERE name = 'Dermatology'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- ADMINISTRATIVE STAFF
-- ============================================================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Hannah', 'Wood', 'hannah.wood@hospitalguard.com', '+1-555-9001', 'receptionist', 'Front Desk', 'ADM-001', id, 'both', true
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Tyler', 'Barnes', 'tyler.barnes@hospitalguard.com', '+1-555-9002', 'receptionist', 'Patient Registration', 'ADM-002', id, 'both', true
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Olivia', 'Ross', 'olivia.ross@hospitalguard.com', '+1-555-9101', 'billing', 'Medical Billing', 'BIL-001', id, 'both', true
FROM departments WHERE name = 'Billing'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Nathan', 'Henderson', 'nathan.henderson@hospitalguard.com', '+1-555-9102', 'billing', 'Insurance Processing', 'BIL-002', id, 'both', true
FROM departments WHERE name = 'Billing'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, patient_care_type, is_active)
SELECT 'Emma', 'Coleman', 'emma.coleman@hospitalguard.com', '+1-555-9103', 'billing', 'Financial Services', 'BIL-003', id, 'both', true
FROM departments WHERE name = 'Billing'
ON CONFLICT (email) DO UPDATE SET department_id = EXCLUDED.department_id;

-- ============================================================================
-- PHARMACY INVENTORY (35+ ESSENTIAL MEDICATIONS)
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, manufacturer, quantity_available, unit_price, reorder_level, storage_location, is_controlled_substance, requires_prescription) VALUES
-- Pain Management
('Acetaminophen 500mg', 'Acetaminophen', 'Generic Pharma', 5000, 0.15, 500, 'A1', false, false),
('Ibuprofen 400mg', 'Ibuprofen', 'Generic Pharma', 4500, 0.20, 500, 'A2', false, false),
('Morphine 10mg', 'Morphine Sulfate', 'Brand Pharma', 500, 5.50, 100, 'Controlled-A', true, true),
('Oxycodone 5mg', 'Oxycodone HCl', 'Brand Pharma', 300, 8.00, 50, 'Controlled-B', true, true),

-- Antibiotics
('Amoxicillin 500mg', 'Amoxicillin', 'Generic Pharma', 3000, 0.50, 300, 'B1', false, true),
('Azithromycin 250mg', 'Azithromycin', 'Generic Pharma', 2000, 1.20, 200, 'B2', false, true),
('Cephalexin 500mg', 'Cephalexin', 'Generic Pharma', 2500, 0.80, 250, 'B3', false, true),
('Ciprofloxacin 500mg', 'Ciprofloxacin HCl', 'Generic Pharma', 1500, 1.50, 150, 'B4', false, true),
('Metronidazole 500mg', 'Metronidazole', 'Generic Pharma', 1800, 0.70, 180, 'B5', false, true),

-- Cardiovascular
('Aspirin 81mg', 'Aspirin', 'Generic Pharma', 8000, 0.05, 800, 'C1', false, false),
('Atorvastatin 20mg', 'Atorvastatin', 'Generic Pharma', 3500, 0.90, 350, 'C2', false, true),
('Lisinopril 10mg', 'Lisinopril', 'Generic Pharma', 3000, 0.45, 300, 'C3', false, true),
('Metoprolol 50mg', 'Metoprolol Tartrate', 'Generic Pharma', 2800, 0.60, 280, 'C4', false, true),
('Warfarin 5mg', 'Warfarin Sodium', 'Brand Pharma', 1200, 1.80, 120, 'C5', false, true),

-- Diabetes
('Metformin 500mg', 'Metformin HCl', 'Generic Pharma', 4000, 0.35, 400, 'D1', false, true),
('Insulin Glargine 100U/mL', 'Insulin Glargine', 'Brand Pharma', 200, 45.00, 30, 'Refrigerated-A', false, true),
('Insulin Lispro 100U/mL', 'Insulin Lispro', 'Brand Pharma', 180, 42.00, 30, 'Refrigerated-B', false, true),

-- Respiratory
('Albuterol Inhaler', 'Albuterol Sulfate', 'Brand Pharma', 500, 25.00, 50, 'E1', false, true),
('Fluticasone Inhaler', 'Fluticasone Propionate', 'Brand Pharma', 300, 55.00, 30, 'E2', false, true),
('Prednisone 20mg', 'Prednisone', 'Generic Pharma', 2000, 0.40, 200, 'E3', false, true),

-- Gastrointestinal
('Omeprazole 20mg', 'Omeprazole', 'Generic Pharma', 3500, 0.65, 350, 'F1', false, true),
('Pantoprazole 40mg', 'Pantoprazole', 'Generic Pharma', 2800, 0.85, 280, 'F2', false, true),
('Ondansetron 4mg', 'Ondansetron', 'Generic Pharma', 1500, 1.20, 150, 'F3', false, true),

-- Anticoagulation
('Heparin 5000U/mL', 'Heparin Sodium', 'Brand Pharma', 300, 12.00, 50, 'G1', false, true),
('Enoxaparin 40mg', 'Enoxaparin Sodium', 'Brand Pharma', 250, 18.00, 40, 'G2', false, true),

-- Emergency Medications
('Epinephrine 1mg/mL', 'Epinephrine', 'Brand Pharma', 200, 15.00, 30, 'Emergency-A', false, true),
('Naloxone 0.4mg/mL', 'Naloxone HCl', 'Brand Pharma', 150, 25.00, 25, 'Emergency-B', false, true),
('Atropine 1mg/mL', 'Atropine Sulfate', 'Brand Pharma', 100, 8.00, 20, 'Emergency-C', false, true),

-- Psychiatric
('Sertraline 50mg', 'Sertraline HCl', 'Generic Pharma', 2500, 0.75, 250, 'H1', false, true),
('Escitalopram 10mg', 'Escitalopram', 'Generic Pharma', 2200, 0.90, 220, 'H2', false, true),
('Lorazepam 1mg', 'Lorazepam', 'Generic Pharma', 800, 1.50, 100, 'Controlled-C', true, true),

-- Others
('Acetylcysteine 200mg', 'Acetylcysteine', 'Generic Pharma', 500, 2.50, 50, 'I1', false, true),
('Vitamin D3 2000IU', 'Cholecalciferol', 'Generic Pharma', 3000, 0.25, 300, 'I2', false, false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION SUMMARY
-- ============================================================================

DO $$
DECLARE
  dept_count INTEGER;
  staff_count INTEGER;
  doctor_count INTEGER;
  inventory_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dept_count FROM departments;
  SELECT COUNT(*) INTO staff_count FROM hospital_staff;
  SELECT COUNT(*) INTO doctor_count FROM hospital_staff
    WHERE staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist');
  SELECT COUNT(*) INTO inventory_count FROM pharmacy_inventory;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'HospitalGuard Seed Data Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Departments: %', dept_count;
  RAISE NOTICE 'Total Staff: %', staff_count;
  RAISE NOTICE 'Medical Doctors: %', doctor_count;
  RAISE NOTICE 'Pharmacy Items: %', inventory_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Level 1 Hospital Ready for Operations!';
  RAISE NOTICE '========================================';
END $$;
