-- ============================================================================
-- HospitalGuard: Doctor Dashboard Backend Functions
-- ============================================================================
-- Comprehensive Supabase functions for doctor operations
-- Version: 1.0
-- Last Updated: 2025
-- ============================================================================

-- ============================================================================
-- PATIENT DATA RETRIEVAL FUNCTIONS
-- ============================================================================

-- Get doctor's active patients
CREATE OR REPLACE FUNCTION get_doctor_active_patients(doctor_id_param UUID)
RETURNS TABLE (
  visit_id UUID,
  patient_id UUID,
  patient_name TEXT,
  patient_age INTEGER,
  gender TEXT,
  visit_number TEXT,
  admission_type TEXT,
  check_in_time TIMESTAMPTZ,
  status TEXT,
  chief_complaint TEXT,
  triage_level TEXT,
  room_number TEXT,
  bed_number TEXT,
  vital_signs JSONB,
  blood_type TEXT,
  allergies TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.id AS visit_id,
    p.id AS patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER AS patient_age,
    p.gender,
    pv.visit_number,
    pv.admission_type,
    pv.check_in_time,
    pv.status,
    pv.chief_complaint,
    pv.triage_level,
    pv.room_number,
    pv.bed_number,
    pv.vital_signs,
    p.blood_type,
    p.allergies
  FROM patient_visits pv
  JOIN patients p ON pv.patient_id = p.id
  WHERE pv.attending_doctor_id = doctor_id_param
    AND pv.status IN ('checked_in', 'in_consultation', 'in_treatment', 'awaiting_lab', 'awaiting_pharmacy')
  ORDER BY
    CASE pv.triage_level
      WHEN 'critical' THEN 1
      WHEN 'urgent' THEN 2
      WHEN 'semi_urgent' THEN 3
      WHEN 'non_urgent' THEN 4
    END,
    pv.check_in_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get detailed patient information
CREATE OR REPLACE FUNCTION get_patient_details(patient_id_param UUID)
RETURNS TABLE (
  patient_id UUID,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  age INTEGER,
  gender TEXT,
  blood_type TEXT,
  allergies TEXT[],
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  national_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS patient_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER AS age,
    p.gender,
    p.blood_type,
    p.allergies,
    p.phone,
    p.email,
    p.address,
    p.emergency_contact_name,
    p.emergency_contact_phone,
    p.insurance_provider,
    p.insurance_policy_number,
    p.national_id
  FROM patients p
  WHERE p.id = patient_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get patient's medical history
CREATE OR REPLACE FUNCTION get_patient_medical_history(patient_id_param UUID)
RETURNS TABLE (
  record_id UUID,
  record_type TEXT,
  title TEXT,
  description TEXT,
  doctor_name TEXT,
  department_name TEXT,
  created_at TIMESTAMPTZ,
  attachments JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mr.id AS record_id,
    mr.record_type,
    mr.title,
    mr.description,
    CONCAT(hs.first_name, ' ', hs.last_name) AS doctor_name,
    d.name AS department_name,
    mr.created_at,
    mr.attachments
  FROM medical_records mr
  LEFT JOIN hospital_staff hs ON mr.doctor_id = hs.id
  LEFT JOIN departments d ON mr.department_id = d.id
  WHERE mr.patient_id = patient_id_param
    AND mr.is_confidential = false
  ORDER BY mr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get patient's current visit details
CREATE OR REPLACE FUNCTION get_current_visit_details(visit_id_param UUID)
RETURNS TABLE (
  visit_id UUID,
  patient_id UUID,
  patient_name TEXT,
  visit_number TEXT,
  admission_type TEXT,
  check_in_time TIMESTAMPTZ,
  status TEXT,
  chief_complaint TEXT,
  triage_level TEXT,
  vital_signs JSONB,
  attending_doctor_id UUID,
  attending_doctor_name TEXT,
  current_department TEXT,
  room_number TEXT,
  bed_number TEXT,
  notes TEXT,
  diagnoses JSONB,
  department_history JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.id AS visit_id,
    p.id AS patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    pv.visit_number,
    pv.admission_type,
    pv.check_in_time,
    pv.status,
    pv.chief_complaint,
    pv.triage_level,
    pv.vital_signs,
    pv.attending_doctor_id,
    CONCAT(hs.first_name, ' ', hs.last_name) AS attending_doctor_name,
    d.name AS current_department,
    pv.room_number,
    pv.bed_number,
    pv.notes,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'diagnosis_name', diag.diagnosis_name,
          'diagnosis_type', diag.diagnosis_type,
          'icd_code', diag.icd_code,
          'notes', diag.notes,
          'created_at', diag.created_at
        )
      )
      FROM diagnoses diag
      WHERE diag.visit_id = pv.id
    ) AS diagnoses,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'department', dept.name,
          'check_in_time', vdh.check_in_time,
          'check_out_time', vdh.check_out_time,
          'services_provided', vdh.services_provided
        ) ORDER BY vdh.check_in_time
      )
      FROM visit_department_history vdh
      JOIN departments dept ON vdh.department_id = dept.id
      WHERE vdh.visit_id = pv.id
    ) AS department_history
  FROM patient_visits pv
  JOIN patients p ON pv.patient_id = p.id
  LEFT JOIN hospital_staff hs ON pv.attending_doctor_id = hs.id
  LEFT JOIN departments d ON pv.current_department_id = d.id
  WHERE pv.id = visit_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PRESCRIPTION MANAGEMENT FUNCTIONS
