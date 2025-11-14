# Test Accounts for HospitalGuard

## Quick Test Credentials

### Patient Portal
- **Email**: `patient@test.com`
- **Password**: `test123`
- **Role**: patient
- **Access**: Patient Dashboard with medical history, appointments, prescriptions

### Doctor Portal
- **Email**: `doctor@test.com`
- **Password**: `test123`
- **Role**: doctor
- **Access**: Doctor Dashboard with patient management, consultations, prescriptions

### Nurse Station
- **Email**: `nurse@test.com`
- **Password**: `test123`
- **Role**: nurse
- **Access**: Nurse Dashboard with patient monitoring, vitals, medications

### Pharmacy Portal
- **Email**: `pharmacist@test.com`
- **Password**: `test123`
- **Role**: pharmacist
- **Access**: Pharmacist Dashboard with prescription verification, QR scanning, inventory

### Billing Portal
- **Email**: `billing@test.com`
- **Password**: `test123`
- **Role**: billing
- **Access**: Billing Dashboard with financial data, invoices, payments

### Additional Roles (Use General Dashboard)

#### Lab Technician
- **Email**: `labtech@test.com`
- **Password**: `test123`
- **Role**: lab_tech
- **Access**: General Dashboard with laboratory focus

#### Radiologist
- **Email**: `radiologist@test.com`
- **Password**: `test123`
- **Role**: radiologist
- **Access**: General Dashboard with radiology focus

#### Receptionist
- **Email**: `receptionist@test.com`
- **Password**: `test123`
- **Role**: receptionist
- **Access**: General Dashboard with registration focus

#### Administrator
- **Email**: `admin@test.com`
- **Password**: `test123`
- **Role**: admin
- **Access**: General Dashboard with full system oversight

---

## How to Create These Accounts

### Option 1: Through the UI (Recommended)
1. Go to http://localhost:8081/
2. Click on the role card (Patient, Hospital Staff, or Pharmacy & Billing)
3. Click "Sign Up" tab
4. Fill in the form with the credentials above
5. The role will be automatically set based on URL parameter
6. Manually select the specific role from dropdown if needed

### Option 2: Using Supabase SQL (Quick Setup)
Run this SQL in your Supabase SQL Editor to create all accounts at once:

```sql
-- Note: You'll need to create these through the auth signup flow first
-- Then run this to ensure roles are properly set

-- After signup, insert roles
INSERT INTO user_roles (user_id, role)
SELECT id, 'patient' FROM auth.users WHERE email = 'patient@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'doctor' FROM auth.users WHERE email = 'doctor@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'nurse' FROM auth.users WHERE email = 'nurse@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'pharmacist' FROM auth.users WHERE email = 'pharmacist@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'billing' FROM auth.users WHERE email = 'billing@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'lab_tech' FROM auth.users WHERE email = 'labtech@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'radiologist' FROM auth.users WHERE email = 'radiologist@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'receptionist' FROM auth.users WHERE email = 'receptionist@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@test.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Testing Each Dashboard

### Patient Dashboard Test
1. Login with `patient@test.com` / `test123`
2. Should see: Medical history, appointments, prescriptions, action items
3. Test buttons: "Request Refill", "View Results", "Schedule"

### Doctor Dashboard Test
1. Login with `doctor@test.com` / `test123`
2. Should see: Today's schedule, patients under care, lab results
3. Test buttons: "Create Prescription", "Sign with QR", "Order Lab Test"

### Nurse Dashboard Test
1. Login with `nurse@test.com` / `test123`
2. Should see: Patient vitals, medication schedule, daily tasks
3. Test buttons: "Record Vitals", "Administer" medication

### Pharmacist Dashboard Test
1. Login with `pharmacist@test.com` / `test123`
2. Should see: Pending prescriptions, inventory status, QR verification
3. Test buttons: "Scan QR", "Dispense", "Check Interactions"

### Billing Dashboard Test
1. Login with `billing@test.com` / `test123`
2. Should see: Revenue stats, pending payments, payment methods
3. Test buttons: "Process Payment", "Send Invoices"

---

## Quick Setup Script

