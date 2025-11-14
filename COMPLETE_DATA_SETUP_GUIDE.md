# Complete Data Setup Guide for HospitalGuard

## Overview
This guide explains how to set up **complete patient data with realistic appointment schedules** for the HospitalGuard system, ensuring both Patient Dashboard and Doctor Dashboard have full, functional data.

---

## 📋 Data Architecture

### Three-Layer Data Structure:

1. **Base Hospital Data** (`hospital-seed.sql`)
   - 20 Departments
   - 80+ Medical Staff (Doctors, Nurses, Pharmacists, etc.)
   - 35+ Pharmacy Medications
   - Hospital infrastructure

2. **Patient Base Data** (`hospital-patient-seed.sql`)
   - 15 Core Patients with diverse profiles
   - Patient visits (active, discharged, ICU, maternity)
   - Basic medical records
   - Initial appointments

3. **Enhanced Patient Data** (`hospital-patient-seed-enhanced.sql`)
   - Additional 20+ appointments (past and future)
   - 10+ prescriptions with medication details
   - 15+ lab orders with results
   - Radiology orders and imaging
   - Detailed medical records (consultation notes, surgery notes)
   - Comprehensive billing and payments

4. **Dummy Appointment Schedules** (`generate-dummy-appointments.sql`) **← NEW!**
   - **Today's appointments** (10-15 active appointments)
   - **Future appointments** (next 30 days, 2-4 per patient)
   - **Past appointments** (last 90 days, 3-6 per patient)
   - **Willis Ivali appointments** (3 specific appointments)
   - Realistic distribution across departments and doctors

---

## 🚀 Setup Instructions

### Prerequisites:
- Supabase project created
- Database schema loaded (`hospital-database.sql`)

### Step-by-Step Setup:

#### 1. Load Base Hospital Data
```sql
-- In Supabase SQL Editor
-- File: hospital-seed.sql
-- This creates departments, staff, and pharmacy inventory
```

**What This Does:**
- Creates 20 hospital departments
- Adds 80+ staff members (doctors, nurses, specialists)
- Populates pharmacy with 35+ medications
- Establishes hospital infrastructure

#### 2. Load Patient Base Data
```sql
-- In Supabase SQL Editor
-- File: hospital-patient-seed.sql
-- This creates 15 patients with initial data
```

**What This Does:**
- Creates 15 diverse patients:
  - John Kamau, Sarah Wanjiku, David Omondi
  - Mary Akinyi, James Mwangi, Grace Njeri
  - Peter Otieno, Lucy Wambui, Michael Kimani
  - Elizabeth Chebet, Robert Muriithi, Nancy Wairimu
  - Thomas Odhiambo, Catherine Muthoni, Anthony Wekesa
- Establishes initial patient visits
- Creates basic medical records

#### 3. Load Enhanced Patient Data
```sql
-- In Supabase SQL Editor
-- File: hospital-patient-seed-enhanced.sql
-- This adds comprehensive medical data
```

**What This Does:**
- Adds 20+ appointments (scheduled, completed, pending)
- Creates 10+ prescriptions with medications
- Generates 15+ lab orders with detailed results
- Adds radiology orders and imaging reports
- Creates detailed medical records (consultations, procedures)
- Establishes billing records with payments
- Adds insurance claims and financial transactions

#### 4. Generate Dummy Appointment Schedules **← CRITICAL FOR DOCTOR DASHBOARD**
```sql
-- In Supabase SQL Editor
-- File: generate-dummy-appointments.sql
-- This creates realistic appointment schedules
```

**What This Does:**
- **Today's Appointments**: Creates 10-15 appointments for today
  - Status: `confirmed`, `in_progress`, `completed`
  - Times: 8:00 AM - 5:00 PM
  - Departments: Outpatient, Cardiology, Neurology, etc.

- **Future Appointments**: Creates 2-4 appointments per patient
  - Next 30 days
  - Random departments and doctors
  - Status: `scheduled`, `confirmed`
  - Realistic scheduling (8 AM - 5 PM)

- **Past Appointments**: Creates 3-6 appointments per patient
  - Last 90 days
  - Status: `completed`, `no_show`, `cancelled`
  - Complete appointment history

- **Willis Ivali Specific Appointments**:
  1. Today at 10:00 AM - Dr. Taylor (Outpatient) - Follow-up
  2. Next week at 2:00 PM - Dr. Phillips (Cardiology) - Consultation
  3. Next month at 8:00 AM - Laboratory - Vitamin D recheck

