import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Activity,
  Ambulance,
  Baby,
  BedDouble,
  Brain,
  Building2,
  Calendar,
  ClipboardPlus,
  CreditCard,
  Heart,
  Home,
  Hospital,
  Laptop,
  LogOut,
  Microscope,
  Pill,
  Scan,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Users,
  Video,
  Wallet,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  UserCheck,
  FileText,
  AlertCircle
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface UserRole {
  role: string;
}

interface Department {
  id: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
  description: string;
  stats?: {
    label: string;
    value: number | string;
    trend?: string;
  }[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("overview");

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Fetch user roles
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching roles:", error);
        toast({
          title: "Role Fetch Error",
          description: "Could not load user roles. Please contact support if this persists.",
          variant: "destructive",
        });
        setRoles([]);
        setIsLoading(false);
        return;
      }

      const userRolesList = userRoles?.map((r: UserRole) => r.role) || [];
      setRoles(userRolesList);

      // Redirect to role-specific dashboard only if on /dashboard route
      if (userRolesList.length > 0 && window.location.pathname === "/dashboard") {
        const primaryRole = userRolesList[0];

        // Route to specific dashboards based on role
        if (primaryRole === "admin") {
          navigate("/admin-dashboard", { replace: true });
          return;
        } else if (primaryRole === "patient") {
          navigate("/patient-dashboard", { replace: true });
          return;
        } else if (primaryRole === "doctor") {
          navigate("/doctor-dashboard", { replace: true });
          return;
        } else if (primaryRole === "nurse") {
          navigate("/nurse-dashboard", { replace: true });
          return;
        } else if (primaryRole === "pharmacist") {
          navigate("/pharmacist-dashboard", { replace: true });
          return;
        } else if (primaryRole === "billing") {
          navigate("/billing-dashboard", { replace: true });
          return;
        }
        // For other roles (lab_tech, radiologist, etc.), stay on general dashboard
      }
    } catch (error: unknown) {
      console.error("Auth check error:", error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Define all hospital departments
  const departments: Department[] = [
    {
      id: "overview",
      name: "Overview",
      icon: Home,
      color: "text-primary",
      gradient: "gradient-royal",
      description: "Hospital-wide dashboard and statistics",
      stats: [
        { label: "Active Patients", value: 156, trend: "+12%" },
        { label: "Today's Visits", value: 48, trend: "+8%" },
        { label: "Staff on Duty", value: 89, trend: "stable" }
      ]
    },
    {
      id: "registration",
      name: "Registration",
      icon: ClipboardPlus,
      color: "text-primary",
      gradient: "gradient-royal",
      description: "Patient check-in and registration",
      stats: [
        { label: "Checked In Today", value: 48 },
        { label: "Waiting", value: 12 },
        { label: "Avg Wait Time", value: "8 min" }
      ]
    },
    {
      id: "emergency",
      name: "Emergency",
      icon: Ambulance,
      color: "text-destructive",
      gradient: "gradient-coral",
      description: "Emergency room and critical care",
      stats: [
        { label: "Critical", value: 3, trend: "critical" },
        { label: "In Treatment", value: 8 },
        { label: "Waiting", value: 5 }
      ]
    },
    {
      id: "icu",
      name: "ICU",
      icon: Heart,
      color: "text-destructive",
      gradient: "gradient-coral",
      description: "Intensive Care Unit",
      stats: [
        { label: "Occupied Beds", value: "12/15" },
        { label: "Critical", value: 4 },
        { label: "Stable", value: 8 }
      ]
    },
    {
      id: "outpatient",
      name: "Outpatient",
      icon: Stethoscope,
      color: "text-primary",
      gradient: "gradient-royal",
      description: "General consultations and follow-ups",
      stats: [
        { label: "Consultations Today", value: 42 },
        { label: "In Progress", value: 6 },
        { label: "Scheduled", value: 18 }
      ]
    },
    {
      id: "maternity",
      name: "Maternity",
      icon: Baby,
      color: "text-coral",
      gradient: "gradient-coral",
      description: "Maternity and obstetrics department",
      stats: [
        { label: "Expecting Mothers", value: 24 },
        { label: "Deliveries Today", value: 3 },
        { label: "Postnatal Care", value: 8 }
      ]
    },
    {
      id: "mental_health",
      name: "Mental Health",
      icon: Brain,
      color: "text-teal",
      gradient: "gradient-teal",
      description: "Psychiatric and counseling services",
      stats: [
        { label: "Active Patients", value: 31 },
        { label: "Sessions Today", value: 12 },
        { label: "Crisis Calls", value: 2 }
      ]
    },
    {
      id: "pediatrics",
      name: "Pediatrics",
      icon: Heart,
      color: "text-secondary",
      gradient: "gradient-emerald",
      description: "Children's health department",
      stats: [
        { label: "Young Patients", value: 28 },
        { label: "Vaccinations", value: 15 },
        { label: "Check-ups", value: 13 }
      ]
    },
    {
      id: "surgery",
      name: "Surgery",
      icon: Syringe,
      color: "text-primary",
      gradient: "gradient-royal",
      description: "Surgical procedures and operations",
      stats: [
        { label: "Scheduled Today", value: 8 },
        { label: "In Progress", value: 2 },
        { label: "Completed", value: 4 }
      ]
    },
    {
      id: "laboratory",
      name: "Laboratory",
      icon: Microscope,
      color: "text-tertiary",
      gradient: "gradient-purple",
      description: "Diagnostic testing and analysis",
      stats: [
        { label: "Tests Pending", value: 45 },
        { label: "In Progress", value: 23 },
        { label: "Completed Today", value: 89 }
      ]
    },
    {
      id: "radiology",
      name: "Radiology",
      icon: Scan,
      color: "text-primary",
      gradient: "gradient-royal",
      description: "Medical imaging and diagnostics",
      stats: [
        { label: "Scans Today", value: 34 },
        { label: "X-Rays", value: 18 },
        { label: "MRI/CT", value: 16 }
      ]
    },
    {
      id: "pharmacy",
      name: "Pharmacy",
      icon: Pill,
      color: "text-secondary",
      gradient: "gradient-emerald",
      description: "Medication management and dispensing",
      stats: [
        { label: "Prescriptions", value: 142 },
        { label: "Dispensed", value: 98 },
        { label: "Pending", value: 44 }
      ]
    },
    {
      id: "billing",
      name: "Billing",
      icon: CreditCard,
      color: "text-accent",
      gradient: "gradient-gold",
      description: "Financial services and billing",
      stats: [
        { label: "Today's Revenue", value: "$24,850" },
        { label: "Pending Bills", value: 34 },
        { label: "Paid", value: 112 }
      ]
    },
    {
      id: "telemedicine",
      name: "Telemedicine",
      icon: Video,
      color: "text-teal",
      gradient: "gradient-teal",
      description: "Remote consultations and aftercare",
      stats: [
        { label: "Sessions Today", value: 28 },
        { label: "Active Now", value: 3 },
        { label: "Follow-ups", value: 25 }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-royal rounded-3xl flex items-center justify-center luxury-shadow"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Hospital className="w-10 h-10 text-white" />
          </motion.div>
          <motion.div
            className="text-muted-foreground text-lg font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading HospitalGuard...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const currentDept = departments.find(d => d.id === selectedDepartment) || departments[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Luxurious Header */}
      <header className="glass-luxury sticky top-0 z-50 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="relative w-14 h-14 gradient-royal rounded-3xl flex items-center justify-center luxury-shadow hover-scale">
                  <Hospital className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-tight bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                  HospitalGuard
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Hospital className="w-3.5 h-3.5 text-accent" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(" • ") || "Staff Member"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="px-3 py-1.5 bg-secondary/10 text-secondary border-secondary/20">
                <Activity className="w-3 h-3 mr-1.5" />
                Online
              </Badge>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hover-lift card-shadow btn-press"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Hero Stats Section */}
        <motion.div
          className={`mb-8 p-8 rounded-3xl ${currentDept.gradient} text-white luxury-shadow overflow-hidden relative`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 shimmer opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <currentDept.icon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-4xl font-bold tracking-tight">{currentDept.name}</h2>
                <p className="text-white/90 text-lg mt-1">{currentDept.description}</p>
              </div>
            </div>

            {currentDept.stats && (
              <div className="grid grid-cols-3 gap-6 mt-8">
                {currentDept.stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover-lift"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <p className="text-white/80 text-sm font-medium mb-2">{stat.label}</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      {stat.trend && stat.trend !== "stable" && (
                        <Badge variant="secondary" className="mb-1 bg-white/20 text-white border-none">
                          {stat.trend}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Department Tabs */}
        <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 bg-card/80 backdrop-blur-md p-4 rounded-3xl luxury-shadow mb-8 gap-3 h-auto">
            {departments.map((dept) => (
              <TabsTrigger
                key={dept.id}
                value={dept.id}
                className="flex items-center justify-center gap-3 px-6 py-5 rounded-2xl btn-press text-base font-semibold transition-all duration-300 data-[state=active]:gradient-royal data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:text-foreground cursor-pointer h-auto"
              >
                <dept.icon className="w-6 h-6 flex-shrink-0" />
                <span className="text-base whitespace-nowrap">{dept.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Department Content */}
          {departments.map((dept) => (
            <TabsContent key={dept.id} value={dept.id} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Quick Actions Card */}
                  <Card className="hover-lift card-shadow bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 ${dept.color} bg-current/10 rounded-xl flex items-center justify-center`}>
                          <ClipboardPlus className={`w-6 h-6 ${dept.color}`} />
                        </div>
                        <CardTitle className="text-xl">Quick Actions</CardTitle>
                      </div>
                      <CardDescription>Common tasks for {dept.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start btn-press hover-lift">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Check In Patient
                      </Button>
                      <Button variant="outline" className="w-full justify-start btn-press hover-lift">
                        <FileText className="w-4 h-4 mr-2" />
                        View Records
                      </Button>
                      <Button variant="outline" className="w-full justify-start btn-press hover-lift">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Appointment
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Active Patients/Tasks */}
                  <Card className="hover-lift card-shadow bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 ${dept.color} bg-current/10 rounded-xl flex items-center justify-center`}>
                          <Users className={`w-6 h-6 ${dept.color}`} />
                        </div>
                        <CardTitle className="text-xl">Active Now</CardTitle>
                      </div>
                      <CardDescription>Current patients and activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover-lift cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-royal rounded-full flex items-center justify-center text-white font-semibold">
                                P{i}
                              </div>
                              <div>
                                <p className="font-medium text-sm">Patient {i}</p>
                                <p className="text-xs text-muted-foreground">In progress</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notifications/Alerts */}
                  <Card className="hover-lift card-shadow bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 ${dept.color} bg-current/10 rounded-xl flex items-center justify-center`}>
                          <AlertCircle className={`w-6 h-6 ${dept.color}`} />
                        </div>
                        <CardTitle className="text-xl">Alerts</CardTitle>
                      </div>
                      <CardDescription>Important notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">All systems operational</p>
                              <p className="text-xs text-muted-foreground">Last checked: 2 min ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl">
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-accent mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">3 pending reviews</p>
                              <p className="text-xs text-muted-foreground">Requires attention</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Coming Soon Features */}
                <Card className="mt-6 luxury-shadow bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center">
                        <Hospital className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Coming Soon to {dept.name}</CardTitle>
                        <CardDescription className="text-base">Exciting features in development</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Full {dept.name.toLowerCase()} management features including patient tracking,
                      digital workflows, real-time monitoring, and comprehensive reporting are currently
                      being developed. Stay tuned for updates!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
