-- HospitalGuard: Prescription Verification Database Functions
-- Functions for verifying prescription authenticity via QR code

-- ============================================================================
-- Function: Get prescription details for public verification
-- ============================================================================
-- This function returns prescription details needed for QR code verification
-- It's designed to be called without authentication for public verification

CREATE OR REPLACE FUNCTION get_prescription_for_verification(
  prescription_number_param TEXT
)
RETURNS TABLE (
  prescription_id UUID,
  prescription_number TEXT,
  patient_id UUID,
  patient_name TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  visit_number TEXT,
  doctor_id UUID,
  doctor_name TEXT,
  doctor_license TEXT,
  doctor_specialization TEXT,
  department_name TEXT,
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as prescription_id,
    p.prescription_number,
    p.patient_id,
    (pt.first_name || ' ' || pt.last_name)::TEXT as patient_name,
    EXTRACT(YEAR FROM AGE(pt.date_of_birth))::INTEGER as patient_age,
    pt.gender::TEXT as patient_gender,
    pv.visit_number::TEXT,
    p.doctor_id,
    (hs.first_name || ' ' || hs.last_name)::TEXT as doctor_name,
    hs.license_number::TEXT as doctor_license,
    hs.specialization::TEXT as doctor_specialization,
    d.name::TEXT as department_name,
    p.status,
    p.qr_code_data,
    p.digital_signature,
    p.signed_at,
    p.notes,
    p.is_controlled_substance,
    p.refills_allowed,
    p.valid_until,
    p.created_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'medication_name', pi.medication_name,
            'dosage', pi.dosage,
            'frequency', pi.frequency,
            'duration', pi.duration,
            'quantity', pi.quantity,
            'instructions', pi.instructions,
            'is_controlled_substance', pi.is_controlled_substance,
            'dispensed_quantity', pi.dispensed_quantity
          )
          ORDER BY pi.created_at
        )
        FROM prescription_items pi
        WHERE pi.prescription_id = p.id
      ),
      '[]'::jsonb
    ) as items
  FROM prescriptions p
  JOIN patients pt ON p.patient_id = pt.id
  JOIN hospital_staff hs ON p.doctor_id = hs.id
  LEFT JOIN patient_visits pv ON p.visit_id = pv.id
  LEFT JOIN departments d ON hs.department_id = d.id
  WHERE p.prescription_number = prescription_number_param;
END;
$$;

-- ============================================================================
-- Function: Update prescription signature
-- ============================================================================
-- Updates the digital signature and QR code data when a doctor signs

