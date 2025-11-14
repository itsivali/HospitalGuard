# Doctor Dashboard Backend Guide

This guide explains how to use the comprehensive backend functionality for the Doctor Dashboard in HospitalGuard.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Database Functions](#database-functions)
4. [React Hooks](#react-hooks)
5. [Utility Functions](#utility-functions)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

---

## Overview

The doctor dashboard backend consists of three main components:

1. **Database Functions** (`doctor-backend-functions.sql`) - Supabase stored procedures for all doctor operations
2. **React Hooks** (`src/hooks/useDoctorBackend.ts`) - TanStack Query hooks for frontend integration
3. **Utility Functions** (`src/lib/doctorUtils.ts`) - Helper functions for data processing and formatting

---

## Setup

### 1. Install Database Functions

Run the SQL file in your Supabase SQL Editor:

```bash
# In Supabase Dashboard > SQL Editor
# Copy and run the contents of doctor-backend-functions.sql
```

### 2. Import Hooks in Your Components

```typescript
import {
  useActivePatients,
  usePatientDetails,
  useCreatePrescription,
  useDoctorDashboardStats,
  // ... other hooks
} from '@/hooks/useDoctorBackend';
```

### 3. Import Utilities

```typescript
import {
  formatDateTime,
  getTriageLevelColor,
  validateVitalSigns,
  // ... other utilities
} from '@/lib/doctorUtils';
```

---

## Database Functions

### Patient Data Retrieval

#### `get_doctor_active_patients(doctor_id_param UUID)`

Retrieves all active patients assigned to a doctor, sorted by triage level.

**Returns:**
- Patient information (name, age, gender, blood type, allergies)
- Visit details (visit number, status, chief complaint, triage level)
- Current location (room number, bed number)
- Vital signs

**Example:**
```sql
SELECT * FROM get_doctor_active_patients('doctor-uuid-here');
```

#### `get_patient_details(patient_id_param UUID)`

Gets comprehensive patient information.

#### `get_patient_medical_history(patient_id_param UUID)`

Retrieves patient's medical records (excluding confidential records).

#### `get_current_visit_details(visit_id_param UUID)`

Gets complete visit information including diagnoses and department history.

#### `search_patients(search_term TEXT, limit_param INTEGER)`

Search patients by name, national ID, or phone number.

---

### Prescription Management

#### `create_prescription(...)`

Creates a new prescription with QR code authentication.

**Parameters:**
- `patient_id_param` - Patient UUID
- `visit_id_param` - Visit UUID
- `doctor_id_param` - Doctor UUID
- `prescription_items` - JSONB array of medications
- `notes_param` - Optional prescription notes
- `is_controlled_substance_param` - Boolean flag
- `refills_allowed_param` - Number of refills (default: 0)
- `valid_days` - Validity period in days (default: 30)

**Returns:**
- `prescription_id` - UUID of created prescription
- `prescription_number` - Generated prescription number
- `qr_code_data` - QR code data string

**Example:**
```sql
SELECT * FROM create_prescription(
  'patient-uuid',
  'visit-uuid',
  'doctor-uuid',
  '[
    {
      "medication_name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "quantity": 21,
      "instructions": "Take with food"
    }
  ]'::jsonb,
  'Complete the full course',
  false,
  0,
  7
);
```

#### `sign_prescription(prescription_id_param UUID, doctor_id_param UUID, digital_signature_param TEXT)`

Signs a pending prescription with a digital signature.

#### `get_doctor_prescriptions(doctor_id_param UUID, status_filter TEXT, limit_param INTEGER)`

Retrieves doctor's prescriptions with optional status filtering.

#### `get_prescription_details(prescription_id_param UUID)`

Gets complete prescription details including all items.

---

### Consultation & Medical Records

#### `create_consultation_note(...)`

Creates a consultation note in the medical record.

**Parameters:**
- `patient_id_param`
- `visit_id_param`
- `doctor_id_param`
- `department_id_param`
- `title_param` - Note title
- `description_param` - Detailed consultation notes
- `is_confidential_param` - Mark as confidential (default: false)
- `attachments_param` - Optional JSONB attachments

#### `add_diagnosis(...)`

Adds a diagnosis to a patient visit.

**Parameters:**
- `visit_id_param`
- `diagnosis_name_param`
- `diagnosis_type_param` - 'primary', 'secondary', or 'differential'
- `icd_code_param` - Optional ICD code
- `notes_param` - Additional notes
- `diagnosed_by_param` - Doctor UUID

#### `update_visit_status(visit_id_param UUID, new_status TEXT, notes_param TEXT)`

Updates the status of a patient visit.

**Valid statuses:**
- `checked_in`
- `in_consultation`
- `in_treatment`
- `awaiting_lab`
- `awaiting_pharmacy`
- `discharged`
- `transferred`
- `admitted`

#### `update_vital_signs(visit_id_param UUID, vital_signs_param JSONB)`

Updates vital signs for a visit.

---

### Lab & Radiology Orders

#### `create_lab_order(...)`

Creates a laboratory test order.

**Parameters:**
- `patient_id_param`
- `visit_id_param`
- `ordered_by_param` - Doctor UUID
- `test_type_param` - Test name
- `urgency_param` - 'routine', 'urgent', or 'stat' (default: 'routine')
- `notes_param` - Optional notes

**Returns:**
- `order_id` - UUID
- `order_number` - Generated order number (LAB-YYYYMMDD-XXXX)

#### `create_radiology_order(...)`

Creates a radiology imaging order.

**Parameters:**
- `patient_id_param`
- `visit_id_param`
- `ordered_by_param`
- `imaging_type_param` - 'x_ray', 'ct_scan', 'mri', 'ultrasound', 'mammography', 'pet_scan'
- `body_part_param` - Body part to image
- `urgency_param` - 'routine', 'urgent', or 'stat'
- `notes_param`

#### `get_patient_lab_orders(patient_id_param UUID, visit_id_param UUID)`

Retrieves lab orders for a patient (optionally filtered by visit).

#### `get_patient_radiology_orders(patient_id_param UUID, visit_id_param UUID)`

Retrieves radiology orders for a patient.

---

### Appointment Management

#### `create_appointment(...)`

Schedules a new appointment.

**Parameters:**
- `patient_id_param`
- `doctor_id_param`
- `department_id_param`
- `appointment_type_param` - 'consultation', 'follow_up', 'procedure', 'lab', 'radiology', 'telemedicine'
- `scheduled_time_param` - TIMESTAMPTZ
- `duration_minutes_param` - Default: 30
- `reason_param` - Appointment reason
- `notes_param`

**Returns:**
- `appointment_id` - UUID
- `appointment_number` - Generated number (APT-YYYYMMDD-XXXX)

#### `get_doctor_appointments(...)`

Gets doctor's appointments within a date range.

**Parameters:**
- `doctor_id_param`
- `start_date` - Default: NOW()
- `end_date` - Default: NOW() + 7 days
- `status_filter` - Optional filter by status

#### `update_appointment_status(appointment_id_param UUID, new_status TEXT, notes_param TEXT)`

Updates appointment status.

**Valid statuses:**
- `scheduled`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`
- `no_show`

---

### Telemedicine

#### `create_telemedicine_session(...)`

Schedules a telemedicine session.

**Parameters:**
- `patient_id_param`
- `original_visit_id_param` - UUID of the original visit
- `doctor_id_param`
- `session_type_param` - 'follow_up', 'consultation', 'emergency', 'prescription_refill'
- `scheduled_time_param`
- `meeting_link_param` - Optional video call link

**Returns:**
- `session_id` - UUID
- `session_number` - Generated number (TM-YYYYMMDD-XXXX)

#### `get_doctor_telemedicine_sessions(...)`

Retrieves doctor's telemedicine sessions.

#### `update_telemedicine_session(...)`

Updates session details (status, notes, start/end times, etc.).

---

### Discharge & Aftercare

#### `discharge_patient(...)`

Discharges a patient from the hospital.

**Parameters:**
- `visit_id_param`
- `discharge_summary_param` - Summary of treatment and outcome
- `follow_up_required_param` - Boolean (default: false)
- `telemedicine_enabled_param` - Boolean (default: false)

#### `create_aftercare_plan(...)`

Creates a comprehensive aftercare plan for discharged patients.

**Parameters:**
- `patient_id_param`
- `visit_id_param`
- `doctor_id_param`
- `plan_details_param` - Detailed aftercare instructions
- `medications_param` - TEXT[] array of medications
- `activity_restrictions_param`
- `diet_instructions_param`
- `warning_signs_param` - Signs requiring immediate attention
- `follow_up_schedule_param`
- `emergency_contact_number_param`
- `telemedicine_enabled_param` - Default: true

#### `get_patient_aftercare_plans(patient_id_param UUID)`

Retrieves all aftercare plans for a patient.

---

### Dashboard Statistics

#### `get_doctor_dashboard_stats(doctor_id_param UUID)`

Gets comprehensive dashboard statistics for a doctor.

**Returns:**
- `active_patients_count` - Number of active patients
- `today_appointments_count` - Appointments scheduled for today
- `pending_prescriptions_count` - Unsigned prescriptions
- `upcoming_telemedicine_count` - Upcoming telemedicine sessions (next 7 days)
- `critical_patients_count` - Patients with critical triage level
- `awaiting_lab_results_count` - Patients awaiting lab results
- `patients_by_status` - JSONB breakdown by status
- `appointments_by_type` - JSONB breakdown by type

#### `get_doctor_recent_activity(doctor_id_param UUID, limit_param INTEGER)`

Gets recent activity feed for the doctor.

**Returns:**
- Recent visits, prescriptions, lab orders, and radiology orders
- Limited to last 7 days
- Sorted by timestamp (newest first)

---

### Utility Functions

#### `get_available_medications(search_term TEXT, in_stock_only BOOLEAN)`

Searches pharmacy inventory for available medications.

---

## React Hooks

All hooks use TanStack Query for data fetching, caching, and automatic revalidation.

### Query Hooks (Data Fetching)

```typescript
// Active patients
const { data, isLoading, error } = useActivePatients(doctorId);

// Patient details
const { data: patient } = usePatientDetails(patientId);

// Medical history
const { data: history } = usePatientMedicalHistory(patientId);

// Visit details
const { data: visit } = useVisitDetails(visitId);

// Prescriptions
const { data: prescriptions } = useDoctorPrescriptions(doctorId, 'pending');

// Appointments
const { data: appointments } = useDoctorAppointments(doctorId);

// Dashboard stats
const { data: stats } = useDoctorDashboardStats(doctorId);

// Lab orders
const { data: labOrders } = usePatientLabOrders(patientId, visitId);

// Radiology orders
const { data: radOrders } = usePatientRadiologyOrders(patientId, visitId);

// Telemedicine sessions
const { data: sessions } = useDoctorTelemedicineSessions(doctorId);

// Search patients
const { data: searchResults } = useSearchPatients(searchTerm);

// Available medications
const { data: medications } = useAvailableMedications(searchTerm);
```

### Mutation Hooks (Data Modification)

```typescript
// Create prescription
const createPrescription = useCreatePrescription();
createPrescription.mutate({
  patientId: 'uuid',
  visitId: 'uuid',
  doctorId: 'uuid',
  prescriptionItems: [
    {
      medication_name: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3 times daily',
      duration: '7 days',
      quantity: 21,
      instructions: 'Take with food',
    },
  ],
  notes: 'Complete the full course',
});

// Sign prescription
const signPrescription = useSignPrescription();
signPrescription.mutate({
  prescriptionId: 'uuid',
  doctorId: 'uuid',
  digitalSignature: 'signature-string',
});

// Create consultation note
const createNote = useCreateConsultationNote();
createNote.mutate({
  patientId: 'uuid',
  visitId: 'uuid',
  doctorId: 'uuid',
  departmentId: 'uuid',
  title: 'Initial Consultation',
  description: 'Detailed notes...',
});

// Add diagnosis
const addDiagnosis = useAddDiagnosis();
addDiagnosis.mutate({
  visitId: 'uuid',
  diagnosisName: 'Acute Bronchitis',
  diagnosisType: 'primary',
  icdCode: 'J20.9',
  diagnosedBy: 'doctor-uuid',
});

// Update visit status
const updateStatus = useUpdateVisitStatus();
updateStatus.mutate({
  visitId: 'uuid',
  newStatus: 'in_consultation',
});

// Update vital signs
const updateVitals = useUpdateVitalSigns();
updateVitals.mutate({
  visitId: 'uuid',
  vitalSigns: {
    blood_pressure: '120/80',
    heart_rate: 72,
    temperature: 37.2,
    oxygen_saturation: 98,
  },
});

// Create lab order
const createLabOrder = useCreateLabOrder();
createLabOrder.mutate({
  patientId: 'uuid',
  visitId: 'uuid',
  orderedBy: 'doctor-uuid',
  testType: 'Complete Blood Count',
  urgency: 'routine',
});

// Create radiology order
const createRadOrder = useCreateRadiologyOrder();
createRadOrder.mutate({
  patientId: 'uuid',
  visitId: 'uuid',
  orderedBy: 'doctor-uuid',
  imagingType: 'x_ray',
  bodyPart: 'Chest',
  urgency: 'urgent',
});

// Create appointment
const createAppointment = useCreateAppointment();
createAppointment.mutate({
  patientId: 'uuid',
  doctorId: 'uuid',
  departmentId: 'uuid',
  appointmentType: 'follow_up',
  scheduledTime: '2025-01-15T10:00:00Z',
  durationMinutes: 30,
  reason: 'Follow-up consultation',
});

// Create telemedicine session
const createSession = useCreateTelemedicineSession();
createSession.mutate({
  patientId: 'uuid',
  originalVisitId: 'uuid',
  doctorId: 'uuid',
  sessionType: 'follow_up',
  scheduledTime: '2025-01-20T14:00:00Z',
  meetingLink: 'https://meet.example.com/session-id',
});

// Discharge patient
const dischargePatient = useDischargePatient();
dischargePatient.mutate({
  visitId: 'uuid',
  dischargeSummary: 'Patient recovered well...',
  followUpRequired: true,
  telemedicineEnabled: true,
});

// Create aftercare plan
const createAftercare = useCreateAftercarePlan();
createAftercare.mutate({
  patientId: 'uuid',
  visitId: 'uuid',
  doctorId: 'uuid',
  planDetails: 'Complete rest for 7 days...',
  medications: ['Amoxicillin 500mg 3x daily'],
  activityRestrictions: 'No heavy lifting',
  dietInstructions: 'Soft foods only',
  warningSigns: 'Fever above 38°C, difficulty breathing',
  followUpSchedule: '2 weeks',
});
```

---

## Utility Functions

### Prescription Utilities

```typescript
import {
  generatePrescriptionQRCode,
  generateDigitalSignature,
  validatePrescriptionItems,
} from '@/lib/doctorUtils';

// Generate QR code
const qrCode = await generatePrescriptionQRCode({
  prescription_number: 'RX-20250115-0001',
  patient_id: 'uuid',
  doctor_id: 'uuid',
  created_at: new Date().toISOString(),
});

// Generate signature
const signature = generateDigitalSignature('doctor-uuid', 'RX-20250115-0001', new Date().toISOString());

// Validate prescription items
const { valid, errors } = validatePrescriptionItems(items);
if (!valid) {
  console.error('Validation errors:', errors);
}
```

### Vital Signs Utilities

```typescript
import {
  parseVitalSigns,
  calculateBMI,
  validateVitalSigns,
} from '@/lib/doctorUtils';

// Parse form data
const vitals = parseVitalSigns(formData);

// Calculate BMI
const bmi = calculateBMI(70, 175); // weight in kg, height in cm

// Validate vitals
const { valid, warnings, critical } = validateVitalSigns(vitals);
if (critical.length > 0) {
  alert('Critical vital signs detected!');
}
```

### Display Utilities

```typescript
import {
  formatDateTime,
  formatCurrency,
  getTriageLevelColor,
  getVisitStatusLabel,
  formatAllergies,
} from '@/lib/doctorUtils';

// Format date/time
const displayDate = formatDateTime('2025-01-15T10:30:00Z');

// Format currency
const price = formatCurrency(5000); // "KES 5,000.00"

// Get triage color
const color = getTriageLevelColor('critical'); // "bg-red-500"

// Get status label
const label = getVisitStatusLabel('in_consultation'); // "In Consultation"

// Format allergies
const allergiesText = formatAllergies(['Penicillin', 'Peanuts']); // "Penicillin, Peanuts"
```

---

## Usage Examples

### Example 1: Doctor Dashboard Component

```typescript
import { useDoctorDashboardStats, useActivePatients } from '@/hooks/useDoctorBackend';
import { formatDateTime, getTriageLevelColor } from '@/lib/doctorUtils';

function DoctorDashboard() {
  const doctorId = 'current-doctor-uuid'; // Get from auth context

  const { data: stats, isLoading: statsLoading } = useDoctorDashboardStats(doctorId);
  const { data: patients, isLoading: patientsLoading } = useActivePatients(doctorId);

  if (statsLoading || patientsLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Active Patients" value={stats?.active_patients_count} />
        <StatCard title="Today's Appointments" value={stats?.today_appointments_count} />
        <StatCard title="Critical Patients" value={stats?.critical_patients_count} />
        <StatCard title="Pending Prescriptions" value={stats?.pending_prescriptions_count} />
      </div>

      {/* Patient List */}
      <div className="mt-8">
        <h2>Active Patients</h2>
        {patients?.map(patient => (
          <div key={patient.visit_id} className="p-4 border rounded">
            <div className="flex justify-between">
              <div>
                <h3>{patient.patient_name}</h3>
                <p>{patient.chief_complaint}</p>
              </div>
              <div>
                <span className={getTriageLevelColor(patient.triage_level)}>
                  {patient.triage_level}
                </span>
                <p>{formatDateTime(patient.check_in_time)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 2: Create Prescription Form

```typescript
import { useCreatePrescription, useAvailableMedications } from '@/hooks/useDoctorBackend';
import { validatePrescriptionItems } from '@/lib/doctorUtils';

function CreatePrescriptionForm({ patientId, visitId, doctorId }) {
  const [items, setItems] = useState([]);
  const createPrescription = useCreatePrescription();
  const { data: medications } = useAvailableMedications();

  const handleSubmit = () => {
    const { valid, errors } = validatePrescriptionItems(items);
    if (!valid) {
      alert(errors.join('\n'));
      return;
    }

    createPrescription.mutate({
      patientId,
      visitId,
      doctorId,
      prescriptionItems: items,
      notes: 'Follow instructions carefully',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Medication selection UI */}
      <button type="submit" disabled={createPrescription.isPending}>
        {createPrescription.isPending ? 'Creating...' : 'Create Prescription'}
      </button>
    </form>
  );
}
```

### Example 3: Update Vital Signs

```typescript
import { useUpdateVitalSigns } from '@/hooks/useDoctorBackend';
import { parseVitalSigns, validateVitalSigns, calculateBMI } from '@/lib/doctorUtils';

function VitalSignsForm({ visitId }) {
  const updateVitals = useUpdateVitalSigns();
  const [formData, setFormData] = useState({});

  const handleSubmit = () => {
    const vitals = parseVitalSigns(formData);

    // Calculate BMI if weight and height provided
    if (formData.weight && formData.height) {
      vitals.bmi = calculateBMI(formData.weight, formData.height);
    }

    // Validate
    const { valid, warnings, critical } = validateVitalSigns(vitals);
    if (critical.length > 0) {
      if (!confirm(`Critical signs detected:\n${critical.join('\n')}\nContinue?`)) {
        return;
      }
    }

    updateVitals.mutate({ visitId, vitalSigns: vitals });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Update Vital Signs</button>
    </form>
  );
}
```

---

## Best Practices

### 1. Error Handling

Always handle errors from mutations:

```typescript
const createPrescription = useCreatePrescription();

createPrescription.mutate(data, {
  onError: (error) => {
    console.error('Failed to create prescription:', error);
    // Show user-friendly error message
  },
});
```

### 2. Loading States

Show loading indicators for better UX:

```typescript
const { data, isLoading, error } = useActivePatients(doctorId);

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
```

### 3. Optimistic Updates

For better perceived performance:

```typescript
const queryClient = useQueryClient();
const updateStatus = useUpdateVisitStatus();

updateStatus.mutate(data, {
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['active-patients'] });

    // Snapshot previous value
    const previousPatients = queryClient.getQueryData(['active-patients']);

    // Optimistically update
    queryClient.setQueryData(['active-patients'], (old) => {
      // Update logic here
    });

    return { previousPatients };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['active-patients'], context.previousPatients);
  },
});
```

### 4. Data Validation

Always validate data before submission:

```typescript
import { validatePrescriptionItems, validateVitalSigns } from '@/lib/doctorUtils';

// Before creating prescription
const { valid, errors } = validatePrescriptionItems(items);
if (!valid) {
  // Show errors to user
  return;
}

// Before updating vitals
const { valid, critical } = validateVitalSigns(vitals);
if (critical.length > 0) {
  // Alert doctor about critical values
}
```

### 5. Automatic Refetching

Configure refetch intervals for real-time data:

```typescript
// Dashboard stats refetch every minute
const { data } = useDoctorDashboardStats(doctorId);
// Already configured with refetchInterval: 60000

// Active patients refetch every 30 seconds
const { data: patients } = useActivePatients(doctorId);
// Already configured with refetchInterval: 30000
```

### 6. Type Safety

Use TypeScript types from the hooks:

```typescript
import type { ActivePatient, Prescription } from '@/hooks/useDoctorBackend';

function PatientCard({ patient }: { patient: ActivePatient }) {
  // TypeScript ensures you're using correct properties
}
```

---

## Security Considerations

1. **Row Level Security (RLS)**: All database functions respect RLS policies
2. **Digital Signatures**: In production, implement proper cryptographic signing for prescriptions
3. **QR Code Security**: QR codes should include verification mechanisms
4. **Confidential Records**: Mental health and sensitive records are marked confidential
5. **Audit Logging**: All critical operations should be logged (implement audit triggers)

---

## Performance Tips

1. **Use pagination** for large datasets
2. **Enable caching** with TanStack Query (already configured)
3. **Debounce search inputs** when using `useSearchPatients`
4. **Lazy load** patient details only when needed
5. **Use indexes** on frequently queried columns (already in schema)

---

## Troubleshooting

### Common Issues

1. **Function not found**: Ensure `doctor-backend-functions.sql` is executed in Supabase
2. **Permission denied**: Check RLS policies and user roles
3. **Invalid data**: Validate inputs before calling mutations
4. **Stale data**: Force refetch with `queryClient.invalidateQueries()`

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: 2025-01-13
**Version**: 1.0
