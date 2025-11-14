# Willis Ivali - Patient Dashboard Setup Guide

This guide walks you through setting up the complete patient profile for Willis Ivali (itsivali@gmail.com) in HospitalGuard.

## Prerequisites

Before loading Willis's patient data, ensure you have:

1. ✅ Supabase project set up and configured
2. ✅ Database schema loaded (`hospital-database.sql`)
3. ✅ Hospital seed data loaded (`hospital-seed.sql`) - This includes departments and staff
4. ✅ Willis registered as a user with role `patient`

## Step 1: Create Willis's User Account

**IMPORTANT**: Willis must have an auth account BEFORE loading seed data!

### Option A: Register through the app (Recommended)
1. Navigate to `http://localhost:8080/auth`
2. Click "Sign Up"
3. Use these credentials:
   - **Email**: `itsivali@gmail.com`
   - **Password**: Choose a password (e.g., `Willis123!`)
   - **Full Name**: `Willis Ivali`
4. Click "Create Account"

### Option B: Create directly in Supabase Dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Email: `itsivali@gmail.com`
4. Auto-generate password or set one
5. Confirm email verification (or disable email confirmation in settings)

## Step 2: Enable Auto-Assign Doctor (Optional but Recommended)

This feature automatically assigns a doctor to new patients when they register:

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `auto-assign-doctor.sql`
3. Click "Run" or press Ctrl+Enter
4. You should see "CREATE FUNCTION" and "CREATE TRIGGER" success messages

**What this does**:
- When a new patient registers, they're automatically assigned a general practitioner
- Uses load balancing to distribute patients evenly among available doctors
- Creates an initial "welcome" visit to establish the doctor-patient relationship
- Ensures the "My Care Team" card populates immediately for new patients

## Step 3: Load Patient Seed Data

Now run the patient seed script in your **Supabase SQL Editor**:

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `patient-willis-ivali-seed.sql`
3. Click "Run" or press Ctrl+Enter
4. You should see "SUCCESS" messages with the summary at the end

This script will create:

### 📋 Patient Profile
- Full patient record with medical history
- Blood type: A+
- Allergies: Sulfa drugs
- Insurance: Britam Insurance

### 🏥 Patient Visits (2 visits)
1. **Current Active Visit** - Outpatient (In Consultation)
   - Chief Complaint: Eye strain, neck pain, headaches from prolonged computer use
   - Status: `in_consultation`
   - Attending Doctor: Dr. Daniel Taylor (Outpatient)
   - Department: Outpatient

2. **Previous Visit** - Routine Checkup (3 months ago)
   - Status: `discharged`
   - Vitamin D deficiency detected
   - Follow-up required

### 💊 Prescriptions (2 prescriptions)
1. **Current Active Prescription** (Status: `signed`)
   - Ibuprofen 400mg - For headaches (30 tablets)
   - Vitamin D3 2000IU - Daily supplement (90 tablets)
   - Acetylcysteine 200mg - Eye health (60 tablets)
   - Refills: 2 remaining
   - Valid for: 90 days

2. **Previous Prescription** (Status: `dispensed`)
   - Vitamin D3 2000IU - Completed 3-month course

### 🔬 Lab Orders (3 orders)
1. **Current - Complete Blood Count & Metabolic Panel** (Completed)
   - WBC, RBC, Hemoglobin, Platelets
   - Glucose, Cholesterol, Liver function
   - All values within normal limits ✅

2. **Previous - Vitamin D Level Test** (Completed)
   - Result: 18 ng/mL (deficient)
   - Supplementation recommended

3. **Upcoming - Vitamin D Recheck** (Pending)
   - Scheduled in 14 days
   - Follow-up after supplementation

### 📸 Radiology Orders (1 order)
- **Cervical Spine X-ray** (Completed)
  - Imaging Type: X-Ray
  - Body Part: Cervical Spine
  - Findings: Postural abnormality from desk work, no acute pathology
  - Radiologist: Dr. Ryan Rivera

