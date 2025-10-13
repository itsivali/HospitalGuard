# Scripts

This folder contains utility scripts for managing the HospitalGuard database.

## Available Scripts

### `populate-departments.ts`

Populates the `departments` table with all 12 hospital departments.

### `populate-doctors.ts`

Populates the `hospital_staff` table with 5-7 doctors per department (60+ total doctors).

**Usage:**
```bash
npx tsx scripts/populate-doctors.ts
```

**Prerequisites:**
- Must run `populate-departments.ts` first
- Departments must exist in the database
- **IMPORTANT**: Requires bypassing Row Level Security. Choose ONE option:

**Option 1 (Recommended)**: Use Service Role Key
  - Get from Supabase Project Settings → API → service_role key (secret)
  - Add to `.env`: `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`
  - **WARNING**: Never commit this key to version control!

**Option 2**: Temporarily disable RLS
  - Run `enable-staff-insert-policy.sql` in Supabase SQL Editor
  - This creates a temporary policy allowing inserts
  - **IMPORTANT**: Remove this policy after population (instructions in file)

**Doctors Created:**
- 5-7 doctors per department with appropriate specializations
- Unique email addresses, phone numbers, and license numbers
- Diverse names and specializations matching department types
- Hire dates ranging from 2020-2024

**Safety:**
- The script checks if doctors already exist before inserting
- If doctors are found, it skips the insertion to avoid duplicates
- To re-populate, delete all doctors from the hospital_staff table first

**Usage for populate-departments.ts:**
```bash
npx tsx scripts/populate-departments.ts
```

**Departments Created:**
- Emergency (Floor 1)
- Intensive Care Unit (ICU) (Floor 2)
- Maternity (Floor 3)
- Pediatrics (Floor 4)
- Surgery (Floor 5)
- Radiology (Floor 1)
- Laboratory (Floor 1)
- Pharmacy (Floor 1)
- Mental Health (Floor 4)
- Outpatient (Floor 2)
- Billing (Floor 1)
- Administration (Floor 5)

**Safety:**
- The script checks if departments already exist before inserting
- If departments are found, it skips the insertion to avoid duplicates
- To re-populate, delete all departments from the table first

## Prerequisites

- Node.js installed
- `.env` file with Supabase credentials:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

## Notes

- All scripts use the `tsx` package to run TypeScript directly
- Scripts automatically load environment variables from `.env`
- Make sure your Supabase instance is running and accessible
