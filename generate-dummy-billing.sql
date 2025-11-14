
DO $$
DECLARE
  patient_record RECORD;
  visit_record UUID;
  bill_id UUID;
  bill_num TEXT;
  counter INTEGER := 1;
  service_charge DECIMAL(10,2);
  total_amount DECIMAL(10,2);
BEGIN
  -- Loop through patients and create bills
  FOR patient_record IN
    SELECT p.id, p.insurance_provider
    FROM patients p
    ORDER BY p.created_at
    LIMIT 16
  LOOP
    -- Get patient's visit if exists
    SELECT id INTO visit_record FROM patient_visits
    WHERE patient_id = patient_record.id
    ORDER BY check_in_time DESC
    LIMIT 1;

    -- Create 1-3 bills per patient
    FOR i IN 1..(1 + floor(random() * 2)::int) LOOP
      bill_id := uuid_generate_v4();
      bill_num := 'INV-2025-' || LPAD(counter::TEXT, 3, '0');
      total_amount := 0;

      -- Determine bill status
      INSERT INTO bills (
        id,
        bill_number,
        patient_id,
        visit_id,
        total_amount,
        insurance_covered,
        amount_paid,
        amount_due,
        status,
        due_date,
        created_at
      ) VALUES (
        bill_id,
        bill_num,
        patient_record.id,
        visit_record,
        0, -- Will be updated after adding items
        0,
        0,
        0,
        CASE
          WHEN random() < 0.15 THEN 'pending'
          WHEN random() < 0.30 THEN 'insurance_pending'
          ELSE 'paid'
        END,
        (NOW() - (random() * INTERVAL '30 days'))::DATE + INTERVAL '15 days',
        NOW() - (random() * INTERVAL '30 days')
      );

      -- Add bill items based on common medical services

      -- Consultation fees (always included)
      service_charge := 5000 + (random() * 10000)::DECIMAL(10,2);
      INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, item_type)
      VALUES (
        bill_id,
        CASE
          WHEN random() < 0.3 THEN 'General Consultation'
          WHEN random() < 0.6 THEN 'Specialist Consultation'
          ELSE 'Emergency Consultation'
        END,
        1,
        service_charge,
        service_charge,
        'consultation'
      );
      total_amount := total_amount + service_charge;

      -- Laboratory tests (60% chance)
      IF random() < 0.6 THEN
        service_charge := 3000 + (random() * 12000)::DECIMAL(10,2);
        INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, item_type)
        VALUES (
          bill_id,
          CASE
            WHEN random() < 0.3 THEN 'Complete Blood Count (CBC)'
            WHEN random() < 0.5 THEN 'Lipid Profile'
            WHEN random() < 0.7 THEN 'Liver Function Tests'
            ELSE 'Kidney Function Tests'
          END,
          1,
          service_charge,
          service_charge,
          'lab_test'
        );
        total_amount := total_amount + service_charge;
      END IF;

      -- Radiology/Imaging (40% chance)
      IF random() < 0.4 THEN
        service_charge := 8000 + (random() * 25000)::DECIMAL(10,2);
        INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, item_type)
        VALUES (
          bill_id,
          CASE
            WHEN random() < 0.3 THEN 'X-Ray Chest'
            WHEN random() < 0.5 THEN 'CT Scan - Head'
            WHEN random() < 0.7 THEN 'MRI - Spine'
            ELSE 'Ultrasound - Abdomen'
          END,
          1,
          service_charge,
          service_charge,
          'radiology'
        );
        total_amount := total_amount + service_charge;
      END IF;

      -- Medications (70% chance)
      IF random() < 0.7 THEN
        service_charge := 2000 + (random() * 15000)::DECIMAL(10,2);
        INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, item_type)
        VALUES (
          bill_id,
          'Prescription Medications',
          CASE
            WHEN random() < 0.5 THEN 1
            ELSE 2
          END,
          service_charge,
          service_charge * CASE WHEN random() < 0.5 THEN 1 ELSE 2 END,
          'medication'
        );
        total_amount := total_amount + service_charge;
      END IF;

      -- Procedures (30% chance)
      IF random() < 0.3 THEN
        service_charge := 15000 + (random() * 85000)::DECIMAL(10,2);
        INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, item_type)
        VALUES (
          bill_id,
          CASE
            WHEN random() < 0.2 THEN 'Minor Surgical Procedure'
            WHEN random() < 0.4 THEN 'Wound Dressing and Suturing'
            WHEN random() < 0.6 THEN 'Endoscopy'
            WHEN random() < 0.8 THEN 'Physical Therapy Session'
            ELSE 'Dialysis Session'
          END,
          1,
          service_charge,
          service_charge,
          'procedure'
        );
        total_amount := total_amount + service_charge;
      END IF;

      -- Hospital admission/stay (20% chance - high cost)
      IF random() < 0.2 THEN
        service_charge := 50000 + (random() * 200000)::DECIMAL(10,2);
        INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, item_type)
        VALUES (
          bill_id,
          CASE
            WHEN random() < 0.3 THEN 'ICU Stay (per day)'
            WHEN random() < 0.6 THEN 'General Ward Stay (per day)'
            ELSE 'Surgery - Major Procedure'
          END,
          CASE
            WHEN random() < 0.5 THEN 1
            WHEN random() < 0.8 THEN 2
            ELSE 3
          END,
          service_charge,
          service_charge * CASE
            WHEN random() < 0.5 THEN 1
            WHEN random() < 0.8 THEN 2
            ELSE 3
          END,
          CASE
            WHEN random() < 0.6 THEN 'room_charge'
            ELSE 'surgery'
          END
        );
        total_amount := total_amount + (service_charge * CASE
          WHEN random() < 0.5 THEN 1
          WHEN random() < 0.8 THEN 2
          ELSE 3
        END);
      END IF;

      -- Recalculate total from bill items (use DISTINCT to avoid ambiguity)
      DECLARE
        current_bill_id UUID := bill_id;
      BEGIN
        SELECT COALESCE(SUM(bi.total_price), 0) INTO total_amount
        FROM bill_items bi
        WHERE bi.bill_id = current_bill_id;
      END;

      -- Update bill with calculated amounts
      DECLARE
        insurance_coverage DECIMAL(10,2);
        patient_portion DECIMAL(10,2);
        amount_paid_var DECIMAL(10,2);
        bill_status TEXT;
        current_bill_id UUID := bill_id;
        current_total DECIMAL(10,2) := total_amount;
      BEGIN
        SELECT status INTO bill_status FROM bills WHERE id = current_bill_id;

        -- Calculate insurance coverage (if patient has insurance)
        IF patient_record.insurance_provider IS NOT NULL AND patient_record.insurance_provider != '' THEN
          insurance_coverage := current_total * (0.6 + random() * 0.3); -- 60-90% coverage
        ELSE
          insurance_coverage := 0;
        END IF;

        patient_portion := current_total - insurance_coverage;

        -- Determine amount paid based on status
        IF bill_status = 'paid' THEN
          amount_paid_var := current_total;
        ELSIF bill_status = 'pending' THEN
          amount_paid_var := 0;
        ELSIF bill_status = 'insurance_pending' THEN
          amount_paid_var := patient_portion; -- Patient paid their portion
        ELSE
          amount_paid_var := current_total * (0.3 + random() * 0.5); -- Partial payment (partially_paid status)
        END IF;

        UPDATE bills SET
          total_amount = current_total,
          insurance_covered = insurance_coverage,
          amount_paid = amount_paid_var,
          amount_due = current_total - amount_paid_var
        WHERE id = current_bill_id;
      END;

      counter := counter + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Successfully created dummy billing data!';
