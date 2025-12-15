/**
 * HospitalGuard: Prescription CRUD Hooks
 * React hooks for managing prescriptions with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// Type Definitions
// ============================================================================

export interface MedicationItem {
  id?: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  is_controlled_substance?: boolean;
  dispensed_quantity?: number;
}

export interface CreatePrescriptionParams {
  patient_id: string;
  doctor_id: string;
  visit_id?: string;
  medications: MedicationItem[];
  notes?: string;
  is_controlled_substance?: boolean;
  refills_allowed?: number;
  valid_days?: number;
}

export interface UpdatePrescriptionParams {
  prescription_id: string;
  doctor_id: string;
  notes?: string;
  refills_allowed?: number;
  valid_days?: number;
  medications?: MedicationItem[];
}

export interface PrescriptionListItem {
  prescription_id: string;
  prescription_number: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string | null;
  visit_number: string | null;
  status: string;
  is_controlled_substance: boolean;
  items_count: number;
  total_quantity: number;
  valid_until: string;
  signed_at: string | null;
  created_at: string;
  is_expired: boolean;
}

export interface PrescriptionDetails {
  prescription_id: string;
  prescription_number: string;
  patient_id: string;
  patient_name: string;
  patient_dob: string;
  patient_gender: string | null;
  patient_phone: string | null;
  patient_allergies: string[] | null;
  visit_id: string | null;
  visit_number: string | null;
  doctor_id: string;
  doctor_name: string;
  doctor_license: string;
  doctor_specialization: string | null;
  department_id: string | null;
  department_name: string | null;
  status: string;
  qr_code_data: string | null;
  digital_signature: string | null;
  signed_at: string | null;
  notes: string | null;
  is_controlled_substance: boolean;
  refills_allowed: number;
  refills_used: number;
  valid_until: string;
  created_at: string;
  updated_at: string;
  items: MedicationItem[];
}

export interface PrescriptionStats {
  total_prescriptions: number;
  pending_count: number;
  signed_count: number;
  dispensed_count: number;
  cancelled_count: number;
  expired_count: number;
  controlled_substance_count: number;
  today_count: number;
  this_week_count: number;
  this_month_count: number;
}

export interface AvailableMedication {
  medication_id: string;
  medication_name: string;
  generic_name: string | null;
  category: string;
  manufacturer: string | null;
  unit_price: number | null;
  quantity_available: number;
  is_controlled_substance: boolean;
  requires_prescription: boolean;
  dosage_forms: string[];
  common_dosages: string[];
}

export interface PatientForPrescription {
  patient_id: string;
  patient_name: string;
  patient_phone: string | null;
  patient_email: string | null;
  date_of_birth: string;
  age: number;
  gender: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  has_active_visit: boolean;
  active_visit_id: string | null;
  active_visit_number: string | null;
  last_visit_date: string | null;
}

export interface DoctorInfo {
  doctor_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  license_number: string;
  specialization: string | null;
  department_id: string | null;
  department_name: string | null;
  status: string;
  can_prescribe_controlled: boolean;
}

export interface PrescriptionFilters {
  status?: string;
  patient_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// CREATE: Create Prescription
// ============================================================================

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreatePrescriptionParams) => {
      const { data, error } = await supabase.rpc('create_prescription', {
        p_patient_id: params.patient_id,
        p_doctor_id: params.doctor_id,
        p_visit_id: params.visit_id || null,
        p_medications: params.medications,
        p_notes: params.notes || null,
        p_is_controlled_substance: params.is_controlled_substance || false,
        p_refills_allowed: params.refills_allowed || 0,
        p_valid_days: params.valid_days || 30
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-stats'] });
      toast({
        title: 'Prescription Created',
        description: `Prescription ${data?.prescription_number} created successfully`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create prescription',
        variant: 'destructive'
      });
    }
  });
}

// ============================================================================
// READ: Get Prescription by ID
// ============================================================================

export function usePrescription(prescriptionId: string | null) {
  return useQuery<PrescriptionDetails | null>({
    queryKey: ['prescription', prescriptionId],
    queryFn: async () => {
      if (!prescriptionId) return null;

      const { data, error } = await supabase.rpc('get_prescription_by_id', {
        p_prescription_id: prescriptionId
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!prescriptionId
  });
}

// ============================================================================
// READ: Get Doctor's Prescriptions List
// ============================================================================

export function usePrescriptionsList(
  doctorId: string,
  filters?: PrescriptionFilters
) {
  return useQuery<PrescriptionListItem[]>({
    queryKey: ['prescriptions', doctorId, filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_prescriptions_list', {
        p_doctor_id: doctorId,
        p_status: filters?.status || null,
        p_patient_id: filters?.patient_id || null,
        p_from_date: filters?.from_date || null,
        p_to_date: filters?.to_date || null,
        p_search: filters?.search || null,
        p_limit: filters?.limit || 50,
        p_offset: filters?.offset || 0
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!doctorId
  });
}

// ============================================================================
// READ: Get Prescription Statistics
// ============================================================================

export function usePrescriptionStats(doctorId: string) {
  return useQuery<PrescriptionStats | null>({
    queryKey: ['prescription-stats', doctorId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_prescription_stats', {
        p_doctor_id: doctorId
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!doctorId
  });
}

// ============================================================================
// READ: Get Available Medications
// ============================================================================

export function useAvailableMedications(
  search?: string,
  category?: string,
  inStockOnly: boolean = true
) {
  return useQuery<AvailableMedication[]>({
    queryKey: ['medications', search, category, inStockOnly],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_medications_for_prescription', {
        p_search: search || null,
        p_category: category || null,
        p_in_stock_only: inStockOnly,
        p_limit: 50
      });

      if (error) throw error;
      return data || [];
    }
  });
}

// ============================================================================
// READ: Get Doctor's Patients
// ============================================================================

export function useDoctorPatients(
  doctorId: string,
  search?: string,
  activeOnly: boolean = false
) {
  return useQuery<PatientForPrescription[]>({
    queryKey: ['doctor-patients', doctorId, search, activeOnly],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_patients_for_prescription', {
        p_doctor_id: doctorId,
        p_search: search || null,
        p_active_only: activeOnly,
        p_limit: 50
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!doctorId
  });
}

// ============================================================================
// READ: Get Doctor Info
// ============================================================================

export function useDoctorInfo(userId?: string, doctorId?: string) {
  return useQuery<DoctorInfo | null>({
    queryKey: ['doctor-info', userId, doctorId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_doctor_info', {
        p_user_id: userId || null,
        p_doctor_id: doctorId || null
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!(userId || doctorId)
  });
}

// ============================================================================
// UPDATE: Update Prescription
// ============================================================================

export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UpdatePrescriptionParams) => {
      const { data, error } = await supabase.rpc('update_prescription', {
        p_prescription_id: params.prescription_id,
        p_doctor_id: params.doctor_id,
        p_notes: params.notes,
        p_refills_allowed: params.refills_allowed,
        p_valid_days: params.valid_days,
        p_medications: params.medications || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescription', variables.prescription_id] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: 'Prescription Updated',
        description: 'Prescription updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update prescription',
        variant: 'destructive'
      });
    }
  });
}

// ============================================================================
// UPDATE: Sign Prescription
// ============================================================================

export function useSignPrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      prescription_id: string;
      doctor_id: string;
      digital_signature: string;
      qr_code_data?: string;
    }) => {
      const { data, error } = await supabase.rpc('sign_prescription_with_qr', {
        p_prescription_id: params.prescription_id,
        p_doctor_id: params.doctor_id,
        p_digital_signature: params.digital_signature,
        p_qr_code_data: params.qr_code_data || null
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescription', variables.prescription_id] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-stats'] });
      toast({
        title: 'Prescription Signed',
        description: `Prescription ${data?.prescription_number} signed successfully`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign prescription',
        variant: 'destructive'
      });
    }
  });
}

// ============================================================================
// UPDATE: Cancel Prescription
// ============================================================================

export function useCancelPrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      prescription_id: string;
      doctor_id: string;
      cancellation_reason?: string;
    }) => {
      const { data, error } = await supabase.rpc('cancel_prescription', {
        p_prescription_id: params.prescription_id,
        p_doctor_id: params.doctor_id,
        p_cancellation_reason: params.cancellation_reason || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescription', variables.prescription_id] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-stats'] });
      toast({
        title: 'Prescription Cancelled',
        description: 'Prescription has been cancelled'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel prescription',
        variant: 'destructive'
      });
    }
  });
}

// ============================================================================
// DELETE: Delete Prescription
// ============================================================================

export function useDeletePrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      prescription_id: string;
      doctor_id: string;
    }) => {
      const { data, error } = await supabase.rpc('delete_prescription', {
        p_prescription_id: params.prescription_id,
        p_doctor_id: params.doctor_id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-stats'] });
      toast({
        title: 'Prescription Deleted',
        description: 'Prescription has been deleted'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete prescription',
        variant: 'destructive'
      });
    }
  });
}

// ============================================================================
// Duplicate Prescription
// ============================================================================

export function useDuplicatePrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      source_prescription_id: string;
      doctor_id: string;
      patient_id?: string;
      visit_id?: string;
    }) => {
      const { data, error } = await supabase.rpc('duplicate_prescription', {
        p_source_prescription_id: params.source_prescription_id,
        p_doctor_id: params.doctor_id,
        p_patient_id: params.patient_id || null,
        p_visit_id: params.visit_id || null
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-stats'] });
      toast({
        title: 'Prescription Duplicated',
        description: `New prescription ${data?.prescription_number} created`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to duplicate prescription',
        variant: 'destructive'
      });
    }
  });
}

// ============================================================================
// Utility: All Patients Search (for any doctor)
// ============================================================================

export function useAllPatientsSearch(search: string, limit: number = 20) {
  return useQuery<PatientForPrescription[]>({
    queryKey: ['all-patients-search', search],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          email,
          date_of_birth,
          gender,
          blood_type,
          allergies
        `)
        .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
        .limit(limit);

      if (error) throw error;

      // Transform to PatientForPrescription format
      return (data || []).map(p => ({
        patient_id: p.id,
        patient_name: `${p.first_name} ${p.last_name}`,
        patient_phone: p.phone,
        patient_email: p.email,
        date_of_birth: p.date_of_birth,
        age: p.date_of_birth
          ? Math.floor((new Date().getTime() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : 0,
        gender: p.gender,
        blood_type: p.blood_type,
        allergies: p.allergies,
        has_active_visit: false,
        active_visit_id: null,
        active_visit_number: null,
        last_visit_date: null
      }));
    },
    enabled: search.length >= 2
  });
}
