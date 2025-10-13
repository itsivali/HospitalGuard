# HospitalGuard Database Setup

## Overview

HospitalGuard is designed for a **Level 1 Trauma Center** - a comprehensive hospital with all major departments and specialized medical staff available 24/7.

## Level 1 Hospital Capabilities

A Level 1 hospital includes:
- **Emergency Department** with trauma capabilities
- **Intensive Care Unit (ICU)** for critical patients
- **Comprehensive Surgical Services** (general, cardiac, neuro, orthopedic, vascular)
- **Specialized Departments** (cardiology, neurology, oncology, etc.)
- **Maternity & NICU** for high-risk pregnancies
- **Pediatric Services** including emergency care
- **Mental Health** with crisis intervention
- **Advanced Diagnostics** (Laboratory, Radiology with CT/MRI)
- **24/7 Pharmacy** with extensive medication inventory
- **Telemedicine** for aftercare and follow-up

## Database Setup Instructions

### Step 1: Create the Schema

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-schema.sql`
4. Copy and paste the entire schema into the SQL Editor
5. Click **Run** to execute

This creates all tables, indexes, and relationships.

### Step 2: Populate with Level 1 Hospital Data

You have two options for populating the database:

#### Option A: Safe Update (Recommended if departments already exist)

1. In the Supabase **SQL Editor**, create a new query
2. Open the file `supabase-seed-level1-hospital-safe.sql`
3. Copy and paste the entire seed script
4. Click **Run** to execute

This version uses `ON CONFLICT` to safely handle existing data:
- **Existing departments** will be updated with new information
- **Existing staff** (by email) will be updated
- **New staff** will be added
- **Pharmacy items** will only be added if they don't exist

#### Option B: Fresh Start (Recommended for new installations)

If you want to completely replace existing data:

1. Open `supabase-seed-level1-hospital-safe.sql`
2. **Uncomment** these lines at the top (remove the `--`):
   ```sql
   TRUNCATE TABLE hospital_staff CASCADE;
   TRUNCATE TABLE departments CASCADE;
   TRUNCATE TABLE pharmacy_inventory CASCADE;
   ```
3. Run the modified script in Supabase SQL Editor

**⚠️ Warning**: This will delete ALL existing departments, staff, and pharmacy data!

---

Either option will populate the database with:

#### Departments (20 total)
- Emergency
- Intensive Care Unit (ICU)
- Outpatient
- Surgery
- Maternity
- Pediatrics
- Mental Health
- Laboratory
- Radiology
- Pharmacy
- Billing
- Cardiology
- Neurology
- Orthopedics
- Oncology
- Nephrology
- Gastroenterology
- Pulmonology
- Endocrinology
- Dermatology

#### Hospital Staff (80+ professionals)
- **Emergency Medicine**: 4 doctors, 2 nurses
- **ICU**: 3 critical care doctors, 2 nurses
- **Surgery**: 5 surgeons (general, cardiac, neuro, orthopedic, vascular)
- **Maternity**: 3 obstetricians, 2 nurses
- **Pediatrics**: 3 pediatricians, 1 nurse
- **Mental Health**: 3 psychiatrists, 1 nurse
- **Cardiology**: 3 cardiologists
- **Neurology**: 3 neurologists
- **Orthopedics**: 3 orthopedic surgeons
- **Oncology**: 3 oncologists
- **Other Specialties**: Nephrology, Gastroenterology, Pulmonology, Endocrinology, Dermatology (2-3 doctors each)
- **Laboratory**: 4 lab technicians
- **Radiology**: 3 radiologists
- **Pharmacy**: 4 pharmacists
- **Administrative**: Receptionists and billing staff

#### Pharmacy Inventory (35+ medications)
- Pain management
- Antibiotics
- Cardiovascular medications
- Diabetes medications
- Respiratory medications
- Gastrointestinal medications
- Emergency medications
- Psychiatric medications
- And more...

### Step 3: Verify Installation

Run this query to verify the data was loaded correctly:

```sql
-- Check departments
SELECT COUNT(*) as department_count FROM departments;

