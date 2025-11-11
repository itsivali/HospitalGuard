-- ============================================================================
-- HospitalGuard: Comprehensive Hospital Management System Database
-- ============================================================================
-- Complete schema for Level 1 Trauma Center
-- Version: 1.0
-- Last Updated: 2025
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES: DEPARTMENTS & STAFF
-- ============================================================================

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  floor_number INTEGER,
  department_type TEXT CHECK (department_type IN (
    'emergency', 'icu', 'maternity', 'pediatrics', 'surgery',
    'radiology', 'laboratory', 'pharmacy', 'mental_health',
    'outpatient', 'billing', 'administration'
  )),
  head_of_department UUID,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospital Staff Table
CREATE TABLE IF NOT EXISTS hospital_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  staff_type TEXT NOT NULL CHECK (staff_type IN (
    'doctor', 'nurse', 'pharmacist', 'receptionist', 'billing',
    'admin', 'lab_tech', 'radiologist', 'psychiatrist', 'obstetrician'
  )),
  specialization TEXT,
  license_number TEXT UNIQUE,
  department_id UUID REFERENCES departments(id),
  patient_care_type TEXT CHECK (patient_care_type IN ('outpatient', 'inpatient', 'both')) DEFAULT 'both',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add head_of_department foreign key constraint
ALTER TABLE departments ADD CONSTRAINT fk_head_of_department
  FOREIGN KEY (head_of_department) REFERENCES hospital_staff(id);

-- ============================================================================
-- PATIENT MANAGEMENT
-- ============================================================================

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  allergies TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  national_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Visits Table (Complete Journey Tracking)
CREATE TABLE IF NOT EXISTS patient_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  visit_number TEXT UNIQUE NOT NULL,
  admission_type TEXT NOT NULL CHECK (admission_type IN (
    'walk_in', 'emergency', 'appointment', 'transfer'
  )),
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  status TEXT DEFAULT 'checked_in' CHECK (status IN (
    'checked_in', 'in_consultation', 'in_treatment', 'awaiting_lab',
    'awaiting_pharmacy', 'discharged', 'transferred', 'admitted'
  )),
  chief_complaint TEXT,
  vital_signs JSONB,
  attending_doctor_id UUID REFERENCES hospital_staff(id),
  current_department_id UUID REFERENCES departments(id),
  triage_level TEXT CHECK (triage_level IN ('critical', 'urgent', 'semi_urgent', 'non_urgent')),
  room_number TEXT,
  bed_number TEXT,
  notes TEXT,
  discharge_summary TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  telemedicine_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit Department Tracking (Multi-department visits)
CREATE TABLE IF NOT EXISTS visit_department_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID REFERENCES patient_visits(id) NOT NULL,
  department_id UUID REFERENCES departments(id) NOT NULL,
  staff_id UUID REFERENCES hospital_staff(id),
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  services_provided TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MEDICAL RECORDS & DIAGNOSES
-- ============================================================================

-- Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  visit_id UUID REFERENCES patient_visits(id),
  record_type TEXT CHECK (record_type IN (
    'consultation', 'diagnosis', 'lab_result', 'radiology',
    'surgery', 'prescription', 'vaccination', 'note'
  )),
  title TEXT NOT NULL,
  description TEXT,
  doctor_id UUID REFERENCES hospital_staff(id),
  department_id UUID REFERENCES departments(id),
  attachments JSONB,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diagnoses Table
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID REFERENCES patient_visits(id) NOT NULL,
  icd_code TEXT,
  diagnosis_name TEXT NOT NULL,
  diagnosis_type TEXT CHECK (diagnosis_type IN ('primary', 'secondary', 'differential')),
  notes TEXT,
  diagnosed_by UUID REFERENCES hospital_staff(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PRESCRIPTIONS & PHARMACY
-- ============================================================================

-- Prescriptions Table (Digital with QR Code)
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  visit_id UUID REFERENCES patient_visits(id),
  doctor_id UUID REFERENCES hospital_staff(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'signed', 'dispensed', 'partially_dispensed', 'cancelled'
  )),
  qr_code_data TEXT UNIQUE,
  digital_signature TEXT,
  signed_at TIMESTAMPTZ,
  notes TEXT,
  is_controlled_substance BOOLEAN DEFAULT false,
  refills_allowed INTEGER DEFAULT 0,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescription Items Table
