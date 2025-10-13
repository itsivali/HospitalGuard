-- ============================================
-- LEVEL 1 HOSPITAL SEED DATA (SAFE VERSION)
-- ============================================
-- This script safely populates the database with comprehensive departments
-- and qualified medical staff for a Level 1 Trauma Center
-- It uses ON CONFLICT to avoid duplicate key errors

-- ============================================
-- CLEAR EXISTING DATA (OPTIONAL)
-- ============================================
-- Uncomment the following lines if you want to start fresh:
-- TRUNCATE TABLE hospital_staff CASCADE;
-- TRUNCATE TABLE departments CASCADE;
-- TRUNCATE TABLE pharmacy_inventory CASCADE;

-- ============================================
-- DEPARTMENTS
-- ============================================

-- Emergency Department
INSERT INTO departments (name, description, floor_number, department_type, phone) VALUES
('Emergency', 'Emergency Department - 24/7 trauma and emergency care with Level 1 capabilities', 1, 'emergency', '+254 20 210 0100'),
('Intensive Care Unit (ICU)', 'Critical care unit for severely ill patients requiring constant monitoring', 3, 'icu', '+254 20 210 0103'),
('Outpatient', 'Outpatient services for consultations and minor procedures', 1, 'outpatient', '+254 20 210 0101'),
('Surgery', 'Surgical department with multiple operating rooms and specialized surgical teams', 4, 'surgery', '+254 20 210 0104'),
('Maternity', 'Comprehensive maternity and obstetrics care including NICU', 2, 'maternity', '+254 20 210 0102'),
('Pediatrics', 'Specialized care for infants, children, and adolescents', 2, 'pediatrics', '+254 20 210 0112'),
('Mental Health', 'Psychiatric and mental health services with crisis intervention', 5, 'mental_health', '+254 20 210 0105'),
('Laboratory', 'Clinical laboratory with advanced diagnostic capabilities', 1, 'laboratory', '+254 20 210 0106'),
('Radiology', 'Medical imaging including CT, MRI, X-Ray, and ultrasound', 1, 'radiology', '+254 20 210 0107'),
('Pharmacy', 'Hospital pharmacy with 24/7 medication dispensing', 1, 'pharmacy', '+254 20 210 0108'),
('Billing', 'Patient financial services and insurance processing', 1, 'billing', '+254 20 210 0109'),
('Cardiology', 'Specialized cardiac care and intervention', 3, 'outpatient', '+254 20 210 0113'),
('Neurology', 'Neurological care and stroke unit', 3, 'outpatient', '+254 20 210 0114'),
('Orthopedics', 'Bone, joint, and musculoskeletal care', 4, 'surgery', '+254 20 210 0115'),
('Oncology', 'Cancer treatment and care', 5, 'outpatient', '+254 20 210 0116'),
('Nephrology', 'Kidney disease and dialysis services', 3, 'outpatient', '+254 20 210 0117'),
('Gastroenterology', 'Digestive system and liver care', 2, 'outpatient', '+254 20 210 0118'),
('Pulmonology', 'Respiratory and lung care', 3, 'outpatient', '+254 20 210 0119'),
('Endocrinology', 'Hormone and metabolic disorders', 2, 'outpatient', '+254 20 210 0120'),
('Dermatology', 'Skin care and dermatological procedures', 2, 'outpatient', '+254 20 210 0121')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  floor_number = EXCLUDED.floor_number,
  department_type = EXCLUDED.department_type,
  phone = EXCLUDED.phone;

