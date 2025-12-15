/**
 * HospitalGuard: Prescription Verification Page
 * Public page for verifying prescription authenticity via QR code scan
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  QrCode,
  Pill,
  User,
  Calendar,
  Clock,
  BadgeCheck,
  AlertTriangle,
  ArrowLeft,
  Download,
  Printer,
  Phone,
  MapPin,
  Building2,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatDateTime } from '@/lib/doctorUtils';
import { parseSignature, verifyPrescriptionSignature, PrescriptionSigningData } from '@/lib/prescriptionSecurity';
import { PrescriptionQRScanner } from '@/components/prescription/PrescriptionQRScanner';

interface PrescriptionData {
  prescription_id: string;
  prescription_number: string;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender?: string;
  visit_number?: string;
  doctor_id: string;
  doctor_name: string;
  doctor_license: string;
  doctor_specialization?: string;
  department_name?: string;
  status: string;
  qr_code_data: string;
  digital_signature: string | null;
  signed_at: string | null;
  notes: string | null;
  is_controlled_substance: boolean;
  refills_allowed: number;
  valid_until: string;
  created_at: string;
  items: Array<{
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
    is_controlled_substance?: boolean;
    dispensed_quantity?: number;
  }>;
}

type VerificationStatus = 'loading' | 'verified' | 'expired' | 'invalid' | 'not_found' | 'scanner';

export default function VerifyPrescription() {
  const { prescriptionNumber } = useParams<{ prescriptionNumber: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<VerificationStatus>(
    prescriptionNumber ? 'loading' : 'scanner'
  );
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [signatureInfo, setSignatureInfo] = useState<ReturnType<typeof parseSignature>>(null);
  const [isSignatureValid, setIsSignatureValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prescriptionNumber) {
      verifyPrescription(prescriptionNumber);
    }
  }, [prescriptionNumber]);

  const verifyPrescription = async (rxNumber: string) => {
    setStatus('loading');
    setError(null);

    try {
      // Fetch prescription details from database
      const { data, error: fetchError } = await supabase.rpc('get_prescription_for_verification', {
        prescription_number_param: rxNumber
      });

      if (fetchError) {
        console.error('Database error:', fetchError);
        throw new Error('Failed to fetch prescription');
      }

      if (!data || data.length === 0) {
        setStatus('not_found');
        return;
      }

      const prescriptionData = data[0] as PrescriptionData;
      setPrescription(prescriptionData);

      // Check if prescription is expired
      const validUntil = new Date(prescriptionData.valid_until);
      if (validUntil < new Date()) {
        setStatus('expired');
        return;
      }

      // Parse and verify digital signature
      if (prescriptionData.digital_signature) {
        const sigInfo = parseSignature(prescriptionData.digital_signature);
        setSignatureInfo(sigInfo);

        // Verify the signature cryptographically
        const signingData: PrescriptionSigningData = {
          prescriptionNumber: prescriptionData.prescription_number,
          patientId: prescriptionData.patient_id,
          doctorId: prescriptionData.doctor_id,
          doctorLicense: prescriptionData.doctor_license,
          doctorName: prescriptionData.doctor_name,
          medications: prescriptionData.items.map(item => ({
            name: item.medication_name,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity
          })),
          issuedAt: new Date(prescriptionData.created_at),
          validUntil: new Date(prescriptionData.valid_until),
          isControlledSubstance: prescriptionData.is_controlled_substance
        };

        const isValid = await verifyPrescriptionSignature(signingData, prescriptionData.digital_signature);
        setIsSignatureValid(isValid);

        if (!isValid) {
          setStatus('invalid');
          return;
        }
      } else {
        setIsSignatureValid(false);
        setStatus('invalid');
        return;
      }

      setStatus('verified');
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'An error occurred during verification');
      setStatus('invalid');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (prescription?.status) {
      case 'signed':
        return <Badge className="bg-blue-600">Signed</Badge>;
      case 'dispensed':
        return <Badge className="bg-green-600">Dispensed</Badge>;
      case 'partially_dispensed':
        return <Badge className="bg-orange-600">Partially Dispensed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{prescription?.status}</Badge>;
    }
  };

  // Render scanner mode
  if (status === 'scanner') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl text-primary">HospitalGuard</span>
            </Link>
            <Badge variant="outline" className="text-xs">
              Prescription Verification
            </Badge>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <PrescriptionQRScanner
            onScanSuccess={(payload) => {
              navigate(`/verify-prescription/${payload.rx}`);
            }}
            autoNavigate={false}
          />
        </main>
      </div>
    );
  }

  // Render loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-lg font-semibold">Verifying Prescription</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Checking authenticity and validity...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render not found state
  if (status === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl text-primary">HospitalGuard</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold">Prescription Not Found</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                The prescription number "{prescriptionNumber}" was not found in our system.
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/verify-prescription')} className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan Another QR Code
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Render invalid/tampered state
  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl text-primary">HospitalGuard</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive" className="mb-6">
              <ShieldX className="h-5 w-5" />
              <AlertTitle className="text-lg">Security Warning</AlertTitle>
              <AlertDescription>
                This prescription could not be verified. The digital signature is invalid or missing,
                which may indicate tampering. Do not dispense medications based on this prescription.
              </AlertDescription>
            </Alert>

            <Card className="border-red-200">
              <CardContent className="py-8 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <ShieldX className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-800">Verification Failed</h2>
                <p className="text-sm text-red-600 mt-2 mb-6">
                  {error || 'The prescription signature could not be verified'}
                </p>

                <div className="p-4 bg-red-50 rounded-lg text-left mb-6">
                  <h4 className="font-medium text-red-800 mb-2">What to do:</h4>
                  <ul className="text-sm text-red-700 space-y-1 list-disc pl-5">
                    <li>Do not dispense any medications</li>
                    <li>Contact the prescribing physician directly</li>
                    <li>Report this incident to hospital administration</li>
                    <li>Retain this QR code as evidence if needed</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Button onClick={() => navigate('/verify-prescription')} variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Another Prescription
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Render expired state
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl text-primary">HospitalGuard</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="mb-6 border-yellow-500 bg-yellow-50">
              <ShieldAlert className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-lg text-yellow-800">Prescription Expired</AlertTitle>
              <AlertDescription className="text-yellow-700">
                This prescription has passed its validity date and can no longer be dispensed.
                The patient should consult their physician for a new prescription if needed.
              </AlertDescription>
            </Alert>

            {prescription && (
              <Card className="border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{prescription.prescription_number}</CardTitle>
                      <CardDescription>Expired Prescription</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Expired
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">Expired on:</span>
                      <span>{formatDate(prescription.valid_until)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{prescription.patient_name}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Prescribing Physician</p>
                    <p className="font-medium">{prescription.doctor_name}</p>
                    <p className="text-sm text-muted-foreground">License: {prescription.doctor_license}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 space-y-2">
              <Button onClick={() => navigate('/verify-prescription')} className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                Verify Another Prescription
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Render verified state
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white print:bg-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm print:shadow-none print:border-b-2">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl text-primary">HospitalGuard</span>
          </Link>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/verify-prescription')}>
              <QrCode className="w-4 h-4 mr-2" />
              Scan Another
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Verification Banner */}
          <div className="p-6 bg-green-100 rounded-xl border-2 border-green-300 print:bg-green-50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-200">
                <ShieldCheck className="w-8 h-8 text-green-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-800">Prescription Verified</h1>
                <p className="text-green-700">
                  This prescription has been authenticated and is valid for dispensing
                </p>
              </div>
            </div>
          </div>

          {prescription && (
            <>
              {/* Prescription Details Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        {prescription.prescription_number}
                      </CardTitle>
                      <CardDescription>Digital Prescription</CardDescription>
                    </div>
                    {getStatusBadge()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Controlled Substance Warning */}
                  {prescription.is_controlled_substance && (
                    <Alert className="border-yellow-500 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        This prescription contains controlled substances. Additional verification may be required.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Patient Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Patient Information</span>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <p className="font-semibold text-lg">{prescription.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {prescription.patient_age} years old
                          {prescription.patient_gender && ` - ${prescription.patient_gender}`}
                        </p>
                        {prescription.visit_number && (
                          <p className="text-sm text-muted-foreground">
                            Visit: {prescription.visit_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BadgeCheck className="w-4 h-4" />
                        <span>Prescribing Physician</span>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <p className="font-semibold text-lg">{prescription.doctor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          License: {prescription.doctor_license}
                        </p>
                        {prescription.doctor_specialization && (
                          <p className="text-sm text-muted-foreground">
                            {prescription.doctor_specialization}
                          </p>
                        )}
                        {prescription.department_name && (
                          <p className="text-sm text-muted-foreground">
                            {prescription.department_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Medications */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Pill className="w-4 h-4" />
                      <span>Prescribed Medications ({prescription.items.length})</span>
                    </div>

                    <div className="space-y-3">
                      {prescription.items.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-muted/30 rounded-lg border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg">
                                  {index + 1}. {item.medication_name}
                                </span>
                                {item.is_controlled_substance && (
                                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                    Controlled
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span><strong>Dosage:</strong> {item.dosage}</span>
                                <span><strong>Frequency:</strong> {item.frequency}</span>
                                <span><strong>Duration:</strong> {item.duration}</span>
                              </div>
                              {item.instructions && (
                                <p className="text-sm text-muted-foreground italic mt-2">
                                  {item.instructions}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{item.quantity}</p>
                              <p className="text-xs text-muted-foreground">Quantity</p>
                              {item.dispensed_quantity !== undefined && item.dispensed_quantity > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  {item.dispensed_quantity} dispensed
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {prescription.notes && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>Additional Notes</span>
                        </div>
                        <p className="p-4 bg-muted/30 rounded-lg">{prescription.notes}</p>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Validity & Refills */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground">Issued Date</p>
                      <p className="font-semibold">{formatDate(prescription.created_at)}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground">Valid Until</p>
                      <p className="font-semibold">{formatDate(prescription.valid_until)}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <RefreshCw className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground">Refills Allowed</p>
                      <p className="font-semibold">{prescription.refills_allowed}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Digital Signature Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Digital Signature</span>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <p className="font-medium text-green-800">
                            Cryptographically Signed and Verified
                          </p>
                          <div className="text-sm text-green-700 space-y-1">
                            {signatureInfo && (
                              <>
                                <p><strong>Signed by:</strong> {signatureInfo.doctorName}</p>
                                <p><strong>License:</strong> {signatureInfo.doctorLicense}</p>
                                <p><strong>Signed at:</strong> {formatDateTime(signatureInfo.signedAt.toISOString())}</p>
                                <p><strong>Hospital ID:</strong> {signatureInfo.hospitalId}</p>
                              </>
                            )}
                            {prescription.signed_at && (
                              <p><strong>Timestamp:</strong> {formatDateTime(prescription.signed_at)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hospital Contact Info */}
              <Card className="print:hidden">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-semibold">HospitalGuard</p>
                        <p className="text-sm text-muted-foreground">Level 1 Trauma Center</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>+254 700 000 000</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>Nairobi, Kenya</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Notice */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3 print:hidden">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">For Pharmacists</p>
                  <p>
                    This prescription has been digitally signed by the prescribing physician.
                    The cryptographic signature ensures the prescription has not been modified
                    since signing. Record the dispensing details in your system after fulfilling this prescription.
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 py-4 text-center text-sm text-muted-foreground print:hidden">
        <p>Verified by HospitalGuard Digital Prescription System</p>
        <p className="text-xs mt-1">
          Verification URL: {window.location.href}
        </p>
      </footer>
    </div>
  );
}
