# Database Setup Guide - Complete Setup from Scratch

## 🎯 Goal
Set up your new Supabase database with all tables, triggers, and configuration for HospitalGuard.

## ⚠️ IMPORTANT: Run These Steps IN ORDER

---

## Step 1: Run Main Database Schema (15 minutes)

This creates ALL the tables you need for HospitalGuard.

### A. Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/hdpavdwanzydfcudogar
2. Click **SQL Editor** in the left sidebar
3. Click **New query** button

### B. Copy the Schema

1. Open the file: `supabase-schema.sql` (it's in your project root)
2. This file is **LARGE** (~600 lines)
3. Select ALL content (Ctrl+A) and copy (Ctrl+C)

### C. Paste and Run

1. Paste into the SQL Editor
2. Click **Run** button (or press Ctrl+Enter)
3. Wait for it to complete (may take 10-30 seconds)
4. You should see: **"Success. No rows returned"**

### D. Verify Tables Were Created

1. Go to **Database** → **Tables** (left sidebar)
2. You should now see these tables:
   - ✅ `user_roles`
   - ✅ `hospital_staff`
   - ✅ `patients`
   - ✅ `departments`
   - ✅ `patient_visits`
   - ✅ `medical_records`
   - ✅ `prescriptions`
   - ✅ `pharmacy_inventory`
   - ✅ `lab_orders`
   - ✅ `radiology_orders`
   - ✅ `appointments`
   - ✅ `billing`
   - ✅ And many more...

**If you don't see these tables, the schema didn't run. Try again.**

---

## Step 2: Run Role Trigger (2 minutes)

Now that tables exist, we can create the automatic role assignment trigger.

### A. Create New Query

1. In SQL Editor, click **New query** (to start fresh)

### B. Copy Trigger SQL

1. Open: `supabase-role-trigger.sql`
2. Select ALL content (Ctrl+A) and copy (Ctrl+C)

### C. Run the Trigger

1. Paste into SQL Editor
2. Click **Run**
3. Should see: **"Success. No rows returned"**

### D. Verify Triggers Exist

1. Go to **Database** → **Triggers**
2. You should see:
   - ✅ `on_auth_user_created`
   - ✅ `on_auth_user_created_immediate`

**These trigger on the `auth.users` table**

---

## Step 3: Configure Authentication (5 minutes)

### A. Enable Email Provider

1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **Enabled** (toggle should be green)

### B. Configure Email Settings

1. Click **Email** to expand settings
2. **Confirm email**: ✅ ENABLED (check the box)
   - This makes users confirm their email
   - The trigger will assign roles after confirmation
3. **Double confirm email**: ❌ DISABLED (uncheck)
4. Click **Save**

### C. Configure Site URL (Important!)

1. Go to **Authentication** → **URL Configuration**
2. **Site URL**: Set to `http://localhost:8080`
   - For development, use localhost
   - For production, change to your domain
3. **Redirect URLs**: Add these:
   - `http://localhost:8080/**`
   - `http://localhost:8080/dashboard`
   - `http://localhost:8080/patient-dashboard`
   - `http://localhost:8080/nurse-dashboard`
   - `http://localhost:8080/doctor-dashboard`
4. Click **Save**

---

## Step 4: Update Email Templates (10 minutes)

Now customize the confirmation emails with HospitalGuard branding.

### A. Access Email Templates

1. Go to **Authentication** → **Email Templates**

### B. Update "Confirm signup" Template

1. Click **"Confirm signup"**
2. You'll see a generic template
3. Open: `email-templates/confirm-signup.html`
4. Copy ENTIRE file (200+ lines)
5. In Supabase:
   - Click in the HTML editor box
   - Select all (Ctrl+A)
   - Paste your template (Ctrl+V)
6. Update **Subject** to:
   ```
   Welcome to HospitalGuard - Confirm Your Email
   ```
7. Click **Save**

### C. Verify Template Saved

1. Refresh the page
2. Click "Confirm signup" again
3. Scroll through HTML
4. Look for: `<h1>HospitalGuard</h1>`
5. If you see it: ✅ Success!

### D. Optional: Update Other Templates

Repeat for **Magic Link** and **Reset Password** if desired.

---

## Step 5: Test Complete Flow (10 minutes)

### A. Sign Up New User

1. Go to: http://localhost:8080/auth
2. Click **Sign Up** tab
3. Fill in:
   ```
   Full Name: Test User
   Email: your-real-email@outlook.com
   Phone: (optional)
   Role: Patient
   Password: test123456
   ```
4. Click **Create Account**
5. Should see: "Check your email!"

### B. Check Email

1. Open your inbox
2. Look for email from Supabase
3. **Verify branded template:**
   - Purple gradient header
   - Hospital icon
   - "HospitalGuard" title
   - Professional design

4. **If still generic**: Re-do Step 4

### C. Confirm Email

1. Click **"Confirm Email Address"** button
2. Should redirect to app
3. You'll see login page or dashboard

### D. Login and Verify

1. If not logged in, go to http://localhost:8080/auth
2. Login with email and password
3. **Verify:**
   - ✅ NO "Error fetching user role"
   - ✅ Redirected to `/patient-dashboard`
   - ✅ Dashboard loads correctly

### E. Check Database

1. Go to Supabase → **Table Editor** → **user_roles**
2. Find your user entry
3. Should have:
   - `user_id`: (your UUID)
   - `role`: patient
   - `created_at`: (timestamp)

**If role exists: ✅ EVERYTHING IS WORKING!**

---

## What Each Component Does

### Database Schema (`supabase-schema.sql`)
Creates all tables for hospital management:
- User roles and staff
- Patients and visits
- Prescriptions and pharmacy
- Lab and radiology orders
- Billing and appointments
- And 20+ more tables

### Role Trigger (`supabase-role-trigger.sql`)
Automatically assigns user roles:
- Fires when email is confirmed
- Reads role from signup metadata
- Inserts into `user_roles` table
- Defaults to 'patient' if no role

### Email Templates
Professional branded emails:
- Confirmation emails
- Password reset
- Magic link sign-in
- All match HospitalGuard design

---

## Troubleshooting

### ❌ Error: "relation does not exist"

**Problem**: Trying to run trigger before schema
**Solution**: Run Step 1 first (database schema), then Step 2 (trigger)

### ❌ Error: Still getting role error

**Check:**
1. Did schema run? Check Database → Tables
2. Did trigger run? Check Database → Triggers
3. Did user confirm email? Check auth.users table

**Fix:**
```sql
-- Check if user exists and is confirmed
SELECT id, email, email_confirmed_at, raw_user_meta_data->>'role' as role
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Manually insert role if needed (replace USER_ID)
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'patient')
ON CONFLICT (user_id) DO UPDATE SET role = 'patient';
```

### ❌ Error: Email still generic

**Problem**: Didn't copy entire template or didn't save
**Solution**:
1. Re-open email template in Supabase
2. Make sure HTML has `HospitalGuard` in it
3. If not, copy and paste again
4. Must click Save button

### ❌ Error: Can't access Supabase dashboard

**Check**: Are you using the correct URL?
- Your project: https://supabase.com/dashboard/project/hdpavdwanzydfcudogar
- NOT the old Lovable AI database

---

## Verification Checklist

Before moving on, verify ALL of these:

**Database:**
- [ ] Can see 20+ tables in Database → Tables
- [ ] user_roles table exists
- [ ] patients table exists
- [ ] prescriptions table exists

**Triggers:**
- [ ] 2 triggers exist in Database → Triggers
- [ ] Both on auth.users table

**Authentication:**
- [ ] Email provider enabled
- [ ] Confirm email setting enabled
- [ ] Site URL set to http://localhost:8080

**Email Templates:**
- [ ] Confirm signup template updated
- [ ] Can see HospitalGuard branding in template

**Testing:**
- [ ] Can sign up new user
- [ ] Receive branded email
- [ ] Can confirm email
- [ ] Can login without errors
- [ ] Redirected to correct dashboard
- [ ] Role visible in user_roles table

---

## SQL Quick Reference

### Check if schema ran:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check if triggers exist:
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%';
```

### Check recent users and their metadata:
```sql
SELECT
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'role' as signup_role,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

### Check user roles:
```sql
SELECT
  ur.user_id,
  u.email,
  ur.role,
  ur.created_at
FROM user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.created_at DESC;
```

### Manually fix a user's role:
```sql
-- First, get the user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert/update their role
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_FROM_ABOVE', 'patient')
ON CONFLICT (user_id) DO UPDATE SET role = 'patient';
```

---

## Environment Configuration

Your `.env` is already configured with:
```env
VITE_SUPABASE_PROJECT_ID="hdpavdwanzydfcudogar"
VITE_SUPABASE_URL="https://hdpavdwanzydfcudogar.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

This points to your NEW database, not the old Lovable AI one. ✅

---

## Next Steps After Setup

1. **Test all roles**: Sign up as doctor, nurse, pharmacist
2. **Customize templates**: Change colors, add logo
3. **Set up test data**: Use setup-test-accounts.js script
4. **Configure for production**: Custom SMTP, domain, etc.

---

## Need Help?

**View logs:**
- **Auth Logs**: Authentication → Logs
- **Database Logs**: Logs → Database
- **Function Logs**: Database → Functions → View logs

**Common issues:**
1. Schema didn't run → Check Tables, should see 20+ tables
2. Trigger didn't run → Check Triggers, should see 2 triggers
3. Template not saved → Refresh and check HTML content
4. Role not assigned → Check Database Logs for trigger execution

---

## Summary

**Complete setup order:**
1. ✅ Run database schema (creates tables)
2. ✅ Run role trigger (auto-assigns roles)
3. ✅ Configure authentication (enable email confirmation)
4. ✅ Update email templates (add branding)
5. ✅ Test signup flow (verify everything works)

**Expected result:**
- User signs up with real email
- Receives branded confirmation email
- Confirms email
- Role is automatically assigned
- Can login without errors
- Redirected to correct dashboard

**You're all set once this works!** 🎉