-- ============================================================================

-- Create a new prescription
CREATE OR REPLACE FUNCTION create_prescription(
  patient_id_param UUID,
  visit_id_param UUID,
  doctor_id_param UUID,
  prescription_items JSONB,
  notes_param TEXT DEFAULT NULL,
  is_controlled_substance_param BOOLEAN DEFAULT false,
  refills_allowed_param INTEGER DEFAULT 0,
  valid_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  prescription_id UUID,
  prescription_number TEXT,
  qr_code_data TEXT
) AS $$
DECLARE
  new_prescription_id UUID;
  new_prescription_number TEXT;
  new_qr_code TEXT;
  item JSONB;
BEGIN
  -- Generate prescription number
  new_prescription_number := generate_prescription_number();

  -- Generate QR code data (JSON string with prescription details)
  new_qr_code := jsonb_build_object(
    'prescription_number', new_prescription_number,
    'patient_id', patient_id_param,
    'doctor_id', doctor_id_param,
    'created_at', NOW()
  )::TEXT;

  -- Insert prescription
  INSERT INTO prescriptions (
    prescription_number,
    patient_id,
    visit_id,
    doctor_id,
    status,
    qr_code_data,
    notes,
    is_controlled_substance,
    refills_allowed,
    valid_until
  ) VALUES (
    new_prescription_number,
    patient_id_param,
    visit_id_param,
    doctor_id_param,
    'pending',
    new_qr_code,
    notes_param,
    is_controlled_substance_param,
    refills_allowed_param,
    (CURRENT_DATE + valid_days)
  )
  RETURNING id INTO new_prescription_id;

  -- Insert prescription items
  FOR item IN SELECT * FROM jsonb_array_elements(prescription_items)
  LOOP
    INSERT INTO prescription_items (
      prescription_id,
      medication_name,
      dosage,
      frequency,
      duration,
      quantity,
      instructions,
      is_controlled_substance
    ) VALUES (
      new_prescription_id,
      item->>'medication_name',
      item->>'dosage',
      item->>'frequency',
      item->>'duration',
      (item->>'quantity')::INTEGER,
      item->>'instructions',
      COALESCE((item->>'is_controlled_substance')::BOOLEAN, false)
    );
  END LOOP;

  RETURN QUERY
  SELECT new_prescription_id, new_prescription_number, new_qr_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sign a prescription