-- ============================================
-- HOSPITAL STAFF - EMERGENCY DEPARTMENT
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Michael', 'Chen', 'michael.chen@hospitalguard.com', '+254 71001 001001001', 'doctor', 'Emergency Medicine', 'MD-EM-001', id, true, 'both'
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Sarah', 'Williams', 'sarah.williams@hospitalguard.com', '+254 71002 002002002', 'doctor', 'Emergency Medicine', 'MD-EM-002', id, true, 'both'
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'James', 'Martinez', 'james.martinez@hospitalguard.com', '+254 71003 003003003', 'doctor', 'Trauma Surgery', 'MD-EM-003', id, true, 'both'
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Emily', 'Johnson', 'emily.johnson@hospitalguard.com', '+254 71004 004004004', 'doctor', 'Emergency Medicine', 'MD-EM-004', id, true, 'both'
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- Emergency Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Jennifer', 'Davis', 'jennifer.davis@hospitalguard.com', '+254 71005 005005005', 'nurse', 'Emergency Nursing', 'RN-EM-001', id, true, 'both'
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Robert', 'Brown', 'robert.brown@hospitalguard.com', '+254 71006 006006006', 'nurse', 'Trauma Nursing', 'RN-EM-002', id, true, 'both'
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - ICU
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'David', 'Anderson', 'david.anderson@hospitalguard.com', '+254 72001 001001001', 'doctor', 'Critical Care Medicine', 'MD-ICU-001', id, true, 'both'
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Lisa', 'Thompson', 'lisa.thompson@hospitalguard.com', '+254 72002 002002002', 'doctor', 'Pulmonology & Critical Care', 'MD-ICU-002', id, true, 'both'
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Mark', 'Garcia', 'mark.garcia@hospitalguard.com', '+254 72003 003003003', 'doctor', 'Critical Care Medicine', 'MD-ICU-003', id, true, 'both'
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ICU Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Amanda', 'Wilson', 'amanda.wilson@hospitalguard.com', '+254 72004 004004004', 'nurse', 'Critical Care Nursing', 'RN-ICU-001', id, true, 'both'
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Christopher', 'Lee', 'christopher.lee@hospitalguard.com', '+254 72005 005005005', 'nurse', 'Critical Care Nursing', 'RN-ICU-002', id, true, 'both'
FROM departments WHERE name = 'Intensive Care Unit (ICU)'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - OUTPATIENT
-- ============================================
-- These doctors focus on outpatient consultations and can also treat patients

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Jessica', 'Moore', 'jessica.moore@hospitalguard.com', '+254 73001 001001001', 'doctor', 'General Practice', 'MD-OP-001', id, true, 'outpatient'
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active,
  patient_care_type = EXCLUDED.patient_care_type;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Daniel', 'Taylor', 'daniel.taylor@hospitalguard.com', '+254 73002 002002002', 'doctor', 'Internal Medicine', 'MD-OP-002', id, true, 'outpatient'
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active,
  patient_care_type = EXCLUDED.patient_care_type;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Rachel', 'White', 'rachel.white@hospitalguard.com', '+254 73003 003003003', 'doctor', 'Family Medicine', 'MD-OP-003', id, true, 'outpatient'
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active,
  patient_care_type = EXCLUDED.patient_care_type;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Kevin', 'Harris', 'kevin.harris@hospitalguard.com', '+254 73004 004004004', 'doctor', 'General Practice', 'MD-OP-004', id, true, 'outpatient'
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active,
  patient_care_type = EXCLUDED.patient_care_type;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Sophia', 'Ahmed', 'sophia.ahmed@hospitalguard.com', '+254 73005 005005005', 'doctor', 'General Practice', 'MD-OP-005', id, true, 'outpatient'
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active,
  patient_care_type = EXCLUDED.patient_care_type;