**Total Appointments Generated:**
- ~12 appointments for today
- ~45-60 future appointments (15 patients × 2-4 each)
- ~60-90 past appointments (15 patients × 3-6 each)
- **Total: ~120-165 appointments** across all patients

---

## 📊 What Each Dashboard Will Show

### Patient Dashboard (Willis Ivali):

**When Willis logs in at `/dashboard`:**

✅ **Header**: "Welcome back, Willis Ivali"

✅ **My Care Team Card**:
- Dr. Daniel Taylor (Outpatient)
- Dr. Jessica Moore (Outpatient)
- "Book Visit" buttons for quick scheduling

✅ **Appointments Card**:
- Shows 3 appointments
- Click to manage → Opens full appointment list:
  - Today: Dr. Taylor at 10:00 AM
  - Next week: Dr. Phillips at 2:00 PM
  - Next month: Lab appointment at 8:00 AM
- Actions: View Details, Cancel

✅ **Prescriptions Card**:
- Shows 1 active prescription
- Click to manage → Opens prescription details:
  - Ibuprofen + 2 more medications
  - Status: signed, 2 refills remaining
  - Expires: April 14, 2025
- Actions: View Details, Request Refill

✅ **Lab Results Card**:
- Shows 1 completed test
- Click to view → Formatted results (no JSON)
  - Vitamin D: 25 ng/mL (low)
  - Interpretation and recommendations

✅ **Medical History Card**:
- Shows 2+ medical records
- Click to view → Consultation notes
- Print functionality available

---

### Doctor Dashboard (Any Doctor):

**When any doctor logs in at `/dashboard`:**

✅ **Header**: "Dr. [Name] • [Department] • [Specialization]"

✅ **Today's Appointments Card**:
- Shows count of today's appointments (10-15)
- Click to manage → Opens today's schedule:
  - Full list of patients scheduled for today
  - Times: 8:00 AM - 5:00 PM
  - Patient names, phone numbers, reasons
  - Status badges (confirmed, in_progress, completed)

✅ **Patients Under My Care Card**:
- Shows active patients currently assigned
- Click to view → Patient list with details:
  - Current visit status
  - Chief complaint
  - Triage level
  - Check-in time
- Click patient → Opens patient details modal

✅ **Urgent Cases Card**:
- Shows count of critical/urgent patients
- Automatically calculated from triage levels

✅ **All Patients in System Card**:
- Shows total patients (15+)
- Click to view → Opens patient registry:
  - **Search functionality** (by name, email, phone)
  - Complete patient list including Willis Ivali
  - Patient details: name, email, phone, blood type
  - Latest visit status
- **Search for "Willis"** → Willis Ivali appears with full details
- Click Willis → Opens his complete patient profile

---

## 🔍 Verification Queries

### Verify Appointments Were Created:

```sql
-- Check total appointments
SELECT COUNT(*) as total_appointments FROM appointments;
-- Expected: 120-165

-- Check today's appointments
SELECT COUNT(*) as todays_appointments
FROM appointments
WHERE DATE(scheduled_time) = CURRENT_DATE;
-- Expected: 10-15

-- Check future appointments
SELECT COUNT(*) as future_appointments
FROM appointments
WHERE DATE(scheduled_time) > CURRENT_DATE;
-- Expected: 45-60

-- Check Willis's appointments
SELECT
  appointment_number,
  scheduled_time,
  status,
  reason,
  d.name as department
FROM appointments a
JOIN patients p ON p.id = a.patient_id
LEFT JOIN departments d ON d.id = a.department_id
WHERE p.email = 'itsivali@gmail.com'
ORDER BY scheduled_time;
-- Expected: 3+ appointments
```

### Verify Doctor Dashboard Data:

```sql
-- Check what a doctor will see (example: Dr. Daniel Taylor)
SELECT
  COUNT(*) as appointment_count,
  DATE(scheduled_time) as appointment_date
FROM appointments a
JOIN hospital_staff hs ON hs.id = a.doctor_id
WHERE hs.email = 'daniel.taylor@hospitalguard.com'
  AND DATE(scheduled_time) >= CURRENT_DATE
GROUP BY DATE(scheduled_time)
ORDER BY appointment_date;
```

### Verify Patient Dashboard Data:

