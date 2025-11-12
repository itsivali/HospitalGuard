# Patient Seed Data Guide

## Overview

This guide explains how to load and use the dummy patient data for testing the HospitalGuard patient dashboard.

## What's Included

The `hospital-patient-seed.sql` file contains:

- **15 Diverse Patients** with complete demographics
- **8 Patient Visits** (active emergency, ICU, outpatient, maternity, mental health, pediatric, cardiology)
- **7 Upcoming Appointments** (various departments and types)
- **5 Prescriptions** with detailed medication items
- **4 Lab Orders** (with completed results and pending tests)
- **2 Radiology Orders** (completed and scheduled)
- **Medical Records** (consultations, diagnoses, assessments)
- **3 Bills** (paid, partially paid, and pending)
- **1 Telemedicine Session** (scheduled follow-up)
- **1 Maternity Record** (active pregnancy tracking)

## Installation Steps

### 1. Ensure Prerequisites Are Met

Make sure you've already run:
```sql
-- First: Create the database schema
\i hospital-database.sql

-- Second: Seed departments and staff
\i hospital-seed.sql
```

### 2. Load Patient Data

Run the patient seed file:
```sql
\i hospital-patient-seed.sql
```

Or if using Supabase SQL Editor:
1. Open your Supabase project
2. Go to SQL Editor
3. Copy and paste the contents of `hospital-patient-seed.sql`
4. Click "Run"

## Test Patient Accounts

Here are the key test patients you can use:

### 1. **John Kamau** - `john.kamau@email.com`
- **Scenario**: Active Emergency Visit (Chest Pain)
- **Features**:
  - Currently in Emergency Department
  - Has cardiac medication prescription
  - Lab results available (cardiac enzymes)
  - Chest X-ray completed
  - Urgent triage level

### 2. **Sarah Wanjiku** - `sarah.wanjiku@email.com`
- **Scenario**: Completed Outpatient Checkup
- **Features**:
  - Discharged visit with summary
  - Upcoming follow-up appointment (5 days)
  - Complete lab results (CBC)
  - Fully paid bill with insurance
  - Clean bill of health

### 3. **James Mwangi** - `james.mwangi@email.com`
- **Scenario**: Mental Health Patient with Telemedicine
- **Features**:
  - Diagnosed with Generalized Anxiety Disorder
  - Active prescriptions (Sertraline, Lorazepam)
  - Upcoming telemedicine appointment (9 days)
  - Confidential medical records
  - Partially paid bill

### 4. **Mary Akinyi** - `mary.akinyi@email.com`
- **Scenario**: Maternity Patient (28 weeks pregnant)
- **Features**:
  - Active prenatal visit
  - Maternity record tracking
  - Upcoming appointment (14 days)
  - First pregnancy with no complications

### 5. **Lucy Wambui** - `lucy.wambui@email.com`
- **Scenario**: Patient with Upcoming Lab Work
- **Features**:
  - Active pain management prescription
  - Confirmed lab appointment (2 days)
  - Pending lab order (lipid panel)
  - Follow-up care

### 6. **Michael Kimani** - `michael.kimani@email.com`
- **Scenario**: Chronic Disease Management (Hypertension & Diabetes)
- **Features**:
  - Multiple chronic medications
  - Completed HbA1c lab results
  - Regular cardiology follow-ups
  - Monthly appointment scheduled (30 days)
  - Partially dispensed prescriptions

### 7. **Peter Otieno** (Child) - Parent: `ann.otieno@email.com`
- **Scenario**: Pediatric Patient (Fever & Cough)
- **Features**:
  - Recent pediatric visit
  - Dispensed medication (Ibuprofen)
  - Upcoming vaccination appointment (7 days)
  - Pending bill

## Testing the Patient Dashboard

### Without Creating User Accounts

You can view the data directly in Supabase:

1. **Patients Table**: See all 15 patients
2. **Patient Visits**: See various visit statuses
3. **Appointments**: Filter by `scheduled_time > NOW()`
4. **Prescriptions**: Filter by status = 'signed' or 'partially_dispensed'
5. **Lab Orders**: See completed results and pending tests

### With User Accounts (Full Testing)

To test the complete patient portal experience:

1. **Sign up** as a new patient in your app at `/auth`
2. This will create a patient record automatically
3. **OR** manually link a test patient to a user:

```sql
-- Example: Link John Kamau to a test user account
-- First create the user in Supabase Auth, then:
UPDATE patients
SET user_id = 'YOUR-USER-UUID-HERE'
WHERE email = 'john.kamau@email.com';

-- Also create a user_role entry
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR-USER-UUID-HERE', 'patient');
```

## Key Features to Test

### 1. Dashboard Stats Cards
- Appointments count
- Active prescriptions count
- Lab results ready
- Medical records available

### 2. Upcoming Appointments Section
- View scheduled appointments
- See doctor assignments
- Check appointment types
- View appointment details modal

