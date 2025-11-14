import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/currency";
import {
  Users,
  Calendar,
  Pill,
  Wallet,
  TrendingUp,
  Building2,
  Activity,
  Shield,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  FileText,
  DollarSign,
  Stethoscope,
  Hospital,
  Database,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Receipt,
  Clock,
  X
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const AdminDashboardEnhanced = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showCreatePatientModal, setShowCreatePatientModal] = useState(false);
  const [showCreateDoctorModal, setShowCreateDoctorModal] = useState(false);
  const [showCreatePrescriptionModal, setShowCreatePrescriptionModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    activeStaff: 0,
    todayAppointments: 0,
    criticalPatients: 0,
    unpaidBills: 0,
    overduePayments: 0
  });

  // Data states
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states for creating records
  const [newPatientForm, setNewPatientForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergies: [] as string[],
    insurance_provider: '',
    insurance_policy_number: '',
    national_id: ''
  });

  const [newDoctorForm, setNewDoctorForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    department_id: '',
    license_number: '',
    hire_date: ''
  });

  const [newPrescriptionForm, setNewPrescriptionForm] = useState({
    patient_id: '',
    doctor_id: '',
    medications: [] as { medication_id: string; dosage: string; frequency: string; duration: string; quantity: number; instructions: string }[],
    refills_allowed: 0,
    valid_until: '',
    notes: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        // Check if user is admin
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const isAdmin = roles?.some(r => r.role === 'admin');
        if (!isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have administrator privileges",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setUser(user);
        await fetchAllData();
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const fetchAllData = async () => {
    try {
      // Fetch all statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Patients
      const { data: patientsData, count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      setPatients(patientsData || []);

      // Appointments
      const { data: appointmentsData, count: appointmentsCount } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name, phone, email),
          doctor:hospital_staff(first_name, last_name),
          department:departments(name)
        `, { count: 'exact' })
        .order('scheduled_time', { ascending: false });
      setAppointments(appointmentsData || []);

      // Today's appointments
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_time', today.toISOString())
        .lt('scheduled_time', tomorrow.toISOString());

      // Prescriptions
      const { data: prescriptionsData, count: prescriptionsCount } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients(first_name, last_name, email),
          doctor:hospital_staff(first_name, last_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });
      setPrescriptions(prescriptionsData || []);

      // Bills and Revenue
      const { data: billsData } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });
      setBills(billsData || []);

      const totalRevenue = billsData?.reduce((sum, bill) => sum + Number(bill.total_amount), 0) || 0;
      const pendingPayments = billsData?.reduce((sum, bill) => sum + Number(bill.amount_due), 0) || 0;
      const unpaidBills = billsData?.filter(b => b.status === 'pending' || b.status === 'insurance_pending').length || 0;
      const overduePayments = billsData?.filter(b => b.status === 'overdue').length || 0;

      // Staff
      const { data: staffData, count: staffCount } = await supabase
        .from('hospital_staff')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setStaff(staffData || []);

      // Departments
      const { data: departmentsData } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      setDepartments(departmentsData || []);

      // Medications
      const { data: medicationsData } = await supabase
        .from('pharmacy_inventory')
        .select('*')
        .order('category', { ascending: true });
      setMedications(medicationsData || []);

      // Critical patients
      const { count: criticalCount } = await supabase
        .from('patient_visits')
        .select('*', { count: 'exact', head: true })
        .in('triage_level', ['critical', 'urgent'])
        .in('status', ['checked_in', 'in_triage', 'in_consultation', 'in_treatment']);

      setStats({
        totalPatients: patientsCount || 0,
        totalAppointments: appointmentsCount || 0,
        totalPrescriptions: prescriptionsCount || 0,
        totalRevenue: totalRevenue,
        pendingPayments: pendingPayments,
        activeStaff: staffCount || 0,
        todayAppointments: todayCount || 0,
        criticalPatients: criticalCount || 0,
        unpaidBills: unpaidBills,
        overduePayments: overduePayments
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Data Fetch Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive",
      });
    }
  };

  const handleCreatePatient = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([newPatientForm])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient created successfully",
      });

      setShowCreatePatientModal(false);
      fetchAllData();
      // Reset form
      setNewPatientForm({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        blood_type: '',
        email: '',
        phone: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        allergies: [],
        insurance_provider: '',
        insurance_policy_number: '',
        national_id: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create patient",
        variant: "destructive",
      });
    }
  };

  const handleCreateDoctor = async () => {
    try {
      // Generate staff number
      const staffNumber = `DOC-${Date.now()}`;

      const { data, error } = await supabase
        .from('hospital_staff')
        .insert([{
          ...newDoctorForm,
          staff_number: staffNumber,
          staff_type: 'doctor',
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Doctor created successfully",
      });

      setShowCreateDoctorModal(false);
      fetchAllData();
      // Reset form
      setNewDoctorForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        specialization: '',
        department_id: '',
        license_number: '',
        hire_date: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create doctor",
        variant: "destructive",
      });
    }
  };

  const handleCreatePrescription = async () => {
    try {
      // Create prescription
      const prescriptionNumber = `RX-${Date.now()}`;
      const qrCodeData = `QR-${prescriptionNumber}`;
      const digitalSignature = `SIG-${Date.now()}`;

      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert([{
          prescription_number: prescriptionNumber,
          patient_id: newPrescriptionForm.patient_id,
          doctor_id: newPrescriptionForm.doctor_id,
          status: 'signed',
          qr_code_data: qrCodeData,
          digital_signature: digitalSignature,
          signed_at: new Date().toISOString(),
          refills_allowed: newPrescriptionForm.refills_allowed,
          valid_until: newPrescriptionForm.valid_until,
          notes: newPrescriptionForm.notes
        }])
        .select()
        .single();

      if (prescriptionError) throw prescriptionError;

      // Create prescription items
      for (const med of newPrescriptionForm.medications) {
        const { error: itemError } = await supabase
          .from('prescription_items')
          .insert([{
            prescription_id: prescriptionData.id,
            medication_name: medications.find(m => m.id === med.medication_id)?.medication_name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            quantity: med.quantity,
            instructions: med.instructions
          }]);

        if (itemError) throw itemError;
      }

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      setShowCreatePrescriptionModal(false);
      fetchAllData();
      // Reset form
      setNewPrescriptionForm({
        patient_id: '',
        doctor_id: '',
        medications: [],
        refills_allowed: 0,
        valid_until: '',
        notes: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter data based on search
  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAppointments = appointments.filter(a =>
    a.patient?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.patient?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patient?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group medications by category
  const medicationsByCategory = medications.reduce((acc, med) => {
    if (!acc[med.category]) {
      acc[med.category] = [];
    }
    acc[med.category].push(med);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">System Administrator</h1>
                <p className="text-sm text-muted-foreground">Full System Access • {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => fetchAllData()} variant="outline" className="hover-lift">
                <Activity className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button onClick={handleLogout} variant="outline" className="hover-lift">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid - Clickable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Patients Card - Clickable */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setShowPatientModal(true)}
            className="cursor-pointer"
          >
            <Card className="hover-lift bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-2xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Patients</CardTitle>
                  <Users className="w-5 h-5 text-blue-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-blue-100 mt-1">Click to manage →</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appointments Card - Clickable */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowAppointmentModal(true)}
            className="cursor-pointer"
          >
            <Card className="hover-lift bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 hover:shadow-2xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-emerald-100">Appointments</CardTitle>
                  <Calendar className="w-5 h-5 text-emerald-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalAppointments}</div>
                <p className="text-xs text-emerald-100 mt-1">{stats.todayAppointments} today • Click to view →</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prescriptions Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover-lift bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-purple-100">Prescriptions</CardTitle>
                  <Pill className="w-5 h-5 text-purple-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPrescriptions}</div>
                <p className="text-xs text-purple-100 mt-1">All prescriptions</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Card - Clickable */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setShowBillingModal(true)}
            className="cursor-pointer"
          >
            <Card className="hover-lift bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 hover:shadow-2xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-amber-100">Total Revenue</CardTitle>
                  <Wallet className="w-5 h-5 text-amber-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-amber-100 mt-1">{formatCurrency(stats.pendingPayments)} pending • Click →</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStaff}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
                <Activity className="w-5 h-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.criticalPatients}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.unpaidBills}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Building2 className="w-5 h-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button onClick={() => setShowCreatePatientModal(true)} className="w-full btn-press bg-gradient-to-r from-blue-500 to-blue-600">
            <UserPlus className="w-4 h-4 mr-2" />
            Create Patient
          </Button>
          <Button onClick={() => setShowCreateDoctorModal(true)} className="w-full btn-press bg-gradient-to-r from-emerald-500 to-emerald-600">
            <Stethoscope className="w-4 h-4 mr-2" />
            Create Doctor
          </Button>
          <Button onClick={() => setShowCreatePrescriptionModal(true)} className="w-full btn-press bg-gradient-to-r from-purple-500 to-purple-600">
            <Pill className="w-4 h-4 mr-2" />
            Create Prescription
          </Button>
          <Button onClick={() => setShowDepartmentModal(true)} className="w-full btn-press bg-gradient-to-r from-amber-500 to-amber-600">
            <Building2 className="w-4 h-4 mr-2" />
            View Departments
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, appointments, prescriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patient Management Modal */}
        <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                All Patients ({filteredPatients.length})
              </DialogTitle>
              <DialogDescription>
                Complete patient registry - View, edit, and manage all patients
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{patient.first_name} {patient.last_name}</p>
                      <p className="text-sm text-muted-foreground">{patient.email} • {patient.phone}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{patient.blood_type}</Badge>
                        <Badge variant="outline" className="text-xs">{patient.gender}</Badge>
                        {patient.national_id && <Badge variant="outline" className="text-xs">ID: {patient.national_id}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Appointment Management Modal */}
        <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-600" />
                All Appointments ({filteredAppointments.length})
              </DialogTitle>
              <DialogDescription>
                Complete appointment schedule - View and manage all appointments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {filteredAppointments.slice(0, 100).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">
                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                      </p>
                      <Badge variant="outline">{appointment.status}</Badge>
                      <Badge variant="secondary" className="text-xs">{appointment.appointment_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.scheduled_time).toLocaleString()} • {appointment.department?.name}
                    </p>
                    {appointment.doctor && (
                      <p className="text-sm text-muted-foreground">
                        Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}
                      </p>
                    )}
                    {appointment.reason && (
                      <p className="text-xs text-muted-foreground mt-1 italic">Reason: {appointment.reason}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Billing Modal */}
        <Dialog open={showBillingModal} onOpenChange={setShowBillingModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Wallet className="w-6 h-6 text-amber-600" />
                Billing Overview
              </DialogTitle>
              <DialogDescription>
                Complete financial data - Bills, payments, and revenue
              </DialogDescription>
            </DialogHeader>

            {/* Billing Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.pendingPayments)}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overduePayments} bills</p>
              </div>
            </div>

            {/* Bills List */}
            <div className="space-y-3">
              {bills.slice(0, 50).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{bill.bill_number}</p>
                      <Badge variant="outline">{bill.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total: {formatCurrency(bill.total_amount)} •
                      Paid: {formatCurrency(bill.amount_paid)} •
                      Due: {formatCurrency(bill.amount_due)}
                    </p>
                    {bill.insurance_covered > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Insurance: {formatCurrency(bill.insurance_covered)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <CreditCard className="w-4 h-4 mr-1" />
                      Pay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Department View Modal */}
        <Dialog open={showDepartmentModal} onOpenChange={setShowDepartmentModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                All Departments ({departments.length})
              </DialogTitle>
              <DialogDescription>
                View all departments with staff and patient information
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept) => {
                const deptStaff = staff.filter(s => s.department_id === dept.id);
                const deptDoctors = deptStaff.filter(s => s.staff_type === 'doctor');

                return (
                  <Card key={dept.id} className="hover-lift">
                    <CardHeader>
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <CardDescription>{dept.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Staff</span>
                          <Badge variant="secondary">{deptStaff.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Doctors</span>
                          <Badge variant="secondary">{deptDoctors.length}</Badge>
                        </div>
                        {dept.head_of_department_id && (
                          <div className="mt-3 p-2 bg-primary/5 rounded">
                            <p className="text-xs text-muted-foreground">Head of Department</p>
                            <p className="text-sm font-medium">
                              {staff.find(s => s.id === dept.head_of_department_id)?.first_name || 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Patient Modal */}
        <Dialog open={showCreatePatientModal} onOpenChange={setShowCreatePatientModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-primary" />
                Create New Patient
              </DialogTitle>
              <DialogDescription>
                Enter patient information to register them in the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={newPatientForm.first_name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={newPatientForm.last_name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={newPatientForm.date_of_birth}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={newPatientForm.gender} onValueChange={(value) => setNewPatientForm({ ...newPatientForm, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_type">Blood Type</Label>
                <Select value={newPatientForm.blood_type} onValueChange={(value) => setNewPatientForm({ ...newPatientForm, blood_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="national_id">National ID *</Label>
                <Input
                  id="national_id"
                  value={newPatientForm.national_id}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, national_id: e.target.value })}
                  placeholder="12345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatientForm.email}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                  placeholder="patient@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={newPatientForm.phone}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                  placeholder="+254-712-345-678"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newPatientForm.address}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                  placeholder="123 Main St, Nairobi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={newPatientForm.emergency_contact_name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, emergency_contact_name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={newPatientForm.emergency_contact_phone}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, emergency_contact_phone: e.target.value })}
                  placeholder="+254-712-345-678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance_provider">Insurance Provider</Label>
                <Input
                  id="insurance_provider"
                  value={newPatientForm.insurance_provider}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, insurance_provider: e.target.value })}
                  placeholder="AAR Insurance"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance_policy_number">Insurance Policy Number</Label>
                <Input
                  id="insurance_policy_number"
                  value={newPatientForm.insurance_policy_number}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, insurance_policy_number: e.target.value })}
                  placeholder="AAR-2024-001"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreatePatientModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePatient} className="btn-press">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Doctor Modal */}
        <Dialog open={showCreateDoctorModal} onOpenChange={setShowCreateDoctorModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-emerald-600" />
                Create New Doctor
              </DialogTitle>
              <DialogDescription>
                Add a new doctor to the hospital staff
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor_first_name">First Name *</Label>
                <Input
                  id="doctor_first_name"
                  value={newDoctorForm.first_name}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_last_name">Last Name *</Label>
                <Input
                  id="doctor_last_name"
                  value={newDoctorForm.last_name}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, last_name: e.target.value })}
                  placeholder="Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_email">Email *</Label>
                <Input
                  id="doctor_email"
                  type="email"
                  value={newDoctorForm.email}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })}
                  placeholder="doctor@hospital.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_phone">Phone *</Label>
                <Input
                  id="doctor_phone"
                  value={newDoctorForm.phone}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, phone: e.target.value })}
                  placeholder="+254-712-345-678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  value={newDoctorForm.specialization}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialization: e.target.value })}
                  placeholder="General Practice"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department_id">Department *</Label>
                <Select value={newDoctorForm.department_id} onValueChange={(value) => setNewDoctorForm({ ...newDoctorForm, department_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={newDoctorForm.license_number}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, license_number: e.target.value })}
                  placeholder="MED-12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire_date">Hire Date *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={newDoctorForm.hire_date}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, hire_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDoctorModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDoctor} className="btn-press bg-gradient-to-r from-emerald-500 to-emerald-600">
                <Stethoscope className="w-4 h-4 mr-2" />
                Create Doctor
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Prescription Modal */}
        <Dialog open={showCreatePrescriptionModal} onOpenChange={setShowCreatePrescriptionModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Pill className="w-6 h-6 text-purple-600" />
                Create New Prescription
              </DialogTitle>
              <DialogDescription>
                Create a prescription with categorized medications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prescription_patient">Patient *</Label>
                  <Select value={newPrescriptionForm.patient_id} onValueChange={(value) => setNewPrescriptionForm({ ...newPrescriptionForm, patient_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescription_doctor">Doctor *</Label>
                  <Select value={newPrescriptionForm.doctor_id} onValueChange={(value) => setNewPrescriptionForm({ ...newPrescriptionForm, doctor_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter(s => s.staff_type === 'doctor').map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refills_allowed">Refills Allowed</Label>
                  <Input
                    id="refills_allowed"
                    type="number"
                    min="0"
                    value={newPrescriptionForm.refills_allowed}
                    onChange={(e) => setNewPrescriptionForm({ ...newPrescriptionForm, refills_allowed: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until *</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={newPrescriptionForm.valid_until}
                    onChange={(e) => setNewPrescriptionForm({ ...newPrescriptionForm, valid_until: e.target.value })}
                  />
                </div>
              </div>

              {/* Medications by Category */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Available Medications by Category</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {Object.entries(medicationsByCategory).map(([category, meds]) => (
                    <div key={category} className="border-b pb-3 last:border-b-0">
                      <h4 className="font-medium text-sm text-primary mb-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {meds.map((med: any) => (
                          <div key={med.id} className="flex items-center gap-2 text-sm p-2 bg-slate-50 rounded hover:bg-slate-100">
                            <input
                              type="checkbox"
                              id={`med-${med.id}`}
                              className="rounded"
                            />
                            <label htmlFor={`med-${med.id}`} className="flex-1 cursor-pointer">
                              {med.medication_name} ({med.strength}) - {med.dosage_form}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescription_notes">Notes</Label>
                <Textarea
                  id="prescription_notes"
                  value={newPrescriptionForm.notes}
                  onChange={(e) => setNewPrescriptionForm({ ...newPrescriptionForm, notes: e.target.value })}
                  placeholder="Additional instructions or notes..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreatePrescriptionModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePrescription} className="btn-press bg-gradient-to-r from-purple-500 to-purple-600">
                <Pill className="w-4 h-4 mr-2" />
                Create Prescription
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboardEnhanced;
