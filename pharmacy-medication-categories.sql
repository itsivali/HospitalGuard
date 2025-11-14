-- ============================================================================
-- HospitalGuard: Pharmacy Medication Categories
-- ============================================================================
-- Comprehensive medication inventory with categories
-- Run AFTER hospital-seed.sql
-- ============================================================================

-- Clear existing pharmacy inventory (optional - be careful in production!)
-- DELETE FROM pharmacy_inventory WHERE medication_name LIKE '%';

-- ============================================================================
-- PAIN MANAGEMENT & ANALGESICS
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Ibuprofen', 'Ibuprofen', 'Pain Management', 'Tablet', '200mg', 5000, 1000, 5.00, 'Cipla Ltd', CURRENT_DATE + INTERVAL '2 years', false),
('Ibuprofen', 'Ibuprofen', 'Pain Management', 'Tablet', '400mg', 3000, 500, 8.00, 'Cipla Ltd', CURRENT_DATE + INTERVAL '2 years', false),
('Paracetamol', 'Acetaminophen', 'Pain Management', 'Tablet', '500mg', 8000, 2000, 3.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '2 years', false),
('Paracetamol', 'Acetaminophen', 'Pain Management', 'Syrup', '120mg/5ml', 1000, 200, 45.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '18 months', false),
('Tramadol', 'Tramadol HCl', 'Pain Management', 'Tablet', '50mg', 800, 200, 35.00, 'Teva Pharmaceuticals', CURRENT_DATE + INTERVAL '2 years', true),
('Diclofenac', 'Diclofenac Sodium', 'Pain Management', 'Tablet', '50mg', 1500, 300, 12.00, 'Novartis', CURRENT_DATE + INTERVAL '2 years', false),
('Morphine', 'Morphine Sulfate', 'Pain Management', 'Injection', '10mg/ml', 200, 50, 350.00, 'Pfizer', CURRENT_DATE + INTERVAL '1 year', true),
('Aspirin', 'Acetylsalicylic Acid', 'Pain Management', 'Tablet', '75mg', 3000, 500, 4.00, 'Bayer', CURRENT_DATE + INTERVAL '3 years', false)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- ANTIBIOTICS
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Amoxicillin', 'Amoxicillin', 'Antibiotics', 'Capsule', '500mg', 2000, 500, 25.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '2 years', true),
('Amoxicillin', 'Amoxicillin', 'Antibiotics', 'Syrup', '125mg/5ml', 800, 150, 80.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '18 months', true),
('Azithromycin', 'Azithromycin', 'Antibiotics', 'Tablet', '500mg', 1200, 300, 120.00, 'Pfizer', CURRENT_DATE + INTERVAL '2 years', true),
('Ciprofloxacin', 'Ciprofloxacin HCl', 'Antibiotics', 'Tablet', '500mg', 1500, 300, 65.00, 'Cipla Ltd', CURRENT_DATE + INTERVAL '2 years', true),
('Metronidazole', 'Metronidazole', 'Antibiotics', 'Tablet', '400mg', 1800, 400, 18.00, 'Sanofi', CURRENT_DATE + INTERVAL '2 years', true),
('Ceftriaxone', 'Ceftriaxone Sodium', 'Antibiotics', 'Injection', '1g', 500, 100, 280.00, 'Roche', CURRENT_DATE + INTERVAL '2 years', true),
('Doxycycline', 'Doxycycline Hyclate', 'Antibiotics', 'Capsule', '100mg', 1000, 200, 45.00, 'Teva Pharmaceuticals', CURRENT_DATE + INTERVAL '2 years', true),
('Cloxacillin', 'Cloxacillin Sodium', 'Antibiotics', 'Capsule', '500mg', 900, 200, 55.00, 'Cipla Ltd', CURRENT_DATE + INTERVAL '2 years', true)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- CARDIOVASCULAR
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Amlodipine', 'Amlodipine Besylate', 'Cardiovascular', 'Tablet', '5mg', 2500, 500, 15.00, 'Pfizer', CURRENT_DATE + INTERVAL '3 years', true),
('Atorvastatin', 'Atorvastatin Calcium', 'Cardiovascular', 'Tablet', '20mg', 2000, 400, 45.00, 'Pfizer', CURRENT_DATE + INTERVAL '2 years', true),
('Metoprolol', 'Metoprolol Tartrate', 'Cardiovascular', 'Tablet', '50mg', 1500, 300, 35.00, 'AstraZeneca', CURRENT_DATE + INTERVAL '2 years', true),
('Lisinopril', 'Lisinopril', 'Cardiovascular', 'Tablet', '10mg', 1800, 350, 28.00, 'Merck', CURRENT_DATE + INTERVAL '2 years', true),
('Warfarin', 'Warfarin Sodium', 'Cardiovascular', 'Tablet', '5mg', 800, 150, 65.00, 'Bristol-Myers Squibb', CURRENT_DATE + INTERVAL '2 years', true),
('Aspirin', 'Acetylsalicylic Acid', 'Cardiovascular', 'Tablet', '81mg', 3000, 600, 5.00, 'Bayer', CURRENT_DATE + INTERVAL '3 years', true),
('Furosemide', 'Furosemide', 'Cardiovascular', 'Tablet', '40mg', 1200, 250, 18.00, 'Sanofi', CURRENT_DATE + INTERVAL '2 years', true),
('Digoxin', 'Digoxin', 'Cardiovascular', 'Tablet', '0.25mg', 600, 120, 22.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '2 years', true)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- DIABETES MANAGEMENT
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Metformin', 'Metformin HCl', 'Diabetes', 'Tablet', '500mg', 3000, 600, 12.00, 'Merck', CURRENT_DATE + INTERVAL '2 years', true),
('Metformin', 'Metformin HCl', 'Diabetes', 'Tablet', '850mg', 2000, 400, 18.00, 'Merck', CURRENT_DATE + INTERVAL '2 years', true),
('Glibenclamide', 'Glibenclamide', 'Diabetes', 'Tablet', '5mg', 1500, 300, 15.00, 'Sanofi', CURRENT_DATE + INTERVAL '2 years', true),
('Insulin Glargine', 'Insulin Glargine', 'Diabetes', 'Injection', '100 units/ml', 300, 60, 1200.00, 'Sanofi', CURRENT_DATE + INTERVAL '1 year', true),
('Insulin Regular', 'Human Insulin', 'Diabetes', 'Injection', '100 units/ml', 250, 50, 850.00, 'Novo Nordisk', CURRENT_DATE + INTERVAL '1 year', true),
('Sitagliptin', 'Sitagliptin Phosphate', 'Diabetes', 'Tablet', '100mg', 800, 150, 185.00, 'Merck', CURRENT_DATE + INTERVAL '2 years', true)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- RESPIRATORY
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Salbutamol Inhaler', 'Salbutamol Sulfate', 'Respiratory', 'Inhaler', '100mcg', 600, 120, 350.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '2 years', true),
('Fluticasone Inhaler', 'Fluticasone Propionate', 'Respiratory', 'Inhaler', '110mcg', 400, 80, 850.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '2 years', true),
('Montelukast', 'Montelukast Sodium', 'Respiratory', 'Tablet', '10mg', 1000, 200, 95.00, 'Merck', CURRENT_DATE + INTERVAL '2 years', true),
('Cetirizine', 'Cetirizine HCl', 'Respiratory', 'Tablet', '10mg', 2000, 400, 8.00, 'Johnson & Johnson', CURRENT_DATE + INTERVAL '2 years', false),
('Loratadine', 'Loratadine', 'Respiratory', 'Tablet', '10mg', 1500, 300, 12.00, 'Bayer', CURRENT_DATE + INTERVAL '2 years', false),
('Prednisolone', 'Prednisolone', 'Respiratory', 'Tablet', '5mg', 1200, 250, 25.00, 'Pfizer', CURRENT_DATE + INTERVAL '2 years', true)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- GASTROINTESTINAL
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Omeprazole', 'Omeprazole', 'Gastrointestinal', 'Capsule', '20mg', 2500, 500, 18.00, 'AstraZeneca', CURRENT_DATE + INTERVAL '2 years', true),
('Ranitidine', 'Ranitidine HCl', 'Gastrointestinal', 'Tablet', '150mg', 1800, 350, 12.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '2 years', true),
('Loperamide', 'Loperamide HCl', 'Gastrointestinal', 'Capsule', '2mg', 1000, 200, 15.00, 'Johnson & Johnson', CURRENT_DATE + INTERVAL '2 years', false),
('Oral Rehydration Salt', 'ORS', 'Gastrointestinal', 'Powder', '27.9g', 3000, 600, 8.00, 'WHO', CURRENT_DATE + INTERVAL '2 years', false),
('Metoclopramide', 'Metoclopramide HCl', 'Gastrointestinal', 'Tablet', '10mg', 1200, 250, 10.00, 'Sanofi', CURRENT_DATE + INTERVAL '2 years', true)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- MENTAL HEALTH
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Escitalopram', 'Escitalopram Oxalate', 'Mental Health', 'Tablet', '10mg', 1000, 200, 85.00, 'Forest Laboratories', CURRENT_DATE + INTERVAL '2 years', true),
('Sertraline', 'Sertraline HCl', 'Mental Health', 'Tablet', '50mg', 1200, 250, 75.00, 'Pfizer', CURRENT_DATE + INTERVAL '2 years', true),
('Diazepam', 'Diazepam', 'Mental Health', 'Tablet', '5mg', 600, 120, 22.00, 'Roche', CURRENT_DATE + INTERVAL '2 years', true),
('Amitriptyline', 'Amitriptyline HCl', 'Mental Health', 'Tablet', '25mg', 800, 160, 18.00, 'Sandoz', CURRENT_DATE + INTERVAL '2 years', true),
('Fluoxetine', 'Fluoxetine HCl', 'Mental Health', 'Capsule', '20mg', 900, 180, 68.00, 'Eli Lilly', CURRENT_DATE + INTERVAL '2 years', true),
('Risperidone', 'Risperidone', 'Mental Health', 'Tablet', '2mg', 500, 100, 125.00, 'Janssen', CURRENT_DATE + INTERVAL '2 years', true)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- VITAMINS & SUPPLEMENTS
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Vitamin D3', 'Cholecalciferol', 'Vitamins', 'Tablet', '1000 IU', 3000, 600, 12.00, 'Nature Made', CURRENT_DATE + INTERVAL '2 years', false),
('Vitamin B Complex', 'B Complex', 'Vitamins', 'Tablet', 'Multi', 2500, 500, 18.00, 'Nature Made', CURRENT_DATE + INTERVAL '2 years', false),
('Folic Acid', 'Folic Acid', 'Vitamins', 'Tablet', '5mg', 2000, 400, 8.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '2 years', false),
('Iron Supplements', 'Ferrous Sulfate', 'Vitamins', 'Tablet', '200mg', 1800, 350, 15.00, 'Pfizer', CURRENT_DATE + INTERVAL '2 years', false),
('Calcium + Vitamin D', 'Calcium Carbonate', 'Vitamins', 'Tablet', '600mg + 400 IU', 1500, 300, 25.00, 'Bayer', CURRENT_DATE + INTERVAL '2 years', false),
('Multivitamin', 'Multivitamin', 'Vitamins', 'Tablet', 'Multi', 2000, 400, 35.00, 'Centrum', CURRENT_DATE + INTERVAL '2 years', false)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- ANTIMALARIALS
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Artemether-Lumefantrine', 'Artemether-Lumefantrine', 'Antimalarial', 'Tablet', '20mg/120mg', 2000, 400, 85.00, 'Novartis', CURRENT_DATE + INTERVAL '2 years', true),
('Quinine', 'Quinine Sulfate', 'Antimalarial', 'Tablet', '300mg', 1200, 250, 45.00, 'Sanofi', CURRENT_DATE + INTERVAL '2 years', true),
('Artesunate', 'Artesunate', 'Antimalarial', 'Injection', '60mg', 400, 80, 180.00, 'Guilin Pharmaceutical', CURRENT_DATE + INTERVAL '2 years', true),
('Doxycycline', 'Doxycycline Hyclate', 'Antimalarial', 'Capsule', '100mg', 800, 160, 48.00, 'Teva Pharmaceuticals', CURRENT_DATE + INTERVAL '2 years', true)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- ANTIVIRALS & ANTIRETROVIRALS
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Acyclovir', 'Acyclovir', 'Antiviral', 'Tablet', '400mg', 1000, 200, 55.00, 'GlaxoSmithKline', CURRENT_DATE + INTERVAL '2 years', true),
('Tenofovir-Emtricitabine', 'TDF/FTC', 'Antiretroviral', 'Tablet', '300mg/200mg', 1500, 300, 125.00, 'Gilead Sciences', CURRENT_DATE + INTERVAL '2 years', true),
('Dolutegravir', 'Dolutegravir Sodium', 'Antiretroviral', 'Tablet', '50mg', 1200, 250, 180.00, 'ViiV Healthcare', CURRENT_DATE + INTERVAL '2 years', true),
('Oseltamivir', 'Oseltamivir Phosphate', 'Antiviral', 'Capsule', '75mg', 600, 120, 285.00, 'Roche', CURRENT_DATE + INTERVAL '18 months', true)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- EMERGENCY & CRITICAL CARE
-- ============================================================================

