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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-card"
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Hospital className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <motion.div
            className="text-muted-foreground text-sm font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading HospitalGuard...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const currentDept = departments.find(d => d.id === selectedDepartment) || departments[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Business Central Header */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <Hospital className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-xl text-foreground">
                  HospitalGuard
                </h1>
                <p className="text-xs text-muted-foreground">
                  {roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(" • ") || "Staff Member"}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                <Activity className="w-3 h-3 mr-1.5" />
                Online
              </Badge>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="btn-press"
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
        {/* Department Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 ${currentDept.color} bg-current/10 rounded-lg flex items-center justify-center`}>
              <currentDept.icon className={`w-6 h-6 ${currentDept.color}`} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{currentDept.name}</h2>
              <p className="text-sm text-muted-foreground">{currentDept.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - Business Central Style */}
        {currentDept.stats && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {currentDept.stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bc-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex flex-col h-full">
                  <p className="bc-metric-label mb-2">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-auto">
                    <p className="bc-metric">{stat.value}</p>
                    {stat.trend && stat.trend !== "stable" && (
                      <Badge variant="outline" className={`
                        ${stat.trend.startsWith('+') ? 'bg-secondary/10 text-secondary border-secondary/30' : ''}
                        ${stat.trend === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                        text-xs font-medium
                      `}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Department Navigation */}
        <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment} className="w-full">
          <div className="bg-card border rounded-2xl p-3 mb-6 shadow-card overflow-x-auto">
            <TabsList className="w-full inline-flex items-center gap-2 h-auto bg-transparent">
              {departments.map((dept) => (
                <TabsTrigger
                  key={dept.id}
                  value={dept.id}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl btn-press text-sm font-semibold transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:text-muted-foreground whitespace-nowrap"
                >
                  <dept.icon className="w-4 h-4" />
                  <span>{dept.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Department Content */}
          {departments.map((dept) => (
            <TabsContent key={dept.id} value={dept.id} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Quick Actions Card */}
                  <Card className="bc-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-9 h-9 ${dept.color} bg-current/10 rounded-xl flex items-center justify-center`}>
                          <ClipboardPlus className={`w-5 h-5 ${dept.color}`} />
                        </div>
                        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Common tasks for {dept.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start btn-press text-sm h-10 rounded-xl">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Check In Patient
                      </Button>
                      <Button variant="outline" className="w-full justify-start btn-press text-sm h-10 rounded-xl">
                        <FileText className="w-4 h-4 mr-2" />
                        View Records
                      </Button>
                      <Button variant="outline" className="w-full justify-start btn-press text-sm h-10 rounded-xl">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Appointment
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Active Patients/Tasks */}
                  <Card className="bc-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-8 h-8 ${dept.color} bg-current/10 rounded-md flex items-center justify-center`}>
                          <Users className={`w-4 h-4 ${dept.color}`} />
                        </div>
                        <CardTitle className="text-base font-semibold">Active Now</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Current patients and activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-md hover:bg-muted transition-colors cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
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
                  <Card className="bc-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-8 h-8 ${dept.color} bg-current/10 rounded-md flex items-center justify-center`}>
                          <AlertCircle className={`w-4 h-4 ${dept.color}`} />
                        </div>
                        <CardTitle className="text-base font-semibold">Alerts</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Important notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="p-2.5 bg-secondary/10 border border-secondary/20 rounded-md">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">All systems operational</p>
                              <p className="text-xs text-muted-foreground">Last checked: 2 min ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-md">
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
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
                <Card className="mt-4 bc-card bg-muted/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                        <Hospital className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">Coming Soon to {dept.name}</CardTitle>
                        <CardDescription className="text-xs">Exciting features in development</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
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