CREATE OR REPLACE FUNCTION update_prescription_signature(
  prescription_id_param UUID,
  doctor_id_param UUID,
  digital_signature_param TEXT,
  qr_code_data_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status TEXT;
  prescription_doctor_id UUID;
BEGIN
  -- Get current prescription details
  SELECT status, doctor_id INTO current_status, prescription_doctor_id
  FROM prescriptions
  WHERE id = prescription_id_param;

  -- Verify prescription exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prescription not found';
  END IF;

  -- Verify doctor ownership
  IF prescription_doctor_id != doctor_id_param THEN
    RAISE EXCEPTION 'Only the prescribing doctor can sign this prescription';
  END IF;

  -- Verify prescription is in pending status
  IF current_status != 'pending' THEN
    RAISE EXCEPTION 'Only pending prescriptions can be signed. Current status: %', current_status;
  END IF;

  -- Update the prescription with signature
  UPDATE prescriptions
  SET
    digital_signature = digital_signature_param,
    qr_code_data = COALESCE(qr_code_data_param, qr_code_data),
    status = 'signed',
    signed_at = NOW(),
    updated_at = NOW()
  WHERE id = prescription_id_param;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- Function: Verify prescription for dispensing
-- ============================================================================
-- Called by pharmacists before dispensing to verify prescription is valid

CREATE OR REPLACE FUNCTION verify_prescription_for_dispensing(
  prescription_number_param TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  status TEXT,
  message TEXT,
  prescription_id UUID,
  patient_name TEXT,
  doctor_name TEXT,
  items_count INTEGER,
  is_controlled_substance BOOLEAN,
  valid_until DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rx_record RECORD;
BEGIN
  -- Get prescription details
  SELECT
    p.id,
    p.status as rx_status,
    p.digital_signature,
    p.valid_until,
    p.is_controlled_substance,
    (pt.first_name || ' ' || pt.last_name) as patient_name,
    (hs.first_name || ' ' || hs.last_name) as doctor_name,
    (SELECT COUNT(*) FROM prescription_items WHERE prescription_id = p.id)::INTEGER as items_count
  INTO rx_record
  FROM prescriptions p
  JOIN patients pt ON p.patient_id = pt.id
  JOIN hospital_staff hs ON p.doctor_id = hs.id
  WHERE p.prescription_number = prescription_number_param;

  -- Check if prescription exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      FALSE,
      'not_found'::TEXT,
      'Prescription not found in the system'::TEXT,
      NULL::UUID,
      NULL::TEXT,
      NULL::TEXT,
      NULL::INTEGER,
      NULL::BOOLEAN,
      NULL::DATE;
    RETURN;
  END IF;

  -- Check if prescription is signed
  IF rx_record.digital_signature IS NULL OR rx_record.rx_status = 'pending' THEN
    RETURN QUERY SELECT
      FALSE,
      'unsigned'::TEXT,
      'Prescription has not been digitally signed'::TEXT,
      rx_record.id,
      rx_record.patient_name::TEXT,
      rx_record.doctor_name::TEXT,
      rx_record.items_count,
      rx_record.is_controlled_substance,
      rx_record.valid_until;
    RETURN;
  END IF;

  -- Check if prescription is expired
  IF rx_record.valid_until < CURRENT_DATE THEN
    RETURN QUERY SELECT
      FALSE,
      'expired'::TEXT,
      'Prescription has expired'::TEXT,
      rx_record.id,
      rx_record.patient_name::TEXT,
      rx_record.doctor_name::TEXT,
      rx_record.items_count,
      rx_record.is_controlled_substance,
      rx_record.valid_until;
    RETURN;
  END IF;

  -- Check if prescription is cancelled
  IF rx_record.rx_status = 'cancelled' THEN
    RETURN QUERY SELECT
      FALSE,
      'cancelled'::TEXT,
      'Prescription has been cancelled'::TEXT,
      rx_record.id,
      rx_record.patient_name::TEXT,
      rx_record.doctor_name::TEXT,
      rx_record.items_count,
      rx_record.is_controlled_substance,
      rx_record.valid_until;
    RETURN;
  END IF;

  -- Check if already fully dispensed
  IF rx_record.rx_status = 'dispensed' THEN
    RETURN QUERY SELECT
      FALSE,
      'dispensed'::TEXT,
      'Prescription has already been fully dispensed'::TEXT,
      rx_record.id,
      rx_record.patient_name::TEXT,
      rx_record.doctor_name::TEXT,
      rx_record.items_count,
      rx_record.is_controlled_substance,
      rx_record.valid_until;
    RETURN;
  END IF;

  -- Prescription is valid
  RETURN QUERY SELECT
    TRUE,
    rx_record.rx_status,
    'Prescription is valid for dispensing'::TEXT,
    rx_record.id,
    rx_record.patient_name::TEXT,
    rx_record.doctor_name::TEXT,
    rx_record.items_count,
    rx_record.is_controlled_substance,
    rx_record.valid_until;
END;
$$;

-- ============================================================================
-- Function: Log prescription verification
-- ============================================================================
-- Creates an audit log entry when a prescription is verified

CREATE OR REPLACE FUNCTION log_prescription_verification(
  prescription_id_param UUID,
  verification_source TEXT DEFAULT 'qr_scan', -- 'qr_scan', 'manual', 'api'
  verifier_info TEXT DEFAULT NULL,
  verification_result BOOLEAN DEFAULT TRUE,
  ip_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_by,
    created_at
  ) VALUES (
    'prescriptions',
    prescription_id_param,
    'VERIFICATION',
    NULL,
    jsonb_build_object(
      'source', verification_source,
      'verifier', verifier_info,
      'result', verification_result,
      'ip_address', ip_address,
      'verified_at', NOW()
    ),
    NULL, -- Anonymous verification
    NOW()
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- ============================================================================
-- Grant permissions for public verification
-- ============================================================================

-- Allow anonymous access to verification function
-- Note: In production, you may want to rate-limit this or add additional security
GRANT EXECUTE ON FUNCTION get_prescription_for_verification(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_prescription_for_dispensing(TEXT) TO anon;

-- Comments for documentation
COMMENT ON FUNCTION get_prescription_for_verification IS
  'Returns prescription details for QR code verification. Publicly accessible.';

COMMENT ON FUNCTION update_prescription_signature IS
  'Updates digital signature when doctor signs prescription. Requires authentication.';

COMMENT ON FUNCTION verify_prescription_for_dispensing IS
  'Validates prescription status before dispensing. Returns validity status and details.';

COMMENT ON FUNCTION log_prescription_verification IS
  'Creates audit log entry for prescription verifications.';
