/**
 * HospitalGuard: Prescription Management Page
 * Complete prescription management for doctors - create, view, sign, and manage prescriptions
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  QrCode,
  FileSignature,
  Eye,
  Copy,
  Trash2,
  Ban,
  ArrowLeft,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Stethoscope,
  BarChart3,
  Users,
  TrendingUp,
  Building2,
  LogOut,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  usePrescriptionsList,
  usePrescription,
  usePrescriptionStats,
  useDoctorInfo,
  useSignPrescription,
  useCancelPrescription,
  useDeletePrescription,
  useDuplicatePrescription,
  PrescriptionListItem,
  PrescriptionFilters
} from '@/hooks/usePrescriptionCRUD';
import { CreatePrescriptionForm } from '@/components/prescription/CreatePrescriptionForm';
import { PrescriptionQRGenerator } from '@/components/prescription/PrescriptionQRGenerator';
import { signPrescription as generateSignature } from '@/lib/prescriptionSecurity';
import { formatDate, formatDateTime } from '@/lib/doctorUtils';

export default function PrescriptionManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Doctor info
  const { data: doctorInfo, isLoading: doctorLoading } = useDoctorInfo(user?.id);

  // View state
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [prescriptionToAction, setPrescriptionToAction] = useState<PrescriptionListItem | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Filters
  const [filters, setFilters] = useState<PrescriptionFilters>({
    status: undefined,
    search: '',
    limit: 50
  });

  // Data fetching
  const { data: prescriptions = [], isLoading: prescriptionsLoading, refetch } = usePrescriptionsList(
    doctorInfo?.doctor_id || '',
    filters
  );
  const { data: stats } = usePrescriptionStats(doctorInfo?.doctor_id || '');
  const { data: selectedPrescription } = usePrescription(selectedPrescriptionId);

  // Mutations
  const signMutation = useSignPrescription();
  const cancelMutation = useCancelPrescription();
  const deleteMutation = useDeletePrescription();
  const duplicateMutation = useDuplicatePrescription();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Handle URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'create') {
      setActiveTab('create');
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSignPrescription = async (prescription: PrescriptionListItem) => {
    if (!doctorInfo || !selectedPrescription) return;

    try {
      // Generate digital signature
      const signatureData = {
        prescriptionNumber: prescription.prescription_number,
        patientId: selectedPrescription.patient_id,
        doctorId: doctorInfo.doctor_id,
        doctorLicense: doctorInfo.license_number,
        doctorName: doctorInfo.full_name,
        medications: selectedPrescription.items.map(item => ({
          name: item.medication_name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity
        })),
        issuedAt: new Date(selectedPrescription.created_at),
        validUntil: new Date(selectedPrescription.valid_until),
        isControlledSubstance: selectedPrescription.is_controlled_substance
      };

      const signature = await generateSignature(signatureData);

      await signMutation.mutateAsync({
        prescription_id: prescription.prescription_id,
        doctor_id: doctorInfo.doctor_id,
        digital_signature: signature
      });

      refetch();
    } catch (error) {
      console.error('Error signing prescription:', error);
    }
  };

  const handleCancelPrescription = async () => {
    if (!prescriptionToAction || !doctorInfo) return;

    try {
      await cancelMutation.mutateAsync({
        prescription_id: prescriptionToAction.prescription_id,
        doctor_id: doctorInfo.doctor_id,
        cancellation_reason: cancellationReason || undefined
      });

      setShowCancelDialog(false);
      setPrescriptionToAction(null);
      setCancellationReason('');
      refetch();
    } catch (error) {
      console.error('Error cancelling prescription:', error);
    }
  };

  const handleDeletePrescription = async () => {
    if (!prescriptionToAction || !doctorInfo) return;

    try {
      await deleteMutation.mutateAsync({
        prescription_id: prescriptionToAction.prescription_id,
        doctor_id: doctorInfo.doctor_id
      });

      setShowDeleteDialog(false);
      setPrescriptionToAction(null);
      refetch();
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const handleDuplicatePrescription = async (prescription: PrescriptionListItem) => {
    if (!doctorInfo) return;

    try {
      const result = await duplicateMutation.mutateAsync({
        source_prescription_id: prescription.prescription_id,
        doctor_id: doctorInfo.doctor_id
      });

      if (result) {
        toast({
          title: 'Prescription Duplicated',
          description: `New prescription ${result.prescription_number} created`
        });
        refetch();
      }
    } catch (error) {
      console.error('Error duplicating prescription:', error);
    }
  };

  const openQRModal = (prescription: PrescriptionListItem) => {
    setSelectedPrescriptionId(prescription.prescription_id);
    setShowQRModal(true);
  };

  const handlePrescriptionCreated = (prescriptionId: string, prescriptionNumber: string) => {
    setActiveTab('list');
    setSelectedPrescriptionId(prescriptionId);
    setShowQRModal(true);
    refetch();
    toast({
      title: 'Prescription Created',
      description: `${prescriptionNumber} created. Sign it to generate QR code.`
    });
  };

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired && status !== 'dispensed' && status !== 'cancelled') {
      return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">Expired</Badge>;
    }

    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'signed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Signed</Badge>;
      case 'dispensed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Dispensed</Badge>;
      case 'partially_dispensed':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Partial</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading || doctorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-card"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Pill className="w-8 h-8 text-primary-foreground" />
        </motion.div>
      </div>
    );
  }

  if (!doctorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You must be a registered doctor to access prescription management.
            </p>
            <Button onClick={() => navigate('/doctor-dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/doctor-dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Pill className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-xl text-foreground">Prescription Management</h1>
              <p className="text-xs text-muted-foreground">
                Dr. {doctorInfo.full_name} • {doctorInfo.department_name || 'General'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab('create')}
              className="btn-press gradient-royal text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Prescription
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="btn-press">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-5 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_prescriptions}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileSignature className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending_count}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.signed_count}</p>
                  <p className="text-xs text-muted-foreground">Signed</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.dispensed_count}</p>
                  <p className="text-xs text-muted-foreground">Dispensed</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.today_count}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'create')}>
          <TabsList className="mb-6">
            <TabsTrigger value="list" className="px-6">
              <Pill className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="create" className="px-6">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </TabsTrigger>
          </TabsList>

          {/* Prescriptions List Tab */}
          <TabsContent value="list">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by prescription #, patient name..."
                        value={filters.search || ''}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="signed">Signed</SelectItem>
                      <SelectItem value="dispensed">Dispensed</SelectItem>
                      <SelectItem value="partially_dispensed">Partial</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Prescriptions Table */}
            <Card>
              <CardContent className="p-0">
                {prescriptionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h3 className="text-lg font-semibold mb-2">No Prescriptions Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {filters.search || filters.status
                        ? 'No prescriptions match your filters'
                        : "You haven't created any prescriptions yet"}
                    </p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Prescription
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {prescriptions.map((prescription) => (
                      <motion.div
                        key={prescription.prescription_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              prescription.status === 'signed'
                                ? 'bg-blue-100'
                                : prescription.status === 'pending'
                                ? 'bg-yellow-100'
                                : prescription.status === 'dispensed'
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                            }`}>
                              {prescription.status === 'signed' ? (
                                <QrCode className="w-6 h-6 text-blue-600" />
                              ) : prescription.status === 'pending' ? (
                                <FileSignature className="w-6 h-6 text-yellow-600" />
                              ) : (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{prescription.prescription_number}</h4>
                                {getStatusBadge(prescription.status, prescription.is_expired)}
                                {prescription.is_controlled_substance && (
                                  <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                                    Controlled
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {prescription.patient_name}
                                {prescription.patient_phone && ` • ${prescription.patient_phone}`}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Pill className="w-3 h-3" />
                                  {prescription.items_count} medication(s)
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Valid until {formatDate(prescription.valid_until)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(prescription.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {prescription.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPrescriptionId(prescription.prescription_id);
                                  openQRModal(prescription);
                                }}
                                className="btn-press"
                              >
                                <FileSignature className="w-4 h-4 mr-1" />
                                Sign
                              </Button>
                            )}
                            {prescription.status === 'signed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openQRModal(prescription)}
                                className="btn-press"
                              >
                                <QrCode className="w-4 h-4 mr-1" />
                                View QR
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedPrescriptionId(prescription.prescription_id);
                                  openQRModal(prescription);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicatePrescription(prescription)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {prescription.status === 'pending' && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setPrescriptionToAction(prescription);
                                      setShowDeleteDialog(true);
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                                {prescription.status !== 'dispensed' && prescription.status !== 'cancelled' && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setPrescriptionToAction(prescription);
                                      setShowCancelDialog(true);
                                    }}
                                    className="text-destructive"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Prescription Tab */}
          <TabsContent value="create">
            <CreatePrescriptionForm
              doctorId={doctorInfo.doctor_id}
              doctorName={doctorInfo.full_name}
              doctorLicense={doctorInfo.license_number}
              onSuccess={handlePrescriptionCreated}
              onCancel={() => setActiveTab('list')}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* QR Generator Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
          {selectedPrescription && (
            <PrescriptionQRGenerator
              prescription={{
                prescription_id: selectedPrescription.prescription_id,
                prescription_number: selectedPrescription.prescription_number,
                patient_id: selectedPrescription.patient_id,
                patient_name: selectedPrescription.patient_name,
                patient_age: selectedPrescription.patient_dob
                  ? Math.floor((new Date().getTime() - new Date(selectedPrescription.patient_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                  : undefined,
                doctor_id: selectedPrescription.doctor_id,
                doctor_name: selectedPrescription.doctor_name,
                doctor_license: selectedPrescription.doctor_license,
                visit_id: selectedPrescription.visit_id || undefined,
                status: selectedPrescription.status,
                notes: selectedPrescription.notes,
                is_controlled_substance: selectedPrescription.is_controlled_substance,
                refills_allowed: selectedPrescription.refills_allowed,
                valid_until: selectedPrescription.valid_until,
                created_at: selectedPrescription.created_at,
                items: selectedPrescription.items,
                digital_signature: selectedPrescription.digital_signature,
                signed_at: selectedPrescription.signed_at
              }}
              onSign={async (prescriptionId, signature) => {
                await signMutation.mutateAsync({
                  prescription_id: prescriptionId,
                  doctor_id: doctorInfo.doctor_id,
                  digital_signature: signature
                });
                refetch();
              }}
              onClose={() => setShowQRModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Prescription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel prescription {prescriptionToAction?.prescription_number}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Cancellation reason (optional)"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowCancelDialog(false);
              setPrescriptionToAction(null);
              setCancellationReason('');
            }}>
              Keep Prescription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPrescription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Prescription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prescription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete prescription {prescriptionToAction?.prescription_number}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setPrescriptionToAction(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrescription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
