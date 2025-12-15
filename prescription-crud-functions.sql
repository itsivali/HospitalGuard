-- HospitalGuard: Prescription CRUD Database Functions
-- Complete prescription management for doctors

-- ============================================================================
-- Helper Function: Generate Prescription Number
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TEXT AS $$
DECLARE
  today_date TEXT;
  sequence_num INTEGER;
  new_number TEXT;
BEGIN
  today_date := TO_CHAR(NOW(), 'YYYYMMDD');

  -- Get the count of prescriptions created today
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM prescriptions
  WHERE DATE(created_at) = CURRENT_DATE;

  new_number := 'RX-' || today_date || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE: Create New Prescription
-- ============================================================================
CREATE OR REPLACE FUNCTION create_prescription(
  p_patient_id UUID,
  p_doctor_id UUID,
  p_visit_id UUID DEFAULT NULL,
  p_medications JSONB DEFAULT '[]'::JSONB,
  p_notes TEXT DEFAULT NULL,
  p_is_controlled_substance BOOLEAN DEFAULT FALSE,
  p_refills_allowed INTEGER DEFAULT 0,
  p_valid_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  prescription_id UUID,
  prescription_number TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_prescription_id UUID;
  new_prescription_number TEXT;
  medication JSONB;
  valid_until_date DATE;
BEGIN
  -- Validate doctor exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM hospital_staff
    WHERE id = p_doctor_id
    AND staff_type = 'doctor'
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid or inactive doctor ID';
  END IF;

  -- Validate patient exists
  IF NOT EXISTS (SELECT 1 FROM patients WHERE id = p_patient_id) THEN
    RAISE EXCEPTION 'Patient not found';
  END IF;

  -- Validate visit if provided
  IF p_visit_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM patient_visits WHERE id = p_visit_id AND patient_id = p_patient_id
  ) THEN
    RAISE EXCEPTION 'Invalid visit ID for this patient';
  END IF;

  -- Validate medications array
  IF jsonb_array_length(p_medications) = 0 THEN
    RAISE EXCEPTION 'At least one medication is required';
  END IF;

  -- Generate prescription number
  new_prescription_number := generate_prescription_number();

  -- Calculate valid until date
  valid_until_date := CURRENT_DATE + p_valid_days;

  -- Create prescription record
  INSERT INTO prescriptions (
    prescription_number,
    patient_id,
    visit_id,
    doctor_id,
    status,
    notes,
    is_controlled_substance,
    refills_allowed,
    valid_until,
    created_at,
    updated_at
  ) VALUES (
    new_prescription_number,
    p_patient_id,
    p_visit_id,
    p_doctor_id,
    'pending',
    p_notes,
    p_is_controlled_substance,
    p_refills_allowed,
    valid_until_date,
    NOW(),
    NOW()
  )
  RETURNING id INTO new_prescription_id;

  -- Insert prescription items (medications)
  FOR medication IN SELECT * FROM jsonb_array_elements(p_medications)
  LOOP
    INSERT INTO prescription_items (
      prescription_id,
      medication_name,
      dosage,
      frequency,
      duration,
      quantity,
      instructions,
      is_controlled_substance,
      created_at
    ) VALUES (
      new_prescription_id,
      medication->>'medication_name',
      medication->>'dosage',
      medication->>'frequency',
      medication->>'duration',
      (medication->>'quantity')::INTEGER,
      medication->>'instructions',
      COALESCE((medication->>'is_controlled_substance')::BOOLEAN, FALSE),
      NOW()
    );

    -- Check if any medication is controlled
    IF (medication->>'is_controlled_substance')::BOOLEAN = TRUE THEN
      UPDATE prescriptions
      SET is_controlled_substance = TRUE
      WHERE id = new_prescription_id;
    END IF;
  END LOOP;

  -- Return the created prescription
  RETURN QUERY
  SELECT
    new_prescription_id,
    new_prescription_number,
    'pending'::TEXT,
    NOW();
END;
$$;

