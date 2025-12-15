/**
 * HospitalGuard: Prescription Security Utilities
 * Cryptographic functions for secure digital prescription signing and verification
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PrescriptionQRPayload {
  // Core prescription data
  rx: string;           // Prescription number (e.g., RX-20251215-0001)
  pid: string;          // Patient ID (UUID)
  did: string;          // Doctor ID (UUID)
  vid?: string;         // Visit ID (UUID, optional for follow-up prescriptions)

  // Security fields
  iat: number;          // Issued at (Unix timestamp)
  exp: number;          // Expiry timestamp (Unix timestamp)
  sig: string;          // Digital signature (HMAC-SHA256)
  ver: string;          // Version of the QR format

  // Verification URL
  url: string;          // Full verification URL
}

export interface PrescriptionSigningData {
  prescriptionNumber: string;
  patientId: string;
  doctorId: string;
  doctorLicense: string;
  doctorName: string;
  visitId?: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }>;
  issuedAt: Date;
  validUntil: Date;
  isControlledSubstance: boolean;
  hospitalId?: string;
}

export interface VerificationResult {
  isValid: boolean;
  status: 'valid' | 'expired' | 'tampered' | 'invalid' | 'revoked';
  message: string;
  prescription?: PrescriptionSigningData;
  verifiedAt: Date;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const QR_VERSION = '1.0';
const HOSPITAL_ID = 'HG-L1TC-001'; // HospitalGuard Level 1 Trauma Center

// For production, this would be stored securely (env variable/secret manager)
// Using a deterministic key derived from hospital info for demo
const SIGNING_SECRET = 'HospitalGuard-SecureRx-2025-L1TC';

// ============================================================================
// CRYPTOGRAPHIC UTILITIES
// ============================================================================

/**
 * Generate HMAC-SHA256 signature using Web Crypto API
 */
