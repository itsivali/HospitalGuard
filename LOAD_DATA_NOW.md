# 🚀 Load All Patient Data into Supabase - Quick Guide

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

**Go to**: https://supabase.com/dashboard/project/hdpavdwanzydfcudogar

Click: **SQL Editor** (left sidebar) → **+ New query**

---

## 2. Load Data Files in This Order

### ✅ Step 1: Hospital Departments & Staff (if not loaded)

**File**: `hospital-seed.sql`

**Action**:
- Copy entire contents of `hospital-seed.sql`
- Paste into SQL Editor
- Click **Run**
- ✅ Success message: "HospitalGuard Seed Data Complete"
- Shows: 20 departments, 80+ staff, 35+ pharmacy items

---

### ✅ Step 2: Base Patient Data (15 patients)

**File**: `hospital-patient-seed.sql`

**Action**:
- Copy entire contents of `hospital-patient-seed.sql`
- Paste into SQL Editor
- Click **Run**
- ✅ Success message: "Patient Portal Ready for Testing!"
- Shows: Test patients list with scenarios

---

### ✅ Step 3: Enhanced Medical Data

**File**: `hospital-patient-seed-enhanced.sql`

**Action**:
- Copy entire contents of `hospital-patient-seed-enhanced.sql`
- Paste into SQL Editor
- Click **Run**
- ✅ Success message: "Enhanced Data Loaded Successfully!"
- Shows: Financial summary with KES 2,900,000+ revenue

---

### ✅ Step 4: Willis Ivali's Profile (YOU!)

**File**: `patient-willis-ivali-seed.sql`

**Action**:
- Copy entire contents of `patient-willis-ivali-seed.sql`
- Paste into SQL Editor
- Click **Run**
- ✅ Success message: "Willis Ivali profile created successfully!"
- Shows: Your visits, appointments, prescriptions, billing

**IMPORTANT**: This file automatically links to your existing auth account (itsivali@gmail.com)

---

## 3. Verify Everything Loaded

Run this query in SQL Editor:

```sql
-- Quick verification
SELECT
  'Patients' as table_name,
  COUNT(*) as count
FROM patients
UNION ALL
SELECT 'Appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'Prescriptions', COUNT(*) FROM prescriptions
UNION ALL
SELECT 'Lab Orders', COUNT(*) FROM lab_orders
UNION ALL
SELECT 'Bills', COUNT(*) FROM bills;
```

**Expected Results**:
- Patients: 16 (15 test patients + Willis)
- Appointments: 30+
- Prescriptions: 17+
- Lab Orders: 18+
- Bills: 10+

---

## 4. Check Your Profile

```sql
-- See Willis's complete profile
SELECT
  p.first_name,
  p.last_name,
  p.email,
  p.blood_type,
  COUNT(DISTINCT pv.id) as visits,
  COUNT(DISTINCT a.id) as appointments,
  COUNT(DISTINCT pr.id) as prescriptions
FROM patients p
LEFT JOIN patient_visits pv ON pv.patient_id = p.id
LEFT JOIN appointments a ON a.patient_id = p.id
LEFT JOIN prescriptions pr ON pr.patient_id = p.id
WHERE p.email = 'itsivali@gmail.com'
GROUP BY p.id, p.first_name, p.last_name, p.email, p.blood_type;
```

---

## 5. Test Your Patient Dashboard

1. **Start dev server**: `npm run dev`
2. **Navigate to**: http://localhost:8080
3. **Login with**: itsivali@gmail.com + your password
4. **You'll be redirected to**: `/patient-dashboard`

### 🎯 What You'll See on Your Dashboard:

#### Quick Stats Cards
- ✅ **3 Upcoming Appointments**
- ✅ **2 Active Prescriptions**
- ✅ **2 Lab Orders** (1 completed, 1 pending)
- ✅ **2 Medical Records**

#### Upcoming Appointments Section
1. Follow-up for eye strain (7 days)
2. Vitamin D lab recheck (14 days)
3. Cardiology screening (21 days)

#### Active Prescriptions
1. Ibuprofen 400mg - As needed for headaches
2. Vitamin D3 2000 IU - Daily supplement (2 refills)
3. Acetylcysteine 200mg - Eye health antioxidant

#### Action Items
- ⚠️ **Lab Results Ready** - CBC & Metabolic Panel completed
- 📅 **Upcoming Lab Work** - Vitamin D recheck in 14 days
- 💊 **Active Prescriptions** - 2 refills available on Vitamin D

#### Recent Medical History
- **Today**: Tech Worker Syndrome consultation (eye strain, neck pain)
- **3 months ago**: Annual checkup with Vitamin D deficiency diagnosis

#### Financial Summary
- **Current Bill**: KES 18,500
- **Paid**: KES 5,550 (30% co-pay)
- **Insurance Pending**: KES 12,950
- **Previous Bills**: KES 8,000 (Fully Paid ✅)

---

## Common Issues & Solutions

### ❌ "foreign key violation" Error
**Solution**: Load files in order (steps 1-4 above)

### ❌ "relation does not exist"
**Solution**: Run `hospital-database.sql` first to create tables

### ❌ Willis's data not showing in app
**Solution**: Make sure you're logged in as `itsivali@gmail.com`

### ❌ "No departments available" when booking appointment
**Solution**: Run `hospital-seed.sql` (Step 1) first

---

## Quick Test Checklist

After loading, test these features:

- [ ] Login as Willis Ivali (itsivali@gmail.com)
- [ ] See dashboard with stats (3 appointments, 2 prescriptions)
- [ ] View upcoming appointments
- [ ] Click "View Details" on an appointment
- [ ] See active prescriptions with dosages
- [ ] Check action items (lab results ready)
- [ ] View recent medical history
- [ ] Try booking a new appointment
- [ ] Check billing summary

---

## What's Included in Your Profile

### 👤 Your Medical Scenario: **"Tech Worker Syndrome"**

**Current Visit** (Active):
- Digital eye strain from 10-12 hrs daily coding
- Neck pain ("Tech Neck") from poor posture
- Tension headaches
- All tests completed (X-ray, blood work)

**Treatment Plan**:
- Ergonomic workspace assessment
- Blue light glasses
- Physical therapy for neck
- Pain management medications
- Vitamin D supplementation

**Upcoming Care**:
- Follow-up next week
- Lab recheck in 2 weeks
- Preventive cardiology screening

**Perfect for testing** a realistic software developer health scenario!

---

## 🎉 Ready to Load?

1. Open Supabase SQL Editor
2. Run files in order (Steps 1-4)
3. Start app: `npm run dev`
4. Login as Willis and explore!

**Estimated Time**: 5 minutes for all steps

---

**Questions or issues?** Check the troubleshooting section above or review the detailed `load-all-seed-data.md` guide.
