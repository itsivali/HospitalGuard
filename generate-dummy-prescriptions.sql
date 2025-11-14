-- ============================================================================
-- GENERATE DUMMY PRESCRIPTION DATA
-- ============================================================================
-- This script creates realistic prescription data for the HospitalGuard system
-- Run this AFTER hospital-seed.sql and pharmacy-medication-categories.sql
-- ============================================================================

-- Optional: Clear existing prescription data (uncomment if you want to start fresh)
-- DELETE FROM medication_dispensing;
-- DELETE FROM prescription_items;
-- DELETE FROM prescriptions;

DO $$
DECLARE
  patient_record RECORD;
  doctor_record RECORD;
  visit_record UUID;
  prescription_id UUID;
  prescription_num TEXT;
  counter INTEGER := 1;
  max_existing_counter INTEGER := 0;
BEGIN
  -- Find the highest existing prescription number to avoid duplicates
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(prescription_number FROM 'RX-2025-(\d+)')
        AS INTEGER
      )
    ), 0
  ) INTO max_existing_counter
  FROM prescriptions
  WHERE prescription_number ~ '^RX-2025-\d+$';

  -- Start counter after the highest existing number
  counter := max_existing_counter + 1;

  RAISE NOTICE 'Starting prescription counter at: %', counter;
  -- Loop through patients and create prescriptions
  FOR patient_record IN
    SELECT id FROM patients ORDER BY created_at LIMIT 16
  LOOP
    -- Get a random doctor
    FOR doctor_record IN
      SELECT id FROM hospital_staff
      WHERE staff_type = 'doctor'
      ORDER BY RANDOM()
      LIMIT 1
    LOOP
      -- Get patient's visit if exists
      SELECT id INTO visit_record FROM patient_visits
      WHERE patient_id = patient_record.id
      ORDER BY check_in_time DESC
      LIMIT 1;

      -- Generate prescription number
      prescription_num := 'RX-2025-' || LPAD(counter::TEXT, 3, '0');
      counter := counter + 1;

      -- Create prescription (1-3 prescriptions per patient)
      FOR i IN 1..(1 + floor(random() * 2)::int) LOOP
        prescription_id := uuid_generate_v4();

        INSERT INTO prescriptions (
          id,
          prescription_number,
          patient_id,
          visit_id,
          doctor_id,
          status,
          digital_signature,
          qr_code_data,
          notes,
          created_at,
          signed_at
        ) VALUES (
          prescription_id,
          prescription_num,
          patient_record.id,
          visit_record,
          doctor_record.id,
          CASE
            WHEN random() < 0.3 THEN 'pending'
            WHEN random() < 0.6 THEN 'signed'
            WHEN random() < 0.85 THEN 'dispensed'
            ELSE 'partially_dispensed'
          END,
          'Dr. ' || (SELECT first_name || ' ' || last_name FROM hospital_staff WHERE id = doctor_record.id) || ' - Digital Signature',
          'QR-' || prescription_num || '-' || encode(gen_random_bytes(8), 'hex'),
          CASE
            WHEN random() < 0.5 THEN 'Take with food. Avoid alcohol.'
            WHEN random() < 0.7 THEN 'Complete full course even if symptoms improve.'
            ELSE 'May cause drowsiness. Do not drive.'
          END,
          NOW() - (random() * INTERVAL '30 days'),
          NOW() - (random() * INTERVAL '25 days')
        );

        -- Add prescription items (medications)
        -- Add 1-3 medications per prescription using available inventory
        FOR med_count IN 1..(1 + floor(random() * 2)::int) LOOP
          INSERT INTO prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, instructions)
          SELECT
            prescription_id,
            pi.medication_name,
            CASE
              WHEN random() < 0.3 THEN '10mg'
              WHEN random() < 0.6 THEN '25mg'
              ELSE '50mg'
            END,
            CASE
              WHEN random() < 0.3 THEN 'Once daily'
              WHEN random() < 0.6 THEN 'Twice daily'
              ELSE 'Three times daily'
            END,
            CASE
              WHEN random() < 0.4 THEN '7 days'
              WHEN random() < 0.7 THEN '14 days'
              ELSE '30 days'
            END,
            CASE
              WHEN random() < 0.4 THEN 7
              WHEN random() < 0.7 THEN 14
              ELSE 30
            END,
            CASE
              WHEN random() < 0.3 THEN 'Take with food'
              WHEN random() < 0.6 THEN 'Take before meals'
              ELSE 'Take as directed'
            END
          FROM pharmacy_inventory pi
          WHERE pi.quantity_available > 0
          ORDER BY RANDOM()
          LIMIT 1;
        END LOOP;

        prescription_num := 'RX-2025-' || LPAD(counter::TEXT, 3, '0');
        counter := counter + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Successfully created dummy prescription data!';