-- ============================================
-- HOSPITAL STAFF - SURGERY
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Richard', 'Clark', 'richard.clark@hospitalguard.com', '+254 74001 001001001', 'doctor', 'General Surgery', 'MD-SG-001', id, true, 'both'
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Patricia', 'Lewis', 'patricia.lewis@hospitalguard.com', '+254 74002 002002002', 'doctor', 'Cardiothoracic Surgery', 'MD-SG-002', id, true, 'both'
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Thomas', 'Walker', 'thomas.walker@hospitalguard.com', '+254 74003 003003003', 'doctor', 'Neurosurgery', 'MD-SG-003', id, true, 'both'
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Michelle', 'Hall', 'michelle.hall@hospitalguard.com', '+254 74004 004004004', 'doctor', 'Orthopedic Surgery', 'MD-SG-004', id, true, 'both'
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Steven', 'Allen', 'steven.allen@hospitalguard.com', '+254 74005 005005005', 'doctor', 'Vascular Surgery', 'MD-SG-005', id, true, 'both'
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- Surgical Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Nicole', 'Young', 'nicole.young@hospitalguard.com', '+254 74006 006006006', 'nurse', 'Perioperative Nursing', 'RN-SG-001', id, true, 'both'
FROM departments WHERE name = 'Surgery'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - MATERNITY
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Catherine', 'King', 'catherine.king@hospitalguard.com', '+254 75001 001001001', 'obstetrician', 'Obstetrics & Gynecology', 'MD-OB-001', id, true, 'both'
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Andrew', 'Wright', 'andrew.wright@hospitalguard.com', '+254 75002 002002002', 'obstetrician', 'Maternal-Fetal Medicine', 'MD-OB-002', id, true, 'both'
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Maria', 'Lopez', 'maria.lopez@hospitalguard.com', '+254 75003 003003003', 'obstetrician', 'Obstetrics & Gynecology', 'MD-OB-003', id, true, 'both'
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- Maternity Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Karen', 'Scott', 'karen.scott@hospitalguard.com', '+254 75004 004004004', 'nurse', 'Labor & Delivery', 'RN-OB-001', id, true, 'both'
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Donna', 'Green', 'donna.green@hospitalguard.com', '+254 75005 005005005', 'nurse', 'Neonatal Nursing', 'RN-OB-002', id, true, 'both'
FROM departments WHERE name = 'Maternity'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - PEDIATRICS
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Laura', 'Adams', 'laura.adams@hospitalguard.com', '+254 76001 001001001', 'doctor', 'Pediatrics', 'MD-PD-001', id, true, 'both'
FROM departments WHERE name = 'Pediatrics'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Brian', 'Baker', 'brian.baker@hospitalguard.com', '+254 76002 002002002', 'doctor', 'Pediatric Emergency Medicine', 'MD-PD-002', id, true, 'both'
FROM departments WHERE name = 'Pediatrics'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Angela', 'Nelson', 'angela.nelson@hospitalguard.com', '+254 76003 003003003', 'doctor', 'Pediatrics', 'MD-PD-003', id, true, 'both'
FROM departments WHERE name = 'Pediatrics'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- Pediatric Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Melissa', 'Carter', 'melissa.carter@hospitalguard.com', '+254 76004 004004004', 'nurse', 'Pediatric Nursing', 'RN-PD-001', id, true, 'both'
FROM departments WHERE name = 'Pediatrics'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - MENTAL HEALTH
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Jonathan', 'Mitchell', 'jonathan.mitchell@hospitalguard.com', '+254 77001 001001001', 'psychiatrist', 'General Psychiatry', 'MD-PSY-001', id, true, 'both'
FROM departments WHERE name = 'Mental Health'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Elizabeth', 'Perez', 'elizabeth.perez@hospitalguard.com', '+254 77002 002002002', 'psychiatrist', 'Child & Adolescent Psychiatry', 'MD-PSY-002', id, true, 'both'
FROM departments WHERE name = 'Mental Health'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Anthony', 'Roberts', 'anthony.roberts@hospitalguard.com', '+254 77003 003003003', 'psychiatrist', 'Addiction Psychiatry', 'MD-PSY-003', id, true, 'both'
FROM departments WHERE name = 'Mental Health'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- Mental Health Nurses
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Sandra', 'Turner', 'sandra.turner@hospitalguard.com', '+254 77004 004004004', 'nurse', 'Psychiatric Nursing', 'RN-PSY-001', id, true, 'both'
FROM departments WHERE name = 'Mental Health'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - CARDIOLOGY
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'William', 'Phillips', 'william.phillips@hospitalguard.com', '+254 78001 001001001', 'doctor', 'Cardiology', 'MD-CAR-001', id, true, 'both'
FROM departments WHERE name = 'Cardiology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Nancy', 'Campbell', 'nancy.campbell@hospitalguard.com', '+254 78002 002002002', 'doctor', 'Interventional Cardiology', 'MD-CAR-002', id, true, 'both'
FROM departments WHERE name = 'Cardiology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'George', 'Parker', 'george.parker@hospitalguard.com', '+254 78003 003003003', 'doctor', 'Electrophysiology', 'MD-CAR-003', id, true, 'both'
FROM departments WHERE name = 'Cardiology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - NEUROLOGY
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Barbara', 'Evans', 'barbara.evans@hospitalguard.com', '+254 71001 001001001', 'doctor', 'Neurology', 'MD-NEU-001', id, true, 'both'
FROM departments WHERE name = 'Neurology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Paul', 'Edwards', 'paul.edwards@hospitalguard.com', '+254 71002 002002002', 'doctor', 'Stroke & Vascular Neurology', 'MD-NEU-002', id, true, 'both'
FROM departments WHERE name = 'Neurology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Helen', 'Collins', 'helen.collins@hospitalguard.com', '+254 71003 003003003', 'doctor', 'Neurology', 'MD-NEU-003', id, true, 'both'
FROM departments WHERE name = 'Neurology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - ORTHOPEDICS
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Charles', 'Stewart', 'charles.stewart@hospitalguard.com', '+254 71101 101101101', 'doctor', 'Orthopedic Surgery', 'MD-ORT-001', id, true, 'both'
FROM departments WHERE name = 'Orthopedics'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Margaret', 'Sanchez', 'margaret.sanchez@hospitalguard.com', '+254 71102 102102102', 'doctor', 'Sports Medicine', 'MD-ORT-002', id, true, 'both'
FROM departments WHERE name = 'Orthopedics'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Joseph', 'Morris', 'joseph.morris@hospitalguard.com', '+254 71103 103103103', 'doctor', 'Joint Replacement', 'MD-ORT-003', id, true, 'both'
FROM departments WHERE name = 'Orthopedics'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - ONCOLOGY
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Susan', 'Rogers', 'susan.rogers@hospitalguard.com', '+254 71201 201201201', 'doctor', 'Medical Oncology', 'MD-ONC-001', id, true, 'both'
FROM departments WHERE name = 'Oncology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Donald', 'Reed', 'donald.reed@hospitalguard.com', '+254 71202 202202202', 'doctor', 'Radiation Oncology', 'MD-ONC-002', id, true, 'both'
FROM departments WHERE name = 'Oncology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Carol', 'Cook', 'carol.cook@hospitalguard.com', '+254 71203 203203203', 'doctor', 'Surgical Oncology', 'MD-ONC-003', id, true, 'both'
FROM departments WHERE name = 'Oncology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - LABORATORY
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Timothy', 'Morgan', 'timothy.morgan@hospitalguard.com', '+254 71301 301301301', 'lab_tech', 'Clinical Laboratory Science', 'MLT-001', id, true, 'both'
FROM departments WHERE name = 'Laboratory'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Betty', 'Bell', 'betty.bell@hospitalguard.com', '+254 71302 302302302', 'lab_tech', 'Hematology', 'MLT-002', id, true, 'both'
FROM departments WHERE name = 'Laboratory'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Jason', 'Murphy', 'jason.murphy@hospitalguard.com', '+254 71303 303303303', 'lab_tech', 'Microbiology', 'MLT-003', id, true, 'both'
FROM departments WHERE name = 'Laboratory'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Dorothy', 'Bailey', 'dorothy.bailey@hospitalguard.com', '+254 71304 304304304', 'lab_tech', 'Chemistry', 'MLT-004', id, true, 'both'
FROM departments WHERE name = 'Laboratory'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - RADIOLOGY
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Ryan', 'Rivera', 'ryan.rivera@hospitalguard.com', '+254 71401 401401401', 'radiologist', 'Diagnostic Radiology', 'MD-RAD-001', id, true, 'both'
FROM departments WHERE name = 'Radiology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Deborah', 'Cooper', 'deborah.cooper@hospitalguard.com', '+254 71402 402402402', 'radiologist', 'Interventional Radiology', 'MD-RAD-002', id, true, 'both'
FROM departments WHERE name = 'Radiology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Brandon', 'Richardson', 'brandon.richardson@hospitalguard.com', '+254 71403 403403403', 'radiologist', 'Neuroradiology', 'MD-RAD-003', id, true, 'both'
FROM departments WHERE name = 'Radiology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - PHARMACY
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Amy', 'Cox', 'amy.cox@hospitalguard.com', '+254 71501 501501501', 'pharmacist', 'Clinical Pharmacy', 'RPH-001', id, true, 'both'
FROM departments WHERE name = 'Pharmacy'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Adam', 'Howard', 'adam.howard@hospitalguard.com', '+254 71502 502502502', 'pharmacist', 'Hospital Pharmacy', 'RPH-002', id, true, 'both'
FROM departments WHERE name = 'Pharmacy'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Stephanie', 'Ward', 'stephanie.ward@hospitalguard.com', '+254 71503 503503503', 'pharmacist', 'Oncology Pharmacy', 'RPH-003', id, true, 'both'
FROM departments WHERE name = 'Pharmacy'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Benjamin', 'Torres', 'benjamin.torres@hospitalguard.com', '+254 71504 504504504', 'pharmacist', 'Critical Care Pharmacy', 'RPH-004', id, true, 'both'
FROM departments WHERE name = 'Pharmacy'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- HOSPITAL STAFF - ADDITIONAL SPECIALTIES
-- ============================================

