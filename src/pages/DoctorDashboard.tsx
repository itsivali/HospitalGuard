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
  X
} from "lucide-react";

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

    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <motion.div
          className="w-20 h-20 gradient-royal rounded-3xl flex items-center justify-center luxury-shadow"
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Stethoscope className="w-10 h-10 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <header className="glass-luxury sticky top-0 z-50 border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="relative w-14 h-14 gradient-royal rounded-3xl flex items-center justify-center luxury-shadow">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">Doctor Portal</h1>
              <p className="text-xs text-muted-foreground">
                Dr. {doctorData ? `${doctorData.first_name} ${doctorData.last_name}` : user?.user_metadata?.full_name || 'Doctor'}
                {doctorData?.department && ` • ${doctorData.department.name}`}
              </p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="btn-press hover-lift">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats - Clickable */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              className="hover-lift card-shadow bg-primary/5 border-primary/20 cursor-pointer transition-all hover:border-primary/40 hover:shadow-lg"
              onClick={() => setShowAllAppointments(true)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Today</Badge>
                </div>
                <h3 className="text-2xl font-bold">{stats.todayAppointments}</h3>
                <p className="text-sm text-muted-foreground">Appointments</p>
                <p className="text-xs text-primary mt-2 font-medium">Click to manage →</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card
              className="hover-lift card-shadow bg-secondary/5 border-secondary/20 cursor-pointer transition-all hover:border-secondary/40 hover:shadow-lg"
              onClick={() => setShowMyPatients(true)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">Active</Badge>
                </div>
                <h3 className="text-2xl font-bold">{stats.activePatientsCount}</h3>
                <p className="text-sm text-muted-foreground">Under My Care</p>
                <p className="text-xs text-secondary mt-2 font-medium">Click to view →</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover-lift card-shadow bg-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Urgent</Badge>
                </div>
                <h3 className="text-2xl font-bold">{stats.urgentCases}</h3>
                <p className="text-sm text-muted-foreground">Require Attention</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card
              className="hover-lift card-shadow bg-accent/5 border-accent/20 cursor-pointer transition-all hover:border-accent/40 hover:shadow-lg"
              onClick={() => setShowAllPatients(true)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">System</Badge>
                </div>
                <h3 className="text-2xl font-bold">{allPatients.length}</h3>
                <p className="text-sm text-muted-foreground">All Patients</p>
                <p className="text-xs text-accent mt-2 font-medium">Click to view →</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Today's Schedule Preview */}
        <Card className="mb-6 card-shadow hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </div>
              <Button
                className="btn-press gradient-royal"
                onClick={() => setShowAllAppointments(true)}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.slice(0, 3).map((apt) => {
                  const time = new Date(apt.scheduled_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <div key={apt.id} className="p-4 rounded-2xl bg-muted/30 hover-lift flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 gradient-royal rounded-2xl flex items-center justify-center flex-col">
                          <span className="text-white text-xs font-medium">{time.split(' ')[0]}</span>
                          <span className="text-white/80 text-xs">{time.split(' ')[1]}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Patient TBA'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {apt.appointment_type?.replace('_', ' ')} - {apt.department?.name || 'General'}
                          </p>
                          {apt.reason && (
                            <p className="text-xs text-muted-foreground mt-1">"{apt.reason}"</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" className="btn-press">View Details</Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Patients Preview */}
        <Card className="card-shadow hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="w-6 h-6 text-secondary" />
                  Patients Under My Care
                </CardTitle>
                <CardDescription>Currently active patients</CardDescription>
              </div>
              <Button
                className="btn-press gradient-emerald"
                onClick={() => setShowMyPatients(true)}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active patients currently</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myPatients.slice(0, 6).map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 rounded-2xl bg-muted/30 border border-muted hover-lift cursor-pointer"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowPatientDetails(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(patient.visit?.status || patient.status)}`}>
                        {patient.status || patient.visit?.status}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{patient.first_name} {patient.last_name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{patient.chief_complaint || 'General consultation'}</p>
                    {patient.triage_level && (
                      <Badge variant="outline" className={`text-xs mb-2 ${getStatusColor(patient.triage_level)}`}>
                        {patient.triage_level}
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(patient.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
    </div>
  );
};

export default DoctorDashboard;
