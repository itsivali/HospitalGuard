-- ============================================================================
-- HospitalGuard: Dummy Appointment Generator
-- ============================================================================
-- Creates realistic appointment schedules for all patients in the database
-- Run AFTER hospital-patient-seed.sql and hospital-patient-seed-enhanced.sql
-- ============================================================================

-- ============================================================================
-- FUTURE APPOINTMENTS (Next 30 days - Realistic Daily Schedule)
-- ============================================================================

-- Generate appointments for all patients spread across the next 30 days
-- This creates a realistic doctor schedule with 8-12 appointments per day

-- Helper: Get all patients who need appointments
DO $$
DECLARE
  patient_record RECORD;
  doctor_record RECORD;
  dept_record RECORD;
  appointment_date DATE;
  appointment_time TIME;
  day_offset INTEGER;
  appointment_count INTEGER := 0;
  unique_suffix TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Generating Dummy Appointments...';
  RAISE NOTICE '========================================';

  -- For each patient, create 2-4 future appointments
  FOR patient_record IN
    SELECT id, first_name, last_name, email FROM patients ORDER BY RANDOM()
  LOOP
    -- Create 2-4 appointments per patient
    FOR i IN 1..FLOOR(RANDOM() * 3 + 2)::INTEGER LOOP
      appointment_count := appointment_count + 1;

      -- Random day in next 30 days
      day_offset := FLOOR(RANDOM() * 30 + 1)::INTEGER;
      appointment_date := CURRENT_DATE + (day_offset || ' days')::INTERVAL;

      -- Random time between 8 AM and 5 PM
      appointment_time := TIME '08:00:00' + (FLOOR(RANDOM() * 10)::INTEGER || ' hours')::INTERVAL;

      -- Select random department and doctor
      SELECT d.id, d.name INTO dept_record
      FROM departments d
      WHERE d.name IN ('Outpatient', 'Cardiology', 'Neurology', 'Dermatology',
                       'Orthopedics', 'Psychiatry', 'Pediatrics', 'Oncology')
      ORDER BY RANDOM()
      LIMIT 1;

      -- Get doctor from that department
      SELECT hs.id INTO doctor_record
      FROM hospital_staff hs
      WHERE hs.department_id = dept_record.id
        AND hs.staff_type = 'doctor'
        AND hs.is_active = true
      ORDER BY RANDOM()
      LIMIT 1;

      -- Generate unique suffix using counter and random number
      unique_suffix := LPAD(appointment_count::TEXT, 5, '0') || '-' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');

      -- Insert appointment with varied types and reasons
      INSERT INTO appointments (
        appointment_number,
        patient_id,
        doctor_id,
        department_id,
        appointment_type,
        scheduled_time,
        status,
        reason
      )
      VALUES (
        'APT-' || TO_CHAR(appointment_date, 'YYYYMMDD') || '-' || unique_suffix,
        patient_record.id,
        doctor_record.id,
        dept_record.id,
        CASE
          WHEN RANDOM() < 0.4 THEN 'consultation'
          WHEN RANDOM() < 0.7 THEN 'follow_up'
          WHEN RANDOM() < 0.85 THEN 'procedure'
          WHEN RANDOM() < 0.95 THEN 'telemedicine'
          ELSE 'lab'
        END,
        appointment_date + appointment_time,
        CASE
          WHEN day_offset <= 3 THEN 'confirmed'
          WHEN day_offset <= 7 THEN 'scheduled'
          ELSE 'scheduled'
        END,
        CASE dept_record.name
          WHEN 'Outpatient' THEN 'General health consultation'
          WHEN 'Cardiology' THEN 'Heart health checkup'
          WHEN 'Neurology' THEN 'Neurological assessment'
          WHEN 'Dermatology' THEN 'Skin condition evaluation'
          WHEN 'Orthopedics' THEN 'Musculoskeletal examination'
          WHEN 'Psychiatry' THEN 'Mental health consultation'
          WHEN 'Pediatrics' THEN 'Child wellness visit'
          WHEN 'Oncology' THEN 'Cancer screening'
          ELSE 'Medical consultation'
        END
      );
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Created % future appointments', appointment_count;