-- Nephrology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Rebecca', 'Peterson', 'rebecca.peterson@hospitalguard.com', '+254 71601 601601601', 'doctor', 'Nephrology', 'MD-NEP-001', id, true, 'both'
FROM departments WHERE name = 'Nephrology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Eric', 'Gray', 'eric.gray@hospitalguard.com', '+254 71602 602602602', 'doctor', 'Nephrology & Dialysis', 'MD-NEP-002', id, true, 'both'
FROM departments WHERE name = 'Nephrology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- Gastroenterology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Christine', 'Ramirez', 'christine.ramirez@hospitalguard.com', '+254 71701 701701701', 'doctor', 'Gastroenterology', 'MD-GAS-001', id, true, 'both'
FROM departments WHERE name = 'Gastroenterology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Peter', 'James', 'peter.james@hospitalguard.com', '+254 71702 702702702', 'doctor', 'Hepatology', 'MD-GAS-002', id, true, 'both'
FROM departments WHERE name = 'Gastroenterology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- Pulmonology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Samantha', 'Watson', 'samantha.watson@hospitalguard.com', '+254 71801 801801801', 'doctor', 'Pulmonology', 'MD-PUL-001', id, true, 'both'
FROM departments WHERE name = 'Pulmonology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Gary', 'Brooks', 'gary.brooks@hospitalguard.com', '+254 71802 802802802', 'doctor', 'Pulmonary Critical Care', 'MD-PUL-002', id, true, 'both'
FROM departments WHERE name = 'Pulmonology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- Endocrinology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Julie', 'Kelly', 'julie.kelly@hospitalguard.com', '+254 71901 901901901', 'doctor', 'Endocrinology', 'MD-END-001', id, true, 'both'
FROM departments WHERE name = 'Endocrinology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Scott', 'Sanders', 'scott.sanders@hospitalguard.com', '+254 71902 902902902', 'doctor', 'Diabetes & Metabolism', 'MD-END-002', id, true, 'both'
FROM departments WHERE name = 'Endocrinology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- Dermatology
INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Victoria', 'Price', 'victoria.price@hospitalguard.com', '+254 72001 001001001', 'doctor', 'Dermatology', 'MD-DER-001', id, true, 'both'
FROM departments WHERE name = 'Dermatology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Kyle', 'Bennett', 'kyle.bennett@hospitalguard.com', '+254 72002 002002002', 'doctor', 'Dermatopathology', 'MD-DER-002', id, true, 'both'
FROM departments WHERE name = 'Dermatology'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- ADMINISTRATIVE STAFF
-- ============================================

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Hannah', 'Wood', 'hannah.wood@hospitalguard.com', '+254 71001 001001001', 'receptionist', 'Front Desk', 'ADM-001', id, true, 'both'
FROM departments WHERE name = 'Outpatient'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Tyler', 'Barnes', 'tyler.barnes@hospitalguard.com', '+254 71002 002002002', 'receptionist', 'Patient Registration', 'ADM-002', id, true, 'both'
FROM departments WHERE name = 'Emergency'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Olivia', 'Ross', 'olivia.ross@hospitalguard.com', '+254 71101 101101101', 'billing', 'Medical Billing', 'BIL-001', id, true, 'both'
FROM departments WHERE name = 'Billing'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Nathan', 'Henderson', 'nathan.henderson@hospitalguard.com', '+254 71102 102102102', 'billing', 'Insurance Processing', 'BIL-002', id, true, 'both'
FROM departments WHERE name = 'Billing'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