async function generateHMAC(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify HMAC-SHA256 signature
 */
async function verifyHMAC(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await generateHMAC(data, secret);
  return signature === expectedSignature;
}

/**
 * Generate a unique prescription fingerprint
 */
function generatePrescriptionFingerprint(data: PrescriptionSigningData): string {
  const medicationsHash = data.medications
    .map(m => `${m.name}|${m.dosage}|${m.frequency}|${m.duration}|${m.quantity}`)
    .sort()
    .join(';');

  return [
    data.prescriptionNumber,
    data.patientId,
    data.doctorId,
    data.doctorLicense,
    medicationsHash,
    data.issuedAt.toISOString(),
    data.validUntil.toISOString(),
    data.isControlledSubstance ? '1' : '0',
    HOSPITAL_ID
  ].join('::');
}

// ============================================================================
// SIGNATURE GENERATION
// ============================================================================

/**
 * Generate a secure digital signature for a prescription
 * This creates a cryptographic proof that the prescription was issued by a specific doctor
 */
export async function signPrescription(data: PrescriptionSigningData): Promise<string> {
  const fingerprint = generatePrescriptionFingerprint(data);
  const signature = await generateHMAC(fingerprint, SIGNING_SECRET);

  // Create a composite signature that includes metadata
  const compositeSignature = {
    sig: signature,
    ver: QR_VERSION,
    ts: data.issuedAt.getTime(),
    dl: data.doctorLicense,
    dn: data.doctorName,
    hid: HOSPITAL_ID
  };

  return btoa(JSON.stringify(compositeSignature));
}

/**
 * Verify a prescription's digital signature
 */
export async function verifyPrescriptionSignature(
  data: PrescriptionSigningData,
  signature: string
): Promise<boolean> {
  try {
    const decoded = JSON.parse(atob(signature));
    const fingerprint = generatePrescriptionFingerprint(data);
    return await verifyHMAC(fingerprint, decoded.sig, SIGNING_SECRET);
  } catch {
    return false;
  }
}

// ============================================================================
// QR CODE GENERATION
// ============================================================================

/**
 * Generate secure QR code payload for a prescription
 * This creates a compact, signed payload that can be encoded in a QR code
 */
export async function generatePrescriptionQRPayload(
  data: PrescriptionSigningData,
  baseUrl: string = window.location.origin
): Promise<PrescriptionQRPayload> {
  const issuedAtTimestamp = Math.floor(data.issuedAt.getTime() / 1000);
  const expiryTimestamp = Math.floor(data.validUntil.getTime() / 1000);

  // Create signing data string for the QR payload
  const signingString = [
    data.prescriptionNumber,
    data.patientId,
    data.doctorId,
    issuedAtTimestamp.toString(),
    expiryTimestamp.toString()
  ].join(':');

  const signature = await generateHMAC(signingString, SIGNING_SECRET);

  const payload: PrescriptionQRPayload = {
    rx: data.prescriptionNumber,
    pid: data.patientId,
    did: data.doctorId,
    vid: data.visitId,
    iat: issuedAtTimestamp,
    exp: expiryTimestamp,
    sig: signature.substring(0, 32), // Use first 32 chars for compact QR
    ver: QR_VERSION,
    url: `${baseUrl}/verify-prescription/${data.prescriptionNumber}`
  };

  return payload;
}

/**
 * Generate compact QR code string
 * Uses a condensed format to keep QR code size manageable
 */
export function encodeQRPayload(payload: PrescriptionQRPayload): string {
  // Compact format: rx|pid|did|iat|exp|sig|ver
  return btoa(JSON.stringify(payload));
}

/**
 * Decode QR code payload string
 */
export function decodeQRPayload(encoded: string): PrescriptionQRPayload | null {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

// ============================================================================
// VERIFICATION
// ============================================================================

/**
 * Verify a scanned QR code payload
 * Returns verification status and prescription details if valid
 */
export async function verifyQRPayload(
  payload: PrescriptionQRPayload
): Promise<{ isValid: boolean; status: string; message: string }> {
  try {
    // Check version compatibility
    if (payload.ver !== QR_VERSION) {
      return {
        isValid: false,
        status: 'invalid',
        message: 'QR code version not supported'
      };
    }

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (now > payload.exp) {
      return {
        isValid: false,
        status: 'expired',
        message: 'This prescription has expired'
      };
    }

    // Verify signature
    const signingString = [
      payload.rx,
      payload.pid,
      payload.did,
      payload.iat.toString(),
      payload.exp.toString()
    ].join(':');

    const expectedSignature = await generateHMAC(signingString, SIGNING_SECRET);
    const isSignatureValid = expectedSignature.startsWith(payload.sig);

    if (!isSignatureValid) {
      return {
        isValid: false,
        status: 'tampered',
        message: 'Prescription signature verification failed - may have been tampered with'
      };
    }

    return {
      isValid: true,
      status: 'valid',
      message: 'Prescription verified successfully'
    };
  } catch {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Invalid QR code format'
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a verification code for manual entry
 * This is a 6-digit code derived from the prescription number and signature
 */
export async function generateVerificationCode(
  prescriptionNumber: string,
  signature: string
): Promise<string> {
  const hash = await generateHMAC(`${prescriptionNumber}:${signature}`, SIGNING_SECRET);
  // Extract 6 numeric digits from the hash
  const numericCode = hash.replace(/[^0-9]/g, '').substring(0, 6).padEnd(6, '0');
  return numericCode;
}

/**
 * Format prescription number for display
 */
export function formatPrescriptionNumber(number: string): string {
  return number.replace(/^RX-/, 'RX ').replace(/-/g, ' ');
}

/**
 * Check if a prescription is a controlled substance
 */
export function isControlledSubstance(medications: Array<{ is_controlled_substance?: boolean }>): boolean {
  return medications.some(m => m.is_controlled_substance);
}

/**
 * Calculate prescription validity period
 */
export function calculateValidityPeriod(
  issuedAt: Date,
  isControlledSubstance: boolean,
  customDays?: number
): Date {
  const validDays = customDays ?? (isControlledSubstance ? 7 : 30);
  const validUntil = new Date(issuedAt);
  validUntil.setDate(validUntil.getDate() + validDays);
  return validUntil;
}

/**
 * Get signature display info from composite signature
 */
export function parseSignature(signature: string): {
  doctorName: string;
  doctorLicense: string;
  signedAt: Date;
  hospitalId: string;
} | null {
  try {
    const decoded = JSON.parse(atob(signature));
    return {
      doctorName: decoded.dn,
      doctorLicense: decoded.dl,
      signedAt: new Date(decoded.ts),
      hospitalId: decoded.hid
    };
  } catch {
    return null;
  }
}

/**
 * Generate prescription hash for audit trail
 */
export async function generatePrescriptionHash(
  prescriptionNumber: string,
  patientId: string,
  doctorId: string,
  issuedAt: Date
): Promise<string> {
  const data = `${prescriptionNumber}:${patientId}:${doctorId}:${issuedAt.toISOString()}`;
  return await generateHMAC(data, SIGNING_SECRET);
}
