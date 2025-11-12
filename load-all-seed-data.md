# Loading All Seed Data into Supabase

## Quick Start Guide

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Go to your Supabase Dashboard**
   - URL: https://hdpavdwanzydfcudogar.supabase.co
   - Or go to: https://supabase.com/dashboard/projects

2. **Navigate to SQL Editor**
   - In the left sidebar, click "SQL Editor"
   - Click "+ New query"

3. **Load the SQL files in this order:**

#### Step 1: Database Schema (if not already loaded)
```
File: hospital-database.sql
Purpose: Creates all tables, relationships, and constraints
Time: ~30 seconds
```
- Copy entire contents of `hospital-database.sql`
- Paste into SQL Editor
- Click "Run" or press Ctrl+Enter
- Wait for "Success" message

#### Step 2: Hospital Staff & Departments
```
File: hospital-seed.sql
Purpose: Populates departments, staff, and pharmacy inventory
Time: ~10 seconds
```
- Copy entire contents of `hospital-seed.sql`
- Paste into SQL Editor
- Click "Run"
- You should see: "HospitalGuard Seed Data Complete" with counts

#### Step 3: Patient Data
```
File: hospital-patient-seed.sql
Purpose: Creates 15 patients with visits, appointments, prescriptions
Time: ~15 seconds
```
- Copy entire contents of `hospital-patient-seed.sql`
- Paste into SQL Editor
- Click "Run"
- You should see: "Patient Portal Ready for Testing!" with patient list

#### Step 4: Enhanced Data (Recommended)
```
File: hospital-patient-seed-enhanced.sql
Purpose: Adds more appointments, medical records, billing, financial data
Time: ~15 seconds
```
- Copy entire contents of `hospital-patient-seed-enhanced.sql`
- Paste into SQL Editor
- Click "Run"
- You should see: "Enhanced Data Loaded Successfully!" with financial summary

### Option 2: Using Combined Script (All at once)

I can create a single file that runs everything if you prefer.

---

## Verify the Data

After loading, run these verification queries in SQL Editor:

### Check Patient Count
```sql
SELECT COUNT(*) as patient_count FROM patients;
-- Expected: 15 patients
```

### Check Upcoming Appointments
```sql
SELECT COUNT(*) as upcoming_appointments
FROM appointments
WHERE scheduled_time > NOW();
-- Expected: 15-20 appointments
```

### Check Active Prescriptions
```sql
SELECT COUNT(*) as active_prescriptions
FROM prescriptions
WHERE status IN ('signed', 'partially_dispensed');
-- Expected: 10-15 prescriptions
```

### Check Lab Results
```sql
SELECT COUNT(*) as completed_labs
FROM lab_orders
WHERE status = 'completed';
-- Expected: 8-10 completed tests
```

### Financial Summary
```sql
SELECT
  COUNT(*) as total_bills,
  SUM(total_amount) as total_billed,
  SUM(amount_paid) as total_collected,
  SUM(amount_due) as pending_collections
FROM bills;
-- Expected: 8+ bills, KES 2,900,000+ in total revenue
```

### Patient Visit Summary
```sql
SELECT
  status,
  COUNT(*) as count
FROM patient_visits
GROUP BY status
ORDER BY count DESC;
```

---

## What You'll Have After Loading

### 📊 **15 Diverse Patients** Including:
- Emergency cases (cardiac, trauma)
- ICU patients (post-surgery)
- Outpatient consultations
- Maternity patients (prenatal care)
- Mental health patients
- Pediatric cases
- Chronic disease management (diabetes, hypertension)
- Various specialties (cardiology, neurology, dermatology, etc.)

### 📅 **25+ Appointments**
- **Upcoming**: 15-20 scheduled appointments across all departments
- **Past**: 5-10 completed appointments with notes
- **Types**: Consultations, follow-ups, lab work, radiology, telemedicine, procedures

### 💊 **15+ Prescriptions**
- Active prescriptions with various statuses
- Some with refills available
- Some needing doctor approval for refill
- Mix of chronic medications and acute treatments
- Controlled substances with proper tracking

### 🔬 **15+ Lab Orders**
- **Completed** with detailed results (cardiac, metabolic, hematology, thyroid, etc.)
- **Pending** tests scheduled
- Results with interpretation and reference ranges
- Various urgency levels (routine, urgent, STAT)

### 🏥 **10+ Radiology Orders**
- X-rays (chest, completed)
- CT scans (scheduled)
- MRIs (scheduled)
- Echocardiograms (completed with findings)
- Mammography (scheduled)