END $$;

-- ============================================================================
-- TODAY'S APPOINTMENTS (10-15 appointments for active day)
-- ============================================================================

-- Create appointments for TODAY to populate the doctor's dashboard
DO $$
DECLARE
  patient_record RECORD;
  doctor_record RECORD;
  dept_record RECORD;
  appointment_time TIME;
  today_count INTEGER := 0;
  unique_suffix TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Generating Today''s Appointments...';
  RAISE NOTICE '========================================';

  -- Create 10-15 appointments for today
  FOR patient_record IN
    SELECT id, first_name, last_name, email
    FROM patients
    ORDER BY RANDOM()
    LIMIT 12
  LOOP
    today_count := today_count + 1;

    -- Random time between 8 AM and 5 PM
    appointment_time := TIME '08:00:00' + (FLOOR(RANDOM() * 10)::INTEGER || ' hours')::INTERVAL;

    -- Select random department and doctor
    SELECT d.id, d.name INTO dept_record
    FROM departments d
    WHERE d.name IN ('Outpatient', 'Cardiology', 'Neurology', 'Dermatology',
                     'Orthopedics', 'Psychiatry', 'Pediatrics')
    ORDER BY RANDOM()
    LIMIT 1;

    -- Get doctor from that department
    SELECT hs.id, hs.first_name, hs.last_name INTO doctor_record
    FROM hospital_staff hs
    WHERE hs.department_id = dept_record.id
      AND hs.staff_type = 'doctor'
      AND hs.is_active = true
    ORDER BY RANDOM()
    LIMIT 1;

    -- Generate unique suffix
    unique_suffix := 'TODAY-' || LPAD(today_count::TEXT, 4, '0') || '-' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');

    -- Insert today's appointment
    INSERT INTO appointments (
      appointment_number,
      patient_id,
      doctor_id,
      department_id,
      appointment_type,
      scheduled_time,
      status,
      reason
    )
    VALUES (
      'APT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || unique_suffix,
      patient_record.id,
      doctor_record.id,
      dept_record.id,
      CASE
        WHEN RANDOM() < 0.5 THEN 'consultation'
        WHEN RANDOM() < 0.8 THEN 'follow_up'
        WHEN RANDOM() < 0.9 THEN 'procedure'
        ELSE 'telemedicine'
      END,
      CURRENT_DATE + appointment_time,
      CASE
        WHEN appointment_time < CURRENT_TIME THEN 'completed'
        WHEN appointment_time < CURRENT_TIME + INTERVAL '1 hour' THEN 'in_progress'
        ELSE 'confirmed'
      END,
      CASE dept_record.name
        WHEN 'Outpatient' THEN 'Routine medical checkup'
        WHEN 'Cardiology' THEN 'Follow-up for hypertension'
        WHEN 'Neurology' THEN 'Headache management'
        WHEN 'Dermatology' THEN 'Skin rash evaluation'
        WHEN 'Orthopedics' THEN 'Joint pain assessment'
        WHEN 'Psychiatry' THEN 'Counseling session'
        WHEN 'Pediatrics' THEN 'Growth and development checkup'
        ELSE 'Medical consultation'
      END
    );
  END LOOP;

  RAISE NOTICE 'Created % appointments for today', today_count;

END $$;

-- ============================================================================
-- PAST APPOINTMENTS (Last 90 days - Historical Data)
-- ============================================================================