### 3. Active Prescriptions
- Medication names and dosages
- Refills available
- Expiration dates
- Request refill functionality

### 4. Action Items
- Prescription refill alerts
- Lab results ready notifications
- Telemedicine availability

### 5. Recent Medical History
- Past visits
- Diagnoses
- Medical records
- Doctor notes

### 6. Appointment Booking
- Department selection (loads from `departments` table)
- Doctor selection (loads available doctors)
- Date/time picker
- Appointment type selection

## Data Scenarios Covered

### Medical Conditions
- ✅ Cardiac issues (unstable angina)
- ✅ Mental health (anxiety disorder)
- ✅ Chronic diseases (hypertension, diabetes)
- ✅ Pediatric care (viral infections)
- ✅ Maternity care (prenatal)
- ✅ Routine checkups

### Visit Types
- ✅ Emergency admissions
- ✅ Scheduled appointments
- ✅ Walk-in visits
- ✅ ICU admissions
- ✅ Telemedicine sessions

### Prescription States
- ✅ Signed (ready to dispense)
- ✅ Partially dispensed (refills needed)
- ✅ Fully dispensed
- ✅ With refills available
- ✅ Without refills (need doctor approval)

### Lab Work
- ✅ Completed with results
- ✅ Pending collection
- ✅ Scheduled future tests
- ✅ STAT/urgent tests
- ✅ Routine tests

### Billing
- ✅ Fully paid bills
- ✅ Partially paid bills
- ✅ Pending bills
- ✅ Insurance coverage
- ✅ Multiple payment methods

## Customization

### Adding More Patients

Copy and modify the patient INSERT statement:
```sql
INSERT INTO patients (first_name, last_name, date_of_birth, ...)
VALUES ('New', 'Patient', '1990-01-01', ...);
```

### Adding Appointments

```sql
INSERT INTO appointments (appointment_number, patient_id, ...)
SELECT 'APT-' || TO_CHAR(NOW() + INTERVAL '7 days', 'YYYYMMDD'),
       p.id, ...
FROM patients p WHERE p.email = 'patient@email.com';
```

### Adding Prescriptions

Follow the pattern with the `WITH` clause for prescription and items:
```sql
WITH new_prescription AS (
  INSERT INTO prescriptions (...) RETURNING id
)
INSERT INTO prescription_items (prescription_id, medication_name, ...)
SELECT id, 'Medication Name', ... FROM new_prescription;
```

## Troubleshooting

### No Data Appears
- Ensure `hospital-database.sql` ran successfully
- Ensure `hospital-seed.sql` ran successfully (creates departments and staff)
- Check for foreign key constraint errors in your database logs

### "No departments available" Error
- Run `hospital-seed.sql` first
- Verify departments exist: `SELECT * FROM departments;`

### "No doctors available" Error
- Ensure staff were created with correct `department_id`
- Check: `SELECT * FROM hospital_staff WHERE staff_type = 'doctor';`

### Appointments Not Showing
- Check scheduled_time is in the future:
  ```sql
  SELECT * FROM appointments WHERE scheduled_time > NOW();
  ```

## Database Cleanup

To remove all test patient data:

```sql
-- WARNING: This will delete ALL patient data!
DELETE FROM payments WHERE bill_id IN (SELECT id FROM bills WHERE bill_number LIKE 'BILL-%');
DELETE FROM bill_items WHERE bill_id IN (SELECT id FROM bills WHERE bill_number LIKE 'BILL-%');
DELETE FROM bills WHERE bill_number LIKE 'BILL-%';
DELETE FROM prescription_items WHERE prescription_id IN (SELECT id FROM prescriptions WHERE prescription_number LIKE 'RX-%');
DELETE FROM prescriptions WHERE prescription_number LIKE 'RX-%';
DELETE FROM lab_orders WHERE order_number LIKE 'LAB-%';
DELETE FROM radiology_orders WHERE order_number LIKE 'RAD-%';
DELETE FROM diagnoses WHERE visit_id IN (SELECT id FROM patient_visits WHERE visit_number LIKE 'V-%');
DELETE FROM medical_records WHERE visit_id IN (SELECT id FROM patient_visits WHERE visit_number LIKE 'V-%');
DELETE FROM maternity_records WHERE patient_id IN (SELECT id FROM patients WHERE national_id LIKE 'KE-12345%');
DELETE FROM telemedicine_sessions WHERE patient_id IN (SELECT id FROM patients WHERE national_id LIKE 'KE-12345%');
DELETE FROM appointments WHERE appointment_number LIKE 'APT-%';
DELETE FROM patient_visits WHERE visit_number LIKE 'V-%';
DELETE FROM patients WHERE national_id LIKE 'KE-12345%';
```

## Next Steps

1. Load the patient seed data
2. Start your dev server: `npm run dev`
3. Navigate to the patient dashboard to see the data in action
4. Test appointment booking, prescription viewing, and lab results
5. Create additional test scenarios as needed

---

**Happy Testing! 🏥**
