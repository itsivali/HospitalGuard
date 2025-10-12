# 🧪 Test Accounts Setup Guide

## Quick Setup (Manual - Recommended)

### Step-by-Step Instructions

Follow these steps to create test accounts for each dashboard:

---

### 1. **Patient Account** 👤

1. Go to http://localhost:8081/
2. Click the **"Patient Portal"** card (left side, blue icon)
3. On the auth page, click **"Sign Up"** tab
4. Fill in:
   - **Full Name**: `John Patient`
   - **Email**: `patient@test.com`
   - **Phone**: `+1 (555) 001-0001` (optional)
   - **Role**: Select `Patient` from dropdown
   - **Password**: `test123`
5. Click **"Create Account"**
6. Switch to **"Login"** tab and sign in with the credentials
7. You'll be redirected to **/patient-dashboard** ✅

**What you'll see:**
- Medical history and appointments
- Active prescriptions (3 medications)
- Actionable insights (prescription refills, lab results)
- Recent medical history

---

### 2. **Doctor Account** 👨‍⚕️

1. Go to http://localhost:8081/ (or logout if already logged in)
2. Click the **"Hospital Staff Portal"** card (middle, green icon)
3. On the auth page, click **"Sign Up"** tab
4. Fill in:
   - **Full Name**: `Dr. Sarah Johnson`
   - **Email**: `doctor@test.com`
   - **Phone**: `+1 (555) 002-0002` (optional)
   - **Role**: Select `Doctor` from dropdown
   - **Password**: `test123`
5. Click **"Create Account"**
6. Login with these credentials
7. You'll be redirected to **/doctor-dashboard** ✅

**What you'll see:**
- Today's appointment schedule (8 appointments)
- Patients under care (24 patients with status)
- Lab results pending review
- Quick actions: Create prescription, Sign with QR, Order tests

---

### 3. **Nurse Account** 👩‍⚕️

1. Go to http://localhost:8081/
2. Click the **"Hospital Staff Portal"** card
3. Click **"Sign Up"** tab
4. Fill in:
   - **Full Name**: `Emily Nurse`
   - **Email**: `nurse@test.com`
   - **Phone**: `+1 (555) 003-0003` (optional)
   - **Role**: Select `Nurse` from dropdown
   - **Password**: `test123`
5. Click **"Create Account"**
6. Login with these credentials
7. You'll be redirected to **/nurse-dashboard** ✅

**What you'll see:**
- Patient monitoring with live vitals (temp, BP, HR, SpO2)
- Medication administration schedule
- Urgent alerts (high temp, overdue medications)
- Daily tasks checklist

---

### 4. **Pharmacist Account** 💊

1. Go to http://localhost:8081/
2. Click the **"Pharmacy & Billing"** card (right side, gold icon)
3. Click **"Sign Up"** tab
4. Fill in:
   - **Full Name**: `Michael Pharmacist`
   - **Email**: `pharmacist@test.com`
   - **Phone**: `+1 (555) 004-0004` (optional)
   - **Role**: Select `Pharmacist` from dropdown
   - **Password**: `test123`
5. Click **"Create Account"**
6. Login with these credentials
7. You'll be redirected to **/pharmacist-dashboard** ✅

**What you'll see:**
- Pending prescriptions (24 to fill)
- QR code verification buttons
- Inventory management with low stock alerts
- Drug interaction warnings

---

### 5. **Billing Account** 💳

1. Go to http://localhost:8081/
2. Click the **"Pharmacy & Billing"** card
3. Click **"Sign Up"** tab
4. Fill in:
   - **Full Name**: `Lisa Billing`
   - **Email**: `billing@test.com`
   - **Phone**: `+1 (555) 005-0005` (optional)
   - **Role**: Select `Billing Staff` from dropdown
   - **Password**: `test123`
5. Click **"Create Account"**
6. Login with these credentials
7. You'll be redirected to **/billing-dashboard** ✅

