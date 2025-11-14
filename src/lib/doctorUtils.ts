/**
 * HospitalGuard: Doctor Dashboard Utility Functions
 * Helper functions for doctor operations
 */

import QRCode from 'qrcode';

// ============================================================================
// PRESCRIPTION UTILITIES
// ============================================================================

/**
 * Generate QR code for prescription
 */
export async function generatePrescriptionQRCode(
  prescriptionData: {
    prescription_number: string;
    patient_id: string;
    doctor_id: string;
    created_at: string;
  }
): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(prescriptionData), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate digital signature for prescription
 * In production, this would use proper cryptographic signing
 */
export function generateDigitalSignature(
  doctorId: string,
  prescriptionNumber: string,
  timestamp: string
): string {
  // For now, this is a simple hash. In production, use proper digital signatures
  const signatureData = `${doctorId}-${prescriptionNumber}-${timestamp}`;
  return btoa(signatureData); // Base64 encode for now
}

/**
 * Validate prescription items
 */
export function validatePrescriptionItems(items: any[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!items || items.length === 0) {
    errors.push('At least one medication is required');
    return { valid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.medication_name || item.medication_name.trim() === '') {
      errors.push(`Medication ${index + 1}: Name is required`);
    }
    if (!item.dosage || item.dosage.trim() === '') {
      errors.push(`Medication ${index + 1}: Dosage is required`);
    }
    if (!item.frequency || item.frequency.trim() === '') {
      errors.push(`Medication ${index + 1}: Frequency is required`);
    }
    if (!item.duration || item.duration.trim() === '') {
      errors.push(`Medication ${index + 1}: Duration is required`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Medication ${index + 1}: Valid quantity is required`);
    }
  });

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// VITAL SIGNS UTILITIES
// ============================================================================

/**
 * Parse vital signs from form data
 */
export function parseVitalSigns(formData: any): any {
  return {
    blood_pressure: formData.blood_pressure || null,
    heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
    temperature: formData.temperature ? parseFloat(formData.temperature) : null,
    respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate) : null,
    oxygen_saturation: formData.oxygen_saturation ? parseInt(formData.oxygen_saturation) : null,
    weight: formData.weight ? parseFloat(formData.weight) : null,
    height: formData.height ? parseFloat(formData.height) : null,
    bmi: formData.bmi ? parseFloat(formData.bmi) : null,
    recorded_at: new Date().toISOString(),
  };
}

/**
 * Calculate BMI
 */
export function calculateBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

/**
 * Validate vital signs
 */
export function validateVitalSigns(vitals: any): {
  valid: boolean;
  warnings: string[];
  critical: string[];
} {
  const warnings: string[] = [];
  const critical: string[] = [];

  // Blood Pressure
  if (vitals.blood_pressure) {
    const [systolic, diastolic] = vitals.blood_pressure.split('/').map((v: string) => parseInt(v));
    if (systolic >= 180 || diastolic >= 120) {
      critical.push('Hypertensive crisis - BP critically high');
    } else if (systolic >= 140 || diastolic >= 90) {
      warnings.push('Elevated blood pressure detected');
    } else if (systolic < 90 || diastolic < 60) {
      warnings.push('Low blood pressure detected');
    }
  }

  // Heart Rate
  if (vitals.heart_rate) {
    if (vitals.heart_rate > 120) {
      warnings.push('Tachycardia - Heart rate elevated');
    } else if (vitals.heart_rate < 60) {
      warnings.push('Bradycardia - Heart rate low');
    }
    if (vitals.heart_rate > 150) {
      critical.push('Severe tachycardia detected');
    }
  }

  // Temperature (Celsius)
  if (vitals.temperature) {
    if (vitals.temperature >= 39.5) {
      critical.push('High fever - Temperature critically elevated');
    } else if (vitals.temperature >= 38) {
      warnings.push('Fever detected');
    } else if (vitals.temperature < 35) {
      critical.push('Hypothermia detected');
    } else if (vitals.temperature < 36) {
      warnings.push('Low body temperature');
    }
  }

  // Oxygen Saturation
  if (vitals.oxygen_saturation) {
    if (vitals.oxygen_saturation < 90) {
      critical.push('Critical oxygen saturation level');
    } else if (vitals.oxygen_saturation < 95) {
      warnings.push('Low oxygen saturation');
    }
  }

  // Respiratory Rate
  if (vitals.respiratory_rate) {
    if (vitals.respiratory_rate > 24) {
      warnings.push('Tachypnea - Elevated respiratory rate');
    } else if (vitals.respiratory_rate < 12) {
      warnings.push('Bradypnea - Low respiratory rate');
    }
    if (vitals.respiratory_rate > 30 || vitals.respiratory_rate < 8) {
      critical.push('Critical respiratory rate');
    }
  }

  return {
    valid: critical.length === 0,
    warnings,
    critical,
  };
}

// ============================================================================
// TRIAGE UTILITIES
// ============================================================================

/**
 * Get triage level color
 */
export function getTriageLevelColor(triageLevel: string): string {
  switch (triageLevel) {
    case 'critical':
      return 'bg-red-500';
    case 'urgent':
      return 'bg-orange-500';
    case 'semi_urgent':
      return 'bg-yellow-500';
    case 'non_urgent':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Get triage level badge variant
 */
export function getTriageLevelBadge(triageLevel: string): 'destructive' | 'default' | 'secondary' {
  switch (triageLevel) {
    case 'critical':
    case 'urgent':
      return 'destructive';
    case 'semi_urgent':
      return 'default';
    case 'non_urgent':
      return 'secondary';
    default:
      return 'default';
  }
}

// ============================================================================
// VISIT STATUS UTILITIES
// ============================================================================

/**
 * Get visit status color
 */
export function getVisitStatusColor(status: string): string {
  switch (status) {
    case 'checked_in':
      return 'text-blue-600';
    case 'in_consultation':
      return 'text-purple-600';
    case 'in_treatment':
      return 'text-indigo-600';
    case 'awaiting_lab':
      return 'text-yellow-600';
    case 'awaiting_pharmacy':
      return 'text-orange-600';
    case 'discharged':
      return 'text-green-600';
    case 'transferred':
      return 'text-gray-600';
    case 'admitted':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get visit status label
 */
export function getVisitStatusLabel(status: string): string {
  switch (status) {
    case 'checked_in':
      return 'Checked In';
    case 'in_consultation':
      return 'In Consultation';
    case 'in_treatment':
      return 'In Treatment';
    case 'awaiting_lab':
      return 'Awaiting Lab Results';
    case 'awaiting_pharmacy':
      return 'Awaiting Pharmacy';
    case 'discharged':
      return 'Discharged';
    case 'transferred':
      return 'Transferred';
    case 'admitted':
      return 'Admitted';
    default:
      return status;
  }
}

// ============================================================================
// APPOINTMENT UTILITIES
// ============================================================================

/**
 * Get appointment type icon
 */
export function getAppointmentTypeIcon(appointmentType: string): string {
  switch (appointmentType) {
    case 'consultation':
      return 'Stethoscope';
    case 'follow_up':
      return 'Calendar';
    case 'procedure':
      return 'Activity';
    case 'lab':
      return 'TestTube';
    case 'radiology':
      return 'Scan';
    case 'telemedicine':
      return 'Video';
    default:
      return 'Calendar';
  }
}

/**
 * Format appointment time range
 */
export function formatAppointmentTime(scheduledTime: string, durationMinutes: number): string {
  const startTime = new Date(scheduledTime);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const timeFormat = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${timeFormat.format(startTime)} - ${timeFormat.format(endTime)}`;
}

/**
 * Check if appointment is upcoming
 */
export function isAppointmentUpcoming(scheduledTime: string): boolean {
  return new Date(scheduledTime) > new Date();
}

/**
 * Check if appointment is today
 */
export function isAppointmentToday(scheduledTime: string): boolean {
  const appointmentDate = new Date(scheduledTime);
  const today = new Date();
  return (
    appointmentDate.getDate() === today.getDate() &&
    appointmentDate.getMonth() === today.getMonth() &&
    appointmentDate.getFullYear() === today.getFullYear()
  );
}

// ============================================================================
// PRESCRIPTION STATUS UTILITIES
// ============================================================================

/**
 * Get prescription status color
 */
export function getPrescriptionStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600';
    case 'signed':
      return 'text-blue-600';
    case 'dispensed':
      return 'text-green-600';
    case 'partially_dispensed':
      return 'text-orange-600';
    case 'cancelled':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get prescription status label
 */
export function getPrescriptionStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending Signature';
    case 'signed':
      return 'Signed';
    case 'dispensed':
      return 'Dispensed';
    case 'partially_dispensed':
      return 'Partially Dispensed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

// ============================================================================
// DATE/TIME UTILITIES
// ============================================================================

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

/**
 * Format time for display
 */
export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string | Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// ============================================================================
// PATIENT INFORMATION UTILITIES
// ============================================================================

/**
 * Format patient name
 */
export function formatPatientName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/**
 * Get patient initials
 */
export function getPatientInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Format allergies for display
 */
export function formatAllergies(allergies: string[] | null): string {
  if (!allergies || allergies.length === 0) {
    return 'No known allergies';
  }
  return allergies.join(', ');
}

// ============================================================================
// LAB & RADIOLOGY UTILITIES
// ============================================================================

/**
 * Get order urgency color
 */
export function getOrderUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'stat':
      return 'text-red-600';
    case 'urgent':
      return 'text-orange-600';
    case 'routine':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get order urgency badge variant
 */
export function getOrderUrgencyBadge(urgency: string): 'destructive' | 'default' | 'secondary' {
  switch (urgency) {
    case 'stat':
      return 'destructive';
    case 'urgent':
      return 'default';
    case 'routine':
      return 'secondary';
    default:
      return 'default';
  }
}

/**
 * Get imaging type label
 */
export function getImagingTypeLabel(imagingType: string): string {
  switch (imagingType) {
    case 'x_ray':
      return 'X-Ray';
    case 'ct_scan':
      return 'CT Scan';
    case 'mri':
      return 'MRI';
    case 'ultrasound':
      return 'Ultrasound';
    case 'mammography':
      return 'Mammography';
    case 'pet_scan':
      return 'PET Scan';
    default:
      return imagingType;
  }
}

// ============================================================================
// CURRENCY UTILITIES
// ============================================================================

/**
 * Format currency in Kenyan Shillings
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(amount);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Kenyan format)
 */
export function isValidPhone(phone: string): boolean {
  // Kenyan phone numbers: +254... or 07... or 01...
  const phoneRegex = /^(\+254|0)[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove spaces and special characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as +254 7XX XXX XXX
  if (cleaned.startsWith('254')) {
    return `+254 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  } else if (cleaned.startsWith('0')) {
    return `0${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

/**
 * Print document
 */
export function printDocument(elementId: string): void {
  const printContent = document.getElementById(elementId);
  if (!printContent) return;

  const windowPrint = window.open('', '', 'width=800,height=600');
  if (!windowPrint) return;

  windowPrint.document.write('<html><head><title>Print</title>');
  windowPrint.document.write('<link rel="stylesheet" href="/styles.css">');
  windowPrint.document.write('</head><body>');
  windowPrint.document.write(printContent.innerHTML);
  windowPrint.document.write('</body></html>');
  windowPrint.document.close();
  windowPrint.focus();
  windowPrint.print();
  windowPrint.close();
}