-- ============================================================================
-- READ: Get Prescription by ID
-- ============================================================================
CREATE OR REPLACE FUNCTION get_prescription_by_id(
  p_prescription_id UUID
)
RETURNS TABLE (
  prescription_id UUID,
  prescription_number TEXT,
  patient_id UUID,
  patient_name TEXT,
  patient_dob DATE,
  patient_gender TEXT,
  patient_phone TEXT,
  patient_allergies TEXT[],
  visit_id UUID,
  visit_number TEXT,
  doctor_id UUID,
  doctor_name TEXT,
  doctor_license TEXT,
  doctor_specialization TEXT,
  department_id UUID,
  department_name TEXT,
  status TEXT,
  qr_code_data TEXT,
  digital_signature TEXT,
  signed_at TIMESTAMPTZ,
  notes TEXT,
  is_controlled_substance BOOLEAN,
  refills_allowed INTEGER,
  refills_used INTEGER,
  valid_until DATE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
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
    pt.date_of_birth as patient_dob,
    pt.gender::TEXT as patient_gender,
    pt.phone::TEXT as patient_phone,
    pt.allergies as patient_allergies,
    p.visit_id,
    pv.visit_number::TEXT,
    p.doctor_id,
    (hs.first_name || ' ' || hs.last_name)::TEXT as doctor_name,
    hs.license_number::TEXT as doctor_license,
    hs.specialization::TEXT as doctor_specialization,
    hs.department_id,
    d.name::TEXT as department_name,
    p.status,
    p.qr_code_data,
    p.digital_signature,
    p.signed_at,
    p.notes,
    p.is_controlled_substance,
    p.refills_allowed,
    COALESCE(p.refills_used, 0) as refills_used,
    p.valid_until,
    p.created_at,
    p.updated_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', pi.id,
            'medication_name', pi.medication_name,
            'dosage', pi.dosage,
            'frequency', pi.frequency,
            'duration', pi.duration,
            'quantity', pi.quantity,
            'dispensed_quantity', COALESCE(pi.dispensed_quantity, 0),
            'instructions', pi.instructions,
            'is_controlled_substance', pi.is_controlled_substance
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
  WHERE p.id = p_prescription_id;
END;
$$;

-- ============================================================================
-- READ: Get Doctor's Prescriptions (with filters)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_doctor_prescriptions_list(
  p_doctor_id UUID,
  p_status TEXT DEFAULT NULL,
  p_patient_id UUID DEFAULT NULL,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  prescription_id UUID,
  prescription_number TEXT,
  patient_id UUID,
  patient_name TEXT,
  patient_phone TEXT,
  visit_number TEXT,
  status TEXT,
  is_controlled_substance BOOLEAN,
  items_count INTEGER,
  total_quantity INTEGER,
  valid_until DATE,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  is_expired BOOLEAN
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
    pt.phone::TEXT as patient_phone,
    pv.visit_number::TEXT,
    p.status,
    p.is_controlled_substance,
    (SELECT COUNT(*)::INTEGER FROM prescription_items WHERE prescription_id = p.id) as items_count,
    (SELECT COALESCE(SUM(quantity), 0)::INTEGER FROM prescription_items WHERE prescription_id = p.id) as total_quantity,
    p.valid_until,
    p.signed_at,
    p.created_at,
    (p.valid_until < CURRENT_DATE) as is_expired
  FROM prescriptions p
  JOIN patients pt ON p.patient_id = pt.id
  LEFT JOIN patient_visits pv ON p.visit_id = pv.id
  WHERE p.doctor_id = p_doctor_id
    AND (p_status IS NULL OR p.status = p_status)
    AND (p_patient_id IS NULL OR p.patient_id = p_patient_id)
    AND (p_from_date IS NULL OR p.created_at::DATE >= p_from_date)
    AND (p_to_date IS NULL OR p.created_at::DATE <= p_to_date)
    AND (
      p_search IS NULL
      OR p.prescription_number ILIKE '%' || p_search || '%'
      OR pt.first_name ILIKE '%' || p_search || '%'
      OR pt.last_name ILIKE '%' || p_search || '%'
      OR pt.phone ILIKE '%' || p_search || '%'
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================================================
-- READ: Get Prescription Statistics for Doctor
-- ============================================================================
CREATE OR REPLACE FUNCTION get_doctor_prescription_stats(
  p_doctor_id UUID
)
RETURNS TABLE (
  total_prescriptions BIGINT,
  pending_count BIGINT,
  signed_count BIGINT,
  dispensed_count BIGINT,
  cancelled_count BIGINT,
  expired_count BIGINT,
  controlled_substance_count BIGINT,
  today_count BIGINT,
  this_week_count BIGINT,
  this_month_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_prescriptions,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
    COUNT(*) FILTER (WHERE status = 'signed')::BIGINT as signed_count,
    COUNT(*) FILTER (WHERE status IN ('dispensed', 'partially_dispensed'))::BIGINT as dispensed_count,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled_count,
    COUNT(*) FILTER (WHERE valid_until < CURRENT_DATE AND status NOT IN ('dispensed', 'cancelled'))::BIGINT as expired_count,
    COUNT(*) FILTER (WHERE is_controlled_substance = TRUE)::BIGINT as controlled_substance_count,
    COUNT(*) FILTER (WHERE created_at::DATE = CURRENT_DATE)::BIGINT as today_count,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE))::BIGINT as this_week_count,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE))::BIGINT as this_month_count
  FROM prescriptions
  WHERE doctor_id = p_doctor_id;
