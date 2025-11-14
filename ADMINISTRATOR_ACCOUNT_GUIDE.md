# Administrator Account Setup Guide

## 🎯 Overview

This guide will help you create and use the **System Administrator account** with full CRUD access to the entire HospitalGuard system.

**Administrator Email**: `itsivali@outlook.com`
**Role**: `admin`
**Access Level**: Full system access (all dashboards, all data, full CRUD operations)

---

## 📋 Setup Instructions

### Step 1: Create the Auth User Account

The administrator auth user must be created via the signup process:

#### Option A: Using the HospitalGuard App (Recommended)

1. Navigate to `/auth` in your browser
2. Click **"Sign Up"**
3. Enter credentials:
   - **Email**: `itsivali@outlook.com`
   - **Password**: (choose a secure password)
4. Complete signup process
5. Verify email if required

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **Authentication > Users**
3. Click **"Invite User"**
4. Enter email: `itsivali@outlook.com`
5. Send invitation
6. User completes signup via email link

---

### Step 2: Assign Admin Role & Permissions

After creating the auth user, run the SQL script in **Supabase SQL Editor**:

```sql
-- File: create-administrator-account.sql
```

**What This Script Does**:
- ✅ Assigns `admin` role to the user
- ✅ Creates hospital staff record (optional)
- ✅ Grants full CRUD permissions via RLS policies
- ✅ Creates `is_admin()` helper function
- ✅ Adds admin bypass to all RLS policies

**Expected Output**:
```
========================================
Administrator Account Created!
========================================
Email: itsivali@outlook.com
Role: admin
Access Level: Full CRUD on entire system
========================================

PERMISSIONS GRANTED:
✓ Access to all dashboards
✓ View all patient data
✓ View/Edit all prescriptions
✓ View/Edit all financial data
✓ View/Edit all medical records
✓ View/Edit all appointments
✓ View/Edit all lab/radiology orders
✓ Manage all hospital staff
✓ Full CRUD on all tables
========================================
```

---

## 🚀 Using the Admin Dashboard

### Accessing the Dashboard

1. Login at `/auth` with credentials:
   - Email: `itsivali@outlook.com`
   - Password: (your password)

2. You'll be automatically redirected to `/admin-dashboard`

3. The dashboard shows a comprehensive overview of the entire system

---

### Dashboard Features

#### 📊 **Overview Tab** (Default View)

**Statistics Display**:
- Total Patients (all registered patients)
- Total Appointments (past, present, future)
- Total Prescriptions (all prescriptions issued)
- Total Revenue (all bills and payments)
- Active Staff (current hospital staff)
- Critical Patients (urgent/critical cases)
- Today's Appointments (scheduled for today)
- Pending Payments (outstanding bills)