CREATE OR REPLACE FUNCTION sign_prescription(
  prescription_id_param UUID,
  doctor_id_param UUID,
  digital_signature_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE prescriptions
  SET
    status = 'signed',
    digital_signature = digital_signature_param,
    signed_at = NOW()
  WHERE id = prescription_id_param
    AND doctor_id = doctor_id_param
    AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get doctor's prescriptions
CREATE OR REPLACE FUNCTION get_doctor_prescriptions(
  doctor_id_param UUID,
  status_filter TEXT DEFAULT NULL,
  limit_param INTEGER DEFAULT 50
)
RETURNS TABLE (
  prescription_id UUID,
  prescription_number TEXT,
  patient_name TEXT,
  patient_id UUID,
  visit_number TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  valid_until DATE,
  is_controlled_substance BOOLEAN,
  items_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id AS prescription_id,
    pr.prescription_number,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    pr.patient_id,
    pv.visit_number,
    pr.status,
    pr.created_at,
    pr.signed_at,
    pr.valid_until,
    pr.is_controlled_substance,
    (SELECT COUNT(*) FROM prescription_items pi WHERE pi.prescription_id = pr.id) AS items_count
  FROM prescriptions pr
  JOIN patients p ON pr.patient_id = p.id
  LEFT JOIN patient_visits pv ON pr.visit_id = pv.id
  WHERE pr.doctor_id = doctor_id_param
    AND (status_filter IS NULL OR pr.status = status_filter)
  ORDER BY pr.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get prescription details with items
CREATE OR REPLACE FUNCTION get_prescription_details(prescription_id_param UUID)
RETURNS TABLE (
  prescription_id UUID,
  prescription_number TEXT,
  patient_id UUID,
  patient_name TEXT,
  patient_age INTEGER,
  patient_allergies TEXT[],
  visit_id UUID,
  visit_number TEXT,
  doctor_id UUID,
  doctor_name TEXT,
  doctor_license TEXT,
  status TEXT,
  qr_code_data TEXT,
  digital_signature TEXT,
  signed_at TIMESTAMPTZ,
  notes TEXT,
  is_controlled_substance BOOLEAN,
  refills_allowed INTEGER,
  valid_until DATE,
  created_at TIMESTAMPTZ,
  items JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id AS prescription_id,
    pr.prescription_number,
    pr.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER AS patient_age,
    p.allergies AS patient_allergies,
    pr.visit_id,
    pv.visit_number,
    pr.doctor_id,
    CONCAT(hs.first_name, ' ', hs.last_name) AS doctor_name,
    hs.license_number AS doctor_license,
    pr.status,
    pr.qr_code_data,
    pr.digital_signature,
    pr.signed_at,
    pr.notes,
    pr.is_controlled_substance,
    pr.refills_allowed,
    pr.valid_until,
    pr.created_at,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', pi.id,
          'medication_name', pi.medication_name,
          'dosage', pi.dosage,
          'frequency', pi.frequency,
          'duration', pi.duration,
          'quantity', pi.quantity,
          'dispensed_quantity', pi.dispensed_quantity,
          'instructions', pi.instructions,
          'is_controlled_substance', pi.is_controlled_substance
        ) ORDER BY pi.created_at
      )
      FROM prescription_items pi
      WHERE pi.prescription_id = pr.id
    ) AS items
  FROM prescriptions pr
  JOIN patients p ON pr.patient_id = p.id
  LEFT JOIN patient_visits pv ON pr.visit_id = pv.id
  JOIN hospital_staff hs ON pr.doctor_id = hs.id
  WHERE pr.id = prescription_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CONSULTATION & MEDICAL RECORDS FUNCTIONS
-- ============================================================================

