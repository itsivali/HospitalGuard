import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { format } from "date-fns";
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
  CheckCircle2
} from "lucide-react";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [showBookAppointment, setShowBookAppointment] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showLabResults, setShowLabResults] = useState(false);
  const [selectedLabOrder, setSelectedLabOrder] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [bookingForm, setBookingForm] = useState({
    department_id: '',
    doctor_id: '',
    appointment_type: 'consultation',
    scheduled_time: '',
    reason: ''
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
    chief_complaint: '',
    symptoms: '',
    department_id: ''
  });
  const [assigningDoctor, setAssigningDoctor] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUser(user);
        await fetchPatientData(user.id);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (showBookAppointment) {
      fetchDepartments();
    }
  }, [showBookAppointment]);

  useEffect(() => {
    if (bookingForm.department_id) {
      fetchDoctors(bookingForm.department_id);
    }
  }, [bookingForm.department_id]);

  useEffect(() => {
    if (showOnboarding) {
      fetchDepartments();
    }
  }, [showOnboarding]);

  const fetchPatientData = async (userId: string) => {
    try {
      // Fetch patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (patientError) throw patientError;
      setPatientData(patient);

      // Onboarding is now handled during signup, so no need to check here

      if (patient) {
        // Fetch appointments
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            *,
            doctor:hospital_staff!appointments_doctor_id_fkey(first_name, last_name, specialization),
            department:departments(name)
          `)
          .eq('patient_id', patient.id)
          .gte('scheduled_time', new Date().toISOString())
          .order('scheduled_time', { ascending: true })
          .limit(10);

        setAppointments(appointmentsData || []);

        // Fetch prescriptions
        const { data: prescriptionsData } = await supabase
          .from('prescriptions')
          .select(`
            *,
            prescription_items(*),
            doctor:hospital_staff(first_name, last_name)
          `)
          .eq('patient_id', patient.id)
          .in('status', ['signed', 'partially_dispensed'])
          .order('created_at', { ascending: false })
          .limit(10);

        setPrescriptions(prescriptionsData || []);

        // Fetch medical records
        const { data: recordsData } = await supabase
          .from('medical_records')
          .select(`
            *,
            doctor:hospital_staff(first_name, last_name),
            department:departments(name)
          `)
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setMedicalRecords(recordsData || []);

        // Fetch lab orders
        const { data: labData } = await supabase
          .from('lab_orders')
          .select('*')
          .eq('patient_id', patient.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(5);

        setLabOrders(labData || []);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast({
        title: "Error",
        description: "Failed to load your medical information",
        variant: "destructive"
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

      if (error) {
        console.error("Error fetching departments:", error);
        toast({
          title: "Info",
          description: "Using default departments list",
        });
        // Use hardcoded departments if fetch fails
        setDepartments([
          { id: 'emergency', name: 'Emergency' },
          { id: 'outpatient', name: 'Outpatient' },
          { id: 'cardiology', name: 'Cardiology' },
          { id: 'laboratory', name: 'Laboratory' },
          { id: 'radiology', name: 'Radiology' },
          { id: 'pharmacy', name: 'Pharmacy' },
        ]);
      } else {
        setDepartments(data || []);
      }
    } catch (error) {
      console.error("Exception fetching departments:", error);
      setDepartments([
        { id: 'emergency', name: 'Emergency' },
        { id: 'outpatient', name: 'Outpatient' },
        { id: 'cardiology', name: 'Cardiology' },
        { id: 'laboratory', name: 'Laboratory' },
        { id: 'radiology', name: 'Radiology' },
        { id: 'pharmacy', name: 'Pharmacy' },
      ]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchDoctors = async (departmentId: string) => {
    try {
      setLoadingDoctors(true);
      const { data, error } = await supabase
        .from('hospital_staff')
        .select('id, first_name, last_name, specialization')
        .eq('department_id', departmentId)
        .eq('staff_type', 'doctor')
        .eq('is_active', true)
        .order('last_name');

      if (error) {
        console.error("Error fetching doctors:", error);
      }
      setDoctors(data || []);
    } catch (error) {
      console.error("Exception fetching doctors:", error);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!patientData || !selectedDate || !selectedTime || !bookingForm.department_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Department, Date, and Time)",
        variant: "destructive"
      });
      return;
    }

    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':');
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentNumber = `APT-${Date.now()}`;

      const { error } = await supabase
        .from('appointments')
        .insert({
          appointment_number: appointmentNumber,
          patient_id: patientData.id,
          doctor_id: bookingForm.doctor_id || null,
          department_id: bookingForm.department_id || null,
          appointment_type: bookingForm.appointment_type,
          scheduled_time: scheduledDateTime.toISOString(),
          reason: bookingForm.reason,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment booked successfully"
      });

      setShowBookAppointment(false);
      setSelectedDate(undefined);
      setSelectedTime('09:00');
      setBookingForm({
        department_id: '',
        doctor_id: '',
        appointment_type: 'consultation',
        scheduled_time: '',
        reason: ''
      });

      if (user) await fetchPatientData(user.id);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive"
      });
    }
  };

  const handleRequestRefill = async (prescriptionId: string) => {
    toast({
      title: "Refill Requested",
      description: "Your prescription refill request has been submitted to your doctor"
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleOnboardingSubmit = async () => {
    if (!patientData || !onboardingForm.chief_complaint || !onboardingForm.department_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setAssigningDoctor(true);

      // Find an available doctor in the selected department
      const { data: availableDoctors, error: doctorError } = await supabase
        .from('hospital_staff')
        .select('id, first_name, last_name, specialization')
        .eq('department_id', onboardingForm.department_id)
        .eq('staff_type', 'doctor')
        .eq('is_active', true)
        .order('id'); // Random-ish selection

      if (doctorError || !availableDoctors || availableDoctors.length === 0) {
        throw new Error('No available doctors in this department');
      }

      // Select the first available doctor (in production, you'd check their schedule)
      const assignedDoctor = availableDoctors[0];

      // Create a new visit record for this patient
      const visitNumber = `V-${Date.now()}`;
      const { data: newVisit, error: visitError } = await supabase
        .from('patient_visits')
        .insert({
          patient_id: patientData.id,
          visit_number: visitNumber,
          admission_type: 'walk_in',
          status: 'checked_in',
          chief_complaint: onboardingForm.chief_complaint,
          attending_doctor_id: assignedDoctor.id,
          current_department_id: onboardingForm.department_id,
          notes: onboardingForm.symptoms || null
        })
        .select()
        .single();

      if (visitError) throw visitError;

      toast({
        title: "Doctor Assigned!",
        description: `You've been assigned to Dr. ${assignedDoctor.first_name} ${assignedDoctor.last_name} (${assignedDoctor.specialization})`,
      });

      setShowOnboarding(false);
      setOnboardingForm({
        chief_complaint: '',
        symptoms: '',
        department_id: ''
      });

      // Refresh patient data
      if (user) await fetchPatientData(user.id);
    } catch (error) {
      console.error("Error assigning doctor:", error);
      toast({
        title: "Error",
        description: "Failed to assign doctor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAssigningDoctor(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <motion.div
          className="w-20 h-20 gradient-royal rounded-3xl flex items-center justify-center luxury-shadow"
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Hospital className="w-10 h-10 text-white" />
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
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">Patient Portal</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {user?.user_metadata?.full_name || 'Patient'}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="btn-press hover-lift">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="hover-lift card-shadow bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Upcoming</Badge>
                </div>
                <h3 className="text-2xl font-bold">{appointments.length}</h3>
                <p className="text-sm text-muted-foreground">Appointments</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover-lift card-shadow bg-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <Pill className="w-6 h-6 text-secondary" />
                  </div>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">Active</Badge>
                </div>
                <h3 className="text-2xl font-bold">{prescriptions.length}</h3>
                <p className="text-sm text-muted-foreground">Prescriptions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover-lift card-shadow bg-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-destructive" />
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Lab</Badge>
                </div>
                <h3 className="text-2xl font-bold">{labOrders.length}</h3>
                <p className="text-sm text-muted-foreground">Lab Results Ready</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover-lift card-shadow bg-accent/5 border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Available</Badge>
                </div>
                <h3 className="text-2xl font-bold">{medicalRecords.length}</h3>
                <p className="text-sm text-muted-foreground">Medical Records</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming Appointments */}
          <Card className="lg:col-span-2 card-shadow hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription>Your scheduled visits and consultations</CardDescription>
                </div>
                <Button
                  className="btn-press gradient-royal"
                  onClick={() => setShowBookAppointment(true)}
                >
                  Book New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No upcoming appointments</p>
                  <Button
                    variant="outline"
                    className="mt-4 btn-press"
                    onClick={() => setShowBookAppointment(true)}
                  >
                    Schedule Your First Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 3).map((apt) => {
                    const scheduledDate = new Date(apt.scheduled_time);
                    const formattedDate = scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const formattedTime = scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                    return (
                      <div key={apt.id} className="p-4 rounded-2xl bg-muted/30 hover-lift flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 gradient-royal rounded-2xl flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {apt.doctor ? `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name}` : 'TBA'}
                              {apt.department && ` - ${apt.department.name}`}
                            </h4>
                            <p className="text-sm text-muted-foreground">{apt.appointment_type || 'Consultation'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">{formattedDate} at {formattedTime}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="btn-press"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowAppointmentDetails(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actionable Insights */}
          <Card className="card-shadow hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="w-5 h-5 text-accent" />
                Action Items
              </CardTitle>
              <CardDescription>Things you should know</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {prescriptions.length > 0 && prescriptions.some(rx => rx.refills_allowed === 0) && (
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-sm font-semibold">Prescription Refill Due</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {prescriptions.find(rx => rx.refills_allowed === 0)?.prescription_items?.[0]?.medication_name || 'Medication'} needs refill
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 btn-press"
                        variant="outline"
                        onClick={() => handleRequestRefill(prescriptions.find(rx => rx.refills_allowed === 0)?.id || '')}
                      >
                        Request Refill
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {labOrders.length > 0 && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-sm font-semibold">Lab Results Ready</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {labOrders[0].test_type} results are available
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 btn-press"
                        variant="outline"
                        onClick={() => {
                          setSelectedLabOrder(labOrders[0]);
                          setShowLabResults(true);
                        }}
                      >
                        View Results
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-2">
                  <Video className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-sm font-semibold">Telemedicine Available</p>
                    <p className="text-xs text-muted-foreground mt-1">Schedule a virtual follow-up consultation</p>
                    <Button
                      size="sm"
                      className="mt-2 btn-press"
                      variant="outline"
                      onClick={() => {
                        setBookingForm({ ...bookingForm, appointment_type: 'telemedicine' });
                        setShowBookAppointment(true);
                      }}
                    >
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>

              {prescriptions.length === 0 && labOrders.length === 0 && appointments.length === 0 && (
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <p className="text-sm text-muted-foreground">No action items at this time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Prescriptions */}
        <Card className="mt-6 card-shadow hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Pill className="w-6 h-6 text-secondary" />
                  Active Prescriptions
                </CardTitle>
                <CardDescription>Your current medications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active prescriptions</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {prescriptions.map((rx) => {
                  const expiryDate = rx.valid_until ? new Date(rx.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                  const totalItems = rx.prescription_items?.length || 0;

                  return (
                    <div key={rx.id} className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 hover-lift">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                          <Pill className="w-5 h-5 text-secondary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {rx.refills_allowed > 0 ? `${rx.refills_allowed} refills` : 'No refills'}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-1">
                        {rx.prescription_items && rx.prescription_items[0]
                          ? `${rx.prescription_items[0].medication_name} ${rx.prescription_items[0].dosage}`
                          : `Prescription #${rx.prescription_number}`}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {totalItems > 1 ? `+ ${totalItems - 1} more medications` : rx.prescription_items?.[0]?.frequency || 'See instructions'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Clock className="w-3 h-3" />
                        Expires: {expiryDate}
                      </div>
                      <Badge variant="outline" className="text-xs bg-secondary/10">
                        {rx.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Medical History */}
        <Card className="mt-6 card-shadow hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Recent Medical History
            </CardTitle>
            <CardDescription>Your latest visits and procedures</CardDescription>
          </CardHeader>
          <CardContent>
            {medicalRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No medical records available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalRecords.slice(0, 5).map((record) => {
                  const recordDate = new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover-lift">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {record.title}
                            {record.department && ` - ${record.department.name}`}
                          </h4>
                          <p className="text-sm text-muted-foreground">{recordDate}</p>
                          {record.doctor && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Dr. {record.doctor.first_name} {record.doctor.last_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-secondary/10 text-secondary">
                          {record.record_type || 'Record'}
                        </Badge>
                        {record.is_confidential && (
                          <p className="text-xs text-muted-foreground mt-1">Confidential</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Book Appointment Modal */}
      <Dialog open={showBookAppointment} onOpenChange={setShowBookAppointment}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl"></div>
                <div className="relative w-16 h-16 gradient-royal rounded-full flex items-center justify-center luxury-shadow">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              Book Your Appointment
            </DialogTitle>
            <DialogDescription className="text-center">
              Schedule your visit with our world-class healthcare professionals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Department Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Label htmlFor="department" className="text-base font-semibold flex items-center gap-2">
                <Hospital className="w-4 h-4 text-primary" />
                Department *
              </Label>
              {loadingDepartments ? (
                <div className="p-4 border rounded-xl bg-muted/30 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading departments...</p>
                </div>
              ) : departments.length === 0 ? (
                <div className="p-4 border rounded-xl bg-destructive/10 border-destructive/20">
                  <p className="text-sm text-destructive">No departments available</p>
                </div>
              ) : (
                <Select
                  value={bookingForm.department_id}
                  onValueChange={(value) => setBookingForm({ ...bookingForm, department_id: value, doctor_id: '' })}
                >
                  <SelectTrigger className="h-12 border-2 hover:border-primary transition-colors">
                    <SelectValue placeholder="Choose a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id} className="py-3">
                        <div className="flex items-center gap-2">
                          <Hospital className="w-4 h-4 text-primary" />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </motion.div>

            {/* Doctor Selection */}
            {bookingForm.department_id && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Label htmlFor="doctor" className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-secondary" />
                  Preferred Doctor (Optional)
                </Label>
                {loadingDoctors ? (
                  <div className="p-4 border rounded-xl bg-muted/30 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading doctors...</p>
                  </div>
                ) : (
                  <Select
                    value={bookingForm.doctor_id}
                    onValueChange={(value) => setBookingForm({ ...bookingForm, doctor_id: value })}
                  >
                    <SelectTrigger className="h-12 border-2 hover:border-secondary transition-colors">
                      <SelectValue placeholder="Any available doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">
                          No doctors available in this department
                        </div>
                      ) : (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id} className="py-3">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Dr. {doctor.first_name} {doctor.last_name}
                              </span>
                              {doctor.specialization && (
                                <span className="text-xs text-muted-foreground">{doctor.specialization}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </motion.div>
            )}

            {/* Appointment Type */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <Label htmlFor="type" className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                Appointment Type *
              </Label>
              <Select
                value={bookingForm.appointment_type}
                onValueChange={(value) => setBookingForm({ ...bookingForm, appointment_type: value })}
              >
                <SelectTrigger className="h-12 border-2 hover:border-accent transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation" className="py-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span>General Consultation</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="follow_up" className="py-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Follow-up Visit</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="procedure" className="py-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>Procedure</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="lab" className="py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Lab Work</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="radiology" className="py-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span>Radiology/Imaging</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="telemedicine" className="py-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>Telemedicine (Virtual)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Date & Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <Label className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Select Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full h-12 justify-start text-left font-normal border-2 hover:border-primary transition-colors ${
                      !selectedDate && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </motion.div>

            {/* Time Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-3"
            >
              <Label htmlFor="time" className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" />
                Select Time *
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="h-12 border-2 hover:border-secondary transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Array.from({ length: 48 }, (_, i) => {
                    const hour = Math.floor(i / 2);
                    const minute = i % 2 === 0 ? '00' : '30';
                    const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const period = hour < 12 ? 'AM' : 'PM';
                    return (
                      <SelectItem key={time} value={time} className="py-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{`${displayHour}:${minute} ${period}`}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Reason */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Label htmlFor="reason" className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-secondary" />
                Reason for Visit
              </Label>
              <Textarea
                id="reason"
                placeholder="Tell us briefly why you're scheduling this appointment..."
                value={bookingForm.reason}
                onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                rows={4}
                className="border-2 hover:border-secondary transition-colors resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This helps us prepare for your visit and provide better care
              </p>
            </motion.div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowBookAppointment(false)}
              className="flex-1 h-12 btn-press hover-lift"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookAppointment}
              className="flex-1 h-12 gradient-royal btn-press hover-lift"
              disabled={!selectedDate || !selectedTime || !bookingForm.department_id}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Confirm Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Modal */}
      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold mb-2">Doctor</h4>
                <p className="text-muted-foreground">
                  {selectedAppointment.doctor
                    ? `Dr. ${selectedAppointment.doctor.first_name} ${selectedAppointment.doctor.last_name}`
                    : 'To be assigned'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Department</h4>
                <p className="text-muted-foreground">
                  {selectedAppointment.department?.name || 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Type</h4>
                <p className="text-muted-foreground capitalize">
                  {selectedAppointment.appointment_type?.replace('_', ' ')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Scheduled Time</h4>
                <p className="text-muted-foreground">
                  {new Date(selectedAppointment.scheduled_time).toLocaleString()}
                </p>
              </div>
              {selectedAppointment.reason && (
                <div>
                  <h4 className="font-semibold mb-2">Reason</h4>
                  <p className="text-muted-foreground">{selectedAppointment.reason}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <Badge>{selectedAppointment.status}</Badge>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowAppointmentDetails(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lab Results Modal */}
      <Dialog open={showLabResults} onOpenChange={setShowLabResults}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Lab Results</DialogTitle>
          </DialogHeader>
          {selectedLabOrder && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold mb-2">Test Type</h4>
                <p className="text-muted-foreground">{selectedLabOrder.test_type}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Order Number</h4>
                <p className="text-muted-foreground">{selectedLabOrder.order_number}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Results Available</h4>
                <p className="text-muted-foreground">
                  {selectedLabOrder.results_available_at
                    ? new Date(selectedLabOrder.results_available_at).toLocaleString()
                    : 'Pending'}
                </p>
              </div>
              {selectedLabOrder.results && (
                <div>
                  <h4 className="font-semibold mb-2">Results</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedLabOrder.results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <Badge>{selectedLabOrder.status}</Badge>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowLabResults(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Onboarding Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"></div>
                <div className="relative w-20 h-20 gradient-royal rounded-full flex items-center justify-center luxury-shadow">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-center text-3xl font-bold">
              Welcome to HospitalGuard
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Let's get you connected with the right doctor. Please tell us what brings you in today.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Chief Complaint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Label htmlFor="chief_complaint" className="text-base font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                What are you experiencing? *
              </Label>
              <Input
                id="chief_complaint"
                placeholder="E.g., chest pain, fever, headache..."
                value={onboardingForm.chief_complaint}
                onChange={(e) => setOnboardingForm({ ...onboardingForm, chief_complaint: e.target.value })}
                className="h-12 border-2 hover:border-primary transition-colors text-base"
              />
              <p className="text-xs text-muted-foreground">
                Brief description of your main concern
              </p>
            </motion.div>

            {/* Department Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <Label htmlFor="onboarding_department" className="text-base font-semibold flex items-center gap-2">
                <Hospital className="w-5 h-5 text-primary" />
                Which department do you need? *
              </Label>
              {loadingDepartments ? (
                <div className="p-4 border rounded-xl bg-muted/30 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading departments...</p>
                </div>
              ) : departments.length === 0 ? (
                <div className="p-4 border rounded-xl bg-destructive/10 border-destructive/20">
                  <p className="text-sm text-destructive">No departments available</p>
                </div>
              ) : (
                <Select
                  value={onboardingForm.department_id}
                  onValueChange={(value) => setOnboardingForm({ ...onboardingForm, department_id: value })}
                >
                  <SelectTrigger className="h-12 border-2 hover:border-primary transition-colors">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id} className="py-3">
                        <div className="flex items-center gap-2">
                          <Hospital className="w-4 h-4 text-primary" />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                Not sure? Choose "Outpatient" or "Emergency" for general care
              </p>
            </motion.div>

            {/* Additional Symptoms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <Label htmlFor="symptoms" className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" />
                Additional Details (Optional)
              </Label>
              <Textarea
                id="symptoms"
                placeholder="Any other symptoms or information we should know..."
                value={onboardingForm.symptoms}
                onChange={(e) => setOnboardingForm({ ...onboardingForm, symptoms: e.target.value })}
                rows={4}
                className="border-2 hover:border-secondary transition-colors resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Additional symptoms, duration, severity, medications you're taking, etc.
              </p>
            </motion.div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-primary/10 border-2 border-primary/20"
            >
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-base">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>We'll automatically assign you an available doctor in the selected department</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Your doctor will review your information and guide your treatment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>This doctor will stay with you throughout your recovery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>You'll be able to see your assigned doctor in your dashboard</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleOnboardingSubmit}
              disabled={!onboardingForm.chief_complaint || !onboardingForm.department_id || assigningDoctor}
              className="w-full h-14 text-base gradient-royal btn-press hover-lift disabled:opacity-50"
            >
              {assigningDoctor ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Hospital className="w-5 h-5" />
                  </motion.div>
                  Assigning Doctor...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Get Started with My Doctor
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDashboard;
