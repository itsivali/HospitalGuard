/**
 * HospitalGuard: Create Prescription Form Component
 * Complete form for doctors to create prescriptions with medication selection
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  User,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  useCreatePrescription,
  useAvailableMedications,
  useDoctorPatients,
  useAllPatientsSearch,
  MedicationItem,
  PatientForPrescription,
  AvailableMedication
} from '@/hooks/usePrescriptionCRUD';

interface CreatePrescriptionFormProps {
  doctorId: string;
  doctorName: string;
  doctorLicense: string;
  preselectedPatient?: PatientForPrescription;
  preselectedVisitId?: string;
  onSuccess?: (prescriptionId: string, prescriptionNumber: string) => void;
  onCancel?: () => void;
}

interface MedicationFormItem extends MedicationItem {
  tempId: string;
}

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'At bedtime',
  'With meals',
  'Before meals',
  'After meals'
];

const DURATION_OPTIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '30 days',
  '60 days',
  '90 days',
  'Until finished',
  'Ongoing'
];

const DOSAGE_FORMS = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Cream',
  'Ointment',
  'Drops',
  'Inhaler',
  'Patch',
  'Suppository'
];

export function CreatePrescriptionForm({
  doctorId,
  doctorName,
  doctorLicense,
  preselectedPatient,
  preselectedVisitId,
  onSuccess,
  onCancel
}: CreatePrescriptionFormProps) {
  const { toast } = useToast();
  const createPrescription = useCreatePrescription();

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<PatientForPrescription | null>(
    preselectedPatient || null
  );
  const [visitId, setVisitId] = useState<string | undefined>(preselectedVisitId);
  const [medications, setMedications] = useState<MedicationFormItem[]>([]);
  const [notes, setNotes] = useState('');
  const [refillsAllowed, setRefillsAllowed] = useState(0);
  const [validDays, setValidDays] = useState(30);
  const [isControlledSubstance, setIsControlledSubstance] = useState(false);

  // Search state
  const [patientSearch, setPatientSearch] = useState('');
  const [medicationSearch, setMedicationSearch] = useState('');
  const [patientPopoverOpen, setPatientPopoverOpen] = useState(false);
  const [medicationPopoverOpen, setMedicationPopoverOpen] = useState(false);
  const [expandedMedications, setExpandedMedications] = useState<Set<string>>(new Set());

  // Data fetching
  const { data: doctorPatients = [] } = useDoctorPatients(doctorId, patientSearch);
  const { data: searchedPatients = [] } = useAllPatientsSearch(patientSearch);
  const { data: availableMedications = [] } = useAvailableMedications(medicationSearch);

  // Combine doctor's patients with searched patients
  const allPatients = patientSearch.length >= 2
    ? [...new Map([...doctorPatients, ...searchedPatients].map(p => [p.patient_id, p])).values()]
    : doctorPatients;

  // Auto-detect controlled substances
  useEffect(() => {
    const hasControlled = medications.some(m => m.is_controlled_substance);
    setIsControlledSubstance(hasControlled);
    if (hasControlled) {
      setValidDays(Math.min(validDays, 7)); // Max 7 days for controlled substances
    }
  }, [medications]);

  const addMedication = (medication?: AvailableMedication) => {
    const newMed: MedicationFormItem = {
      tempId: Date.now().toString(),
      medication_name: medication?.medication_name || '',
      dosage: '',
      frequency: 'Once daily',
      duration: '7 days',
      quantity: 1,
      instructions: '',
      is_controlled_substance: medication?.is_controlled_substance || false
    };
    setMedications([...medications, newMed]);
    setExpandedMedications(prev => new Set([...prev, newMed.tempId]));
    setMedicationPopoverOpen(false);
    setMedicationSearch('');
  };

  const updateMedication = (tempId: string, field: keyof MedicationFormItem, value: any) => {
    setMedications(medications.map(med =>
      med.tempId === tempId ? { ...med, [field]: value } : med
    ));
  };

  const removeMedication = (tempId: string) => {
    setMedications(medications.filter(med => med.tempId !== tempId));
    setExpandedMedications(prev => {
      const next = new Set(prev);
      next.delete(tempId);
      return next;
    });
  };

  const toggleMedicationExpand = (tempId: string) => {
    setExpandedMedications(prev => {
      const next = new Set(prev);
      if (next.has(tempId)) {
        next.delete(tempId);
      } else {
        next.add(tempId);
      }
      return next;
    });
  };

  const selectPatient = (patient: PatientForPrescription) => {
    setSelectedPatient(patient);
    setVisitId(patient.active_visit_id || undefined);
    setPatientPopoverOpen(false);
    setPatientSearch('');
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!selectedPatient) {
      errors.push('Please select a patient');
    }

    if (medications.length === 0) {
      errors.push('Please add at least one medication');
    }

    medications.forEach((med, index) => {
      if (!med.medication_name.trim()) {
        errors.push(`Medication ${index + 1}: Name is required`);
      }
      if (!med.dosage.trim()) {
        errors.push(`Medication ${index + 1}: Dosage is required`);
      }
      if (med.quantity < 1) {
        errors.push(`Medication ${index + 1}: Quantity must be at least 1`);
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors[0],
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await createPrescription.mutateAsync({
        patient_id: selectedPatient!.patient_id,
        doctor_id: doctorId,
        visit_id: visitId,
        medications: medications.map(({ tempId, ...med }) => med),
        notes: notes || undefined,
        is_controlled_substance: isControlledSubstance,
        refills_allowed: refillsAllowed,
        valid_days: validDays
      });

      if (result && onSuccess) {
        onSuccess(result.prescription_id, result.prescription_number);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const hasAllergies = selectedPatient?.allergies && selectedPatient.allergies.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Pill className="w-6 h-6 text-primary" />
            Create Prescription
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Prescribing as Dr. {doctorName} ({doctorLicense})
          </p>
        </div>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {selectedPatient.patient_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedPatient.patient_name}</h4>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{selectedPatient.age} years old</span>
                      {selectedPatient.gender && <span>• {selectedPatient.gender}</span>}
                      {selectedPatient.blood_type && (
                        <Badge variant="outline" className="text-xs">{selectedPatient.blood_type}</Badge>
                      )}
                    </div>
                    {selectedPatient.patient_phone && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedPatient.patient_phone}</p>
                    )}
                    {selectedPatient.active_visit_number && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        Active Visit: {selectedPatient.active_visit_number}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                  Change
                </Button>
              </div>

              {/* Allergy Warning */}
              {hasAllergies && (
                <Alert className="border-yellow-500 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <span className="font-semibold">Known Allergies:</span>{' '}
                    {selectedPatient.allergies?.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Popover open={patientPopoverOpen} onOpenChange={setPatientPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  Search for a patient...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search by name, phone, or email..."
                    value={patientSearch}
                    onValueChange={setPatientSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No patients found</CommandEmpty>
                    <CommandGroup heading="Patients">
                      {allPatients.map(patient => (
                        <CommandItem
                          key={patient.patient_id}
                          onSelect={() => selectPatient(patient)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold">
                              {patient.patient_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{patient.patient_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {patient.age} yrs • {patient.patient_phone || 'No phone'}
                              </p>
                            </div>
                            {patient.has_active_visit && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Active
                              </Badge>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Medications ({medications.length})
            </CardTitle>
            <Popover open={medicationPopoverOpen} onOpenChange={setMedicationPopoverOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" className="btn-press">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="Search medications..."
                    value={medicationSearch}
                    onValueChange={setMedicationSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="py-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">No medications found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addMedication()}
                        >
                          Add Custom Medication
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Available Medications">
                      {availableMedications.map(med => (
                        <CommandItem
                          key={med.medication_id}
                          onSelect={() => addMedication(med)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p className="font-medium">{med.medication_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {med.generic_name || med.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {med.is_controlled_substance && (
                                <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                                  Controlled
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {med.quantity_available} in stock
                              </Badge>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No medications added yet</p>
              <p className="text-xs mt-1">Click "Add Medication" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {medications.map((med, index) => (
                  <motion.div
                    key={med.tempId}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border rounded-lg overflow-hidden"
                  >
                    {/* Medication Header */}
                    <div
                      className="p-3 bg-muted/50 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleMedicationExpand(med.tempId)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">
                            {med.medication_name || 'New Medication'}
                          </p>
                          {med.dosage && (
                            <p className="text-xs text-muted-foreground">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                          )}
                        </div>
                        {med.is_controlled_substance && (
                          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                            Controlled
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMedication(med.tempId);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        {expandedMedications.has(med.tempId) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* Medication Details */}
                    {expandedMedications.has(med.tempId) && (
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label>Medication Name *</Label>
                            <Input
                              value={med.medication_name}
                              onChange={(e) => updateMedication(med.tempId, 'medication_name', e.target.value)}
                              placeholder="Enter medication name"
                            />
                          </div>

                          <div>
                            <Label>Dosage *</Label>
                            <Input
                              value={med.dosage}
                              onChange={(e) => updateMedication(med.tempId, 'dosage', e.target.value)}
                              placeholder="e.g., 500mg, 10ml"
                            />
                          </div>

                          <div>
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={med.quantity}
                              onChange={(e) => updateMedication(med.tempId, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>

                          <div>
                            <Label>Frequency</Label>
                            <Select
                              value={med.frequency}
                              onValueChange={(value) => updateMedication(med.tempId, 'frequency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FREQUENCY_OPTIONS.map(opt => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Duration</Label>
                            <Select
                              value={med.duration}
                              onValueChange={(value) => updateMedication(med.tempId, 'duration', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DURATION_OPTIONS.map(opt => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-2">
                            <Label>Special Instructions</Label>
                            <Input
                              value={med.instructions || ''}
                              onChange={(e) => updateMedication(med.tempId, 'instructions', e.target.value)}
                              placeholder="e.g., Take with food, Avoid alcohol"
                            />
                          </div>

                          <div className="col-span-2 flex items-center gap-2">
                            <Switch
                              checked={med.is_controlled_substance || false}
                              onCheckedChange={(checked) => updateMedication(med.tempId, 'is_controlled_substance', checked)}
                            />
                            <Label className="font-normal cursor-pointer">
                              Controlled Substance
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Prescription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional instructions or notes for the pharmacist..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valid For (Days)</Label>
              <Select
                value={validDays.toString()}
                onValueChange={(value) => setValidDays(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isControlledSubstance ? (
                    <>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days (max for controlled)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Refills Allowed</Label>
              <Select
                value={refillsAllowed.toString()}
                onValueChange={(value) => setRefillsAllowed(parseInt(value))}
                disabled={isControlledSubstance}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No refills</SelectItem>
                  <SelectItem value="1">1 refill</SelectItem>
                  <SelectItem value="2">2 refills</SelectItem>
                  <SelectItem value="3">3 refills</SelectItem>
                  <SelectItem value="5">5 refills</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Controlled Substance Warning */}
          {isControlledSubstance && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <Shield className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This prescription contains controlled substances. Maximum validity is 7 days
                and refills are not allowed. Additional verification will be required.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Summary & Actions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold">Prescription Summary</h4>
              <p className="text-sm text-muted-foreground">
                {medications.length} medication(s) • Valid for {validDays} days
                {refillsAllowed > 0 && ` • ${refillsAllowed} refill(s)`}
              </p>
            </div>
            {isControlledSubstance && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Contains Controlled Substance
              </Badge>
            )}
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={createPrescription.isPending || !selectedPatient || medications.length === 0}
              className="flex-1 btn-press gradient-royal text-white"
            >
              {createPrescription.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Prescription
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-3">
            Prescription will be created as pending. You can sign it to generate a QR code.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreatePrescriptionForm;