### 📝 Medical Records (2 records)
1. **Current - Occupational Health Assessment**
   - Complete consultation notes
   - Diagnoses: Digital Eye Strain, Cervical Strain, Tension Headaches
   - Treatment plan with ergonomic recommendations

2. **Previous - Annual Health Checkup**
   - General health assessment
   - Vitamin D deficiency diagnosis

### 🩺 Diagnoses (3 diagnoses)
1. Computer Vision Syndrome (ICD: H53.14)
2. Cervicalgia - Neck Pain (ICD: M54.2)
3. Tension-Type Headache (ICD: G44.209)

### 📅 Upcoming Appointments (3 scheduled)
1. **Follow-up for Eye Strain** - In 7 days
   - Dr. Daniel Taylor (Outpatient)
   - Ergonomic assessment review

2. **Lab Work - Vitamin D Recheck** - In 14 days
   - Laboratory Department
   - After 3 months of supplementation

3. **Preventive Cardiology Screening** - In 21 days
   - Dr. William Phillips (Cardiology)
   - Family history of heart disease

### 💰 Billing & Payments (2 bills)
1. **Current Visit Bill**
   - Total: KES 18,500
   - Paid: KES 5,550 (30% co-payment via M-Pesa)
   - Due: KES 12,950 (Insurance pending - 70% coverage)
   - Status: `insurance_pending`

2. **Previous Visit Bill**
   - Total: KES 8,000
   - Status: `paid` (Fully settled)

## Step 4: Verify Data Was Loaded Successfully

Before logging in, verify the data in Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the entire contents of `verify-willis-data.sql`
4. Click "Run"
5. Check the results:
   - All checks should show "✅ FOUND"
   - Summary should show:
     - `auth_user_exists: 1`
     - `patient_record_exists: 1`
     - `total_visits: 2`
     - `active_visits: 1`
     - `total_prescriptions: 2`
     - `active_prescriptions: 1`
     - `care_team_count: 2` (Dr. Daniel Taylor & Dr. Jessica Moore)

If any checks fail, see the Troubleshooting section below.

## Step 5: View Data in Patient Dashboard

After loading the seed data, log in to the Patient Dashboard as Willis:

1. **Navigate to**: `http://localhost:8080/auth`
2. **Login with**: `itsivali@gmail.com`
3. **You should see**:
   - ✅ Current Visit card showing active consultation with Dr. Daniel Taylor
   - ✅ My Care Team section with assigned doctors
   - ✅ 3 Upcoming Appointments
   - ✅ 1 Active Prescription (with 3 medications)
   - ✅ 1 Lab Result Ready (CBC & Metabolic Panel)
   - ✅ 2 Medical Records (viewable and printable)

## Features Available

### 🏥 Current Visit Tracking
- See your active hospital visit status
- View assigned attending physician
- Track visit progress (In Consultation)

### 👨‍⚕️ My Care Team (Always Visible)
- **NEW**: Always shows for all patients (new and existing)
- **Empty State**: Guides new patients to book first appointment
- View all doctors who have treated you
- Quick "Book Visit" button for follow-ups with pre-selected doctor
- See doctor specializations
- **Auto-Assigned**: New patients automatically get a doctor on registration

### 📅 Enhanced Appointment Booking
- **NEW**: "Show All Doctors" button to see all available doctors
- **NEW**: Doctor dropdown shows department names
- Select from all hospital doctors, not just one department
- Doctors listed with specialization AND department
- Pre-select doctor when booking from Care Team

### 💊 Active Prescriptions
- **NEW**: Prescription count displayed on stats card
- View all medications with dosage and frequency
- See refills remaining (shown as badge)
- Check expiration dates
- **NEW**: "Request Refill" button when refills = 0
- **NEW**: Refill request modal with prescription details
- Submit refill requests directly to prescribing doctor
- Track refill request status (1-2 business days)

### 🔬 Lab Results (Clean Format)
- NO JSON! Beautiful, formatted test results
- Test values with reference ranges displayed inline
- Clinical interpretation highlighted
- Print functionality included