END $$;

-- Create dispensing log for dispensed prescriptions
DO $$
DECLARE
  rx_record RECORD;
  pharmacist_id UUID;
BEGIN
  -- Get a pharmacist
  SELECT id INTO pharmacist_id
  FROM hospital_staff
  WHERE staff_type = 'pharmacist'
  LIMIT 1;

  -- Create dispensing logs for dispensed/partially dispensed prescriptions
  FOR rx_record IN
    SELECT p.id as prescription_id, p.patient_id, pi.id as item_id, pi.medication_name, pi.quantity
    FROM prescriptions p
    INNER JOIN prescription_items pi ON pi.prescription_id = p.id
    WHERE p.status IN ('dispensed', 'partially_dispensed')
  LOOP
    INSERT INTO medication_dispensing (
      prescription_id,
      prescription_item_id,
      patient_id,
      pharmacist_id,
      medication_name,
      quantity_dispensed,
      dispensed_at,
      notes
    ) VALUES (
      rx_record.prescription_id,
      rx_record.item_id,
      rx_record.patient_id,
      pharmacist_id,
      rx_record.medication_name,
      rx_record.quantity,
      NOW() - (random() * INTERVAL '25 days'),
      'Dispensed as prescribed. Patient counseled on usage.'
    );
  END LOOP;

  RAISE NOTICE 'Successfully created dispensing logs!';
END $$;

-- Display summary
DO $$
DECLARE
  total_prescriptions INTEGER;
  total_items INTEGER;
  total_dispensed INTEGER;
  pending_count INTEGER;
  signed_count INTEGER;
  dispensed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_prescriptions FROM prescriptions;
  SELECT COUNT(*) INTO total_items FROM prescription_items;
  SELECT COUNT(*) INTO total_dispensed FROM medication_dispensing;
  SELECT COUNT(*) INTO pending_count FROM prescriptions WHERE status = 'pending';
  SELECT COUNT(*) INTO signed_count FROM prescriptions WHERE status = 'signed';
  SELECT COUNT(*) INTO dispensed_count FROM prescriptions WHERE status = 'dispensed';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'PRESCRIPTION DATA SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Prescriptions: %', total_prescriptions;
  RAISE NOTICE 'Total Prescription Items: %', total_items;
  RAISE NOTICE 'Total Dispensing Records: %', total_dispensed;
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Pending: %', pending_count;
  RAISE NOTICE 'Signed: %', signed_count;
  RAISE NOTICE 'Dispensed: %', dispensed_count;
  RAISE NOTICE '========================================';
END $$;

-- Verify data
SELECT
  'Prescriptions by Status' as category,
  status,
  COUNT(*) as count
FROM prescriptions
GROUP BY status
ORDER BY count DESC;

SELECT
  'Top Prescribed Medications' as category,
  medication_name,
  COUNT(*) as prescription_count
FROM prescription_items
GROUP BY medication_name
ORDER BY prescription_count DESC
LIMIT 10;