-- Create consultation note
CREATE OR REPLACE FUNCTION create_consultation_note(
  patient_id_param UUID,
  visit_id_param UUID,
  doctor_id_param UUID,
  department_id_param UUID,
  title_param TEXT,
  description_param TEXT,
  is_confidential_param BOOLEAN DEFAULT false,
  attachments_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_record_id UUID;
BEGIN
  INSERT INTO medical_records (
    patient_id,
    visit_id,
    record_type,
    title,
    description,
    doctor_id,
    department_id,
    attachments,
    is_confidential
  ) VALUES (
    patient_id_param,
    visit_id_param,
    'consultation',
    title_param,
    description_param,
    doctor_id_param,
    department_id_param,
    attachments_param,
    is_confidential_param
  )
  RETURNING id INTO new_record_id;

  RETURN new_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add diagnosis to visit
CREATE OR REPLACE FUNCTION add_diagnosis(
  visit_id_param UUID,
  diagnosis_name_param TEXT,
  diagnosis_type_param TEXT,
  icd_code_param TEXT DEFAULT NULL,
  notes_param TEXT DEFAULT NULL,
  diagnosed_by_param UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_diagnosis_id UUID;
BEGIN
  INSERT INTO diagnoses (
    visit_id,
    diagnosis_name,
    diagnosis_type,
    icd_code,
    notes,
    diagnosed_by
  ) VALUES (
    visit_id_param,
    diagnosis_name_param,
    diagnosis_type_param,
    icd_code_param,
    notes_param,
    diagnosed_by_param
  )
  RETURNING id INTO new_diagnosis_id;

  RETURN new_diagnosis_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update visit status
CREATE OR REPLACE FUNCTION update_visit_status(
  visit_id_param UUID,
  new_status TEXT,
  notes_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE patient_visits
  SET
    status = new_status,
    notes = COALESCE(notes_param, notes),
    updated_at = NOW()
  WHERE id = visit_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update vital signs
CREATE OR REPLACE FUNCTION update_vital_signs(
  visit_id_param UUID,
  vital_signs_param JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE patient_visits
  SET
    vital_signs = vital_signs_param,
    updated_at = NOW()
  WHERE id = visit_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- LAB & RADIOLOGY ORDER FUNCTIONS
-- ============================================================================

-- Create lab order
CREATE OR REPLACE FUNCTION create_lab_order(
  patient_id_param UUID,
  visit_id_param UUID,
  ordered_by_param UUID,
  test_type_param TEXT,
  urgency_param TEXT DEFAULT 'routine',
  notes_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT
) AS $$
DECLARE
  new_order_id UUID;
  new_order_number TEXT;
BEGIN
  -- Generate order number
  new_order_number := 'LAB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO lab_orders (
    order_number,
    patient_id,
    visit_id,
    ordered_by,
    test_type,
    urgency,
    status,
    notes
  ) VALUES (
    new_order_number,
    patient_id_param,
    visit_id_param,
    ordered_by_param,
    test_type_param,
    urgency_param,
    'pending',
    notes_param
  )
  RETURNING id INTO new_order_id;

  RETURN QUERY
  SELECT new_order_id, new_order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create radiology order
CREATE OR REPLACE FUNCTION create_radiology_order(
  patient_id_param UUID,
  visit_id_param UUID,
  ordered_by_param UUID,
  imaging_type_param TEXT,
  body_part_param TEXT,
  urgency_param TEXT DEFAULT 'routine',
  notes_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT
) AS $$
DECLARE
  new_order_id UUID;
  new_order_number TEXT;
BEGIN
  -- Generate order number
  new_order_number := 'RAD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO radiology_orders (
    order_number,
    patient_id,
    visit_id,
    ordered_by,
    imaging_type,
    body_part,
    urgency,
    status,
    notes
  ) VALUES (
    new_order_number,
    patient_id_param,
    visit_id_param,
    ordered_by_param,
    imaging_type_param,
    body_part_param,
    urgency_param,
    'pending',
    notes_param
  )
  RETURNING id INTO new_order_id;

  RETURN QUERY
  SELECT new_order_id, new_order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get patient's lab orders
CREATE OR REPLACE FUNCTION get_patient_lab_orders(
  patient_id_param UUID,
  visit_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  test_type TEXT,
  urgency TEXT,
  status TEXT,
  sample_collected BOOLEAN,
  sample_collected_at TIMESTAMPTZ,
  results JSONB,
  results_available_at TIMESTAMPTZ,
  ordered_by_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lo.id AS order_id,
    lo.order_number,
    lo.test_type,
    lo.urgency,
    lo.status,
    lo.sample_collected,
    lo.sample_collected_at,
    lo.results,
    lo.results_available_at,
    CONCAT(hs.first_name, ' ', hs.last_name) AS ordered_by_name,
    lo.created_at
  FROM lab_orders lo
  LEFT JOIN hospital_staff hs ON lo.ordered_by = hs.id
  WHERE lo.patient_id = patient_id_param
    AND (visit_id_param IS NULL OR lo.visit_id = visit_id_param)
  ORDER BY lo.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get patient's radiology orders
CREATE OR REPLACE FUNCTION get_patient_radiology_orders(
  patient_id_param UUID,
  visit_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  imaging_type TEXT,
  body_part TEXT,
  urgency TEXT,
  status TEXT,
  scheduled_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  findings TEXT,
  images_url TEXT[],
  radiologist_name TEXT,
  ordered_by_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ro.id AS order_id,
    ro.order_number,
    ro.imaging_type,
    ro.body_part,
    ro.urgency,
    ro.status,
    ro.scheduled_time,
    ro.completed_at,
    ro.findings,
    ro.images_url,
    CONCAT(rad.first_name, ' ', rad.last_name) AS radiologist_name,
    CONCAT(doc.first_name, ' ', doc.last_name) AS ordered_by_name,
    ro.created_at
  FROM radiology_orders ro
  LEFT JOIN hospital_staff rad ON ro.radiologist_id = rad.id
  LEFT JOIN hospital_staff doc ON ro.ordered_by = doc.id
  WHERE ro.patient_id = patient_id_param
    AND (visit_id_param IS NULL OR ro.visit_id = visit_id_param)
  ORDER BY ro.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APPOINTMENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Create appointment
CREATE OR REPLACE FUNCTION create_appointment(
  patient_id_param UUID,
  doctor_id_param UUID,
  department_id_param UUID,
  appointment_type_param TEXT,
  scheduled_time_param TIMESTAMPTZ,
  duration_minutes_param INTEGER DEFAULT 30,
  reason_param TEXT DEFAULT NULL,
  notes_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  appointment_id UUID,
  appointment_number TEXT
) AS $$
DECLARE
  new_appointment_id UUID;
  new_appointment_number TEXT;
BEGIN
  -- Generate appointment number
  new_appointment_number := 'APT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO appointments (
    appointment_number,
    patient_id,
    doctor_id,
    department_id,
    appointment_type,
    scheduled_time,
    duration_minutes,
    status,
    reason,
    notes
  ) VALUES (
    new_appointment_number,
    patient_id_param,
    doctor_id_param,
    department_id_param,
    appointment_type_param,
    scheduled_time_param,
    duration_minutes_param,
    'scheduled',
    reason_param,
    notes_param
  )
  RETURNING id INTO new_appointment_id;

  RETURN QUERY
  SELECT new_appointment_id, new_appointment_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get doctor's appointments
CREATE OR REPLACE FUNCTION get_doctor_appointments(
  doctor_id_param UUID,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  status_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  appointment_id UUID,
  appointment_number TEXT,
  patient_id UUID,
  patient_name TEXT,
  patient_phone TEXT,
  appointment_type TEXT,
  scheduled_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  status TEXT,
  reason TEXT,
  department_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id AS appointment_id,
    a.appointment_number,
    a.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.phone AS patient_phone,
    a.appointment_type,
    a.scheduled_time,
    a.duration_minutes,
    a.status,
    a.reason,
    d.name AS department_name
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  LEFT JOIN departments d ON a.department_id = d.id
  WHERE a.doctor_id = doctor_id_param
    AND a.scheduled_time >= start_date
    AND a.scheduled_time <= end_date
    AND (status_filter IS NULL OR a.status = status_filter)
  ORDER BY a.scheduled_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update appointment status
CREATE OR REPLACE FUNCTION update_appointment_status(
  appointment_id_param UUID,
  new_status TEXT,
  notes_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE appointments
  SET
    status = new_status,
    notes = COALESCE(notes_param, notes),
    updated_at = NOW()
  WHERE id = appointment_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TELEMEDICINE FUNCTIONS
-- ============================================================================

-- Create telemedicine session
CREATE OR REPLACE FUNCTION create_telemedicine_session(
  patient_id_param UUID,
  original_visit_id_param UUID,
  doctor_id_param UUID,
  session_type_param TEXT,
  scheduled_time_param TIMESTAMPTZ,
  meeting_link_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  session_id UUID,
  session_number TEXT
) AS $$
DECLARE
  new_session_id UUID;
  new_session_number TEXT;
BEGIN
  -- Generate session number
  new_session_number := 'TM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO telemedicine_sessions (
    session_number,
    patient_id,
    original_visit_id,
    doctor_id,
    session_type,
    scheduled_time,
    status,
    meeting_link
  ) VALUES (
    new_session_number,
    patient_id_param,
    original_visit_id_param,
    doctor_id_param,
    session_type_param,
    scheduled_time_param,
    'scheduled',
    meeting_link_param
  )
  RETURNING id INTO new_session_id;

  RETURN QUERY
  SELECT new_session_id, new_session_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get doctor's telemedicine sessions
CREATE OR REPLACE FUNCTION get_doctor_telemedicine_sessions(
  doctor_id_param UUID,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  status_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  session_id UUID,
  session_number TEXT,
  patient_id UUID,
  patient_name TEXT,
  patient_phone TEXT,
  session_type TEXT,
  scheduled_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  meeting_link TEXT,
  original_visit_number TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ts.id AS session_id,
    ts.session_number,
    ts.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.phone AS patient_phone,
    ts.session_type,
    ts.scheduled_time,
    ts.start_time,
    ts.end_time,
    ts.status,
    ts.meeting_link,
    pv.visit_number AS original_visit_number
  FROM telemedicine_sessions ts
  JOIN patients p ON ts.patient_id = p.id
  LEFT JOIN patient_visits pv ON ts.original_visit_id = pv.id
  WHERE ts.doctor_id = doctor_id_param
    AND ts.scheduled_time >= start_date
    AND ts.scheduled_time <= end_date
    AND (status_filter IS NULL OR ts.status = status_filter)
  ORDER BY ts.scheduled_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update telemedicine session
CREATE OR REPLACE FUNCTION update_telemedicine_session(
  session_id_param UUID,
  new_status TEXT DEFAULT NULL,
  start_time_param TIMESTAMPTZ DEFAULT NULL,
  end_time_param TIMESTAMPTZ DEFAULT NULL,
  session_notes_param TEXT DEFAULT NULL,
  prescriptions_issued_param BOOLEAN DEFAULT NULL,
  follow_up_required_param BOOLEAN DEFAULT NULL,
  next_appointment_date_param DATE DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE telemedicine_sessions
  SET
    status = COALESCE(new_status, status),
    start_time = COALESCE(start_time_param, start_time),
    end_time = COALESCE(end_time_param, end_time),
    session_notes = COALESCE(session_notes_param, session_notes),
    prescriptions_issued = COALESCE(prescriptions_issued_param, prescriptions_issued),
    follow_up_required = COALESCE(follow_up_required_param, follow_up_required),
    next_appointment_date = COALESCE(next_appointment_date_param, next_appointment_date),
    updated_at = NOW()
  WHERE id = session_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DISCHARGE & AFTERCARE FUNCTIONS
-- ============================================================================

-- Discharge patient
CREATE OR REPLACE FUNCTION discharge_patient(
  visit_id_param UUID,
  discharge_summary_param TEXT,
  follow_up_required_param BOOLEAN DEFAULT false,
  telemedicine_enabled_param BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE patient_visits
  SET
    status = 'discharged',
    check_out_time = NOW(),
    discharge_summary = discharge_summary_param,
    follow_up_required = follow_up_required_param,
    telemedicine_enabled = telemedicine_enabled_param,
    updated_at = NOW()
  WHERE id = visit_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create aftercare plan
CREATE OR REPLACE FUNCTION create_aftercare_plan(
  patient_id_param UUID,
  visit_id_param UUID,
  doctor_id_param UUID,
  plan_details_param TEXT,
  medications_param TEXT[] DEFAULT NULL,
  activity_restrictions_param TEXT DEFAULT NULL,
  diet_instructions_param TEXT DEFAULT NULL,
  warning_signs_param TEXT DEFAULT NULL,
  follow_up_schedule_param TEXT DEFAULT NULL,
  emergency_contact_number_param TEXT DEFAULT NULL,
  telemedicine_enabled_param BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  new_aftercare_id UUID;
BEGIN
  INSERT INTO aftercare_plans (
    patient_id,
    visit_id,
    doctor_id,
    plan_details,
    medications,
    activity_restrictions,
    diet_instructions,
    warning_signs,
    follow_up_schedule,
    emergency_contact_number,
    telemedicine_enabled
  ) VALUES (
    patient_id_param,
    visit_id_param,
    doctor_id_param,
    plan_details_param,
    medications_param,
    activity_restrictions_param,
    diet_instructions_param,
    warning_signs_param,
    follow_up_schedule_param,
    emergency_contact_number_param,
    telemedicine_enabled_param
  )
  RETURNING id INTO new_aftercare_id;

  RETURN new_aftercare_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get patient's aftercare plans
CREATE OR REPLACE FUNCTION get_patient_aftercare_plans(patient_id_param UUID)
RETURNS TABLE (
  aftercare_id UUID,
  visit_number TEXT,
  doctor_name TEXT,
  plan_details TEXT,
  medications TEXT[],
  activity_restrictions TEXT,
  diet_instructions TEXT,
  warning_signs TEXT,
  follow_up_schedule TEXT,
  emergency_contact_number TEXT,
  telemedicine_enabled BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ap.id AS aftercare_id,
    pv.visit_number,
    CONCAT(hs.first_name, ' ', hs.last_name) AS doctor_name,
    ap.plan_details,
    ap.medications,
    ap.activity_restrictions,
    ap.diet_instructions,
    ap.warning_signs,
    ap.follow_up_schedule,
    ap.emergency_contact_number,
    ap.telemedicine_enabled,
    ap.created_at
  FROM aftercare_plans ap
  JOIN patient_visits pv ON ap.visit_id = pv.id
  JOIN hospital_staff hs ON ap.doctor_id = hs.id
  WHERE ap.patient_id = patient_id_param
  ORDER BY ap.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DASHBOARD STATISTICS FUNCTIONS
-- ============================================================================

-- Get doctor dashboard statistics
CREATE OR REPLACE FUNCTION get_doctor_dashboard_stats(doctor_id_param UUID)
RETURNS TABLE (
  active_patients_count BIGINT,
  today_appointments_count BIGINT,
  pending_prescriptions_count BIGINT,
  upcoming_telemedicine_count BIGINT,
  critical_patients_count BIGINT,
  awaiting_lab_results_count BIGINT,
  patients_by_status JSONB,
  appointments_by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Active patients count
    (SELECT COUNT(*)
     FROM patient_visits
     WHERE attending_doctor_id = doctor_id_param
     AND status IN ('checked_in', 'in_consultation', 'in_treatment', 'awaiting_lab', 'awaiting_pharmacy')
    ) AS active_patients_count,

    -- Today's appointments count
    (SELECT COUNT(*)
     FROM appointments
     WHERE doctor_id = doctor_id_param
     AND DATE(scheduled_time) = CURRENT_DATE
     AND status IN ('scheduled', 'confirmed')
    ) AS today_appointments_count,

    -- Pending prescriptions count
    (SELECT COUNT(*)
     FROM prescriptions
     WHERE doctor_id = doctor_id_param
     AND status = 'pending'
    ) AS pending_prescriptions_count,

    -- Upcoming telemedicine sessions count
    (SELECT COUNT(*)
     FROM telemedicine_sessions
     WHERE doctor_id = doctor_id_param
     AND status = 'scheduled'
     AND scheduled_time >= NOW()
     AND scheduled_time <= (NOW() + INTERVAL '7 days')
    ) AS upcoming_telemedicine_count,

    -- Critical patients count
    (SELECT COUNT(*)
     FROM patient_visits
     WHERE attending_doctor_id = doctor_id_param
     AND triage_level = 'critical'
     AND status NOT IN ('discharged', 'transferred')
    ) AS critical_patients_count,

    -- Awaiting lab results count
    (SELECT COUNT(*)
     FROM patient_visits
     WHERE attending_doctor_id = doctor_id_param
     AND status = 'awaiting_lab'
    ) AS awaiting_lab_results_count,

    -- Patients by status breakdown
    (SELECT jsonb_object_agg(status, count)
     FROM (
       SELECT status, COUNT(*) as count
       FROM patient_visits
       WHERE attending_doctor_id = doctor_id_param
       AND status IN ('checked_in', 'in_consultation', 'in_treatment', 'awaiting_lab', 'awaiting_pharmacy')
       GROUP BY status
     ) subq
    ) AS patients_by_status,

    -- Appointments by type breakdown
    (SELECT jsonb_object_agg(appointment_type, count)
     FROM (
       SELECT appointment_type, COUNT(*) as count
       FROM appointments
       WHERE doctor_id = doctor_id_param
       AND DATE(scheduled_time) = CURRENT_DATE
       AND status IN ('scheduled', 'confirmed')
       GROUP BY appointment_type
     ) subq
    ) AS appointments_by_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recent patient activity for doctor
CREATE OR REPLACE FUNCTION get_doctor_recent_activity(
  doctor_id_param UUID,
  limit_param INTEGER DEFAULT 20
)
RETURNS TABLE (
  activity_type TEXT,
  activity_description TEXT,
  patient_name TEXT,
  patient_id UUID,
  related_id UUID,
  timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Recent visits
    SELECT
      'visit'::TEXT AS activity_type,
      ('Patient checked in with ' || pv.chief_complaint) AS activity_description,
      CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
      p.id AS patient_id,
      pv.id AS related_id,
      pv.check_in_time AS timestamp
    FROM patient_visits pv
    JOIN patients p ON pv.patient_id = p.id
    WHERE pv.attending_doctor_id = doctor_id_param
    AND pv.check_in_time >= (NOW() - INTERVAL '7 days')
  )
  UNION ALL
  (
    -- Recent prescriptions
    SELECT
      'prescription'::TEXT AS activity_type,
      'Prescription created' AS activity_description,
      CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
      p.id AS patient_id,
      pr.id AS related_id,
      pr.created_at AS timestamp
    FROM prescriptions pr
    JOIN patients p ON pr.patient_id = p.id
    WHERE pr.doctor_id = doctor_id_param
    AND pr.created_at >= (NOW() - INTERVAL '7 days')
  )
  UNION ALL
  (
    -- Recent lab orders
    SELECT
      'lab_order'::TEXT AS activity_type,
      ('Lab order: ' || lo.test_type) AS activity_description,
      CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
      p.id AS patient_id,
      lo.id AS related_id,
      lo.created_at AS timestamp
    FROM lab_orders lo
    JOIN patients p ON lo.patient_id = p.id
    WHERE lo.ordered_by = doctor_id_param
    AND lo.created_at >= (NOW() - INTERVAL '7 days')
  )
  UNION ALL
  (
    -- Recent radiology orders
    SELECT
      'radiology_order'::TEXT AS activity_type,
      ('Radiology order: ' || ro.imaging_type || ' - ' || ro.body_part) AS activity_description,
      CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
      p.id AS patient_id,
      ro.id AS related_id,
      ro.created_at AS timestamp
    FROM radiology_orders ro
    JOIN patients p ON ro.patient_id = p.id
    WHERE ro.ordered_by = doctor_id_param
    AND ro.created_at >= (NOW() - INTERVAL '7 days')
  )
  ORDER BY timestamp DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Search patients by name or ID
CREATE OR REPLACE FUNCTION search_patients(
  search_term TEXT,
  limit_param INTEGER DEFAULT 20
)
RETURNS TABLE (
  patient_id UUID,
  patient_name TEXT,
  date_of_birth DATE,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  national_id TEXT,
  last_visit_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.date_of_birth,
    EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER AS age,
    p.gender,
    p.phone,
    p.national_id,
    (
      SELECT MAX(pv.check_in_time)
      FROM patient_visits pv
      WHERE pv.patient_id = p.id
    ) AS last_visit_date
  FROM patients p
  WHERE
    LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER('%' || search_term || '%')
    OR p.national_id LIKE '%' || search_term || '%'
    OR p.phone LIKE '%' || search_term || '%'
  ORDER BY p.last_name, p.first_name
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get available medication list for prescriptions
CREATE OR REPLACE FUNCTION get_available_medications(
  search_term TEXT DEFAULT NULL,
  in_stock_only BOOLEAN DEFAULT true
)
RETURNS TABLE (
  medication_id UUID,
  medication_name TEXT,
  generic_name TEXT,
  manufacturer TEXT,
  quantity_available INTEGER,
  unit_price NUMERIC,
  is_controlled_substance BOOLEAN,
  requires_prescription BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pi.id AS medication_id,
    pi.medication_name,
    pi.generic_name,
    pi.manufacturer,
    pi.quantity_available,
    pi.unit_price,
    pi.is_controlled_substance,
    pi.requires_prescription
  FROM pharmacy_inventory pi
  WHERE
    (NOT in_stock_only OR pi.quantity_available > 0)
    AND pi.expiry_date > CURRENT_DATE
    AND (search_term IS NULL OR
         LOWER(pi.medication_name) LIKE LOWER('%' || search_term || '%') OR
         LOWER(pi.generic_name) LIKE LOWER('%' || search_term || '%'))
  ORDER BY pi.medication_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Doctor Dashboard Backend Functions Created';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All functions are ready to use!';
  RAISE NOTICE '========================================';
END $$;