**What you'll see:**
- Today's revenue ($24,850)
- Pending payments (34 unpaid bills)
- Payment methods breakdown
- Revenue by department

---

## 📋 Quick Reference Card

| Role | Email | Password | Dashboard URL |
|------|-------|----------|---------------|
| **Patient** | patient@test.com | test123 | /patient-dashboard |
| **Doctor** | doctor@test.com | test123 | /doctor-dashboard |
| **Nurse** | nurse@test.com | test123 | /nurse-dashboard |
| **Pharmacist** | pharmacist@test.com | test123 | /pharmacist-dashboard |
| **Billing** | billing@test.com | test123 | /billing-dashboard |

---

## 🔧 Additional Test Accounts (Optional)

These roles use the general dashboard:

### Lab Technician
- **Email**: `labtech@test.com`
- **Password**: `test123`
- **Role**: Lab Technician
- **Dashboard**: /dashboard

### Radiologist
- **Email**: `radiologist@test.com`
- **Password**: `test123`
- **Role**: Radiologist
- **Dashboard**: /dashboard

### Receptionist
- **Email**: `receptionist@test.com`
- **Password**: `test123`
- **Role**: Receptionist
- **Dashboard**: /dashboard

### Administrator
- **Email**: `admin@test.com`
- **Password**: `test123`
- **Role**: Administrator
- **Dashboard**: /dashboard (full access)

---

## 🎯 Testing Each Dashboard

### Patient Dashboard Testing
✅ Check medical history display
✅ View upcoming appointments
✅ See active prescriptions with expiry dates
✅ Test "Request Refill" button
✅ Test "View Results" button
✅ Test "Schedule" telemedicine button

### Doctor Dashboard Testing
✅ Review today's appointment schedule
✅ View patients under care with status
✅ Check lab results pending review
✅ Test "Create Prescription" button
✅ Test "Sign with QR" button
✅ Test "Order Lab Test" button

### Nurse Dashboard Testing
✅ Monitor patient vitals (temp, BP, HR, SpO2)
✅ View medication schedule
✅ Check urgent alerts
✅ Test "Record Vitals" button
✅ Test "Administered" medication button
✅ Review daily tasks checklist

### Pharmacist Dashboard Testing
✅ View pending prescriptions
✅ Check inventory levels
✅ Test "Scan QR" button
✅ Test "Dispense" button
✅ Test "Check Interactions" button
✅ Review low stock alerts

### Billing Dashboard Testing
✅ Check today's revenue
✅ View pending payments
✅ Review payment methods breakdown
✅ Test "Process Payment" button
✅ View revenue by department
✅ Check recent transactions

---

## ⚠️ Troubleshooting

### Issue: "Email already registered"
**Solution**: The account already exists. Just login with the credentials.

### Issue: Not redirected to correct dashboard
**Solution**:
1. Logout completely
2. Clear browser cookies for localhost:8081
3. Login again
4. Check that the role was properly selected during signup

### Issue: "User roles" error
**Solution**: The user_roles table might not have been created. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor.

### Issue: Can't see any data
**Solution**: This is expected! The dashboards currently show mock/dummy data. Real data integration will come in later phases when we connect to the actual database tables.

---

## 🚀 Next Steps

After creating test accounts:

1. **Test Navigation**: Try logging in as different roles and see how each dashboard is unique
2. **Test Buttons**: Click on various action buttons (they may not be fully functional yet)
3. **Test Responsiveness**: Resize your browser to see how dashboards adapt
4. **Provide Feedback**: Let me know which features you'd like to see implemented first

---

## 💡 Pro Tips

- Use **Chrome Incognito** windows to test multiple accounts simultaneously
- Bookmark each dashboard URL for quick access during testing
- Take screenshots of any bugs or UI issues you encounter
- The password `test123` is intentionally simple for testing - use strong passwords in production!

---

**Happy Testing! 🏥✨**