**Visual Layout**:
```
╔══════════════════════════════════════════════╗
║  System Administrator                        ║
║  Full System Access • itsivali@outlook.com   ║
╚══════════════════════════════════════════════╝

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 👥 16       │  │ 📅 145      │  │ 💊 11       │  │ 💰 2.9M     │
│ Patients    │  │ Appts       │  │ Rx          │  │ Revenue     │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 👨‍⚕️ 80      │  │ ⚠️ 3        │  │ 📅 12       │  │ 💵 285K     │
│ Staff       │  │ Critical    │  │ Today       │  │ Pending     │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

#### 👥 **Patients Tab**

**Features**:
- View all registered patients (16+ patients)
- Search patients by name or email
- View patient details (name, email, phone, blood type, gender)
- Quick actions:
  - **View Full Profile** - Complete patient information
  - **Edit Patient** - Modify patient data
  - **Add New Patient** - Register new patients

**What You Can Do**:
- ✅ View all patient data (unlimited access)
- ✅ Edit any patient record
- ✅ Create new patients
- ✅ Delete patient records (careful!)
- ✅ Access patient medical history
- ✅ View patient visits, appointments, prescriptions

---

#### 📅 **Appointments Tab**

**Features**:
- View all appointments (145+ appointments)
- Search appointments by patient name
- See appointment details:
  - Patient name
  - Scheduled time
  - Department
  - Doctor assigned
  - Appointment status
  - Reason for visit

**What You Can Do**:
- ✅ View all appointments across all departments
- ✅ Edit any appointment
- ✅ Schedule new appointments for any patient
- ✅ Cancel appointments
- ✅ Modify appointment times and doctors
- ✅ View appointment history

---

#### 💊 **Prescriptions Tab**

**Features**:
- View all prescriptions (11+ prescriptions)
- Search prescriptions by patient name
- See prescription details:
  - Prescription number
  - Patient name
  - Doctor who prescribed
  - Status (signed, dispensed, etc.)
  - Refills allowed
  - Medications included

**What You Can Do**:
- ✅ View all prescriptions system-wide
- ✅ Edit prescription details
- ✅ Create new prescriptions
- ✅ Approve/deny refill requests
- ✅ View prescription medications
- ✅ Check dispensing history

---

#### 💰 **Financials Tab**

**Features**:
- Complete financial overview
- Total revenue tracking
- Pending payments monitoring
- Individual bill management

**Statistics**:
- **Total Revenue**: Sum of all bills
- **Pending Payments**: Outstanding amounts
- **Total Bills**: Number of bills issued

**Bill Details**:
- Bill number
- Total amount, amount paid, amount due
- Bill status (paid, pending, partially_paid)
- Patient associated with bill

**What You Can Do**:
- ✅ View all financial data
- ✅ View all bills and payments
- ✅ Edit bill amounts
- ✅ Record payments
- ✅ Generate financial reports
- ✅ Export billing data
- ✅ Track insurance claims

---

## 🔒 Permissions & Access Control

### Full CRUD Permissions

The admin account has **full CRUD** (Create, Read, Update, Delete) access to:

#### Patient Data:
- ✅ `patients` - All patient records
- ✅ `patient_visits` - All patient visits
- ✅ `medical_records` - All medical history

#### Appointments:
- ✅ `appointments` - All appointments

#### Prescriptions:
- ✅ `prescriptions` - All prescriptions
- ✅ `prescription_items` - All medication details
- ✅ `dispensing_log` - Pharmacy dispensing records

#### Financial Data:
- ✅ `bills` - All billing records
- ✅ `bill_items` - Bill line items
- ✅ `payments` - All payment transactions

#### Lab & Radiology:
- ✅ `lab_orders` - All lab tests
- ✅ `radiology_orders` - All imaging orders

#### Hospital Staff:
- ✅ `hospital_staff` - All staff members
- ✅ `departments` - All departments
- ✅ `user_roles` - User role assignments

#### Pharmacy:
- ✅ `pharmacy_inventory` - Medication inventory
- ✅ `dispensing_log` - Dispensing history

#### Specialized Records:
- ✅ `maternity_records` - Maternity care data
- ✅ `mental_health_records` - Mental health data
- ✅ `telemedicine_sessions` - Telemedicine records
- ✅ `aftercare_plans` - Post-discharge care plans

---

### How RLS Policies Work for Admin

**RLS Policy Structure**:
```sql
-- Example: Patients table
CREATE POLICY "admin_all_patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

**The `is_admin()` Function**:
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**What This Means**:
- Admin users **bypass all row-level restrictions**
- Can view, edit, delete ANY record in ANY table
- No limitations on data access
- Full system control

---

## 🎯 Common Admin Tasks

### Task 1: View All Patient Data

1. Login as admin
2. Navigate to **Patients Tab**
3. Search for specific patient or browse all
4. Click **"View"** to see full profile
5. Access complete medical history

### Task 2: Manage Appointments

1. Navigate to **Appointments Tab**
2. View all appointments across all departments
3. Search for specific patient appointments
4. Click **"Edit"** to modify appointment
5. Click **"Schedule Appointment"** to create new

### Task 3: Review Prescriptions

1. Navigate to **Prescriptions Tab**
2. View all prescriptions system-wide
3. Search by patient name
4. Click **"View Details"** to see medications
5. Edit or approve refill requests

### Task 4: Financial Management

1. Navigate to **Financials Tab**
2. Review total revenue and pending payments
3. Search for specific bills
4. Click **"View"** to see bill details
5. Click **"Export Report"** for financial summaries

### Task 5: Search Across All Data

1. Use the **Search Bar** at the top
2. Type patient name, email, or identifier
3. Results filter across:
   - Patients
   - Appointments
   - Prescriptions
   - Bills

---

## ⚠️ Important Security Notes

### Administrator Responsibilities:

1. **Data Privacy**: Handle all patient data with care
2. **HIPAA Compliance**: Follow data protection regulations
3. **Audit Trail**: All admin actions are logged
4. **Password Security**: Use strong, unique password
5. **Access Control**: Don't share admin credentials
6. **Regular Audits**: Review system activity regularly

### What NOT to Do:

- ❌ Don't delete patient data without proper authorization
- ❌ Don't share login credentials
- ❌ Don't modify financial records without documentation
- ❌ Don't access patient data without legitimate need
- ❌ Don't bypass established procedures

---

## 🔍 Verification Checklist

After setup, verify everything works:

### Step 1: Login Verification
- [ ] Can login at `/auth` with `itsivali@outlook.com`
- [ ] Automatically redirected to `/admin-dashboard`
- [ ] Header shows "System Administrator"
- [ ] Email displays correctly

### Step 2: Data Access Verification
- [ ] **Overview Tab** shows all statistics
- [ ] **Patients Tab** displays all patients (16+)
- [ ] **Appointments Tab** shows all appointments (145+)
- [ ] **Prescriptions Tab** displays all prescriptions (11+)
- [ ] **Financials Tab** shows revenue and bills

### Step 3: Search Functionality
- [ ] Search bar filters results in real-time
- [ ] Can search for "Willis" and find patient
- [ ] Search works across all tabs

### Step 4: CRUD Operations
- [ ] Can view patient details
- [ ] Can edit patient records
- [ ] Can create new appointments
- [ ] Can view prescription details
- [ ] Can access all financial data

---

## 📊 System Statistics (After Setup)

**Expected Data**:
- **Patients**: 16 (15 base + Willis Ivali)
- **Appointments**: 145+ (today, future, past)
- **Prescriptions**: 11+
- **Revenue**: ~2.9 million KES
- **Staff**: 80+ active staff members
- **Departments**: 20 departments

---

## 🐛 Troubleshooting

### Issue: Can't login

**Solution**:
```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'itsivali@outlook.com';

-- If not found, create user at /auth first
```

### Issue: Not redirected to admin dashboard

**Solution**:
```sql
-- Check if admin role is assigned
SELECT * FROM user_roles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'itsivali@outlook.com'
);

-- If no role, run create-administrator-account.sql
```

### Issue: "Access Denied" error

**Solution**:
- Verify admin role is assigned in `user_roles` table
- Check RLS policies are created (run create-administrator-account.sql)
- Verify `is_admin()` function exists

### Issue: Can't see all data

**Solution**:
```sql
-- Verify RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE policyname LIKE 'admin%';

-- Should see policies for all tables
```

---

## 📝 Quick Reference

### Admin Account Details:
- **Email**: `itsivali@outlook.com`
- **Role**: `admin`
- **Dashboard**: `/admin-dashboard`

### Files Created:
- `create-administrator-account.sql` - Setup script
- `AdminDashboard.tsx` - Dashboard component
- `ADMINISTRATOR_ACCOUNT_GUIDE.md` - This guide

### Routes Updated:
- `/admin-dashboard` - Admin dashboard route
- `/dashboard` - Redirects admin to admin dashboard

### Database Changes:
- Added `is_admin()` function
- Created RLS policies for all tables
- Admin role assigned in `user_roles`

---

## ✅ Quick Setup Checklist

1. [ ] Create auth user at `/auth` (signup as `itsivali@outlook.com`)
2. [ ] Run `create-administrator-account.sql` in Supabase SQL Editor
3. [ ] Verify admin role assigned
4. [ ] Login at `/auth`
5. [ ] Confirm redirect to `/admin-dashboard`
6. [ ] Test viewing all patients
7. [ ] Test viewing all appointments
8. [ ] Test viewing prescriptions
9. [ ] Test viewing financial data
10. [ ] Test search functionality

---

**Created**: January 14, 2025
**Last Updated**: January 14, 2025
**Version**: 1.0
**Status**: Ready for Production

---

## 🎉 You're Ready!

Your administrator account is now configured with:
- ✅ Full system access
- ✅ All dashboards accessible
- ✅ Complete patient data visibility
- ✅ Financial data access
- ✅ Prescription management
- ✅ Full CRUD operations
- ✅ Search functionality
- ✅ Real-time data updates

**Simply login and start managing the entire HospitalGuard system!**