INSERT INTO hospital_staff (first_name, last_name, email, phone, staff_type, specialization, license_number, department_id, is_active, patient_care_type)
SELECT 'Emma', 'Coleman', 'emma.coleman@hospitalguard.com', '+254 71103 103103103', 'billing', 'Financial Services', 'BIL-003', id, true, 'both'
FROM departments WHERE name = 'Billing'
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  specialization = EXCLUDED.specialization,
  is_active = EXCLUDED.is_active;

-- ============================================
-- PHARMACY INVENTORY - ESSENTIAL MEDICATIONS
-- ============================================

-- Using ON CONFLICT for medication_name since we don't have a unique constraint on it in the schema
-- We'll use a combination approach: try to insert, and if it exists, skip it
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

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
DECLARE
  dept_count INTEGER;
  staff_count INTEGER;
  doctor_count INTEGER;
  inventory_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dept_count FROM departments;
  SELECT COUNT(*) INTO staff_count FROM hospital_staff;
  SELECT COUNT(*) INTO doctor_count FROM hospital_staff WHERE staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist');
  SELECT COUNT(*) INTO inventory_count FROM pharmacy_inventory;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'LEVEL 1 HOSPITAL SEED COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Departments: %', dept_count;
  RAISE NOTICE 'Total Staff: %', staff_count;
  RAISE NOTICE 'Doctors/Specialists: %', doctor_count;
  RAISE NOTICE 'Pharmacy Items: %', inventory_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Hospital is now ready for operations!';
  RAISE NOTICE '========================================';
END $$;
