import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
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
  Database
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Stats
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    activeStaff: 0,
    todayAppointments: 0,
    criticalPatients: 0
  });

  // Data states
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
          patient:patients(first_name, last_name, phone),
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
          patient:patients(first_name, last_name),
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

      // Staff
      const { data: staffData, count: staffCount } = await supabase
        .from('hospital_staff')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setStaff(staffData || []);

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
        criticalPatients: criticalCount || 0
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
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
            <Button onClick={handleLogout} variant="outline" className="hover-lift">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover-lift bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Patients</CardTitle>
                  <Users className="w-5 h-5 text-blue-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-blue-100 mt-1">Registered in system</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover-lift bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-emerald-100">Appointments</CardTitle>
                  <Calendar className="w-5 h-5 text-emerald-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalAppointments}</div>
                <p className="text-xs text-emerald-100 mt-1">{stats.todayAppointments} today</p>
              </CardContent>
            </Card>
          </motion.div>

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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="hover-lift bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-amber-100">Total Revenue</CardTitle>
                  <Wallet className="w-5 h-5 text-amber-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-amber-100 mt-1">{formatCurrency(stats.pendingPayments)} pending</p>
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
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="w-5 h-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.pendingPayments)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, appointments, prescriptions, bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Different Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview">
              <Database className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="patients">
              <Users className="w-4 h-4 mr-2" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <Pill className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="financials">
              <Wallet className="w-4 h-4 mr-2" />
              Financials
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Complete hospital management system statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-semibold">Total Patients</p>
                        <p className="text-sm text-muted-foreground">All registered patients in the system</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalPatients}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="font-semibold">Total Appointments</p>
                        <p className="text-sm text-muted-foreground">All appointments (past, present, future)</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{stats.totalAppointments}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Pill className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="font-semibold">Total Prescriptions</p>
                        <p className="text-sm text-muted-foreground">All prescriptions issued</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalPrescriptions}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-8 h-8 text-amber-600" />
                      <div>
                        <p className="font-semibold">Total Revenue</p>
                        <p className="text-sm text-muted-foreground">All bills and payments</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Patients</CardTitle>
                    <CardDescription>{filteredPatients.length} patients found</CardDescription>
                  </div>
                  <Button className="btn-press">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredPatients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
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
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Appointments</CardTitle>
                    <CardDescription>{filteredAppointments.length} appointments found</CardDescription>
                  </div>
                  <Button className="btn-press">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredAppointments.slice(0, 50).map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {appointment.patient?.first_name} {appointment.patient?.last_name}
                          </p>
                          <Badge variant="outline">{appointment.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.scheduled_time).toLocaleString()} • {appointment.department?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Prescriptions</CardTitle>
                    <CardDescription>{filteredPrescriptions.length} prescriptions found</CardDescription>
                  </div>
                  <Button className="btn-press">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Prescription
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredPrescriptions.slice(0, 50).map((prescription, index) => (
                    <motion.div
                      key={prescription.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{prescription.prescription_number}</p>
                          <Badge variant="outline">{prescription.status}</Badge>
                          <Badge variant="secondary">{prescription.refills_allowed} refills</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Patient: {prescription.patient?.first_name} {prescription.patient?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Doctor: {prescription.doctor?.first_name} {prescription.doctor?.last_name}
                        </p>
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
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>All bills and payments</CardDescription>
                  </div>
                  <Button className="btn-press">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.pendingPayments)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Bills</p>
                    <p className="text-2xl font-bold text-blue-600">{bills.length}</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {bills.slice(0, 50).map((bill, index) => (
                    <motion.div
                      key={bill.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
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
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
