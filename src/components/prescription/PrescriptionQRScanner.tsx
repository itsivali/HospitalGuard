/**
 * HospitalGuard: Prescription QR Code Scanner Component
 * Allows pharmacists and users to scan and verify prescription QR codes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QrScanner from 'qr-scanner';
import {
  Camera,
  CameraOff,
  QrCode,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Keyboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  decodeQRPayload,
  verifyQRPayload,
  PrescriptionQRPayload
} from '@/lib/prescriptionSecurity';

interface ScanResult {
  isValid: boolean;
  status: 'valid' | 'expired' | 'tampered' | 'invalid' | 'pending';
  message: string;
  payload?: PrescriptionQRPayload;
}

interface PrescriptionQRScannerProps {
  onScanSuccess?: (payload: PrescriptionQRPayload) => void;
  onVerificationComplete?: (result: ScanResult) => void;
  autoNavigate?: boolean;
}

export function PrescriptionQRScanner({
  onScanSuccess,
  onVerificationComplete,
  autoNavigate = true
}: PrescriptionQRScannerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [activeTab, setActiveTab] = useState('camera');

  // Check camera availability
  useEffect(() => {
    QrScanner.hasCamera().then(setHasCamera);
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, []);

  const processQRData = useCallback(async (data: string) => {
    setIsVerifying(true);
    setScanResult({ isValid: false, status: 'pending', message: 'Verifying...' });

    try {
      // Decode the QR payload
      const payload = decodeQRPayload(data);

      if (!payload) {
        const result: ScanResult = {
          isValid: false,
          status: 'invalid',
          message: 'Invalid QR code format - not a HospitalGuard prescription'
        };
        setScanResult(result);
        onVerificationComplete?.(result);
        return;
      }

      // Verify the payload
      const verificationResult = await verifyQRPayload(payload);

      const result: ScanResult = {
        isValid: verificationResult.isValid,
        status: verificationResult.status as ScanResult['status'],
        message: verificationResult.message,
        payload
      };

      setScanResult(result);

      if (result.isValid && onScanSuccess) {
        onScanSuccess(payload);
      }

      onVerificationComplete?.(result);

      // Auto-navigate to verification page if enabled
      if (result.isValid && autoNavigate && payload.url) {
        toast({
          title: 'Prescription Verified',
          description: 'Redirecting to prescription details...'
        });

        setTimeout(() => {
          window.location.href = payload.url;
        }, 1500);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      const result: ScanResult = {
        isValid: false,
        status: 'invalid',
        message: 'Error processing QR code'
      };
      setScanResult(result);
      onVerificationComplete?.(result);
    } finally {
      setIsVerifying(false);
    }
  }, [onScanSuccess, onVerificationComplete, autoNavigate, toast]);

  const startScanner = useCallback(async () => {
    if (!videoRef.current) return;

    setCameraError(null);
    setIsScanning(true);
    setScanResult(null);

    try {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          // Stop scanning after successful read
          scannerRef.current?.stop();
          setIsScanning(false);
          processQRData(result.data);
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true
        }
      );

      await scannerRef.current.start();
    } catch (error: any) {
      console.error('Scanner error:', error);
      setCameraError(error.message || 'Failed to access camera');
      setIsScanning(false);
    }
  }, [processQRData]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setIsScanning(false);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setScanResult(null);

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true
      });
      processQRData(result.data);
    } catch (error) {
      setScanResult({
        isValid: false,
        status: 'invalid',
        message: 'No QR code found in the image'
      });
      setIsVerifying(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleManualEntry = async () => {
    if (!manualCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prescription number or verification code',
        variant: 'destructive'
      });
      return;
    }

    // For manual entry, redirect to verification page
    const prescriptionNumber = manualCode.trim().toUpperCase();

    if (prescriptionNumber.startsWith('RX-')) {
      window.location.href = `/verify-prescription/${prescriptionNumber}`;
    } else {
      // Assume it's a verification code - redirect to search
      window.location.href = `/verify-prescription?code=${prescriptionNumber}`;
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setManualCode('');
    if (activeTab === 'camera') {
      startScanner();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <ShieldCheck className="w-12 h-12 text-green-600" />;
      case 'expired':
        return <ShieldAlert className="w-12 h-12 text-yellow-600" />;
      case 'tampered':
        return <ShieldX className="w-12 h-12 text-red-600" />;
      case 'invalid':
        return <AlertCircle className="w-12 h-12 text-red-600" />;
      case 'pending':
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
      default:
        return <Shield className="w-12 h-12 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'expired':
        return 'bg-yellow-50 border-yellow-200';
      case 'tampered':
      case 'invalid':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Verify Prescription</CardTitle>
        <CardDescription>
          Scan a prescription QR code or enter the verification code
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Results Display */}
        <AnimatePresence mode="wait">
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 rounded-xl border-2 ${getStatusColor(scanResult.status)}`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {getStatusIcon(scanResult.status)}

                <div>
                  <h3 className="text-lg font-semibold">
                    {scanResult.status === 'valid' && 'Prescription Verified'}
                    {scanResult.status === 'expired' && 'Prescription Expired'}
                    {scanResult.status === 'tampered' && 'Security Alert'}
                    {scanResult.status === 'invalid' && 'Invalid QR Code'}
                    {scanResult.status === 'pending' && 'Verifying...'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {scanResult.message}
                  </p>
                </div>

                {scanResult.payload && scanResult.isValid && (
                  <div className="w-full p-3 bg-white rounded-lg border space-y-2 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prescription</span>
                      <span className="font-medium">{scanResult.payload.rx}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valid Until</span>
                      <span className="font-medium">
                        {new Date(scanResult.payload.exp * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {scanResult.status !== 'pending' && (
                  <Button
                    variant="outline"
                    onClick={resetScanner}
                    className="btn-press"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Scan Another
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanner Interface */}
        {!scanResult && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="camera" disabled={!hasCamera}>
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Keyboard className="w-4 h-4 mr-2" />
                Manual
              </TabsTrigger>
            </TabsList>

            {/* Camera Tab */}
            <TabsContent value="camera" className="space-y-4">
              {!hasCamera ? (
                <Alert>
                  <CameraOff className="h-4 w-4" />
                  <AlertDescription>
                    No camera found. Please use the upload or manual entry options.
                  </AlertDescription>
                </Alert>
              ) : cameraError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {cameraError}. Please check camera permissions.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="relative aspect-square w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                    />

                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Button
                          size="lg"
                          onClick={startScanner}
                          className="btn-press"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Start Scanning
                        </Button>
                      </div>
                    )}

                    {isScanning && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 border-2 border-primary/50 rounded-xl">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                        </div>

                        {/* Scanning line animation */}
                        <motion.div
                          initial={{ top: '10%' }}
                          animate={{ top: '90%' }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'linear'
                          }}
                          className="absolute left-4 right-4 h-0.5 bg-primary shadow-lg"
                          style={{ boxShadow: '0 0 10px 2px hsl(var(--primary))' }}
                        />
                      </div>
                    )}
                  </div>

                  {isScanning && (
                    <Button
                      variant="outline"
                      onClick={stopScanner}
                      className="w-full btn-press"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Stop Scanning
                    </Button>
                  )}
                </>
              )}
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG or GIF (max 10MB)
                </p>
              </div>

              {isVerifying && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing image...
                </div>
              )}
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Prescription Number or Verification Code</Label>
                <Input
                  id="code"
                  placeholder="RX-20251215-0001 or 123456"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="text-center font-mono text-lg tracking-wide"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the prescription number (e.g., RX-20251215-0001) or the 6-digit verification code
                </p>
              </div>

              <Button
                onClick={handleManualEntry}
                className="w-full btn-press"
                disabled={!manualCode.trim()}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Prescription
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {/* Security Notice */}
        <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">Secure Verification</p>
              <p>
                HospitalGuard prescriptions use cryptographic signatures to ensure authenticity.
                Always verify prescriptions before dispensing medications.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PrescriptionQRScanner;
