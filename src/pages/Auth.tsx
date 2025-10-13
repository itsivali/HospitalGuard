import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hospital,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  Users,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const roleParam = searchParams.get("role");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "patient",
  });

  // Patient onboarding states
  const [signupStep, setSignupStep] = useState<"role-selection" | "patient-flow" | "staff-flow">("role-selection");
  const [patientSignupStep, setPatientSignupStep] = useState<"symptoms" | "basic" | "doctor-assignment">("basic");
  const [symptomData, setSymptomData] = useState({
    chiefComplaint: "",
    additionalSymptoms: ""
  });
  const [aiAnalysis, setAiAnalysis] = useState<{
    suggestedDepartment: string;
    departmentId: string;
    reasoning: string;
    urgencyLevel: string;
  } | null>(null);
  const [assignedDoctor, setAssignedDoctor] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Set role from URL param
  useEffect(() => {
    if (roleParam === "patient") {
      setSignupData(prev => ({ ...prev, role: "patient" }));
    } else if (roleParam === "staff") {
      setSignupData(prev => ({ ...prev, role: "doctor" }));
    } else if (roleParam === "admin") {
      setSignupData(prev => ({ ...prev, role: "pharmacist" }));
    }
  }, [roleParam]);

  const getRoleDisplayInfo = () => {
    if (roleParam === "patient") {
      return {
        title: "Patient Portal",
        description: "Access your medical records and appointments",
        icon: Users,
        color: "text-primary"
      };
    } else if (roleParam === "staff") {
      return {
        title: "Hospital Staff Portal",
        description: "Manage patient care and medical services",
        icon: Stethoscope,
        color: "text-secondary"
      };
    } else if (roleParam === "admin") {
      return {
        title: "Pharmacy & Billing",
        description: "Manage prescriptions and finances",
        icon: ShieldCheck,
        color: "text-accent"
      };
    }
    return {
      title: "HospitalGuard",
      description: "Secure hospital management",
      icon: Hospital,
      color: "text-primary"
    };
  };

  const roleInfo = getRoleDisplayInfo();
  const RoleIcon = roleInfo.icon;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account.",
      });

      navigate("/dashboard");
    } catch (error: unknown) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSymptomsWithAI = async () => {
    setIsAnalyzing(true);
    try {
      // Fetch all departments first
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id, name, description')
        .order('name');

      if (deptError || !departments || departments.length === 0) {
        throw new Error('Unable to load departments');
      }

      // Create a prompt for the AI
      const departmentList = departments.map(d => `- ${d.name}: ${d.description}`).join('\n');
      const prompt = `You are a medical triage AI assistant. Based on the patient's symptoms, determine which hospital department would be most appropriate.

Patient's Chief Complaint: "${symptomData.chiefComplaint}"
Additional Symptoms: "${symptomData.additionalSymptoms || 'None provided'}"

Available Departments:
${departmentList}

Analyze the symptoms and respond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "suggestedDepartment": "Department Name",
  "reasoning": "Brief 1-2 sentence explanation of why this department is appropriate",
  "urgencyLevel": "routine|semi_urgent|urgent|critical"
}

Choose the most appropriate department from the list above. Be concise and professional.`;

      // For this implementation, I'll use a simple rule-based system since we can't directly call Claude API from frontend
      // In production, this would be an API route that calls Claude
      const analysis = await simulateAIAnalysis(symptomData.chiefComplaint, symptomData.additionalSymptoms, departments);

      setAiAnalysis(analysis);

      // Try to assign a doctor from the suggested department
      const doctorAssigned = await assignDoctorFromDepartment(analysis.departmentId);

      // Move to doctor assignment step even if no doctor was assigned
      // The UI will handle the case where there's no doctor
      if (doctorAssigned || analysis) {
        setPatientSignupStep("doctor-assignment");
      }

    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze symptoms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simple rule-based system (in production, this would call Claude API via backend)
  const simulateAIAnalysis = async (chiefComplaint: string, additionalSymptoms: string, departments: any[]) => {
    const combined = `${chiefComplaint} ${additionalSymptoms}`.toLowerCase();

    // Emergency keywords
    if (combined.match(/chest pain|heart attack|stroke|can't breathe|severe bleeding|unconscious|trauma|accident/i)) {
      const dept = departments.find(d => d.name === 'Emergency');
      return {
        suggestedDepartment: dept?.name || 'Emergency',
        departmentId: dept?.id || departments[0].id,
        reasoning: "Your symptoms indicate a potentially urgent condition that requires immediate emergency care.",
        urgencyLevel: "critical"
      };
    }

    // ICU/Critical care
    if (combined.match(/critical|intensive|severe respiratory|sepsis|organ failure/i)) {
      const dept = departments.find(d => d.name === 'Intensive Care Unit (ICU)');
      return {
        suggestedDepartment: dept?.name || 'ICU',
        departmentId: dept?.id || departments[0].id,
        reasoning: "Your condition requires intensive monitoring and critical care support.",
        urgencyLevel: "critical"
      };
    }

    // Maternity
    if (combined.match(/pregnant|pregnancy|labor|contractions|prenatal|postpartum|baby|delivery/i)) {
      const dept = departments.find(d => d.name === 'Maternity');
      return {
        suggestedDepartment: dept?.name || 'Maternity',
        departmentId: dept?.id || departments[0].id,
        reasoning: "Your needs are related to maternal care and would be best served by our maternity department.",
        urgencyLevel: "semi_urgent"
      };
    }

    // Mental Health
    if (combined.match(/depression|anxiety|mental|suicidal|psychiatric|stress|panic|bipolar|schizophrenia/i)) {
      const dept = departments.find(d => d.name === 'Mental Health');
      return {
        suggestedDepartment: dept?.name || 'Mental Health',
        departmentId: dept?.id || departments[0].id,
        reasoning: "Your symptoms suggest you would benefit from specialized mental health support and counseling.",
        urgencyLevel: "semi_urgent"
      };
    }

    // Pediatrics
    if (combined.match(/child|kid|infant|baby|toddler|pediatric|under \d+ years/i)) {
      const dept = departments.find(d => d.name === 'Pediatrics');
      return {
        suggestedDepartment: dept?.name || 'Pediatrics',
        departmentId: dept?.id || departments[0].id,
        reasoning: "Children require specialized care, and our pediatrics department is best equipped to help.",
        urgencyLevel: "routine"
      };
    }

    // Surgery
    if (combined.match(/surgery|surgical|operation|appendix|gallbladder|tumor|mass|hernia/i)) {
      const dept = departments.find(d => d.name === 'Surgery');
      return {
        suggestedDepartment: dept?.name || 'Surgery',
        departmentId: dept?.id || departments[0].id,
        reasoning: "Your condition may require surgical evaluation and possible intervention.",
        urgencyLevel: "semi_urgent"
      };
    }

    // Radiology
    if (combined.match(/x-ray|scan|mri|ct scan|imaging|ultrasound|mammogram/i)) {
      const dept = departments.find(d => d.name === 'Radiology');
      return {
        suggestedDepartment: dept?.name || 'Radiology',
        departmentId: dept?.id || departments[0].id,
        reasoning: "You need medical imaging services to diagnose your condition.",
        urgencyLevel: "routine"
      };
    }

    // Laboratory
    if (combined.match(/blood test|lab work|laboratory|test results|screening/i)) {
      const dept = departments.find(d => d.name === 'Laboratory');
      return {
        suggestedDepartment: dept?.name || 'Laboratory',
        departmentId: dept?.id || departments[0].id,
        reasoning: "You require laboratory testing and analysis for proper diagnosis.",
        urgencyLevel: "routine"
      };
    }

    // Default to Outpatient for general concerns
    const outpatientDept = departments.find(d => d.name === 'Outpatient');
    return {
      suggestedDepartment: outpatientDept?.name || 'Outpatient',
      departmentId: outpatientDept?.id || departments[0].id,
      reasoning: "Based on your symptoms, a general outpatient consultation would be the best starting point for your care.",
      urgencyLevel: "routine"
    };
  };

  const assignDoctorFromDepartment = async (departmentId: string): Promise<boolean> => {
    try {
      console.log('Attempting to assign doctor from department:', departmentId);

      const { data: doctors, error } = await supabase
        .from('hospital_staff')
        .select('id, first_name, last_name, specialization, patient_care_type')
        .eq('department_id', departmentId)
        .eq('staff_type', 'doctor')
        .eq('is_active', true)
        .in('patient_care_type', ['outpatient', 'both'])
        .limit(5);

      console.log('Doctor query result:', { doctors, error });

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Note",
          description: "Unable to query doctors from database. You can still continue with registration.",
        });
        return false;
      }

      if (!doctors || doctors.length === 0) {
        console.warn('No doctors found for department:', departmentId);
        toast({
          title: "No Doctors Available",
          description: "No doctors found in this department. A doctor will be assigned to you after registration.",
        });
        return false;
      }

      // Select a random doctor
      const selectedDoctor = doctors[Math.floor(Math.random() * doctors.length)];
      setAssignedDoctor({
        id: selectedDoctor.id,
        firstName: selectedDoctor.first_name,
        lastName: selectedDoctor.last_name,
        specialization: selectedDoctor.specialization
      });
      console.log('Doctor assigned successfully:', selectedDoctor);
      return true;
    } catch (error) {
      console.error("Error assigning doctor:", error);
      toast({
        title: "Note",
        description: "Unable to assign a doctor right now. A doctor will be assigned to you after registration.",
      });
      return false;
    }
  };

  const handleRoleSelection = (role: string) => {
    setSignupData({ ...signupData, role });
    if (role === "patient") {
      setSignupStep("patient-flow");
      setPatientSignupStep("basic");
    } else {
      setSignupStep("staff-flow");
    }
  };

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomData.chiefComplaint.trim()) {
      toast({
        title: "Symptoms Required",
        description: "Please describe what brings you in today.",
        variant: "destructive"
      });
      return;
    }
    await analyzeSymptomsWithAI();
  };

  const handlePatientBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    // This is called after AI analysis, so proceed to final signup
    await handleFinalSignup();
  };

  const handleFinalSignup = async () => {
    if (!aiAnalysis) {
      toast({
        title: "Error",
        description: "Please complete the symptom analysis first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone,
            role: "patient",
            assigned_doctor_id: assignedDoctor?.id || null,
            chief_complaint: symptomData.chiefComplaint,
            department_id: aiAnalysis.departmentId
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      const emailConfirmationRequired = !data.session && data.user;

      if (!emailConfirmationRequired && data.user) {
        // Insert role
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "patient",
        });

        // Create patient record
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: data.user.id,
            first_name: signupData.fullName.split(' ')[0],
            last_name: signupData.fullName.split(' ').slice(1).join(' ') || signupData.fullName,
            email: signupData.email,
            phone: signupData.phone || null,
            date_of_birth: null
          })
          .select()
          .single();

        if (patientError) throw patientError;

        // Create patient visit with assigned doctor (if available)
        const visitNumber = `V-${Date.now()}`;
        await supabase.from('patient_visits').insert({
          patient_id: patientData.id,
          visit_number: visitNumber,
          admission_type: 'walk_in',
          status: 'checked_in',
          chief_complaint: symptomData.chiefComplaint,
          attending_doctor_id: assignedDoctor?.id || null,
          current_department_id: aiAnalysis.departmentId,
          notes: symptomData.additionalSymptoms || null,
          triage_level: aiAnalysis.urgencyLevel
        });

        toast({
          title: "Welcome to HospitalGuard!",
          description: assignedDoctor
            ? `Your account has been created and you've been assigned to Dr. ${assignedDoctor.firstName} ${assignedDoctor.lastName}.`
            : "Your account has been created. A doctor will be assigned to you shortly.",
        });

        // Auto-login and navigate
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link. Your doctor will be assigned after you confirm your email.",
        });

        // Reset to login tab
        setPatientSignupStep("basic");
        setTimeout(() => {
          const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement;
          loginTab?.click();
        }, 2000);
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone,
            role: signupData.role,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      const emailConfirmationRequired = !data.session && data.user;

      if (emailConfirmationRequired) {
        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link. Please check your inbox to complete registration.",
        });
      } else {
        if (data.user) {
          await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: signupData.role,
          });
        }

        toast({
          title: "Account created!",
          description: "You can now log in with your credentials.",
        });

        setTimeout(() => {
          const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement;
          loginTab?.click();
        }, 1000);
      }
    } catch (error: unknown) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl"></div>
            <div className="relative w-20 h-20 gradient-royal rounded-3xl flex items-center justify-center luxury-shadow hover-scale">
              <RoleIcon className={`w-10 h-10 text-white`} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
            {roleInfo.title}
          </h1>
          <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
            <Hospital className="w-4 h-4 text-primary" />
            {roleInfo.description}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="luxury-shadow border-border/50 bg-card/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription className="text-base">Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:shadow-sm">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:shadow-sm">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-11"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 mt-6 gradient-royal btn-press luxury-shadow"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <AnimatePresence mode="wait">
                  {signupStep === "role-selection" && (
                    <motion.div
                      key="role"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-6">
                        <div className="flex gap-3 items-start">
                          <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Choose Your Account Type</h4>
                            <p className="text-xs text-muted-foreground">
                              Patients get AI-powered doctor assignment. Staff signup is quick and easy.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">I am signing up as a...</Label>

                        <button
                          type="button"
                          onClick={() => handleRoleSelection("patient")}
                          className="w-full p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 gradient-royal rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Users className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-1">Patient</h4>
                              <p className="text-sm text-muted-foreground">Get matched with the right doctor using AI</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRoleSelection("doctor")}
                          className="w-full p-6 rounded-xl border-2 border-border hover:border-secondary hover:bg-secondary/5 transition-all text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 gradient-emerald rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Stethoscope className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-1">Hospital Staff</h4>
                              <p className="text-sm text-muted-foreground">Doctor, Nurse, Pharmacist, or other staff</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {signupStep === "patient-flow" ? (
                    <AnimatePresence mode="wait">
                      {patientSignupStep === "basic" && (
                      <motion.form
                        key="basic"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handlePatientBasicInfo}
                        className="space-y-4"
                      >
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-6">
                          <div className="flex gap-3 items-start">
                            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-sm mb-1">AI-Powered Doctor Assignment</h4>
                              <p className="text-xs text-muted-foreground">
                                We'll use AI to analyze your symptoms and match you with the perfect doctor in the right department.
                              </p>
                            </div>
                          </div>
                        </div>


                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="signup-name"
                              type="text"
                              placeholder="John Doe"
                              className="pl-10 h-11"
                              value={signupData.fullName}
                              onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10 h-11"
                              value={signupData.email}
                              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-phone" className="text-sm font-medium">Phone (Optional)</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="signup-phone"
                              type="tel"
                              placeholder="+1 (555) 000-0000"
                              className="pl-10 h-11"
                              value={signupData.phone}
                              onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="signup-password"
                              type="password"
                              placeholder="••••••••"
                              className="pl-10 h-11"
                              value={signupData.password}
                              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                              required
                              minLength={6}
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={() => setPatientSignupStep("symptoms")}
                          className="w-full h-11 mt-6 gradient-royal btn-press luxury-shadow"
                        >
                          Continue <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.form>
                    )}

                    {patientSignupStep === "symptoms" && (
                      <motion.form
                        key="symptoms"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleSymptomSubmit}
                        className="space-y-4"
                      >
                        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 mb-6">
                          <div className="flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Tell us about your symptoms</h4>
                              <p className="text-xs text-muted-foreground">
                                Our AI will analyze your symptoms and match you with the right specialist.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="chief-complaint" className="text-sm font-medium">
                            What brings you in today? *
                          </Label>
                          <Input
                            id="chief-complaint"
                            type="text"
                            placeholder="E.g., chest pain, fever, headache..."
                            className="h-11"
                            value={symptomData.chiefComplaint}
                            onChange={(e) => setSymptomData({ ...symptomData, chiefComplaint: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="additional-symptoms" className="text-sm font-medium">
                            Additional details (Optional)
                          </Label>
                          <Textarea
                            id="additional-symptoms"
                            placeholder="Any other symptoms, duration, severity, medications you're taking..."
                            rows={4}
                            className="resize-none"
                            value={symptomData.additionalSymptoms}
                            onChange={(e) => setSymptomData({ ...symptomData, additionalSymptoms: e.target.value })}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-11"
                            onClick={() => setPatientSignupStep("basic")}
                            disabled={isAnalyzing}
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 h-11 gradient-royal btn-press luxury-shadow"
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analyze with AI
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    )}

                    {patientSignupStep === "doctor-assignment" && aiAnalysis && (
                      <motion.div
                        key="doctor"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">AI Analysis Complete</h4>
                              <p className="text-sm text-muted-foreground mb-3">{aiAnalysis.reasoning}</p>
                              <div className="flex items-center gap-2">
                                <Hospital className="w-4 h-4 text-primary" />
                                <span className="font-medium text-sm">Recommended: {aiAnalysis.suggestedDepartment}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {assignedDoctor ? (
                          <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-accent/10 border border-secondary/20">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 gradient-royal rounded-full flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">Your Assigned Doctor</h4>
                                <p className="text-lg font-bold text-primary mb-1">
                                  Dr. {assignedDoctor.firstName} {assignedDoctor.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{assignedDoctor.specialization}</p>
                                <div className="mt-3 flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                                  <span className="text-muted-foreground">This doctor will stay with you throughout your recovery</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 rounded-xl bg-gradient-to-br from-amber/10 to-accent/10 border border-amber/20">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">Doctor Assignment Pending</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  No doctors are currently available in the {aiAnalysis.suggestedDepartment} department.
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                                  <span className="text-muted-foreground">A doctor will be assigned to you shortly after registration</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleFinalSignup}
                          className="w-full h-12 gradient-royal btn-press luxury-shadow text-base"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5 mr-2" />
                              Complete Registration
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11"
                          onClick={() => {
                            setPatientSignupStep("symptoms");
                            setAiAnalysis(null);
                            setAssignedDoctor(null);
                          }}
                          disabled={isLoading}
                        >
                          Revise Symptoms
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <form onSubmit={handleStaffSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="staff-name" className="text-sm font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="staff-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 h-11"
                          value={signupData.fullName}
                          onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="staff-email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 h-11"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-phone" className="text-sm font-medium">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="staff-phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="pl-10 h-11"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-role" className="text-sm font-medium">I am a...</Label>
                      <Select
                        value={signupData.role}
                        onValueChange={(value) => setSignupData({ ...signupData, role: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient">Patient</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="nurse">Nurse</SelectItem>
                          <SelectItem value="pharmacist">Pharmacist</SelectItem>
                          <SelectItem value="billing">Billing Staff</SelectItem>
                          <SelectItem value="lab_tech">Lab Technician</SelectItem>
                          <SelectItem value="radiologist">Radiologist</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="staff-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 h-11"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 mt-6 gradient-royal btn-press luxury-shadow"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground p-4 rounded-2xl bg-secondary/5 border border-secondary/10">
          <CheckCircle2 className="w-5 h-5 text-secondary" />
          <span className="font-medium">Enterprise-grade security & HIPAA compliance</span>
        </div>

        {/* Back to Home */}
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};

export default Auth;