### 📋 Medical History
- Full consultation notes viewable
- Complete clinical documentation
- Print professional medical records
- Patient information included

### 📅 Appointments
- Book new appointments with department/doctor selection
- View upcoming scheduled visits
- See appointment details

## Troubleshooting

### "My Care Team" Card Not Showing?

**Most Common Issue**: Patient visits don't have attending doctors assigned.

**Debug Steps**:
1. Open browser console (F12) when logged in as Willis
2. Look for console logs:
   ```
   Recent visits data: []  ← No visits found
   Care team extracted: [] ← No doctors found
   ```
3. Run `verify-willis-data.sql` in Supabase to check:
   - Check 11 should show `care_team_count > 0`
   - Check 12 should list doctors (Dr. Daniel Taylor, Dr. Jessica Moore)

**Solutions**:
- ✅ Make sure hospital seed data is loaded first (`hospital-seed.sql`)
  - This creates the doctors (Dr. Daniel Taylor, Dr. Jessica Moore)
- ✅ Then load Willis's data (`patient-willis-ivali-seed.sql`)
- ✅ Check that doctors exist in `hospital_staff` table with the correct emails:
  - `daniel.taylor@hospitalguard.com`
  - `jessica.moore@hospitalguard.com`

### "Current Visit" Card Not Showing?

**Issue**: No active visit found.

**Debug**:
```sql
SELECT status, chief_complaint, check_in_time
FROM patient_visits pv
JOIN patients p ON p.id = pv.patient_id
WHERE p.email = 'itsivali@gmail.com'
ORDER BY check_in_time DESC;
```

**Expected**: One visit with status = `in_consultation`

**Solutions**:
- Verify visit status is one of: `checked_in`, `in_triage`, `in_consultation`, `in_treatment`
- Check that `check_in_time` is recent (within last few hours/days)
- Re-run seed script if needed

### Prescriptions Not Showing?

**Debug**:
```sql
SELECT prescription_number, status, valid_until, refills_allowed
FROM prescriptions pr
JOIN patients p ON p.id = pr.patient_id
WHERE p.email = 'itsivali@gmail.com';
```

**Expected**: 2 prescriptions, 1 with status `signed`

**Solutions**:
- Check that prescription status is `signed` or `partially_dispensed`
- Verify `valid_until` date is in the future
- Confirm patient_id matches Willis's patient record

### Lab Results Showing JSON?

**This should be fixed!** The new design formats all data properly.

**If you still see JSON**:
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check browser console for errors

### Auth User Not Found

**Error**: `❌ NOT FOUND - Please register Willis at /auth first`

**Solution**:
1. Go to `http://localhost:8080/auth`
2. Click "Sign Up"
3. Register with email: `itsivali@gmail.com`
4. Then run `patient-willis-ivali-seed.sql`

### Doctors Don't Exist

**Error when running seed**: Foreign key constraint violation on `attending_doctor_id`

**Solution**:
1. Load hospital seed data first: `hospital-seed.sql`
2. This creates all departments and staff including:
   - Dr. Daniel Taylor (Outpatient)
   - Dr. Jessica Moore (Internal Medicine)
3. Then load Willis's data

## Summary

After loading Willis Ivali's seed data, you'll have a **complete, realistic patient profile** demonstrating:

- ✅ Active hospital visit with assigned doctor
- ✅ Care team tracking
- ✅ Digital prescriptions with QR codes
- ✅ Beautifully formatted lab results (no JSON!)
- ✅ Comprehensive medical records (printable)
- ✅ Billing and insurance tracking
- ✅ Upcoming appointments
- ✅ Complete patient journey from check-in to follow-up

This represents a **real-world tech worker's health journey** with occupational health concerns, preventive care, and ongoing treatment.

---

**Willis Ivali Profile**: Software developer, age 37, experiencing tech-related health issues (eye strain, neck pain) with comprehensive medical care and follow-up plan.