### 📋 **Detailed Medical Records**
- Consultation notes
- Diagnoses (ICD codes)
- Surgery reports
- Treatment plans
- Follow-up instructions

### 💰 **Financial Data (KES 2,900,000+ in Revenue)**
- **8 Bills** with various statuses:
  - ✅ Paid (fully settled)
  - ⏳ Partially paid (payment plans)
  - 📋 Pending (awaiting payment)
  - 🏥 Insurance pending (claims processing)

- **Multiple Payment Methods**:
  - Cash
  - Card
  - Mobile money (M-PESA)
  - Insurance
  - Bank transfer

- **Real Cost Scenarios**:
  - Minor consultations: KES 4,500 - 15,000
  - Specialist visits with tests: KES 45,000
  - Major surgery (CABG): KES 2,850,000
  - Maternity care: KES 9,000 per visit

### 🏥 **Active Patient Visits**
- Emergency admission (chest pain)
- ICU patient (post-cardiac surgery)
- Maternity visit (prenatal)
- Mental health consultation
- Cardiology follow-up

---

## Troubleshooting

### "relation does not exist" Error
**Solution**: Run `hospital-database.sql` first. This creates all the tables.

### "foreign key violation" Error
**Solution**: Ensure you run the files in order:
1. hospital-database.sql (schema)
2. hospital-seed.sql (departments & staff)
3. hospital-patient-seed.sql (patients)
4. hospital-patient-seed-enhanced.sql (enhanced data)

### "duplicate key value" Error
**Solution**: The data has already been loaded. You can either:
- Skip this file
- Delete existing data first (see cleanup section below)
- Modify the INSERT statements to use `ON CONFLICT DO NOTHING`

### No Data Showing in App
**Solution**: The patient records are not linked to auth users yet. To test:

**Option A**: Sign up as a new patient in your app
- Go to `/auth`
- Create new account
- This will auto-create a patient record

**Option B**: Link existing patient to test user
```sql
-- Get your user ID from Supabase Auth
-- Then link to a test patient:
UPDATE patients
SET user_id = 'YOUR-AUTH-USER-UUID-HERE'
WHERE email = 'john.kamau@email.com';

-- Also add role
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR-AUTH-USER-UUID-HERE', 'patient');
```

---

## Cleanup (Reset Database)

If you need to start fresh, run this in SQL Editor:

```sql
-- WARNING: This deletes ALL patient data!
DELETE FROM payments;
DELETE FROM bill_items;
DELETE FROM bills;
DELETE FROM medication_dispensing;
DELETE FROM prescription_items;
DELETE FROM prescriptions;
DELETE FROM telemedicine_sessions;
DELETE FROM aftercare_plans;
DELETE FROM radiology_orders;
DELETE FROM lab_orders;
DELETE FROM diagnoses;
DELETE FROM medical_records;
DELETE FROM mental_health_records;
DELETE FROM maternity_records;
DELETE FROM visit_department_history;
DELETE FROM appointments;
DELETE FROM patient_visits;
DELETE FROM patients;

-- Optionally reset staff and departments too:
-- DELETE FROM pharmacy_inventory;
-- DELETE FROM hospital_staff;
-- DELETE FROM departments;
```

---

## Next Steps

1. ✅ Load the seed data (follow steps above)
2. ✅ Verify data is loaded (run verification queries)
3. ✅ Start your dev server: `npm run dev`
4. ✅ Test the patient dashboard
5. ✅ Create test user accounts and link to patients
6. ✅ Test appointment booking, prescription viewing, billing

---

## Quick Test Patients

After loading, you can test with these patient emails:

| Email | Scenario | Highlights |
|-------|----------|------------|
| `john.kamau@email.com` | Emergency Visit | Active cardiac case, lab results, X-ray |
| `sarah.wanjiku@email.com` | Completed Checkup | Upcoming appointment, fully paid bill |
| `james.mwangi@email.com` | Mental Health | Telemedicine session, confidential records |
| `mary.akinyi@email.com` | Maternity | 28 weeks pregnant, prenatal visits |
| `david.omondi@email.com` | Post-Surgery | ICU, major surgery bill (KES 2.8M) |
| `lucy.wambui@email.com` | Lab Appointment | Upcoming lab work in 2 days |
| `michael.kimani@email.com` | Chronic Disease | Diabetes/hypertension, multiple meds |

---

**Ready to load? Start with Step 1 above! 🚀**