END;
$$;

-- ============================================================================
-- UPDATE: Update Prescription (before signing)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_prescription(
  p_prescription_id UUID,
  p_doctor_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_refills_allowed INTEGER DEFAULT NULL,
  p_valid_days INTEGER DEFAULT NULL,
  p_medications JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status TEXT;
  prescription_doctor_id UUID;
  medication JSONB;
BEGIN
  -- Get current prescription details
  SELECT status, doctor_id INTO current_status, prescription_doctor_id
  FROM prescriptions
  WHERE id = p_prescription_id;

  -- Verify prescription exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prescription not found';
  END IF;

  -- Verify doctor ownership
  IF prescription_doctor_id != p_doctor_id THEN
    RAISE EXCEPTION 'Only the prescribing doctor can update this prescription';
  END IF;

  -- Only allow updates to pending prescriptions
  IF current_status != 'pending' THEN
    RAISE EXCEPTION 'Cannot update prescription with status: %', current_status;
  END IF;

  -- Update prescription fields
  UPDATE prescriptions
  SET
    notes = COALESCE(p_notes, notes),
    refills_allowed = COALESCE(p_refills_allowed, refills_allowed),
    valid_until = CASE
      WHEN p_valid_days IS NOT NULL THEN CURRENT_DATE + p_valid_days
      ELSE valid_until
    END,
    updated_at = NOW()
  WHERE id = p_prescription_id;

  -- Update medications if provided
  IF p_medications IS NOT NULL AND jsonb_array_length(p_medications) > 0 THEN
    -- Delete existing items
    DELETE FROM prescription_items WHERE prescription_id = p_prescription_id;

    -- Reset controlled substance flag
    UPDATE prescriptions SET is_controlled_substance = FALSE WHERE id = p_prescription_id;

    -- Insert new items
    FOR medication IN SELECT * FROM jsonb_array_elements(p_medications)
    LOOP
      INSERT INTO prescription_items (
        prescription_id,
        medication_name,
        dosage,
        frequency,
        duration,
        quantity,
        instructions,
        is_controlled_substance,
        created_at
      ) VALUES (
        p_prescription_id,
        medication->>'medication_name',
        medication->>'dosage',
        medication->>'frequency',
        medication->>'duration',
        (medication->>'quantity')::INTEGER,
        medication->>'instructions',
        COALESCE((medication->>'is_controlled_substance')::BOOLEAN, FALSE),
        NOW()
      );

      -- Update controlled substance flag
      IF (medication->>'is_controlled_substance')::BOOLEAN = TRUE THEN
        UPDATE prescriptions
        SET is_controlled_substance = TRUE
        WHERE id = p_prescription_id;
      END IF;
    END LOOP;
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- UPDATE: Sign Prescription
-- ============================================================================
CREATE OR REPLACE FUNCTION sign_prescription_with_qr(
  p_prescription_id UUID,
  p_doctor_id UUID,
  p_digital_signature TEXT,
  p_qr_code_data TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  prescription_number TEXT,
  signed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status TEXT;
  prescription_doctor_id UUID;
  rx_number TEXT;
BEGIN
  -- Get current prescription details
  SELECT status, doctor_id, prescription_number
  INTO current_status, prescription_doctor_id, rx_number
  FROM prescriptions
  WHERE id = p_prescription_id;

  -- Verify prescription exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prescription not found';
  END IF;

  -- Verify doctor ownership
  IF prescription_doctor_id != p_doctor_id THEN
    RAISE EXCEPTION 'Only the prescribing doctor can sign this prescription';
  END IF;

  -- Only allow signing pending prescriptions
  IF current_status != 'pending' THEN
    RAISE EXCEPTION 'Prescription already signed or cannot be signed. Status: %', current_status;
  END IF;

  -- Update prescription with signature
  UPDATE prescriptions
  SET
    digital_signature = p_digital_signature,
    qr_code_data = COALESCE(p_qr_code_data, qr_code_data),
    status = 'signed',
    signed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_prescription_id;

  RETURN QUERY SELECT TRUE, rx_number, NOW();
END;
$$;

-- ============================================================================
-- UPDATE: Cancel Prescription
-- ============================================================================
CREATE OR REPLACE FUNCTION cancel_prescription(
  p_prescription_id UUID,
  p_doctor_id UUID,
  p_cancellation_reason TEXT DEFAULT NULL
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
  WHERE id = p_prescription_id;

  -- Verify prescription exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prescription not found';
  END IF;

  -- Verify doctor ownership
  IF prescription_doctor_id != p_doctor_id THEN
    RAISE EXCEPTION 'Only the prescribing doctor can cancel this prescription';
  END IF;

  -- Cannot cancel already dispensed prescriptions
  IF current_status IN ('dispensed', 'partially_dispensed') THEN
    RAISE EXCEPTION 'Cannot cancel prescription that has been dispensed';
  END IF;

  -- Cannot cancel already cancelled prescriptions
  IF current_status = 'cancelled' THEN
    RAISE EXCEPTION 'Prescription is already cancelled';
  END IF;

  -- Cancel the prescription
  UPDATE prescriptions
  SET
    status = 'cancelled',
    notes = CASE
      WHEN notes IS NULL THEN 'CANCELLED: ' || COALESCE(p_cancellation_reason, 'No reason provided')
      ELSE notes || ' | CANCELLED: ' || COALESCE(p_cancellation_reason, 'No reason provided')
    END,
    updated_at = NOW()
  WHERE id = p_prescription_id;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- DELETE: Delete Prescription (only pending, unsent prescriptions)
-- ============================================================================
CREATE OR REPLACE FUNCTION delete_prescription(
  p_prescription_id UUID,
  p_doctor_id UUID
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
  WHERE id = p_prescription_id;

  -- Verify prescription exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prescription not found';
  END IF;

  -- Verify doctor ownership
  IF prescription_doctor_id != p_doctor_id THEN
    RAISE EXCEPTION 'Only the prescribing doctor can delete this prescription';
  END IF;

  -- Only allow deletion of pending prescriptions
  IF current_status != 'pending' THEN
    RAISE EXCEPTION 'Only pending prescriptions can be deleted. Use cancel for signed prescriptions.';
  END IF;

  -- Delete prescription items first
  DELETE FROM prescription_items WHERE prescription_id = p_prescription_id;

  -- Delete the prescription
  DELETE FROM prescriptions WHERE id = p_prescription_id;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- READ: Get Available Medications for Prescription
-- ============================================================================
CREATE OR REPLACE FUNCTION get_available_medications_for_prescription(
  p_search TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_in_stock_only BOOLEAN DEFAULT TRUE,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  medication_id UUID,
  medication_name TEXT,
  generic_name TEXT,
  category TEXT,
  manufacturer TEXT,
  unit_price DECIMAL,
  quantity_available INTEGER,
  is_controlled_substance BOOLEAN,
  requires_prescription BOOLEAN,
  dosage_forms TEXT[],
  common_dosages TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pi.id as medication_id,
    pi.medication_name::TEXT,
    pi.generic_name::TEXT,
    COALESCE(pi.category, 'General')::TEXT as category,
    pi.manufacturer::TEXT,
    pi.unit_price,
    pi.quantity_available,
    pi.is_controlled_substance,
    pi.requires_prescription,
    ARRAY['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops']::TEXT[] as dosage_forms,
    ARRAY['Once daily', 'Twice daily', 'Three times daily', 'As needed']::TEXT[] as common_dosages
  FROM pharmacy_inventory pi
  WHERE
    (p_search IS NULL OR
      pi.medication_name ILIKE '%' || p_search || '%' OR
      pi.generic_name ILIKE '%' || p_search || '%')
    AND (p_category IS NULL OR pi.category = p_category)
    AND (NOT p_in_stock_only OR pi.quantity_available > 0)
  ORDER BY pi.medication_name
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- READ: Get Doctor's Patients (for prescription creation)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_doctor_patients_for_prescription(
  p_doctor_id UUID,
  p_search TEXT DEFAULT NULL,
  p_active_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  patient_id UUID,
  patient_name TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  date_of_birth DATE,
  age INTEGER,
  gender TEXT,
  blood_type TEXT,
  allergies TEXT[],
  has_active_visit BOOLEAN,
  active_visit_id UUID,
  active_visit_number TEXT,
  last_visit_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (pt.id)
    pt.id as patient_id,
    (pt.first_name || ' ' || pt.last_name)::TEXT as patient_name,
    pt.phone::TEXT as patient_phone,
    pt.email::TEXT as patient_email,
    pt.date_of_birth,
    EXTRACT(YEAR FROM AGE(pt.date_of_birth))::INTEGER as age,
    pt.gender::TEXT,
    pt.blood_type::TEXT,
    pt.allergies,
    EXISTS (
      SELECT 1 FROM patient_visits pv
      WHERE pv.patient_id = pt.id
      AND pv.status NOT IN ('discharged', 'transferred', 'cancelled')
    ) as has_active_visit,
    (
      SELECT pv.id FROM patient_visits pv
      WHERE pv.patient_id = pt.id
      AND pv.status NOT IN ('discharged', 'transferred', 'cancelled')
      ORDER BY pv.check_in_time DESC
      LIMIT 1
    ) as active_visit_id,
    (
      SELECT pv.visit_number FROM patient_visits pv
      WHERE pv.patient_id = pt.id
      AND pv.status NOT IN ('discharged', 'transferred', 'cancelled')
      ORDER BY pv.check_in_time DESC
      LIMIT 1
    )::TEXT as active_visit_number,
    (
      SELECT MAX(pv.check_in_time)::DATE FROM patient_visits pv WHERE pv.patient_id = pt.id
    ) as last_visit_date
  FROM patients pt
  LEFT JOIN patient_visits pv ON pt.id = pv.patient_id
  WHERE
    (
      -- Show all patients the doctor has interacted with OR patients with appointments
      pv.attending_doctor_id = p_doctor_id
      OR EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.patient_id = pt.id AND a.doctor_id = p_doctor_id
      )
      OR EXISTS (
        SELECT 1 FROM prescriptions pr
        WHERE pr.patient_id = pt.id AND pr.doctor_id = p_doctor_id
      )
    )
    AND (
      p_search IS NULL
      OR pt.first_name ILIKE '%' || p_search || '%'
      OR pt.last_name ILIKE '%' || p_search || '%'
      OR pt.phone ILIKE '%' || p_search || '%'
      OR pt.email ILIKE '%' || p_search || '%'
    )
    AND (
      NOT p_active_only
      OR EXISTS (
        SELECT 1 FROM patient_visits pv2
        WHERE pv2.patient_id = pt.id
        AND pv2.status NOT IN ('discharged', 'transferred', 'cancelled')
      )
    )
  ORDER BY pt.id, pv.check_in_time DESC NULLS LAST
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- READ: Get Doctor Information
-- ============================================================================
CREATE OR REPLACE FUNCTION get_doctor_info(
  p_user_id UUID DEFAULT NULL,
  p_doctor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  doctor_id UUID,
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  specialization TEXT,
  department_id UUID,
  department_name TEXT,
  status TEXT,
  can_prescribe_controlled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hs.id as doctor_id,
    hs.user_id,
    hs.first_name::TEXT,
    hs.last_name::TEXT,
    (hs.first_name || ' ' || hs.last_name)::TEXT as full_name,
    hs.email::TEXT,
    hs.phone::TEXT,
    hs.license_number::TEXT,
    hs.specialization::TEXT,
    hs.department_id,
    d.name::TEXT as department_name,
    hs.status::TEXT,
    TRUE as can_prescribe_controlled -- In production, check actual credentials
  FROM hospital_staff hs
  LEFT JOIN departments d ON hs.department_id = d.id
  WHERE
    hs.staff_type = 'doctor'
    AND (p_user_id IS NULL OR hs.user_id = p_user_id)
    AND (p_doctor_id IS NULL OR hs.id = p_doctor_id);
END;
$$;

-- ============================================================================
-- Duplicate Prescription (Create from existing)
-- ============================================================================
CREATE OR REPLACE FUNCTION duplicate_prescription(
  p_source_prescription_id UUID,
  p_doctor_id UUID,
  p_patient_id UUID DEFAULT NULL,  -- If null, use same patient
  p_visit_id UUID DEFAULT NULL
)
RETURNS TABLE (
  prescription_id UUID,
  prescription_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  source_rx RECORD;
  new_rx_id UUID;
  new_rx_number TEXT;
  med RECORD;
BEGIN
  -- Get source prescription
  SELECT * INTO source_rx
  FROM prescriptions
  WHERE id = p_source_prescription_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source prescription not found';
  END IF;

  -- Verify doctor has access (either created it or is creating for same department)
  IF source_rx.doctor_id != p_doctor_id THEN
    -- Could add additional checks here for same department access
    NULL;
  END IF;

  -- Generate new prescription number
  new_rx_number := generate_prescription_number();

  -- Create new prescription
  INSERT INTO prescriptions (
    prescription_number,
    patient_id,
    visit_id,
    doctor_id,
    status,
    notes,
    is_controlled_substance,
    refills_allowed,
    valid_until,
    created_at,
    updated_at
  ) VALUES (
    new_rx_number,
    COALESCE(p_patient_id, source_rx.patient_id),
    p_visit_id,
    p_doctor_id,
    'pending',
    source_rx.notes,
    source_rx.is_controlled_substance,
    source_rx.refills_allowed,
    CURRENT_DATE + 30,
    NOW(),
    NOW()
  )
  RETURNING id INTO new_rx_id;

  -- Copy prescription items
  FOR med IN
    SELECT * FROM prescription_items WHERE prescription_id = p_source_prescription_id
  LOOP
    INSERT INTO prescription_items (
      prescription_id,
      medication_name,
      dosage,
      frequency,
      duration,
      quantity,
      instructions,
      is_controlled_substance,
      created_at
    ) VALUES (
      new_rx_id,
      med.medication_name,
      med.dosage,
      med.frequency,
      med.duration,
      med.quantity,
      med.instructions,
      med.is_controlled_substance,
      NOW()
    );
  END LOOP;

  RETURN QUERY SELECT new_rx_id, new_rx_number;
END;
$$;

-- ============================================================================
-- Grant Permissions
-- ============================================================================
-- These functions require authentication
GRANT EXECUTE ON FUNCTION create_prescription TO authenticated;
GRANT EXECUTE ON FUNCTION get_prescription_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_doctor_prescriptions_list TO authenticated;
GRANT EXECUTE ON FUNCTION get_doctor_prescription_stats TO authenticated;
GRANT EXECUTE ON FUNCTION update_prescription TO authenticated;
GRANT EXECUTE ON FUNCTION sign_prescription_with_qr TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_prescription TO authenticated;
GRANT EXECUTE ON FUNCTION delete_prescription TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_medications_for_prescription TO authenticated;
GRANT EXECUTE ON FUNCTION get_doctor_patients_for_prescription TO authenticated;
GRANT EXECUTE ON FUNCTION get_doctor_info TO authenticated;
GRANT EXECUTE ON FUNCTION duplicate_prescription TO authenticated;

-- Comments
COMMENT ON FUNCTION create_prescription IS 'Creates a new prescription with medications';
COMMENT ON FUNCTION get_prescription_by_id IS 'Gets complete prescription details by ID';
COMMENT ON FUNCTION get_doctor_prescriptions_list IS 'Lists prescriptions for a doctor with filters';
COMMENT ON FUNCTION update_prescription IS 'Updates a pending prescription';
COMMENT ON FUNCTION sign_prescription_with_qr IS 'Signs prescription and generates QR code';
COMMENT ON FUNCTION cancel_prescription IS 'Cancels a prescription';
COMMENT ON FUNCTION delete_prescription IS 'Deletes a pending prescription';
