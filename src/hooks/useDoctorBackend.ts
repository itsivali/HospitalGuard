/**
 * HospitalGuard: Doctor Dashboard Backend Hooks
 * Custom React hooks for doctor operations using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age: number;
  gender: string;
  blood_type: string | null;
  allergies: string[] | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  national_id: string | null;
}

export interface ActivePatient {
  visit_id: string;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  gender: string;
  visit_number: string;
  admission_type: string;
  check_in_time: string;
  status: string;
  chief_complaint: string;
  triage_level: string;
  room_number: string | null;
  bed_number: string | null;
  vital_signs: any;
  blood_type: string | null;
  allergies: string[] | null;
}

export interface VisitDetails {
  visit_id: string;
  patient_id: string;
  patient_name: string;
  visit_number: string;
  admission_type: string;
  check_in_time: string;
  status: string;
  chief_complaint: string;
  triage_level: string;
  vital_signs: any;
  attending_doctor_id: string;
  attending_doctor_name: string;
  current_department: string;
  room_number: string | null;
  bed_number: string | null;
  notes: string | null;
  diagnoses: any[];
  department_history: any[];
}

export interface PrescriptionItem {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  is_controlled_substance?: boolean;
}

export interface Prescription {
  prescription_id: string;
  prescription_number: string;
  patient_name: string;
  patient_id: string;
  visit_number: string;
  status: string;
  created_at: string;
  signed_at: string | null;
  valid_until: string;
  is_controlled_substance: boolean;
  items_count: number;
}

export interface PrescriptionDetails {
  prescription_id: string;
  prescription_number: string;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  patient_allergies: string[] | null;
  visit_id: string;
  visit_number: string;
  doctor_id: string;
  doctor_name: string;
  doctor_license: string;
  status: string;
  qr_code_data: string;
  digital_signature: string | null;
  signed_at: string | null;
  notes: string | null;
  is_controlled_substance: boolean;
  refills_allowed: number;
  valid_until: string;
  created_at: string;
  items: PrescriptionItem[];
}

export interface Appointment {
  appointment_id: string;
  appointment_number: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string | null;
  appointment_type: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  reason: string | null;
  department_name: string;
}

export interface TelemedicineSession {
  session_id: string;
  session_number: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string | null;
  session_type: string;
  scheduled_time: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  meeting_link: string | null;
  original_visit_number: string | null;
}

export interface DashboardStats {
  active_patients_count: number;
  today_appointments_count: number;
  pending_prescriptions_count: number;
  upcoming_telemedicine_count: number;
  critical_patients_count: number;
  awaiting_lab_results_count: number;
  patients_by_status: Record<string, number>;
  appointments_by_type: Record<string, number>;
}

export interface LabOrder {
  order_id: string;
  order_number: string;
  test_type: string;
  urgency: string;
  status: string;
  sample_collected: boolean;
  sample_collected_at: string | null;
  results: any;
  results_available_at: string | null;
  ordered_by_name: string;
  created_at: string;
}

export interface RadiologyOrder {
  order_id: string;
  order_number: string;
  imaging_type: string;
  body_part: string;
  urgency: string;
  status: string;
  scheduled_time: string | null;
  completed_at: string | null;
  findings: string | null;
  images_url: string[] | null;
  radiologist_name: string | null;
  ordered_by_name: string;
  created_at: string;
}

export interface MedicalRecord {
  record_id: string;
  record_type: string;
  title: string;
  description: string;
  doctor_name: string;
  department_name: string;
  created_at: string;
  attachments: any;
}

export interface Medication {
  medication_id: string;
  medication_name: string;
  generic_name: string;
  manufacturer: string;
  quantity_available: number;
  unit_price: number;
  is_controlled_substance: boolean;
  requires_prescription: boolean;
}

// ============================================================================
// PATIENT DATA HOOKS
// ============================================================================

/**
 * Get doctor's active patients
 */
