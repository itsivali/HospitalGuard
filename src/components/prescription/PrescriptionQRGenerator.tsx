/**
 * HospitalGuard: Prescription QR Code Generator Component
 * Allows doctors to digitally sign prescriptions and generate secure QR codes
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import {
  QrCode,
  FileSignature,
  Shield,
  CheckCircle,
  AlertTriangle,
  Download,
  Printer,
  Copy,
  Clock,
  User,
  Pill,
  Calendar,
  BadgeCheck,
  Info,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  signPrescription,
  generatePrescriptionQRPayload,
  encodeQRPayload,
  generateVerificationCode,
  PrescriptionSigningData
} from '@/lib/prescriptionSecurity';
import { formatDate, formatDateTime } from '@/lib/doctorUtils';

interface PrescriptionItem {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  is_controlled_substance?: boolean;
}

interface PrescriptionData {
  prescription_id: string;
  prescription_number: string;
  patient_id: string;
  patient_name: string;
  patient_age?: number;
  patient_allergies?: string[] | null;
  doctor_id: string;
  doctor_name: string;
  doctor_license: string;
  visit_id?: string;
  visit_number?: string;
  status: string;
  notes?: string | null;
  is_controlled_substance: boolean;
  refills_allowed: number;
  valid_until: string;
  created_at: string;
  items: PrescriptionItem[];
  digital_signature?: string | null;
  signed_at?: string | null;
}

interface PrescriptionQRGeneratorProps {
  prescription: PrescriptionData;
  onSign?: (prescriptionId: string, signature: string) => void;
  onClose?: () => void;
}

export function PrescriptionQRGenerator({
  prescription,
  onSign,
  onClose
}: PrescriptionQRGeneratorProps) {
  const { toast } = useToast();
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(!!prescription.digital_signature);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(prescription.digital_signature || null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const hasControlledSubstance = prescription.is_controlled_substance ||
    prescription.items.some(item => item.is_controlled_substance);

  // Generate QR code when prescription is signed
  useEffect(() => {
    if (isSigned && signature) {
      generateQRCode();
    }
  }, [isSigned, signature]);

  const generateQRCode = async () => {
    try {
      const signingData: PrescriptionSigningData = {
        prescriptionNumber: prescription.prescription_number,
        patientId: prescription.patient_id,
        doctorId: prescription.doctor_id,
        doctorLicense: prescription.doctor_license,
        doctorName: prescription.doctor_name,
        visitId: prescription.visit_id,
        medications: prescription.items.map(item => ({
          name: item.medication_name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity
        })),
        issuedAt: new Date(prescription.created_at),
        validUntil: new Date(prescription.valid_until),
        isControlledSubstance: hasControlledSubstance
      };

      const qrPayload = await generatePrescriptionQRPayload(signingData);
      const encodedPayload = encodeQRPayload(qrPayload);

      // Generate QR code image
      const qrCodeUrl = await QRCode.toDataURL(encodedPayload, {
        errorCorrectionLevel: 'H',
        width: 400,
        margin: 2,
        color: {
          dark: '#1e3a5f',
          light: '#ffffff'
        }
      });

      setQrCodeDataUrl(qrCodeUrl);

      // Generate verification code
      if (signature) {
        const code = await generateVerificationCode(prescription.prescription_number, signature);
        setVerificationCode(code);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive'
      });
    }
  };

  const handleSign = async () => {
    setIsSigning(true);
    try {
      const signingData: PrescriptionSigningData = {
        prescriptionNumber: prescription.prescription_number,
        patientId: prescription.patient_id,
        doctorId: prescription.doctor_id,
        doctorLicense: prescription.doctor_license,
        doctorName: prescription.doctor_name,
        visitId: prescription.visit_id,
        medications: prescription.items.map(item => ({
          name: item.medication_name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity
        })),
        issuedAt: new Date(prescription.created_at),
        validUntil: new Date(prescription.valid_until),
        isControlledSubstance: hasControlledSubstance
      };

      const digitalSignature = await signPrescription(signingData);
      setSignature(digitalSignature);
      setIsSigned(true);

      // Callback to parent component to save signature
      if (onSign) {
        onSign(prescription.prescription_id, digitalSignature);
      }

      toast({
        title: 'Prescription Signed',
        description: 'Digital signature applied successfully'
      });

      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error signing prescription:', error);
      toast({
        title: 'Signing Failed',
        description: 'Failed to apply digital signature',
        variant: 'destructive'
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `Prescription-${prescription.prescription_number}.png`;
    link.href = qrCodeDataUrl;
    link.click();

    toast({
      title: 'Downloaded',
      description: 'QR code saved to downloads'
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription.prescription_number}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Georgia', serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #1e3a5f;
          }
          .hospital-subtitle {
            font-size: 14px;
            color: #666;
          }
          .prescription-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0;
          }
          .rx-number {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a5f;
          }
          .date {
            color: #666;
          }
          .section {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .section-title {
            font-weight: bold;
            color: #1e3a5f;
            margin-bottom: 10px;
          }
          .patient-info, .doctor-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .info-item {
            font-size: 14px;
          }
          .info-label {
            color: #666;
          }
          .medications {
            margin: 20px 0;
          }
          .medication-item {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            margin-bottom: 10px;
          }
          .medication-name {
            font-weight: bold;
            font-size: 16px;
          }
          .medication-details {
            font-size: 14px;
            color: #444;
            margin-top: 5px;
          }
          .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 2px dashed #1e3a5f;
            border-radius: 10px;
          }
          .qr-code {
            width: 200px;
            height: 200px;
          }
          .verification-code {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #1e3a5f;
            margin: 10px 0;
          }
          .signature-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .signature-line {
            margin-top: 40px;
            padding-top: 10px;
            border-top: 1px solid #333;
            text-align: right;
          }
          .controlled-warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            border-radius: 6px;
            text-align: center;
            font-size: 12px;
            margin: 10px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #666;
            text-align: center;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">HospitalGuard</div>
          <div class="hospital-subtitle">Level 1 Trauma Center - Digital Prescription</div>
        </div>

        <div class="prescription-title">
          <div class="rx-number">${prescription.prescription_number}</div>
          <div class="date">Date: ${formatDate(prescription.created_at)}</div>
        </div>

        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="patient-info">
            <div class="info-item"><span class="info-label">Name:</span> ${prescription.patient_name}</div>
            ${prescription.patient_age ? `<div class="info-item"><span class="info-label">Age:</span> ${prescription.patient_age} years</div>` : ''}
            ${prescription.visit_number ? `<div class="info-item"><span class="info-label">Visit:</span> ${prescription.visit_number}</div>` : ''}
          </div>
        </div>

        ${hasControlledSubstance ? `
        <div class="controlled-warning">
          <strong>CONTROLLED SUBSTANCE</strong> - This prescription contains controlled medications and is subject to additional verification requirements.
        </div>
        ` : ''}

        <div class="medications">
          <div class="section-title">Prescribed Medications</div>
          ${prescription.items.map((item, index) => `
            <div class="medication-item">
              <div class="medication-name">${index + 1}. ${item.medication_name}</div>
              <div class="medication-details">
                <strong>Dosage:</strong> ${item.dosage} |
                <strong>Frequency:</strong> ${item.frequency} |
                <strong>Duration:</strong> ${item.duration} |
                <strong>Quantity:</strong> ${item.quantity}
              </div>
              ${item.instructions ? `<div class="medication-details"><strong>Instructions:</strong> ${item.instructions}</div>` : ''}
            </div>
          `).join('')}
        </div>

        ${prescription.notes ? `
        <div class="section">
          <div class="section-title">Additional Notes</div>
          <p>${prescription.notes}</p>
        </div>
        ` : ''}

        <div class="qr-section">
          <p style="margin-bottom: 15px; font-size: 14px;">Scan to verify prescription authenticity</p>
          ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" class="qr-code" alt="Prescription QR Code" />` : ''}
          ${verificationCode ? `
          <p style="margin-top: 10px; font-size: 12px;">Verification Code</p>
          <div class="verification-code">${verificationCode}</div>
          ` : ''}
          <p style="font-size: 11px; color: #666;">Valid until: ${formatDate(prescription.valid_until)}</p>
        </div>

        <div class="signature-section">
          <div class="section-title">Prescribing Physician</div>
          <div class="doctor-info">
            <div class="info-item"><span class="info-label">Name:</span> ${prescription.doctor_name}</div>
            <div class="info-item"><span class="info-label">License:</span> ${prescription.doctor_license}</div>
          </div>
          <div class="signature-line">
            <p>Digitally Signed: ${prescription.signed_at ? formatDateTime(prescription.signed_at) : formatDateTime(new Date().toISOString())}</p>
          </div>
        </div>

        <div class="footer">
          <p>This is a digitally signed prescription from HospitalGuard Level 1 Trauma Center.</p>
          <p>Verify authenticity at: ${window.location.origin}/verify-prescription/${prescription.prescription_number}</p>
          <p>Refills Allowed: ${prescription.refills_allowed}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const copyVerificationCode = () => {
    if (verificationCode) {
      navigator.clipboard.writeText(verificationCode);
      toast({
        title: 'Copied',
        description: 'Verification code copied to clipboard'
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Digital Prescription</CardTitle>
        <CardDescription>
          {prescription.prescription_number}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Prescription Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className={`w-5 h-5 ${isSigned ? 'text-green-600' : 'text-yellow-600'}`} />
            <div>
              <p className="font-medium">Signature Status</p>
              <p className="text-sm text-muted-foreground">
                {isSigned ? 'Digitally signed and verified' : 'Awaiting digital signature'}
              </p>
            </div>
          </div>
          <Badge variant={isSigned ? 'default' : 'secondary'} className={isSigned ? 'bg-green-600' : ''}>
            {isSigned ? 'Signed' : 'Pending'}
          </Badge>
        </div>

        {/* Controlled Substance Warning */}
        {hasControlledSubstance && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              This prescription contains controlled substances and requires additional verification for dispensing.
            </AlertDescription>
          </Alert>
        )}

        {/* Patient Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Patient</span>
          </div>
          <p className="font-medium">{prescription.patient_name}</p>
          {prescription.patient_age && (
            <p className="text-sm text-muted-foreground">{prescription.patient_age} years old</p>
          )}
        </div>

        <Separator />

        {/* Medications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Pill className="w-4 h-4" />
            <span>Prescribed Medications ({prescription.items.length})</span>
          </div>
          <div className="space-y-2">
            {prescription.items.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-muted/30 rounded-lg space-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.medication_name}</p>
                  {item.is_controlled_substance && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Controlled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.dosage} - {item.frequency} - {item.duration}
                </p>
                <p className="text-sm">Qty: {item.quantity}</p>
                {item.instructions && (
                  <p className="text-sm text-muted-foreground italic">{item.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Validity */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Valid Until</span>
          </div>
          <span className="font-medium">{formatDate(prescription.valid_until)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Refills Allowed</span>
          </div>
          <span className="font-medium">{prescription.refills_allowed}</span>
        </div>

        <Separator />

        {/* QR Code Section */}
        <AnimatePresence mode="wait">
          {isSigned && qrCodeDataUrl ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center p-6 bg-gradient-to-b from-primary/5 to-primary/10 rounded-xl border-2 border-dashed border-primary/30">
                <motion.img
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  src={qrCodeDataUrl}
                  alt="Prescription QR Code"
                  className="w-48 h-48 rounded-lg shadow-lg"
                />

                {verificationCode && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Verification Code</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold tracking-widest text-primary">
                        {verificationCode}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyVerificationCode}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <p className="mt-4 text-sm text-center text-muted-foreground">
                  Scan this QR code or enter the verification code to authenticate this prescription
                </p>
              </div>

              {/* Signed Info */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">Digitally Signed</p>
                  <p className="text-xs text-green-600 truncate">
                    By {prescription.doctor_name} ({prescription.doctor_license})
                  </p>
                </div>
                <BadgeCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 btn-press"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 btn-press"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Prescribing Doctor Info */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Prescribing Physician</span>
                </div>
                <p className="font-medium">{prescription.doctor_name}</p>
                <p className="text-sm text-muted-foreground">License: {prescription.doctor_license}</p>
              </div>

              {/* Sign Button */}
              <Button
                className="w-full btn-press gradient-royal text-white"
                size="lg"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isSigning}
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <FileSignature className="w-5 h-5 mr-2" />
                    Sign & Generate QR Code
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By signing, you certify that this prescription is medically necessary and accurate
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Secure Digital Prescription</p>
            <p className="text-blue-600">
              This prescription uses cryptographic signatures to prevent tampering.
              Pharmacists can scan the QR code to verify authenticity and view medication details.
            </p>
          </div>
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-primary" />
              Confirm Digital Signature
            </DialogTitle>
            <DialogDescription>
              You are about to digitally sign this prescription. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prescription</span>
                <span className="font-medium">{prescription.prescription_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium">{prescription.patient_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Medications</span>
                <span className="font-medium">{prescription.items.length} item(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valid Until</span>
                <span className="font-medium">{formatDate(prescription.valid_until)}</span>
              </div>
            </div>

            {hasControlledSubstance && (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  This prescription contains controlled substances and will be flagged for additional verification.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-muted-foreground">
              By signing, I certify that:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>I have examined the patient and this prescription is medically necessary</li>
              <li>The medication information is accurate and complete</li>
              <li>I am authorized to prescribe these medications</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              disabled={isSigning}
              className="btn-press gradient-royal text-white"
            >
              {isSigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <FileSignature className="w-4 h-4 mr-2" />
                  Sign Prescription
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default PrescriptionQRGenerator;