END $$;

-- Create payment records for paid bills
DO $$
DECLARE
  bill_record RECORD;
  payment_counter INTEGER := 1;
BEGIN
  FOR bill_record IN
    SELECT id, amount_paid, created_at
    FROM bills
    WHERE status = 'paid' AND amount_paid > 0
  LOOP
    INSERT INTO payments (
      payment_number,
      bill_id,
      amount,
      payment_method,
      payment_reference,
      payment_status,
      notes,
      created_at
    ) VALUES (
      'PAY-2025-' || LPAD(payment_counter::TEXT, 4, '0'),
      bill_record.id,
      bill_record.amount_paid,
      CASE
        WHEN random() < 0.3 THEN 'cash'
        WHEN random() < 0.5 THEN 'card'
        WHEN random() < 0.7 THEN 'insurance'
        WHEN random() < 0.85 THEN 'mobile_money'
        ELSE 'bank_transfer'
      END,
      'TXN-' || encode(gen_random_bytes(8), 'hex'),
      'completed',
      CASE
        WHEN random() < 0.5 THEN 'Payment received in full'
        ELSE 'Automatic payment processing'
      END,
      bill_record.created_at + (random() * INTERVAL '10 days')
    );
    payment_counter := payment_counter + 1;
  END LOOP;

  RAISE NOTICE 'Successfully created payment records!';
END $$;

-- Display summary
DO $$
DECLARE
  total_bills INTEGER;
  total_revenue DECIMAL(12,2);
  total_paid DECIMAL(12,2);
  total_outstanding DECIMAL(12,2);
  pending_count INTEGER;
  paid_count INTEGER;
  partially_paid_count INTEGER;
  insurance_pending_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_bills FROM bills;
  SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue FROM bills;
  SELECT COALESCE(SUM(amount_paid), 0) INTO total_paid FROM bills;
  SELECT COALESCE(SUM(amount_due), 0) INTO total_outstanding FROM bills;
  SELECT COUNT(*) INTO pending_count FROM bills WHERE status = 'pending';
  SELECT COUNT(*) INTO paid_count FROM bills WHERE status = 'paid';
  SELECT COUNT(*) INTO partially_paid_count FROM bills WHERE status = 'partially_paid';
  SELECT COUNT(*) INTO insurance_pending_count FROM bills WHERE status = 'insurance_pending';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'BILLING DATA SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Bills: %', total_bills;
  RAISE NOTICE 'Total Revenue: KES %', total_revenue;
  RAISE NOTICE 'Total Paid: KES %', total_paid;
  RAISE NOTICE 'Total Outstanding: KES %', total_outstanding;
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Status Breakdown:';
  RAISE NOTICE '  Paid: %', paid_count;
  RAISE NOTICE '  Pending: %', pending_count;
  RAISE NOTICE '  Partially Paid: %', partially_paid_count;
  RAISE NOTICE '  Insurance Pending: %', insurance_pending_count;
  RAISE NOTICE '========================================';
END $$;

-- Verify data
SELECT
  'Bills by Status' as category,
  status,
  COUNT(*) as count,
  SUM(total_amount) as total_amount,
  SUM(amount_due) as outstanding
FROM bills
GROUP BY status
ORDER BY count DESC;

SELECT
  'Revenue by Service Type' as category,
  item_type,
  COUNT(*) as count,
  SUM(total_price) as total_revenue
FROM bill_items
GROUP BY item_type
ORDER BY total_revenue DESC;

SELECT
  'Payment Methods' as category,
  payment_method,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM payments
GROUP BY payment_method
ORDER BY total_amount DESC;