-- Check total staff
SELECT COUNT(*) as total_staff FROM hospital_staff;

-- Check doctors by department
SELECT
  d.name as department,
  COUNT(s.id) as doctor_count,
  STRING_AGG(s.first_name || ' ' || s.last_name, ', ') as doctors
FROM departments d
LEFT JOIN hospital_staff s ON s.department_id = d.id
  AND s.staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist')
GROUP BY d.name
ORDER BY d.name;

-- Check pharmacy inventory
SELECT COUNT(*) as medication_count FROM pharmacy_inventory;
```

Expected results:
- **Departments**: 20
- **Total Staff**: 80+
- **Doctors**: 60+
- **Pharmacy Items**: 35+

## Environment Configuration

Make sure your `.env` file contains the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Patient Signup Flow

With this Level 1 hospital setup, patients who sign up will:

1. **Enter basic information** (name, email, password)
2. **Describe symptoms** using natural language
3. **AI Analysis** routes them to the appropriate department
4. **Doctor Assignment** automatically assigns an available doctor from that department
5. **Complete Registration** with their assigned doctor and department

The system now has qualified doctors in every department, ensuring patients are always matched with an appropriate specialist.

## Key Features

### Complete Department Coverage
Every major medical specialty has qualified doctors available.

### 24/7 Operations
Emergency, ICU, and Pharmacy are staffed for round-the-clock care.

### Comprehensive Inventory
Pharmacy has essential medications for all common conditions.

### Specialized Care
From trauma surgery to mental health, all specialties are covered.

### Telemedicine Ready
Doctors can provide follow-up care through telemedicine sessions.

## Troubleshooting

### "duplicate key value violates unique constraint" error

**Error**: `ERROR: duplicate key value violates unique constraint "departments_name_key"`

**Cause**: Departments already exist in your database from a previous seed attempt.

**Solution**: Use the **safe version** of the seed script:
1. Use `supabase-seed-level1-hospital-safe.sql` instead
2. This version uses `ON CONFLICT` to update existing data instead of failing
3. Re-run the script - it will update existing departments and add new staff

Alternatively, if you want to start completely fresh:
1. Open `supabase-seed-level1-hospital-safe.sql`
2. Uncomment the `TRUNCATE TABLE` lines at the top
3. Run the script to delete all existing data and start fresh

### "No doctors available" error
- Run the safe seed script to ensure all staff were created
- Check that `is_active = true` for all staff members
- Verify foreign keys between `hospital_staff` and `departments`
- Query to check doctors per department:
  ```sql
  SELECT d.name, COUNT(s.id) as doctor_count
  FROM departments d
  LEFT JOIN hospital_staff s ON s.department_id = d.id
    AND s.staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist')
  GROUP BY d.name
  ORDER BY d.name;
  ```

### Departments not showing
- Ensure the schema was created first
- Check for any SQL errors in the Supabase logs
- Verify you're connected to the correct Supabase project
- Run: `SELECT * FROM departments ORDER BY name;`

### Pharmacy inventory missing
- The seed script includes 35+ medications
- Check the `pharmacy_inventory` table with: `SELECT COUNT(*) FROM pharmacy_inventory;`
- If count is 0, the pharmacy section may have failed
- Re-run the safe seed script to add medications

## Next Steps

After setup:
1. Test patient signup flow
2. Create test appointments
3. Generate prescriptions
4. Test billing workflows
5. Configure telemedicine sessions

## Support

For issues or questions, check:
- Supabase dashboard for error logs
- Browser console for frontend errors
- `CLAUDE.md` for architectural documentation

---

**Note**: This is a comprehensive Level 1 hospital system. All departments are fully staffed with qualified medical professionals, ensuring 24/7 comprehensive care capabilities.