-- Create completed appointments for the past 90 days
DO $$
DECLARE
  patient_record RECORD;
  doctor_record RECORD;
  dept_record RECORD;
  appointment_date DATE;
  appointment_time TIME;
  day_offset INTEGER;
  past_count INTEGER := 0;
  unique_suffix TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Generating Past Appointments...';
  RAISE NOTICE '========================================';

  -- For each patient, create 3-6 historical appointments
  FOR patient_record IN
    SELECT id, first_name, last_name, email FROM patients ORDER BY RANDOM()
  LOOP
    -- Create 3-6 past appointments per patient
    FOR i IN 1..FLOOR(RANDOM() * 4 + 3)::INTEGER LOOP
      past_count := past_count + 1;

      -- Random day in past 90 days
      day_offset := FLOOR(RANDOM() * 90 + 1)::INTEGER;
      appointment_date := CURRENT_DATE - (day_offset || ' days')::INTERVAL;

      -- Random time between 8 AM and 5 PM
      appointment_time := TIME '08:00:00' + (FLOOR(RANDOM() * 10)::INTEGER || ' hours')::INTERVAL;

      -- Select random department and doctor
      SELECT d.id, d.name INTO dept_record
      FROM departments d
      WHERE d.name IN ('Outpatient', 'Cardiology', 'Laboratory', 'Radiology',
                       'Emergency', 'Dermatology', 'Orthopedics')
      ORDER BY RANDOM()
      LIMIT 1;

      -- Get doctor from that department
      SELECT hs.id INTO doctor_record
      FROM hospital_staff hs
      WHERE hs.department_id = dept_record.id
        AND hs.staff_type = 'doctor'
        AND hs.is_active = true
      ORDER BY RANDOM()
      LIMIT 1;

      -- Generate unique suffix
      unique_suffix := 'PAST-' || LPAD(past_count::TEXT, 5, '0') || '-' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');

      -- Insert past appointment
      INSERT INTO appointments (
        appointment_number,
        patient_id,
        doctor_id,
        department_id,
        appointment_type,
        scheduled_time,
        status,
        reason,
        notes
      )
      VALUES (
        'APT-' || TO_CHAR(appointment_date, 'YYYYMMDD') || '-' || unique_suffix,
        patient_record.id,
        doctor_record.id,
        dept_record.id,
        CASE
          WHEN RANDOM() < 0.4 THEN 'consultation'
          WHEN RANDOM() < 0.7 THEN 'follow_up'
          WHEN RANDOM() < 0.85 THEN 'lab'
          WHEN RANDOM() < 0.95 THEN 'radiology'
          ELSE 'procedure'
        END,
        appointment_date + appointment_time,
        CASE
          WHEN RANDOM() < 0.85 THEN 'completed'
          WHEN RANDOM() < 0.95 THEN 'no_show'
          ELSE 'cancelled'
        END,
        CASE dept_record.name
          WHEN 'Outpatient' THEN 'General health consultation'
          WHEN 'Cardiology' THEN 'Cardiac evaluation'
          WHEN 'Laboratory' THEN 'Blood work and tests'
          WHEN 'Radiology' THEN 'Imaging studies'
          WHEN 'Emergency' THEN 'Urgent care visit'
          WHEN 'Dermatology' THEN 'Dermatological examination'
          WHEN 'Orthopedics' THEN 'Musculoskeletal assessment'
          ELSE 'Medical visit'
        END,
        CASE
          WHEN RANDOM() < 0.85 THEN 'Appointment completed successfully. Patient examined and treated.'
          WHEN RANDOM() < 0.95 THEN 'Patient did not show up for scheduled appointment.'
          ELSE 'Appointment cancelled by patient.'
        END
      );
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Created % past appointments', past_count;

END $$;

-- ============================================================================
-- SPECIAL APPOINTMENTS (Willis Ivali - Ensure he has appointments)
-- ============================================================================