export function useActivePatients(doctorId: string) {
  return useQuery<ActivePatient[]>({
    queryKey: ['active-patients', doctorId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_active_patients', {
        doctor_id_param: doctorId
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!doctorId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Get patient details
 */
export function usePatientDetails(patientId: string | null) {
  return useQuery<Patient>({
    queryKey: ['patient-details', patientId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_patient_details', {
        patient_id_param: patientId
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!patientId,
  });
}

/**
 * Get patient's medical history
 */
export function usePatientMedicalHistory(patientId: string | null) {
  return useQuery<MedicalRecord[]>({
    queryKey: ['patient-medical-history', patientId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_patient_medical_history', {
        patient_id_param: patientId
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId,
  });
}

/**
 * Get current visit details
 */
export function useVisitDetails(visitId: string | null) {
  return useQuery<VisitDetails>({
    queryKey: ['visit-details', visitId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_visit_details', {
        visit_id_param: visitId
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!visitId,
  });
}

/**
 * Search patients
 */
export function useSearchPatients(searchTerm: string, limit: number = 20) {
  return useQuery({
    queryKey: ['search-patients', searchTerm, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_patients', {
        search_term: searchTerm,
        limit_param: limit
      });

      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });
}

// ============================================================================
// PRESCRIPTION HOOKS
// ============================================================================

/**
 * Create a new prescription
 */
export function useCreatePrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      patientId: string;
      visitId: string;
      doctorId: string;
      prescriptionItems: PrescriptionItem[];
      notes?: string;
      isControlledSubstance?: boolean;
      refillsAllowed?: number;
      validDays?: number;
    }) => {
      const { data, error } = await supabase.rpc('create_prescription', {
        patient_id_param: params.patientId,
        visit_id_param: params.visitId,
        doctor_id_param: params.doctorId,
        prescription_items: params.prescriptionItems,
        notes_param: params.notes || null,
        is_controlled_substance_param: params.isControlledSubstance || false,
        refills_allowed_param: params.refillsAllowed || 0,
        valid_days: params.validDays || 30
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Prescription Created',
        description: 'The prescription has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create prescription.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Sign a prescription
 */
export function useSignPrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      prescriptionId: string;
      doctorId: string;
      digitalSignature: string;
    }) => {
      const { data, error } = await supabase.rpc('sign_prescription', {
        prescription_id_param: params.prescriptionId,
        doctor_id_param: params.doctorId,
        digital_signature_param: params.digitalSignature
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-details'] });
      toast({
        title: 'Prescription Signed',
        description: 'The prescription has been signed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign prescription.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get doctor's prescriptions
 */
export function useDoctorPrescriptions(
  doctorId: string,
  statusFilter?: string,
  limit: number = 50
) {
  return useQuery<Prescription[]>({
    queryKey: ['doctor-prescriptions', doctorId, statusFilter, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_prescriptions', {
        doctor_id_param: doctorId,
        status_filter: statusFilter || null,
        limit_param: limit
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!doctorId,
  });
}

/**
 * Get prescription details
 */
export function usePrescriptionDetails(prescriptionId: string | null) {
  return useQuery<PrescriptionDetails>({
    queryKey: ['prescription-details', prescriptionId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_prescription_details', {
        prescription_id_param: prescriptionId
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!prescriptionId,
  });
}

/**
 * Get available medications
 */
export function useAvailableMedications(searchTerm?: string, inStockOnly: boolean = true) {
  return useQuery<Medication[]>({
    queryKey: ['available-medications', searchTerm, inStockOnly],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_medications', {
        search_term: searchTerm || null,
        in_stock_only: inStockOnly
      });

      if (error) throw error;
      return data || [];
    },
  });
}

// ============================================================================
// CONSULTATION & MEDICAL RECORDS HOOKS
// ============================================================================

/**
 * Create consultation note
 */
export function useCreateConsultationNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      patientId: string;
      visitId: string;
      doctorId: string;
      departmentId: string;
      title: string;
      description: string;
      isConfidential?: boolean;
      attachments?: any;
    }) => {
      const { data, error } = await supabase.rpc('create_consultation_note', {
        patient_id_param: params.patientId,
        visit_id_param: params.visitId,
        doctor_id_param: params.doctorId,
        department_id_param: params.departmentId,
        title_param: params.title,
        description_param: params.description,
        is_confidential_param: params.isConfidential || false,
        attachments_param: params.attachments || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-medical-history'] });
      queryClient.invalidateQueries({ queryKey: ['visit-details'] });
      toast({
        title: 'Note Created',
        description: 'Consultation note has been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create consultation note.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Add diagnosis
 */
export function useAddDiagnosis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      visitId: string;
      diagnosisName: string;
      diagnosisType: string;
      icdCode?: string;
      notes?: string;
      diagnosedBy?: string;
    }) => {
      const { data, error } = await supabase.rpc('add_diagnosis', {
        visit_id_param: params.visitId,
        diagnosis_name_param: params.diagnosisName,
        diagnosis_type_param: params.diagnosisType,
        icd_code_param: params.icdCode || null,
        notes_param: params.notes || null,
        diagnosed_by_param: params.diagnosedBy || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit-details'] });
      toast({
        title: 'Diagnosis Added',
        description: 'Diagnosis has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add diagnosis.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update visit status
 */
export function useUpdateVisitStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      visitId: string;
      newStatus: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('update_visit_status', {
        visit_id_param: params.visitId,
        new_status: params.newStatus,
        notes_param: params.notes || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-patients'] });
      queryClient.invalidateQueries({ queryKey: ['visit-details'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Status Updated',
        description: 'Visit status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update visit status.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update vital signs
 */
export function useUpdateVitalSigns() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      visitId: string;
      vitalSigns: any;
    }) => {
      const { data, error } = await supabase.rpc('update_vital_signs', {
        visit_id_param: params.visitId,
        vital_signs_param: params.vitalSigns
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-patients'] });
      queryClient.invalidateQueries({ queryKey: ['visit-details'] });
      toast({
        title: 'Vitals Updated',
        description: 'Vital signs have been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update vital signs.',
        variant: 'destructive',
      });
    },
  });
}

// ============================================================================
// LAB & RADIOLOGY HOOKS
// ============================================================================

/**
 * Create lab order
 */
export function useCreateLabOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      patientId: string;
      visitId: string;
      orderedBy: string;
      testType: string;
      urgency?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('create_lab_order', {
        patient_id_param: params.patientId,
        visit_id_param: params.visitId,
        ordered_by_param: params.orderedBy,
        test_type_param: params.testType,
        urgency_param: params.urgency || 'routine',
        notes_param: params.notes || null
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-lab-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Lab Order Created',
        description: 'Lab order has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create lab order.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Create radiology order
 */
export function useCreateRadiologyOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      patientId: string;
      visitId: string;
      orderedBy: string;
      imagingType: string;
      bodyPart: string;
      urgency?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('create_radiology_order', {
        patient_id_param: params.patientId,
        visit_id_param: params.visitId,
        ordered_by_param: params.orderedBy,
        imaging_type_param: params.imagingType,
        body_part_param: params.bodyPart,
        urgency_param: params.urgency || 'routine',
        notes_param: params.notes || null
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-radiology-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Radiology Order Created',
        description: 'Radiology order has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create radiology order.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get patient's lab orders
 */
export function usePatientLabOrders(patientId: string | null, visitId?: string) {
  return useQuery<LabOrder[]>({
    queryKey: ['patient-lab-orders', patientId, visitId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_patient_lab_orders', {
        patient_id_param: patientId,
        visit_id_param: visitId || null
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId,
  });
}

/**
 * Get patient's radiology orders
 */
export function usePatientRadiologyOrders(patientId: string | null, visitId?: string) {
  return useQuery<RadiologyOrder[]>({
    queryKey: ['patient-radiology-orders', patientId, visitId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_patient_radiology_orders', {
        patient_id_param: patientId,
        visit_id_param: visitId || null
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId,
  });
}

// ============================================================================
// APPOINTMENT HOOKS
// ============================================================================

/**
 * Create appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      patientId: string;
      doctorId: string;
      departmentId: string;
      appointmentType: string;
      scheduledTime: string;
      durationMinutes?: number;
      reason?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('create_appointment', {
        patient_id_param: params.patientId,
        doctor_id_param: params.doctorId,
        department_id_param: params.departmentId,
        appointment_type_param: params.appointmentType,
        scheduled_time_param: params.scheduledTime,
        duration_minutes_param: params.durationMinutes || 30,
        reason_param: params.reason || null,
        notes_param: params.notes || null
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Appointment Created',
        description: 'Appointment has been scheduled successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create appointment.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get doctor's appointments
 */
export function useDoctorAppointments(
  doctorId: string,
  startDate?: string,
  endDate?: string,
  statusFilter?: string
) {
  return useQuery<Appointment[]>({
    queryKey: ['doctor-appointments', doctorId, startDate, endDate, statusFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_appointments', {
        doctor_id_param: doctorId,
        start_date: startDate || new Date().toISOString(),
        end_date: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status_filter: statusFilter || null
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!doctorId,
  });
}

/**
 * Update appointment status
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      appointmentId: string;
      newStatus: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('update_appointment_status', {
        appointment_id_param: params.appointmentId,
        new_status: params.newStatus,
        notes_param: params.notes || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Appointment Updated',
        description: 'Appointment status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update appointment.',
        variant: 'destructive',
      });
    },
  });
}

// ============================================================================
// TELEMEDICINE HOOKS
// ============================================================================

/**
 * Create telemedicine session
 */
export function useCreateTelemedicineSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      patientId: string;
      originalVisitId: string;
      doctorId: string;
      sessionType: string;
      scheduledTime: string;
      meetingLink?: string;
    }) => {
      const { data, error } = await supabase.rpc('create_telemedicine_session', {
        patient_id_param: params.patientId,
        original_visit_id_param: params.originalVisitId,
        doctor_id_param: params.doctorId,
        session_type_param: params.sessionType,
        scheduled_time_param: params.scheduledTime,
        meeting_link_param: params.meetingLink || null
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-telemedicine-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Session Scheduled',
        description: 'Telemedicine session has been scheduled successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create telemedicine session.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get doctor's telemedicine sessions
 */
export function useDoctorTelemedicineSessions(
  doctorId: string,
  startDate?: string,
  endDate?: string,
  statusFilter?: string
) {
  return useQuery<TelemedicineSession[]>({
    queryKey: ['doctor-telemedicine-sessions', doctorId, startDate, endDate, statusFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_telemedicine_sessions', {
        doctor_id_param: doctorId,
        start_date: startDate || new Date().toISOString(),
        end_date: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status_filter: statusFilter || null
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!doctorId,
  });
}

/**
 * Update telemedicine session
 */
export function useUpdateTelemedicineSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      sessionId: string;
      newStatus?: string;
      startTime?: string;
      endTime?: string;
      sessionNotes?: string;
      prescriptionsIssued?: boolean;
      followUpRequired?: boolean;
      nextAppointmentDate?: string;
    }) => {
      const { data, error } = await supabase.rpc('update_telemedicine_session', {
        session_id_param: params.sessionId,
        new_status: params.newStatus || null,
        start_time_param: params.startTime || null,
        end_time_param: params.endTime || null,
        session_notes_param: params.sessionNotes || null,
        prescriptions_issued_param: params.prescriptionsIssued || null,
        follow_up_required_param: params.followUpRequired || null,
        next_appointment_date_param: params.nextAppointmentDate || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-telemedicine-sessions'] });
      toast({
        title: 'Session Updated',
        description: 'Telemedicine session has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update telemedicine session.',
        variant: 'destructive',
      });
    },
  });
}

// ============================================================================
// DISCHARGE & AFTERCARE HOOKS
// ============================================================================

/**
 * Discharge patient
 */
export function useDischargePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      visitId: string;
      dischargeSummary: string;
      followUpRequired?: boolean;
      telemedicineEnabled?: boolean;
    }) => {
      const { data, error } = await supabase.rpc('discharge_patient', {
        visit_id_param: params.visitId,
        discharge_summary_param: params.dischargeSummary,
        follow_up_required_param: params.followUpRequired || false,
        telemedicine_enabled_param: params.telemedicineEnabled || false
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-patients'] });
      queryClient.invalidateQueries({ queryKey: ['visit-details'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Patient Discharged',
        description: 'Patient has been discharged successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to discharge patient.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Create aftercare plan
 */
export function useCreateAftercarePlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      patientId: string;
      visitId: string;
      doctorId: string;
      planDetails: string;
      medications?: string[];
      activityRestrictions?: string;
      dietInstructions?: string;
      warningSigns?: string;
      followUpSchedule?: string;
      emergencyContactNumber?: string;
      telemedicineEnabled?: boolean;
    }) => {
      const { data, error } = await supabase.rpc('create_aftercare_plan', {
        patient_id_param: params.patientId,
        visit_id_param: params.visitId,
        doctor_id_param: params.doctorId,
        plan_details_param: params.planDetails,
        medications_param: params.medications || null,
        activity_restrictions_param: params.activityRestrictions || null,
        diet_instructions_param: params.dietInstructions || null,
        warning_signs_param: params.warningSigns || null,
        follow_up_schedule_param: params.followUpSchedule || null,
        emergency_contact_number_param: params.emergencyContactNumber || null,
        telemedicine_enabled_param: params.telemedicineEnabled || true
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-aftercare-plans'] });
      toast({
        title: 'Aftercare Plan Created',
        description: 'Aftercare plan has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create aftercare plan.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get patient's aftercare plans
 */
export function usePatientAftercarePlans(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-aftercare-plans', patientId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_patient_aftercare_plans', {
        patient_id_param: patientId
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId,
  });
}

// ============================================================================
// DASHBOARD STATISTICS HOOKS
// ============================================================================

/**
 * Get doctor dashboard statistics
 */
export function useDoctorDashboardStats(doctorId: string) {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', doctorId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_dashboard_stats', {
        doctor_id_param: doctorId
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!doctorId,
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Get doctor's recent activity
 */
export function useDoctorRecentActivity(doctorId: string, limit: number = 20) {
  return useQuery({
    queryKey: ['doctor-recent-activity', doctorId, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_recent_activity', {
        doctor_id_param: doctorId,
        limit_param: limit
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!doctorId,
  });
}