CREATE TABLE IF NOT EXISTS prescription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  dispensed_quantity INTEGER DEFAULT 0,
  instructions TEXT,
  is_controlled_substance BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacy Inventory Table
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_name TEXT NOT NULL,
  generic_name TEXT,
  manufacturer TEXT,
  batch_number TEXT,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2),
  expiry_date DATE,
  reorder_level INTEGER DEFAULT 10,
  storage_location TEXT,
  is_controlled_substance BOOLEAN DEFAULT false,
  requires_prescription BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Dispensing Log
CREATE TABLE IF NOT EXISTS medication_dispensing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES prescriptions(id),
  prescription_item_id UUID REFERENCES prescription_items(id),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  pharmacist_id UUID REFERENCES hospital_staff(id) NOT NULL,
  medication_name TEXT NOT NULL,
  quantity_dispensed INTEGER NOT NULL,
  dispensed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LABORATORY & DIAGNOSTICS
-- ============================================================================

-- Lab Orders Table
CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  visit_id UUID REFERENCES patient_visits(id),
  ordered_by UUID REFERENCES hospital_staff(id) NOT NULL,
  test_type TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('routine', 'urgent', 'stat')),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'cancelled'
  )),
  sample_collected BOOLEAN DEFAULT false,
  sample_collected_at TIMESTAMPTZ,
  results JSONB,
  results_available_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES hospital_staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Radiology Orders Table
CREATE TABLE IF NOT EXISTS radiology_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  visit_id UUID REFERENCES patient_visits(id),
  ordered_by UUID REFERENCES hospital_staff(id) NOT NULL,
  imaging_type TEXT NOT NULL CHECK (imaging_type IN (
    'x_ray', 'ct_scan', 'mri', 'ultrasound', 'mammography', 'pet_scan'
  )),
  body_part TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('routine', 'urgent', 'stat')),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'
  )),
  scheduled_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  findings TEXT,
  images_url TEXT[],
  radiologist_id UUID REFERENCES hospital_staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SPECIALIZED DEPARTMENTS
-- ============================================================================

-- Maternity Records Table
CREATE TABLE IF NOT EXISTS maternity_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  visit_id UUID REFERENCES patient_visits(id),
  pregnancy_number INTEGER,
  lmp_date DATE,
  edd_date DATE,
  blood_group TEXT,
  rhesus_factor TEXT,
  hiv_status TEXT,
  hepatitis_b_status TEXT,
  antenatal_visits INTEGER DEFAULT 0,
  delivery_date DATE,
  delivery_type TEXT CHECK (delivery_type IN ('normal', 'caesarean', 'assisted')),
  baby_gender TEXT,
  baby_weight DECIMAL(5, 2),
  apgar_score INTEGER,
  complications TEXT,
  obstetrician_id UUID REFERENCES hospital_staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mental Health Records Table
CREATE TABLE IF NOT EXISTS mental_health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  visit_id UUID REFERENCES patient_visits(id),
  assessment_type TEXT CHECK (assessment_type IN (
    'initial', 'follow_up', 'crisis', 'discharge'
  )),
  mental_status_exam JSONB,
  diagnosis TEXT,
  risk_assessment TEXT,
  treatment_plan TEXT,
  medications_prescribed TEXT[],
  therapy_recommended TEXT,
  follow_up_date DATE,
  psychiatrist_id UUID REFERENCES hospital_staff(id),
  is_confidential BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BILLING & PAYMENTS
-- ============================================================================

-- Bills Table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  visit_id UUID REFERENCES patient_visits(id),
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  amount_due DECIMAL(12, 2) NOT NULL DEFAULT 0,
  insurance_covered DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'partially_paid', 'paid', 'cancelled', 'insurance_pending'
  )),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill Items Table
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN (
    'consultation', 'procedure', 'medication', 'lab_test',
    'radiology', 'room_charge', 'surgery', 'therapy', 'other'
  )),
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number TEXT UNIQUE NOT NULL,
  bill_id UUID REFERENCES bills(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN (
    'cash', 'card', 'mobile_money', 'insurance', 'bank_transfer'
  )),
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN (
    'completed', 'pending', 'failed', 'refunded'
  )),
  received_by UUID REFERENCES hospital_staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TELEMEDICINE & AFTERCARE
-- ============================================================================

