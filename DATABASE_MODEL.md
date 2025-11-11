# HospitalGuard Database Model

**Comprehensive data model for Level 1 Trauma Center hospital management**

Version: 1.0
Last Updated: 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Entities](#core-entities)
4. [Medical Records & Clinical Data](#medical-records--clinical-data)
5. [Pharmacy & Prescriptions](#pharmacy--prescriptions)
6. [Laboratory & Diagnostics](#laboratory--diagnostics)
7. [Financial Management](#financial-management)
8. [Telemedicine & Aftercare](#telemedicine--aftercare)
9. [Access Control & Security](#access-control--security)
10. [Key Workflows](#key-workflows)
11. [Indexes & Performance](#indexes--performance)

---

## Overview

The HospitalGuard database is designed to support complete patient journey tracking from admission through discharge and aftercare. It manages:

- **20 Hospital Departments** (Emergency, ICU, Surgery, Cardiology, etc.)
- **80+ Medical Staff** (Doctors, Nurses, Pharmacists, Lab Technicians)
- **Complete Patient Visits** across multiple departments
- **Digital Prescriptions** with QR code authentication
- **Laboratory & Radiology** orders and results
- **Billing & Payments** with insurance processing
- **Telemedicine Sessions** for aftercare
- **Comprehensive Audit Logs**

---

## Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│   auth.users    │────────▶│   user_roles     │
│  (Supabase)     │         │                  │
└────────┬────────┘         └──────────────────┘
         │
         ├────────────┬─────────────┬────────────┐
         │            │             │            │
         ▼            ▼             ▼            ▼
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐
│  patients  │  │hospital_   │  │departments │  │ audit_logs   │
│            │  │  staff     │  │            │  │              │
└──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────────────┘
       │               │                │
       │               │                │
       ▼               ▼                ▼
┌─────────────────────────────────────────────────┐
│            patient_visits                       │
│  (Complete journey from check-in to discharge)  │
└──────┬────────┬────────┬─────────┬──────────────┘
       │        │        │         │
       ▼        ▼        ▼         ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌─────────────┐
│medical │  │diagnoses│ │visit_  │  │appointments │
│records │  │         │ │dept    │  │             │
└────────┘  └─────────┘ │history │  └─────────────┘
                        └────────┘
       │
       ├──────────────┬───────────────┬──────────────┐
       ▼              ▼               ▼              ▼
┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│prescriptions│ │lab_orders│ │radiology │  │maternity_    │
│            │  │          │  │ orders   │  │ records      │
└──────┬─────┘  └──────────┘  └──────────┘  └──────────────┘
       │
       ▼
┌─────────────────┐
│prescription_    │
│   items         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐         ┌──────────────┐
│medication_      │         │pharmacy_     │
│ dispensing      │◀────────│ inventory    │
└─────────────────┘         └──────────────┘

       patient_visits
            │
            ├────────────────┬──────────────┐
            ▼                ▼              ▼
      ┌──────────┐    ┌──────────┐   ┌────────────┐
      │  bills   │    │aftercare │   │telemedicine│
      │          │    │  plans   │   │ sessions   │
      └────┬─────┘    └──────────┘   └────────────┘
           │
      ┌────┴─────┐
      ▼          ▼
┌──────────┐  ┌──────────┐
│bill_items│  │payments  │
└──────────┘  └──────────┘
```

---

## Core Entities

### 1. **departments**
Hospital departments and their information.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `name` (TEXT, UNIQUE): Department name
- `description` (TEXT): Department description
- `floor_number` (INTEGER): Physical location
- `department_type` (TEXT): Type of department (emergency, icu, surgery, etc.)
- `head_of_department` (UUID, FK → hospital_staff): Department head
- `phone` (TEXT): Contact number
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Constraints:**
- `department_type` must be one of: emergency, icu, maternity, pediatrics, surgery, radiology, laboratory, pharmacy, mental_health, outpatient, billing, administration

**Relationships:**
- Has many `hospital_staff` (one-to-many)
- Has one `head_of_department` from `hospital_staff` (one-to-one)

---

### 2. **hospital_staff**
Medical and administrative staff members.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): Link to auth system
- `first_name`, `last_name` (TEXT): Staff name
- `email` (TEXT, UNIQUE): Contact email
- `phone` (TEXT): Contact number
- `staff_type` (TEXT): Role type (doctor, nurse, pharmacist, etc.)
- `specialization` (TEXT): Medical specialization
- `license_number` (TEXT, UNIQUE): Professional license
- `department_id` (UUID, FK → departments): Assigned department
- `patient_care_type` (TEXT): Type of patients they handle (outpatient, inpatient, both)
- `is_active` (BOOLEAN): Active status
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Constraints:**
- `staff_type` must be one of: doctor, nurse, pharmacist, receptionist, billing, admin, lab_tech, radiologist, psychiatrist, obstetrician
- `patient_care_type` must be one of: outpatient, inpatient, both

**Relationships:**
- Belongs to one `department` (many-to-one)
- Has many `patient_visits` as attending doctor (one-to-many)
- Has many `prescriptions` (one-to-many)

---

### 3. **patients**
Patient demographic and contact information.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): Link to auth system
- `first_name`, `last_name` (TEXT): Patient name
- `date_of_birth` (DATE): Birth date
- `gender` (TEXT): Gender (male, female, other)
- `blood_type` (TEXT): Blood type
- `allergies` (TEXT[]): Array of allergies
- `emergency_contact_name`, `emergency_contact_phone` (TEXT): Emergency contact
- `address`, `phone`, `email` (TEXT): Contact information
- `insurance_provider`, `insurance_policy_number` (TEXT): Insurance details
- `national_id` (TEXT, UNIQUE): National identification
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Relationships:**
- Has many `patient_visits` (one-to-many)
- Has many `medical_records` (one-to-many)
- Has many `prescriptions` (one-to-many)
- Has many `bills` (one-to-many)

---

### 4. **patient_visits**
Complete patient journey tracking from check-in to discharge.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `patient_id` (UUID, FK → patients): Patient reference
- `visit_number` (TEXT, UNIQUE): Generated visit number (V-YYYYMMDD-####)
- `admission_type` (TEXT): How patient entered (walk_in, emergency, appointment, transfer)
- `check_in_time`, `check_out_time` (TIMESTAMPTZ): Visit timeline
- `status` (TEXT): Current status (checked_in, in_consultation, discharged, etc.)
- `chief_complaint` (TEXT): Reason for visit
- `vital_signs` (JSONB): Structured vital signs data
- `attending_doctor_id` (UUID, FK → hospital_staff): Assigned doctor
- `current_department_id` (UUID, FK → departments): Current location
- `triage_level` (TEXT): Emergency priority (critical, urgent, semi_urgent, non_urgent)
- `room_number`, `bed_number` (TEXT): Physical location
- `notes` (TEXT): Visit notes
- `discharge_summary` (TEXT): Discharge information
- `follow_up_required` (BOOLEAN): Needs follow-up
- `telemedicine_enabled` (BOOLEAN): Telemedicine aftercare enabled
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Constraints:**
- `admission_type` must be one of: walk_in, emergency, appointment, transfer
- `status` must be one of: checked_in, in_consultation, in_treatment, awaiting_lab, awaiting_pharmacy, discharged, transferred, admitted

**Relationships:**
- Belongs to one `patient` (many-to-one)
- Belongs to one `hospital_staff` as doctor (many-to-one)
- Belongs to one `department` (many-to-one)
- Has many `visit_department_history` records (one-to-many)
- Has many `diagnoses` (one-to-many)
- Has many `prescriptions` (one-to-many)
- Has many `lab_orders` (one-to-many)
- Has many `radiology_orders` (one-to-many)

---

### 5. **visit_department_history**
Tracks patient movement across multiple departments during a visit.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `visit_id` (UUID, FK → patient_visits): Visit reference
- `department_id` (UUID, FK → departments): Department visited
- `staff_id` (UUID, FK → hospital_staff): Staff who saw patient
- `check_in_time`, `check_out_time` (TIMESTAMPTZ): Time in department
- `notes` (TEXT): Department-specific notes
- `services_provided` (TEXT[]): Services rendered
- `created_at` (TIMESTAMPTZ): Timestamp

**Relationships:**
- Belongs to one `patient_visit` (many-to-one)
- Belongs to one `department` (many-to-one)
- Belongs to one `hospital_staff` (many-to-one)

---

## Medical Records & Clinical Data

### 6. **medical_records**
Patient medical records and documentation.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `patient_id` (UUID, FK → patients): Patient reference
- `visit_id` (UUID, FK → patient_visits): Associated visit
- `record_type` (TEXT): Type of record (consultation, diagnosis, lab_result, etc.)
- `title` (TEXT): Record title
- `description` (TEXT): Record content
- `doctor_id` (UUID, FK → hospital_staff): Authoring doctor
- `department_id` (UUID, FK → departments): Department
- `attachments` (JSONB): File attachments metadata
- `is_confidential` (BOOLEAN): Confidentiality flag
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Constraints:**
- `record_type` must be one of: consultation, diagnosis, lab_result, radiology, surgery, prescription, vaccination, note

---

### 7. **diagnoses**
Medical diagnoses for patient visits.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `visit_id` (UUID, FK → patient_visits): Visit reference
- `icd_code` (TEXT): ICD diagnostic code
- `diagnosis_name` (TEXT): Diagnosis description
- `diagnosis_type` (TEXT): Type (primary, secondary, differential)
- `notes` (TEXT): Additional notes
- `diagnosed_by` (UUID, FK → hospital_staff): Diagnosing doctor
- `created_at` (TIMESTAMPTZ): Timestamp

---

### 8. **maternity_records**
Obstetric and maternity care records.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `patient_id` (UUID, FK → patients): Patient reference
- `visit_id` (UUID, FK → patient_visits): Visit reference
- `pregnancy_number` (INTEGER): Which pregnancy
- `lmp_date`, `edd_date` (DATE): Last menstrual period, expected delivery date
- `blood_group`, `rhesus_factor` (TEXT): Blood information
- `hiv_status`, `hepatitis_b_status` (TEXT): Screening results
- `antenatal_visits` (INTEGER): Number of prenatal visits
- `delivery_date` (DATE): Actual delivery date
- `delivery_type` (TEXT): Type of delivery (normal, caesarean, assisted)
- `baby_gender` (TEXT): Baby's gender
- `baby_weight` (DECIMAL): Birth weight in kg
- `apgar_score` (INTEGER): APGAR score
- `complications` (TEXT): Delivery complications
- `obstetrician_id` (UUID, FK → hospital_staff): Attending obstetrician
- `notes` (TEXT): Additional notes
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

---

### 9. **mental_health_records**
Psychiatric and mental health assessments.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `patient_id` (UUID, FK → patients): Patient reference
- `visit_id` (UUID, FK → patient_visits): Visit reference
- `assessment_type` (TEXT): Type (initial, follow_up, crisis, discharge)
- `mental_status_exam` (JSONB): Structured mental status examination
- `diagnosis` (TEXT): Psychiatric diagnosis
- `risk_assessment` (TEXT): Risk evaluation
- `treatment_plan` (TEXT): Proposed treatment
- `medications_prescribed` (TEXT[]): Psychiatric medications
- `therapy_recommended` (TEXT): Therapy recommendations
- `follow_up_date` (DATE): Next appointment
- `psychiatrist_id` (UUID, FK → hospital_staff): Attending psychiatrist
- `is_confidential` (BOOLEAN): Extra confidentiality (default: true)
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

---

## Pharmacy & Prescriptions

### 10. **prescriptions**
Digital prescriptions with QR code authentication.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `prescription_number` (TEXT, UNIQUE): Generated number (RX-YYYYMMDD-####)
- `patient_id` (UUID, FK → patients): Patient reference
- `visit_id` (UUID, FK → patient_visits): Visit reference
- `doctor_id` (UUID, FK → hospital_staff): Prescribing doctor
- `status` (TEXT): Status (pending, signed, dispensed, partially_dispensed, cancelled)
- `qr_code_data` (TEXT, UNIQUE): QR code authentication data
- `digital_signature` (TEXT): Doctor's digital signature
- `signed_at` (TIMESTAMPTZ): Signature timestamp
- `notes` (TEXT): Prescription notes
- `is_controlled_substance` (BOOLEAN): Contains controlled substances
- `refills_allowed` (INTEGER): Number of refills
- `valid_until` (DATE): Expiration date
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Workflow:**
1. Doctor creates prescription
2. Doctor digitally signs prescription
3. QR code generated automatically
4. Pharmacist scans QR code to authenticate
5. Pharmacist dispenses medication
6. Status updated to dispensed

---

### 11. **prescription_items**
Individual medications within a prescription.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `prescription_id` (UUID, FK → prescriptions): Parent prescription
- `medication_name` (TEXT): Medication name
- `dosage` (TEXT): Dosage (e.g., "500mg")
- `frequency` (TEXT): How often (e.g., "twice daily")
- `duration` (TEXT): Treatment duration (e.g., "7 days")
- `quantity` (INTEGER): Total quantity to dispense
- `dispensed_quantity` (INTEGER): Amount actually dispensed
- `instructions` (TEXT): Patient instructions
- `is_controlled_substance` (BOOLEAN): Controlled substance flag
- `created_at` (TIMESTAMPTZ): Timestamp

---

### 12. **pharmacy_inventory**
Hospital pharmacy medication inventory.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `medication_name` (TEXT): Brand/trade name
- `generic_name` (TEXT): Generic name
- `manufacturer` (TEXT): Manufacturer
- `batch_number` (TEXT): Batch/lot number
- `quantity_available` (INTEGER): Current stock
- `unit_price` (DECIMAL): Price per unit
- `expiry_date` (DATE): Expiration date
- `reorder_level` (INTEGER): Minimum stock trigger
- `storage_location` (TEXT): Physical location in pharmacy
- `is_controlled_substance` (BOOLEAN): Controlled substance flag
- `requires_prescription` (BOOLEAN): Requires prescription
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Automated Alerts:**
- Low stock alert when `quantity_available` ≤ `reorder_level`
- Expiry alerts for medications expiring within 30 days

---

### 13. **medication_dispensing**
Audit log of all medication dispensing.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `prescription_id` (UUID, FK → prescriptions): Related prescription
- `prescription_item_id` (UUID, FK → prescription_items): Specific medication
- `patient_id` (UUID, FK → patients): Patient reference
- `pharmacist_id` (UUID, FK → hospital_staff): Dispensing pharmacist
- `medication_name` (TEXT): Medication dispensed
- `quantity_dispensed` (INTEGER): Amount dispensed
- `dispensed_at` (TIMESTAMPTZ): Dispensing timestamp
- `notes` (TEXT): Dispensing notes
- `created_at` (TIMESTAMPTZ): Timestamp

---

## Laboratory & Diagnostics

### 14. **lab_orders**
Laboratory test orders and results.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `order_number` (TEXT, UNIQUE): Generated order number
- `patient_id` (UUID, FK → patients): Patient reference
- `visit_id` (UUID, FK → patient_visits): Visit reference
- `ordered_by` (UUID, FK → hospital_staff): Ordering doctor
- `test_type` (TEXT): Type of test (CBC, urinalysis, etc.)
- `urgency` (TEXT): Priority (routine, urgent, stat)
- `status` (TEXT): Status (pending, in_progress, completed, cancelled)
- `sample_collected` (BOOLEAN): Sample collection status
- `sample_collected_at` (TIMESTAMPTZ): Collection timestamp
- `results` (JSONB): Structured test results
- `results_available_at` (TIMESTAMPTZ): Results timestamp
- `reviewed_by` (UUID, FK → hospital_staff): Reviewing doctor/tech
- `notes` (TEXT): Additional notes
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

---

### 15. **radiology_orders**
Medical imaging orders and findings.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `order_number` (TEXT, UNIQUE): Generated order number
- `patient_id` (UUID, FK → patients): Patient reference
- `visit_id` (UUID, FK → patient_visits): Visit reference
- `ordered_by` (UUID, FK → hospital_staff): Ordering doctor
- `imaging_type` (TEXT): Type (x_ray, ct_scan, mri, ultrasound, mammography, pet_scan)
- `body_part` (TEXT): Area to image
- `urgency` (TEXT): Priority (routine, urgent, stat)
- `status` (TEXT): Status (pending, scheduled, in_progress, completed, cancelled)
- `scheduled_time` (TIMESTAMPTZ): Scheduled appointment
- `completed_at` (TIMESTAMPTZ): Completion timestamp
- `findings` (TEXT): Radiologist findings
- `images_url` (TEXT[]): Image file URLs
- `radiologist_id` (UUID, FK → hospital_staff): Radiologist
- `notes` (TEXT): Additional notes
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

---

## Financial Management

### 16. **bills**
Patient bills and invoices.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `bill_number` (TEXT, UNIQUE): Generated bill number (BL-YYYYMMDD-####)
- `patient_id` (UUID, FK → patients): Patient reference
- `visit_id` (UUID, FK → patient_visits): Visit reference
- `total_amount` (DECIMAL): Total bill amount
- `amount_paid` (DECIMAL): Amount already paid
- `amount_due` (DECIMAL): Outstanding balance
- `insurance_covered` (DECIMAL): Insurance coverage amount
- `discount` (DECIMAL): Discount applied
- `status` (TEXT): Status (pending, partially_paid, paid, cancelled, insurance_pending)
- `due_date` (DATE): Payment due date
- `notes` (TEXT): Billing notes
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Calculations:**
```
amount_due = total_amount - amount_paid - insurance_covered - discount
```

---

### 17. **bill_items**
Individual line items on a bill.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `bill_id` (UUID, FK → bills): Parent bill
- `item_type` (TEXT): Type (consultation, procedure, medication, lab_test, etc.)
- `description` (TEXT): Item description
- `quantity` (INTEGER): Quantity
- `unit_price` (DECIMAL): Price per unit
- `total_price` (DECIMAL): Total for this item
- `department_id` (UUID, FK → departments): Charging department
- `created_at` (TIMESTAMPTZ): Timestamp

---

### 18. **payments**
Payment transactions.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `payment_number` (TEXT, UNIQUE): Generated payment number
- `bill_id` (UUID, FK → bills): Related bill
- `amount` (DECIMAL): Payment amount
- `payment_method` (TEXT): Method (cash, card, mobile_money, insurance, bank_transfer)
- `payment_reference` (TEXT): Transaction reference
- `payment_status` (TEXT): Status (completed, pending, failed, refunded)
- `received_by` (UUID, FK → hospital_staff): Staff who received payment
- `notes` (TEXT): Payment notes
- `created_at` (TIMESTAMPTZ): Timestamp

---

## Telemedicine & Aftercare

### 19. **telemedicine_sessions**
Virtual consultation sessions for aftercare.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `session_number` (TEXT, UNIQUE): Generated session number
- `patient_id` (UUID, FK → patients): Patient reference
- `original_visit_id` (UUID, FK → patient_visits): Original hospital visit
- `doctor_id` (UUID, FK → hospital_staff): Doctor conducting session
- `session_type` (TEXT): Type (follow_up, consultation, emergency, prescription_refill)
- `scheduled_time` (TIMESTAMPTZ): Scheduled time
- `start_time`, `end_time` (TIMESTAMPTZ): Actual session time
- `status` (TEXT): Status (scheduled, in_progress, completed, cancelled, no_show)
- `meeting_link` (TEXT): Video conference link
- `session_notes` (TEXT): Doctor's notes
- `prescriptions_issued` (BOOLEAN): New prescriptions issued
- `follow_up_required` (BOOLEAN): Needs another session
- `next_appointment_date` (DATE): Next appointment
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

---

### 20. **aftercare_plans**
Post-discharge care plans.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `patient_id` (UUID, FK → patients): Patient reference
- `visit_id` (UUID, FK → patient_visits): Hospital visit
- `doctor_id` (UUID, FK → hospital_staff): Responsible doctor
- `plan_details` (TEXT): Care plan details
- `medications` (TEXT[]): Ongoing medications
- `activity_restrictions` (TEXT): Activity limitations
- `diet_instructions` (TEXT): Dietary guidelines
- `warning_signs` (TEXT): Symptoms to watch for
- `follow_up_schedule` (TEXT): Follow-up schedule
- `emergency_contact_number` (TEXT): Emergency contact
- `telemedicine_enabled` (BOOLEAN): Telemedicine option
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

---

### 21. **appointments**
Scheduled appointments.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `appointment_number` (TEXT, UNIQUE): Generated appointment number
- `patient_id` (UUID, FK → patients): Patient reference
- `doctor_id` (UUID, FK → hospital_staff): Doctor
- `department_id` (UUID, FK → departments): Department
- `appointment_type` (TEXT): Type (consultation, follow_up, procedure, lab, radiology, telemedicine)
- `scheduled_time` (TIMESTAMPTZ): Scheduled time
- `duration_minutes` (INTEGER): Expected duration
- `status` (TEXT): Status (scheduled, confirmed, in_progress, completed, cancelled, no_show)
- `reason` (TEXT): Appointment reason
- `notes` (TEXT): Additional notes
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

---

## Access Control & Security

### 22. **user_roles**
Role-based access control (RBAC).

**Fields:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): User reference
- `role` (TEXT): Role (patient, doctor, nurse, pharmacist, etc.)
- `created_at` (TIMESTAMPTZ): Timestamp

**Constraints:**
- Unique combination of (user_id, role)
- User can have multiple roles

**Available Roles:**
- `patient`: View own medical records and appointments
- `doctor`: Full access to patient care, prescriptions
- `nurse`: Patient monitoring, vitals, medication administration
- `pharmacist`: Prescription validation, dispensing, inventory
- `receptionist`: Patient registration, appointment scheduling
- `billing`: Financial management, invoicing, payments
- `admin`: System oversight, user management
- `lab_tech`: Laboratory test management
- `radiologist`: Medical imaging and diagnostics
- `psychiatrist`: Mental health services
- `obstetrician`: Maternity care

**Auto-Assignment:**
When a user signs up, their role is automatically assigned via the `handle_new_user()` trigger function based on metadata provided during registration.

---

### 23. **audit_logs**
Complete audit trail of all system actions.

**Fields:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): User who performed action
- `action` (TEXT): Action performed (INSERT, UPDATE, DELETE, etc.)
- `table_name` (TEXT): Affected table
- `record_id` (UUID): Affected record
- `old_data` (JSONB): Data before change
- `new_data` (JSONB): Data after change
- `ip_address` (TEXT): User's IP address
- `user_agent` (TEXT): Browser/client info
- `created_at` (TIMESTAMPTZ): Timestamp

**Use Cases:**
- Compliance and regulatory requirements
- Security incident investigation
- Data change tracking
- User activity monitoring

---

## Row Level Security (RLS)

The database implements comprehensive Row Level Security policies:

### Patient Access
- **Patients can view their own data**: Patients can SELECT their own records in `patients`, `patient_visits`, `prescriptions`, `bills`
- **Patients can update their own data**: Patients can UPDATE their own contact information

### Staff Access
- **Staff can view all patients**: Medical staff (doctor, nurse, receptionist, admin) can SELECT all patient records
- **Staff can insert patients**: Receptionist, admin, doctor, nurse can INSERT new patient records
- **Staff can manage visits**: Medical staff can SELECT, INSERT, UPDATE patient visits
- **Medical staff can manage prescriptions**: Doctors and pharmacists can manage prescriptions
- **All medical staff can view medical records**: Any staff with a medical role can view patient medical records

### Security Features
- All sensitive tables have RLS enabled
- Policies enforce role-based access
- Actions are logged in audit_logs
- Confidential records (mental health) have extra protection

---

## Key Workflows

### 1. Patient Registration & Check-In
```
1. Receptionist creates patient record (INSERT patients)
2. System creates user_roles entry (role: 'patient')
3. Create patient_visit record (status: 'checked_in')
4. Assign to department and doctor
5. Record vital signs in visit
6. Update triage_level if emergency
```

### 2. Doctor Consultation
```
1. Doctor views patient_visit
2. Doctor adds notes to visit
3. Doctor creates diagnosis (INSERT diagnoses)
4. Doctor orders lab tests (INSERT lab_orders)
5. Doctor creates prescription (INSERT prescriptions)
6. System generates prescription_number and QR code
7. Doctor digitally signs prescription
8. Update visit status to 'in_treatment'
```

### 3. Prescription Dispensing
```
1. Patient presents at pharmacy
2. Pharmacist scans QR code
3. System authenticates qr_code_data
4. Pharmacist views prescription_items
5. Pharmacist checks pharmacy_inventory
6. Pharmacist dispenses medication (INSERT medication_dispensing)
7. Update prescription_items.dispensed_quantity
8. Update pharmacy_inventory.quantity_available
9. Update prescription.status to 'dispensed'
```

### 4. Billing & Payment
```
1. System creates bill (INSERT bills) for visit
2. Add line items (INSERT bill_items) for:
   - Consultation fees
   - Medications from prescriptions
   - Lab tests from lab_orders
   - Radiology from radiology_orders
3. Calculate total_amount, insurance_covered
4. Patient makes payment (INSERT payments)
5. Update bills.amount_paid
6. Calculate bills.amount_due
7. Update bills.status when fully paid
```

### 5. Discharge & Aftercare
```
1. Doctor completes discharge_summary
2. Doctor creates aftercare_plan
3. If telemedicine_enabled:
   a. Schedule telemedicine_session
   b. Generate meeting_link
4. Update patient_visit.status to 'discharged'
5. Set patient_visit.check_out_time
6. Generate final bill
```

### 6. Telemedicine Follow-Up
```
1. Patient receives reminder for telemedicine_session
2. Doctor and patient join meeting
3. Doctor updates session_notes
4. If needed: Create new prescription
5. If needed: Order additional tests
6. Update session.status to 'completed'
7. Schedule next_appointment if needed
```

---

## Indexes & Performance

### Primary Indexes (Automatically Created)
- All `id` fields (Primary Keys)
- All `UNIQUE` constraints (email, license_number, visit_number, etc.)

### Custom Indexes for Performance

#### Patient & Staff Lookups
```sql
idx_patients_user_id          ON patients(user_id)
idx_patients_national_id      ON patients(national_id)
idx_staff_user_id             ON hospital_staff(user_id)
idx_staff_department          ON hospital_staff(department_id)
idx_staff_type                ON hospital_staff(staff_type)
idx_staff_patient_care_type   ON hospital_staff(patient_care_type)
                                WHERE staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist')
```

#### Visit & Appointment Tracking
```sql
idx_visits_patient            ON patient_visits(patient_id)
idx_visits_doctor             ON patient_visits(attending_doctor_id)
idx_visits_status             ON patient_visits(status)
idx_visits_check_in           ON patient_visits(check_in_time)
idx_visits_department         ON patient_visits(current_department_id)
idx_appointments_patient      ON appointments(patient_id)
idx_appointments_doctor       ON appointments(doctor_id)
idx_appointments_department   ON appointments(department_id)
idx_appointments_status       ON appointments(status)
idx_appointments_scheduled    ON appointments(scheduled_time)
```

#### Prescription & Pharmacy
```sql
idx_prescriptions_patient     ON prescriptions(patient_id)
idx_prescriptions_doctor      ON prescriptions(doctor_id)
idx_prescriptions_status      ON prescriptions(status)
idx_prescriptions_qr          ON prescriptions(qr_code_data)
```

#### Billing
```sql
idx_bills_patient             ON bills(patient_id)
idx_bills_visit               ON bills(visit_id)
idx_bills_status              ON bills(status)
```

#### Lab & Radiology
```sql
idx_lab_orders_patient        ON lab_orders(patient_id)
idx_lab_orders_status         ON lab_orders(status)
idx_radiology_orders_patient  ON radiology_orders(patient_id)
idx_radiology_orders_status   ON radiology_orders(status)
```

#### Telemedicine
```sql
idx_telemedicine_patient      ON telemedicine_sessions(patient_id)
idx_telemedicine_doctor       ON telemedicine_sessions(doctor_id)
idx_telemedicine_status       ON telemedicine_sessions(status)
```

### Query Optimization Tips

1. **Use indexes for filtering**: Always filter on indexed columns (patient_id, status, etc.)
2. **Limit JSONB queries**: JSONB fields (vital_signs, results) are flexible but slower
3. **Use appropriate JOINs**: LEFT JOIN when optional, INNER JOIN when required
4. **Paginate large result sets**: Use LIMIT and OFFSET for large queries
5. **Avoid N+1 queries**: Fetch related data in single queries using JOINs

---

## Database Triggers

### 1. **update_updated_at_column()**
Automatically updates the `updated_at` timestamp on record modification.

**Applied to:**
- patients
- hospital_staff
- patient_visits
- prescriptions
- bills
- telemedicine_sessions
- appointments

### 2. **handle_new_user()**
Automatically assigns user roles when a new user signs up or confirms email.

**Workflow:**
1. User signs up with metadata `{role: 'doctor'}`
2. Trigger fires on auth.users INSERT/UPDATE
3. Function extracts role from metadata
4. Inserts into user_roles table
5. Defaults to 'patient' if no role specified

---

## Helper Functions

### 1. **generate_visit_number()**
Generates unique visit numbers in format: `V-YYYYMMDD-####`

### 2. **generate_prescription_number()**
Generates unique prescription numbers in format: `RX-YYYYMMDD-####`

### 3. **generate_bill_number()**
Generates unique bill numbers in format: `BL-YYYYMMDD-####`

**Usage:**
```sql
INSERT INTO patient_visits (visit_number, ...)
VALUES (generate_visit_number(), ...);
```

---

## Data Integrity & Constraints

### Foreign Key Constraints
All relationships enforced with `FOREIGN KEY` constraints with `ON DELETE CASCADE` or `ON DELETE SET NULL` where appropriate.

### Check Constraints
Enum-like fields use `CHECK` constraints:
- `gender IN ('male', 'female', 'other')`
- `admission_type IN ('walk_in', 'emergency', 'appointment', 'transfer')`
- `status IN ('checked_in', 'discharged', ...)`

### Unique Constraints
Critical identifiers are unique:
- email addresses
- license numbers
- visit/prescription/bill numbers
- QR codes

---

## Backup & Recovery

### Recommended Backup Strategy

1. **Daily automated backups** of entire database
2. **Real-time replication** for disaster recovery
3. **Point-in-time recovery** capability
4. **Audit log retention** for 7+ years (regulatory compliance)

### Critical Tables (Priority 1)
- patients
- patient_visits
- prescriptions
- medical_records
- bills
- audit_logs

### Reference Tables (Priority 2)
- departments
- hospital_staff
- pharmacy_inventory

---

## Scalability Considerations

### Current Design Supports
- 100,000+ patient records
- 10,000+ daily visits
- 50,000+ prescriptions/month
- Multi-department hospital operations

### Future Enhancements
- Partitioning large tables by date (patient_visits, audit_logs)
- Archive old records to cold storage
- Implement caching layer for frequent queries
- Add full-text search for medical records
- Implement materialized views for reporting

---

## Compliance & Regulations

### HIPAA Compliance
- Row Level Security for patient data
- Comprehensive audit logging
- Encrypted connections (TLS)
- Role-based access control
- Confidential flags for sensitive records

### Data Retention
- Medical records: 7+ years
- Audit logs: 7+ years
- Financial records: 7+ years
- Prescriptions: 5+ years
- Appointment history: 3+ years

---

## Version History

- **v1.0** (2025): Initial comprehensive database model for Level 1 Hospital

---

## Quick Reference

### Most Important Tables
1. **patient_visits** - Center of all workflows
2. **prescriptions** - Digital prescription system
3. **hospital_staff** - Medical professionals
4. **departments** - Hospital structure
5. **bills** - Financial tracking

### Most Used Relationships
```sql
-- Get patient's current visit with doctor and department
SELECT v.*, p.first_name, p.last_name, d.name as doctor_name, dept.name as department_name
FROM patient_visits v
JOIN patients p ON v.patient_id = p.id
JOIN hospital_staff d ON v.attending_doctor_id = d.id
JOIN departments dept ON v.current_department_id = dept.id
WHERE v.status != 'discharged'
AND v.patient_id = '<patient_id>';

-- Get all prescriptions for a visit
SELECT pr.*, pi.medication_name, pi.dosage, pi.quantity
FROM prescriptions pr
JOIN prescription_items pi ON pr.id = pi.prescription_id
WHERE pr.visit_id = '<visit_id>';

-- Get patient's bill with items
SELECT b.*, bi.description, bi.total_price
FROM bills b
JOIN bill_items bi ON b.id = bi.bill_id
WHERE b.patient_id = '<patient_id>';
```

---

**For setup instructions, see [DATABASE_SETUP.md](DATABASE_SETUP.md)**
**For application documentation, see [CLAUDE.md](CLAUDE.md)**