INSERT INTO pharmacy_inventory (medication_name, generic_name, category, dosage_form, strength, quantity_in_stock, reorder_level, unit_price, manufacturer, expiry_date, requires_prescription)
VALUES
('Epinephrine', 'Epinephrine', 'Emergency', 'Injection', '1mg/ml', 300, 60, 450.00, 'Pfizer', CURRENT_DATE + INTERVAL '1 year', true),
('Atropine', 'Atropine Sulfate', 'Emergency', 'Injection', '1mg/ml', 200, 40, 120.00, 'Fresenius Kabi', CURRENT_DATE + INTERVAL '2 years', true),
('Dextrose 50%', 'Dextrose', 'Emergency', 'Injection', '25g/50ml', 400, 80, 85.00, 'Baxter', CURRENT_DATE + INTERVAL '2 years', true),
('Naloxone', 'Naloxone HCl', 'Emergency', 'Injection', '0.4mg/ml', 150, 30, 280.00, 'Pfizer', CURRENT_DATE + INTERVAL '2 years', true),
('Hydrocortisone', 'Hydrocortisone Sodium', 'Emergency', 'Injection', '100mg', 300, 60, 185.00, 'Pfizer', CURRENT_DATE + INTERVAL '2 years', true)
ON CONFLICT (medication_name, dosage_form, strength) DO UPDATE SET
  quantity_in_stock = pharmacy_inventory.quantity_in_stock + EXCLUDED.quantity_in_stock;

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================