```sql
-- Check what Willis will see
SELECT
  'Appointments' as data_type,
  COUNT(*) as count
FROM appointments
WHERE patient_id = (SELECT id FROM patients WHERE email = 'itsivali@gmail.com')
  AND DATE(scheduled_time) >= CURRENT_DATE

UNION ALL

SELECT
  'Prescriptions' as data_type,
  COUNT(*) as count
FROM prescriptions
WHERE patient_id = (SELECT id FROM patients WHERE email = 'itsivali@gmail.com')
  AND status IN ('signed', 'partially_dispensed')

UNION ALL

SELECT
  'Lab Results' as data_type,
  COUNT(*) as count
FROM lab_orders
WHERE patient_id = (SELECT id FROM patients WHERE email = 'itsivali@gmail.com')
  AND status = 'completed';
```

---

## 🎯 Expected Results

### After Complete Setup:

#### Patient Portal (Willis Ivali):
- ✅ Full name displayed
- ✅ 2 doctors in care team
- ✅ 3+ appointments visible
- ✅ 1 active prescription
- ✅ 1+ lab result
- ✅ 2+ medical records
- ✅ All cards clickable and interactive

#### Doctor Portal (Any Doctor):
- ✅ Doctor profile with specialization
- ✅ 10-15 today's appointments
- ✅ 5-10 active patients under care
- ✅ 2-3 urgent cases
- ✅ 15+ patients in registry
- ✅ Search functionality for finding Willis
- ✅ All patients clickable for details

---

## 📝 Troubleshooting

### Issue: No appointments showing on doctor dashboard

**Solution:**
```sql
-- Check if appointments were created
SELECT COUNT(*) FROM appointments;

-- If 0, run generate-dummy-appointments.sql again
```

### Issue: Willis not appearing in patient registry

**Solution:**
```sql
-- Check if Willis exists
SELECT * FROM patients WHERE email = 'itsivali@gmail.com';

-- If not found, run patient-willis-ivali-seed.sql
```

### Issue: Today's appointments not showing

**Solution:**
```sql
-- Check today's date appointments
SELECT * FROM appointments WHERE DATE(scheduled_time) = CURRENT_DATE;

-- If empty, re-run generate-dummy-appointments.sql
```

---

## 🔄 Data Refresh

To **refresh all dummy appointment data**:

```sql
-- 1. Delete existing dummy appointments (CAREFUL!)
DELETE FROM appointments WHERE appointment_number LIKE 'APT-%';

-- 2. Re-run the generator
-- Run: generate-dummy-appointments.sql
```

**Note:** This will NOT delete appointments from the enhanced seed file. Only appointments generated by the dummy script will be removed.

---

## 📁 File Execution Order

**Correct order for complete setup:**

1. `hospital-database.sql` - Database schema
2. `hospital-seed.sql` - Hospital infrastructure
3. `auto-assign-doctor.sql` - Auto-assignment trigger (optional)
4. `hospital-patient-seed.sql` - Base patient data
5. `patient-willis-ivali-seed.sql` - Willis's detailed data
6. `hospital-patient-seed-enhanced.sql` - Enhanced patient data
7. **`generate-dummy-appointments.sql`** ← **Run this for full schedules!**

---

## 🎨 Visual Confirmation

### Patient Dashboard Should Show:
```
┌─────────────────────────────────────┐
│ Welcome back, Willis Ivali          │
└─────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐
│ 📅 3     │ │ 💊 1     │ │ 🧪 1     │
│ Appts ✓  │ │ Rx ✓     │ │ Labs ✓   │
└──────────┘ └──────────┘ └──────────┘
```

### Doctor Dashboard Should Show:
```
┌─────────────────────────────────────┐
│ Dr. Daniel Taylor • Outpatient      │
└─────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐
│ 📅 12    │ │ 👥 8     │ │ ⚠️ 2     │
│ Today ✓  │ │ Care ✓   │ │ Urgent ✓ │
└──────────┘ └──────────┘ └──────────┘

┌──────────┐
│ 👥 15    │ Search Willis → Found ✓
│ All ✓    │
└──────────┘
```

---

## ✅ Success Indicators

Your setup is complete when:

- [ ] All 7 SQL files executed without errors
- [ ] Patient dashboard shows Willis's full name
- [ ] Patient dashboard has 3+ appointments
- [ ] Patient dashboard has 1+ prescriptions
- [ ] Doctor dashboard shows today's appointments (10+)
- [ ] Doctor dashboard "All Patients" includes Willis
- [ ] Search for "Willis" returns results
- [ ] All stat cards are clickable
- [ ] All modals open with data

---

**Last Updated**: 2025-01-14
**Version**: 1.0
**Purpose**: Complete data setup for functional HospitalGuard system