-- Ensure Willis Ivali has appointments scheduled
DO $$
DECLARE
  willis_id UUID;
  doctor_id UUID;
  dept_id UUID;
  willis_appointment_count INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Creating Willis Ivali Appointments...';
  RAISE NOTICE '========================================';

  -- Get Willis's ID
  SELECT id INTO willis_id FROM patients WHERE email = 'itsivali@gmail.com';

  IF willis_id IS NOT NULL THEN
    -- Appointment 1: Today with Dr. Taylor (Outpatient)
    SELECT id INTO doctor_id FROM hospital_staff WHERE email = 'daniel.taylor@hospitalguard.com';
    SELECT id INTO dept_id FROM departments WHERE name = 'Outpatient';

    INSERT INTO appointments (
      appointment_number,
      patient_id,
      doctor_id,
      department_id,
      appointment_type,
      scheduled_time,
      status,
      reason
    )
    VALUES (
      'APT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-WILLIS-001',
      willis_id,
      doctor_id,
      dept_id,
      'follow_up',
      CURRENT_DATE + TIME '10:00:00',
      'confirmed',
      'Follow-up for eye strain and neck pain'
    );
    willis_appointment_count := willis_appointment_count + 1;

    -- Appointment 2: Next week with Dr. Phillips (Cardiology)
    SELECT id INTO doctor_id FROM hospital_staff WHERE email = 'william.phillips@hospitalguard.com';
    SELECT id INTO dept_id FROM departments WHERE name = 'Cardiology';

    INSERT INTO appointments (
      appointment_number,
      patient_id,
      doctor_id,
      department_id,
      appointment_type,
      scheduled_time,
      status,
      reason
    )
    VALUES (
      'APT-' || TO_CHAR(CURRENT_DATE + INTERVAL '7 days', 'YYYYMMDD') || '-WILLIS-002',
      willis_id,
      doctor_id,
      dept_id,
      'consultation',
      CURRENT_DATE + INTERVAL '7 days' + TIME '14:00:00',
      'scheduled',
      'Cardiovascular health assessment'
    );
    willis_appointment_count := willis_appointment_count + 1;

    -- Appointment 3: Next month with Lab (Vitamin D follow-up)
    SELECT id INTO dept_id FROM departments WHERE name = 'Laboratory';

    INSERT INTO appointments (
      appointment_number,
      patient_id,
      department_id,
      appointment_type,
      scheduled_time,
      status,
      reason
    )
    VALUES (
      'APT-' || TO_CHAR(CURRENT_DATE + INTERVAL '28 days', 'YYYYMMDD') || '-WILLIS-003',
      willis_id,
      dept_id,
      'lab',
      CURRENT_DATE + INTERVAL '28 days' + TIME '08:00:00',
      'scheduled',
      'Vitamin D level recheck'
    );
    willis_appointment_count := willis_appointment_count + 1;

    RAISE NOTICE 'Created % appointments for Willis Ivali', willis_appointment_count;
  ELSE
    RAISE NOTICE 'Willis Ivali not found in database';
  END IF;

END $$;

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================

DO $$
DECLARE
  total_appointments INTEGER;
  today_appointments INTEGER;
  future_appointments INTEGER;
  past_appointments INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_appointments FROM appointments;
  SELECT COUNT(*) INTO today_appointments FROM appointments WHERE DATE(scheduled_time) = CURRENT_DATE;
  SELECT COUNT(*) INTO future_appointments FROM appointments WHERE DATE(scheduled_time) > CURRENT_DATE;
  SELECT COUNT(*) INTO past_appointments FROM appointments WHERE DATE(scheduled_time) < CURRENT_DATE;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Dummy Appointment Generation Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Appointments: %', total_appointments;
  RAISE NOTICE 'Today''s Appointments: %', today_appointments;
  RAISE NOTICE 'Future Appointments: %', future_appointments;
  RAISE NOTICE 'Past Appointments: %', past_appointments;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Doctor Dashboard will now show:';
  RAISE NOTICE '✓ Full appointment schedule';
  RAISE NOTICE '✓ Today''s patients';
  RAISE NOTICE '✓ Upcoming appointments';
  RAISE NOTICE '✓ Patient appointment history';
  RAISE NOTICE '========================================';
END $$;