DO $$
DECLARE
  total_medications INTEGER;
  total_categories INTEGER;
  total_stock_value DECIMAL(12,2);
BEGIN
  SELECT COUNT(DISTINCT medication_name) INTO total_medications FROM pharmacy_inventory;
  SELECT COUNT(DISTINCT category) INTO total_categories FROM pharmacy_inventory;
  SELECT SUM(quantity_in_stock * unit_price) INTO total_stock_value FROM pharmacy_inventory;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PHARMACY INVENTORY SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Unique Medications: %', total_medications;
  RAISE NOTICE 'Total Categories: %', total_categories;
  RAISE NOTICE 'Total Stock Value: KES %', total_stock_value;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'CATEGORIES:';
  RAISE NOTICE '✓ Pain Management & Analgesics';
  RAISE NOTICE '✓ Antibiotics';
  RAISE NOTICE '✓ Cardiovascular';
  RAISE NOTICE '✓ Diabetes Management';
  RAISE NOTICE '✓ Respiratory';
  RAISE NOTICE '✓ Gastrointestinal';
  RAISE NOTICE '✓ Mental Health';
  RAISE NOTICE '✓ Vitamins & Supplements';
  RAISE NOTICE '✓ Antimalarials';
  RAISE NOTICE '✓ Antivirals & Antiretrovirals';
  RAISE NOTICE '✓ Emergency & Critical Care';
  RAISE NOTICE '========================================';
END $$;

-- Category breakdown
SELECT
  '📊 MEDICATION BREAKDOWN BY CATEGORY' as report_title,
  category,
  COUNT(*) as medication_count,
  SUM(quantity_in_stock) as total_stock,
  SUM(quantity_in_stock * unit_price) as category_value
FROM pharmacy_inventory
GROUP BY category
ORDER BY category_value DESC;
