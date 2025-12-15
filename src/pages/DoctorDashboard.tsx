import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { DoctorList } from "@/components/DoctorList";
import {
  Activity,
  Calendar,
  FileText,
  Heart,
  Hospital,
  LogOut,
  Pill,
  Clock,
  AlertCircle,
  Video,
  User,
  TrendingUp,
  CheckCircle2,
  Users,
  Stethoscope,
  ClipboardPlus,
  Microscope,
  BedDouble,
  Phone,
  QrCode,
  FileSignature,
  Search,
  Filter,
  X,
  ArrowRight,
  Plus
} from "lucide-react";
import { PrescriptionQRGenerator } from "@/components/prescription";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorData, setDoctorData] = useState<any>(null);

  // Stats data
  const [stats, setStats] = useState({
    todayAppointments: 0,
    activePatientsCount: 0,
    urgentCases: 0,
    pendingLabResults: 0
  });

  // Modal states
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [showMyPatients, setShowMyPatients] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [showPrescriptionList, setShowPrescriptionList] = useState(false);

  // Data states
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [myPatients, setMyPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUser(user);
        await fetchDoctorData(user.id);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchDoctorData = async (userId: string) => {
    try {
      // Fetch doctor information
      const { data: doctor } = await supabase
        .from('hospital_staff')
        .select('*, department:departments(name)')
        .eq('user_id', userId)
        .eq('staff_type', 'doctor')
        .single();

      setDoctorData(doctor);

      if (!doctor) return;

      // Fetch today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone),
          department:departments(name)
        `)
        .eq('doctor_id', doctor.id)
        .gte('scheduled_time', today.toISOString())
        .lt('scheduled_time', tomorrow.toISOString())
        .order('scheduled_time', { ascending: true });

      setTodayAppointments(appointments || []);

      // Fetch my active patients (from recent visits)
      const { data: activePatients } = await supabase
        .from('patient_visits')
        .select(`
          *,
          patient:patients(
            id,
            first_name,
            last_name,
            date_of_birth,
            blood_type,
            phone,
            email
          )
        `)
        .eq('attending_doctor_id', doctor.id)
        .in('status', ['checked_in', 'in_triage', 'in_consultation', 'in_treatment'])
        .order('check_in_time', { ascending: false });

      // Extract unique patients
      const uniquePatients = new Map();
      activePatients?.forEach(visit => {
        if (visit.patient && !uniquePatients.has(visit.patient.id)) {
          uniquePatients.set(visit.patient.id, {
            ...visit.patient,
            visit: visit,
            status: visit.status,
            chief_complaint: visit.chief_complaint,
            triage_level: visit.triage_level,
            check_in_time: visit.check_in_time
          });
        }
      });

      setMyPatients(Array.from(uniquePatients.values()));

      // Fetch ALL patients in the system
      const { data: allPatientsData } = await supabase
        .from('patients')
        .select(`
          *,
          latest_visit:patient_visits(
            id,
            status,
            check_in_time,
            chief_complaint
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      setAllPatients(allPatientsData || []);

      // Calculate stats
      setStats({
        todayAppointments: appointments?.length || 0,
        activePatientsCount: uniquePatients.size,
        urgentCases: activePatients?.filter(v => v.triage_level === 'critical' || v.triage_level === 'urgent').length || 0,
        pendingLabResults: 0 // TODO: Fetch from lab_orders
      });

    // Fetch prescriptions for this doctor
      const { data: prescriptionsData } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients(id, first_name, last_name, date_of_birth),
          prescription_items:prescription_items(*)
        `)
        .eq('doctor_id', doctor.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setPrescriptions(prescriptionsData || []);

    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  const handleSignPrescription = async (prescriptionId: string, digitalSignature: string) => {
    try {
      // Update prescription with signature
      const { error } = await supabase
        .from('prescriptions')
        .update({
          digital_signature: digitalSignature,
          status: 'signed',
          signed_at: new Date().toISOString()
        })
        .eq('id', prescriptionId);

      if (error) throw error;

      // Refresh prescriptions
      if (doctorData) {
        const { data: prescriptionsData } = await supabase
          .from('prescriptions')
          .select(`
            *,
            patient:patients(id, first_name, last_name, date_of_birth),
            prescription_items:prescription_items(*)
          `)
          .eq('doctor_id', doctorData.id)
          .order('created_at', { ascending: false })
          .limit(50);

        setPrescriptions(prescriptionsData || []);
      }

      toast({
        title: 'Prescription Signed',
        description: 'Digital signature applied and QR code generated'
      });

    } catch (error: any) {
      console.error('Error signing prescription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign prescription',
        variant: 'destructive'
      });
    }
  };

  const openPrescriptionQR = (prescription: any) => {
    // Transform prescription data for the QR generator
    const prescriptionData = {
      prescription_id: prescription.id,
      prescription_number: prescription.prescription_number,
      patient_id: prescription.patient?.id || prescription.patient_id,
      patient_name: prescription.patient
        ? `${prescription.patient.first_name} ${prescription.patient.last_name}`
        : 'Unknown Patient',
      patient_age: prescription.patient?.date_of_birth
        ? Math.floor((new Date().getTime() - new Date(prescription.patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : undefined,
      doctor_id: doctorData?.id || '',
      doctor_name: doctorData ? `${doctorData.first_name} ${doctorData.last_name}` : 'Doctor',
      doctor_license: doctorData?.license_number || 'N/A',
      visit_id: prescription.visit_id,
      status: prescription.status,
      notes: prescription.notes,
      is_controlled_substance: prescription.is_controlled_substance,
      refills_allowed: prescription.refills_allowed || 0,
      valid_until: prescription.valid_until,
      created_at: prescription.created_at,
      items: prescription.prescription_items?.map((item: any) => ({
        medication_name: item.medication_name,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        instructions: item.instructions,
        is_controlled_substance: item.is_controlled_substance
      })) || [],
      digital_signature: prescription.digital_signature,
      signed_at: prescription.signed_at
    };

    setSelectedPrescription(prescriptionData);
    setShowPrescriptionModal(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'stable': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'checked_in': return 'bg-primary/10 text-primary border-primary/20';
      case 'in_consultation': return 'bg-accent/10 text-accent border-accent/20';
      case 'in_treatment': return 'bg-secondary/10 text-secondary border-secondary/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const filteredPatients = allPatients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-card"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Stethoscope className="w-8 h-8 text-primary-foreground" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-xl text-foreground">Doctor Portal</h1>
              <p className="text-xs text-muted-foreground">
                Dr. {doctorData ? `${doctorData.first_name} ${doctorData.last_name}` : user?.user_metadata?.full_name || 'Doctor'}
                {doctorData?.department && ` • ${doctorData.department.name}`}
              </p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="btn-press">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats - Business Central Style */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              className="bc-stat-card bg-primary/5 border-primary/20 hover:border-primary/40"
              onClick={() => setShowAllAppointments(true)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">Today</Badge>
              </div>
              <p className="bc-metric">{stats.todayAppointments}</p>
              <p className="bc-metric-label mt-1">Appointments</p>
              <p className="text-xs text-primary mt-2 font-medium flex items-center gap-1">
                Click to manage <ArrowRight className="w-3 h-3" />
              </p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card
              className="bc-stat-card bg-secondary/5 border-secondary/20 hover:border-secondary/40"
              onClick={() => setShowMyPatients(true)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30 text-xs">Active</Badge>
              </div>
              <p className="bc-metric">{stats.activePatientsCount}</p>
              <p className="bc-metric-label mt-1">Under My Care</p>
              <p className="text-xs text-secondary mt-2 font-medium flex items-center gap-1">
                Click to view <ArrowRight className="w-3 h-3" />
              </p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bc-card bg-destructive/5 border-destructive/20 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">Urgent</Badge>
              </div>
              <p className="bc-metric">{stats.urgentCases}</p>
              <p className="bc-metric-label mt-1">Require Attention</p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card
              className="bc-stat-card bg-tertiary/5 border-tertiary/20 hover:border-tertiary/40"
              onClick={() => setShowAllPatients(true)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-tertiary" />
                </div>
                <Badge variant="outline" className="bg-tertiary/10 text-tertiary border-tertiary/30 text-xs">System</Badge>
              </div>
              <p className="bc-metric">{allPatients.length}</p>
              <p className="bc-metric-label mt-1">All Patients</p>
              <p className="text-xs text-tertiary mt-2 font-medium flex items-center gap-1">
                Click to view <ArrowRight className="w-3 h-3" />
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Today's Schedule Preview */}
        <Card className="mb-4 bc-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Today's Schedule</CardTitle>
                  <CardDescription className="text-xs">Your appointments for today</CardDescription>
                </div>
              </div>
              <Button
                className="btn-press bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
                onClick={() => setShowAllAppointments(true)}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayAppointments.slice(0, 3).map((apt) => {
                  const time = new Date(apt.scheduled_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <div key={apt.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-col">
                          <span className="text-primary-foreground text-xs font-medium">{time.split(' ')[0]}</span>
                          <span className="text-primary-foreground/80 text-xs">{time.split(' ')[1]}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Patient TBA'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {apt.appointment_type?.replace('_', ' ')} - {apt.department?.name || 'General'}
                          </p>
                          {apt.reason && (
                            <p className="text-xs text-muted-foreground mt-0.5">"{apt.reason}"</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="btn-press text-xs">View Details</Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Patients Preview */}
        <Card className="bc-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Patients Under My Care</CardTitle>
                  <CardDescription className="text-xs">Currently active patients</CardDescription>
                </div>
              </div>
              <Button
                className="btn-press bg-secondary text-secondary-foreground hover:bg-secondary/90"
                size="sm"
                onClick={() => setShowMyPatients(true)}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No active patients currently</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {myPatients.slice(0, 6).map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 rounded-lg bg-muted/50 border hover:border-secondary/40 hover:bg-muted transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowPatientDetails(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(patient.visit?.status || patient.status)}`}>
                        {patient.status || patient.visit?.status}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{patient.first_name} {patient.last_name}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{patient.chief_complaint || 'General consultation'}</p>
                    {patient.triage_level && (
                      <Badge variant="outline" className={`text-xs mb-2 ${getStatusColor(patient.triage_level)}`}>
                        {patient.triage_level}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(patient.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prescriptions Card */}
        <Card className="bc-card mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Digital Prescriptions</CardTitle>
                  <CardDescription className="text-xs">Sign and generate QR codes for prescriptions</CardDescription>
                </div>
              </div>
              <Button
                className="btn-press bg-accent text-accent-foreground hover:bg-accent/90"
                size="sm"
                onClick={() => setShowPrescriptionList(true)}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No prescriptions created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map((prescription) => (
                  <div
                    key={prescription.id}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer flex items-center justify-between"
                    onClick={() => openPrescriptionQR(prescription)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        prescription.status === 'signed'
                          ? 'bg-green-100'
                          : 'bg-yellow-100'
                      }`}>
                        {prescription.status === 'signed' ? (
                          <QrCode className="w-5 h-5 text-green-700" />
                        ) : (
                          <FileSignature className="w-5 h-5 text-yellow-700" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{prescription.prescription_number}</h4>
                        <p className="text-xs text-muted-foreground">
                          {prescription.patient
                            ? `${prescription.patient.first_name} ${prescription.patient.last_name}`
                            : 'Patient'}
                          {' - '}
                          {prescription.prescription_items?.length || 0} med(s)
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        prescription.status === 'signed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : prescription.status === 'dispensed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      {prescription.status === 'signed' ? 'View QR' : 'Sign'}
                    </Badge>
                  </div>
                ))}
                {prescriptions.length > 3 && (
                  <p
                    className="text-xs text-center text-accent cursor-pointer hover:underline pt-2"
                    onClick={() => setShowPrescriptionList(true)}
                  >
                    +{prescriptions.length - 3} more prescriptions
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hospital Doctors Directory */}
        <Card className="bc-card mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Hospital Doctors Directory</CardTitle>
                <CardDescription className="text-xs">View all doctors across departments for collaboration and referrals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DoctorList
              groupByDepartment={true}
              showSearch={true}
            />
          </CardContent>
        </Card>
      </main>

      {/* All Appointments Management Modal */}
      <Dialog open={showAllAppointments} onOpenChange={setShowAllAppointments}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Today's Appointments
            </DialogTitle>
            <DialogDescription>
              Manage all your appointments for today
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((apt) => {
                  const scheduledDate = new Date(apt.scheduled_time);
                  const time = scheduledDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <div key={apt.id} className="p-4 rounded-xl bg-muted/30 border hover-lift">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 gradient-royal rounded-xl flex items-center justify-center flex-col">
                            <span className="text-white text-xs font-medium">{time.split(' ')[0]}</span>
                            <span className="text-white/80 text-xs">{time.split(' ')[1]}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Patient TBA'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {apt.appointment_type?.replace('_', ' ')} • {apt.department?.name || 'General'}
                            </p>
                            {apt.reason && (
                              <p className="text-sm mt-2 text-muted-foreground italic">"{apt.reason}"</p>
                            )}
                            {apt.patient?.phone && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {apt.patient.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10">
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* My Patients Modal */}
      <Dialog open={showMyPatients} onOpenChange={setShowMyPatients}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-secondary" />
              Patients Under My Care
            </DialogTitle>
            <DialogDescription>
              Currently active patients you're managing
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {myPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">No active patients currently</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 rounded-xl bg-muted/30 border hover-lift cursor-pointer"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowMyPatients(false);
                      setShowPatientDetails(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center text-white font-semibold">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div>
                          <h4 className="font-semibold">{patient.first_name} {patient.last_name}</h4>
                          <p className="text-xs text-muted-foreground">{patient.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">{patient.chief_complaint}</p>
                      {patient.triage_level && (
                        <Badge variant="outline" className={`text-xs ${getStatusColor(patient.triage_level)}`}>
                          Triage: {patient.triage_level}
                        </Badge>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(patient.check_in_time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* All Patients in System Modal */}
      <Dialog open={showAllPatients} onOpenChange={setShowAllPatients}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-accent" />
                  All Patients in System
                </DialogTitle>
                <DialogDescription>
                  Complete patient registry ({allPatients.length} patients)
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Patients List */}
            <div className="space-y-3">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No patients found matching your search' : 'No patients in system'}
                  </p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 rounded-xl bg-muted/30 border hover-lift cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowAllPatients(false);
                      setShowPatientDetails(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold">{patient.first_name} {patient.last_name}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{patient.email}</span>
                          {patient.phone && (
                            <>
                              <span>•</span>
                              <span>{patient.phone}</span>
                            </>
                          )}
                          {patient.blood_type && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {patient.blood_type}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {patient.latest_visit && patient.latest_visit.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {patient.latest_visit[0].status}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Details Modal */}
      <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Patient Details
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6 py-4">
              {/* Patient Header */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-20 h-20 bg-gradient-royal rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedPatient.first_name} {selectedPatient.last_name}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2">{selectedPatient.email}</span>
                    </div>
                    {selectedPatient.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="ml-2">{selectedPatient.phone}</span>
                      </div>
                    )}
                    {selectedPatient.date_of_birth && (
                      <div>
                        <span className="text-muted-foreground">DOB:</span>
                        <span className="ml-2">
                          {new Date(selectedPatient.date_of_birth).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedPatient.blood_type && (
                      <div>
                        <span className="text-muted-foreground">Blood Type:</span>
                        <Badge variant="outline" className="ml-2">{selectedPatient.blood_type}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Visit Info */}
              {selectedPatient.visit && (
                <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-secondary" />
                    Current Visit
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className={`ml-2 ${getStatusColor(selectedPatient.status)}`}>
                        {selectedPatient.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Chief Complaint:</span>
                      <span className="ml-2">{selectedPatient.chief_complaint}</span>
                    </div>
                    {selectedPatient.triage_level && (
                      <div>
                        <span className="text-muted-foreground">Triage Level:</span>
                        <Badge variant="outline" className={`ml-2 ${getStatusColor(selectedPatient.triage_level)}`}>
                          {selectedPatient.triage_level}
                        </Badge>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Check-in Time:</span>
                      <span className="ml-2">{new Date(selectedPatient.check_in_time).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button className="btn-press gradient-royal">
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Chart
                </Button>
                <Button variant="outline" className="btn-press">
                  <Pill className="w-4 h-4 mr-2" />
                  Create Prescription
                </Button>
                <Button variant="outline" className="btn-press">
                  <Microscope className="w-4 h-4 mr-2" />
                  Order Lab Test
                </Button>
                <Button variant="outline" className="btn-press">
                  <FileSignature className="w-4 h-4 mr-2" />
                  Medical Note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prescriptions List Modal */}
      <Dialog open={showPrescriptionList} onOpenChange={setShowPrescriptionList}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Pill className="w-6 h-6 text-primary" />
              My Prescriptions
            </DialogTitle>
            <DialogDescription>
              View and manage prescriptions you've created
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">No prescriptions created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="p-4 rounded-xl bg-muted/30 border hover-lift cursor-pointer"
                    onClick={() => openPrescriptionQR(prescription)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          {prescription.status === 'signed' ? (
                            <QrCode className="w-6 h-6 text-primary" />
                          ) : (
                            <FileSignature className="w-6 h-6 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{prescription.prescription_number}</h4>
                          <p className="text-sm text-muted-foreground">
                            {prescription.patient
                              ? `${prescription.patient.first_name} ${prescription.patient.last_name}`
                              : 'Unknown Patient'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {prescription.prescription_items?.length || 0} medication(s)
                            </Badge>
                            {prescription.is_controlled_substance && (
                              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                                Controlled
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            prescription.status === 'signed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : prescription.status === 'dispensed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {prescription.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription QR Generator Modal */}
      <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
          {selectedPrescription && (
            <PrescriptionQRGenerator
              prescription={selectedPrescription}
              onSign={handleSignPrescription}
              onClose={() => setShowPrescriptionModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