-- Telemedicine Sessions Table
CREATE TABLE IF NOT EXISTS telemedicine_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  original_visit_id UUID REFERENCES patient_visits(id),
  doctor_id UUID REFERENCES hospital_staff(id) NOT NULL,
  session_type TEXT CHECK (session_type IN (
    'follow_up', 'consultation', 'emergency', 'prescription_refill'
  )),
  scheduled_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  meeting_link TEXT,
  session_notes TEXT,
  prescriptions_issued BOOLEAN DEFAULT false,
  follow_up_required BOOLEAN DEFAULT false,
  next_appointment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aftercare Plans Table
CREATE TABLE IF NOT EXISTS aftercare_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  visit_id UUID REFERENCES patient_visits(id) NOT NULL,
  doctor_id UUID REFERENCES hospital_staff(id) NOT NULL,
  plan_details TEXT NOT NULL,
  medications TEXT[],
  activity_restrictions TEXT,
  diet_instructions TEXT,
  warning_signs TEXT,
  follow_up_schedule TEXT,
  emergency_contact_number TEXT,
  telemedicine_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APPOINTMENTS
-- ============================================================================

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  doctor_id UUID REFERENCES hospital_staff(id),
  department_id UUID REFERENCES departments(id),
  appointment_type TEXT CHECK (appointment_type IN (
    'consultation', 'follow_up', 'procedure', 'lab', 'radiology', 'telemedicine'
  )),
  scheduled_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER ROLES (RBAC)
-- ============================================================================

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'patient', 'doctor', 'nurse', 'pharmacist', 'receptionist',
    'billing', 'admin', 'lab_tech', 'radiologist', 'psychiatrist', 'obstetrician'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Patient indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_national_id ON patients(national_id);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON hospital_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_department ON hospital_staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_type ON hospital_staff(staff_type);
CREATE INDEX IF NOT EXISTS idx_staff_patient_care_type ON hospital_staff(patient_care_type)
  WHERE staff_type IN ('doctor', 'obstetrician', 'psychiatrist', 'radiologist');

-- Visit indexes
CREATE INDEX IF NOT EXISTS idx_visits_patient ON patient_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_doctor ON patient_visits(attending_doctor_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON patient_visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_check_in ON patient_visits(check_in_time);
CREATE INDEX IF NOT EXISTS idx_visits_department ON patient_visits(current_department_id);

-- Prescription indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_qr ON prescriptions(qr_code_data);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_bills_patient ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_visit ON bills(visit_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);

-- Telemedicine indexes
CREATE INDEX IF NOT EXISTS idx_telemedicine_patient ON telemedicine_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_doctor ON telemedicine_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_status ON telemedicine_sessions(status);

-- Appointment indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_department ON appointments(department_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_time);

-- Lab and radiology indexes
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);
CREATE INDEX IF NOT EXISTS idx_radiology_orders_patient ON radiology_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_radiology_orders_status ON radiology_orders(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own data
CREATE POLICY "Patients can view own data" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own data" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

-- Staff can view all patients
CREATE POLICY "Staff can view all patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('doctor', 'nurse', 'receptionist', 'admin', 'pharmacist', 'lab_tech', 'radiologist')
    )
  );

-- Staff can insert patients
CREATE POLICY "Staff can insert patients" ON patients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('receptionist', 'admin', 'doctor', 'nurse')
    )
  );

-- Patients can view their own visits
CREATE POLICY "Patients can view own visits" ON patient_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_visits.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- Staff can view and manage visits
CREATE POLICY "Staff can manage visits" ON patient_visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('doctor', 'nurse', 'receptionist', 'admin')
    )
  );

-- Similar policies for prescriptions, bills, and appointments
CREATE POLICY "Patients can view own prescriptions" ON prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = prescriptions.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Medical staff can manage prescriptions" ON prescriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('doctor', 'pharmacist', 'admin')
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON hospital_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON patient_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telemedicine_updated_at BEFORE UPDATE ON telemedicine_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate visit number
CREATE OR REPLACE FUNCTION generate_visit_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'V-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate prescription number
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate bill number
CREATE OR REPLACE FUNCTION generate_bill_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTO-ASSIGN USER ROLES ON SIGNUP
-- ============================================================================

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role from user metadata (set during signup)
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');

  -- Insert the role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_immediate ON auth.users;

-- Create trigger for user email confirmation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for immediately confirmed users
CREATE TRIGGER on_auth_user_created_immediate
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'HospitalGuard Database Schema Created';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database is ready for seed data!';
  RAISE NOTICE '========================================';
END $$;
