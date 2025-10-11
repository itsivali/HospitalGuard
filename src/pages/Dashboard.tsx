import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  LogOut,
  Activity,
  FileText,
  Users,
  AlertCircle,
  Pill,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface UserRole {
  role: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      if (error) throw error;

      setRoles(userRoles?.map((r: UserRole) => r.role) || []);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="text-muted-foreground animate-pulse">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const getDashboardContent = () => {
    if (roles.includes("doctor") || roles.includes("hospital")) {
      return {
        title: "Doctor Dashboard",
        description: "Manage prescriptions and patient care",
        gradient: "from-rose-500/10 via-primary/5 to-transparent",
        features: [
          {
            icon: FileText,
            title: "Create Prescription",
            description: "Issue digital prescriptions with SHA pre-authorization and safety checks",
            color: "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500/20"
          },
          {
            icon: Pill,
            title: "My Prescriptions",
            description: "View and manage all prescriptions you've created with status tracking",
            color: "bg-primary/10 text-primary group-hover:bg-primary/20"
          },
          {
            icon: Activity,
            title: "Patient History",
            description: "Review patient medication history and identify potential drug interactions",
            color: "bg-secondary/10 text-secondary group-hover:bg-secondary/20"
          },
        ],
      };
    } else if (roles.includes("pharmacist") || roles.includes("pharmacy")) {
      return {
        title: "Pharmacist Dashboard",
        description: "Validate and dispense prescriptions",
        gradient: "from-emerald-500/10 via-secondary/5 to-transparent",
        features: [
          {
            icon: CheckCircle2,
            title: "Validate Prescription",
            description: "Verify digital signatures and authenticate prescriptions with PPB compliance",
            color: "bg-secondary/10 text-secondary group-hover:bg-secondary/20"
          },
          {
            icon: Clock,
            title: "Pending Reviews",
            description: "Process SHA claims and M-Pesa payments for awaiting prescriptions",
            color: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/20"
          },
          {
            icon: TrendingUp,
            title: "Dispensing History",
            description: "Track filled prescriptions and report counterfeit drug incidents",
            color: "bg-primary/10 text-primary group-hover:bg-primary/20"
          },
        ],
      };
    } else if (roles.includes("admin") || roles.includes("ppb")) {
      return {
        title: "Admin Dashboard",
        description: "System oversight and compliance",
        gradient: "from-violet-500/10 via-primary/5 to-transparent",
        features: [
          {
            icon: Users,
            title: "User Management",
            description: "Manage roles, permissions, and facility access across Nairobi network",
            color: "bg-violet-500/10 text-violet-600 group-hover:bg-violet-500/20"
          },
          {
            icon: AlertCircle,
            title: "Fraud Detection",
            description: "Monitor suspicious activity, duplicate prescriptions, and PPB alerts",
            color: "bg-destructive/10 text-destructive group-hover:bg-destructive/20"
          },
          {
            icon: Activity,
            title: "Audit Logs",
            description: "Review complete system activity and generate compliance reports",
            color: "bg-primary/10 text-primary group-hover:bg-primary/20"
          },
        ],
      };
    } else {
      return {
        title: "Patient Dashboard",
        description: "View your prescriptions and health information",
        gradient: "from-blue-500/10 via-primary/5 to-transparent",
        features: [
          {
            icon: Pill,
            title: "My Prescriptions",
            description: "View active and past prescriptions with SMS/WhatsApp access",
            color: "bg-primary/10 text-primary group-hover:bg-primary/20"
          },
          {
            icon: Clock,
            title: "Refill Status",
            description: "Track prescription refills and SHA coverage for your medications",
            color: "bg-secondary/10 text-secondary group-hover:bg-secondary/20"
          },
          {
            icon: AlertCircle,
            title: "Notifications",
            description: "Important prescription alerts and drug authenticity verification",
            color: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/20"
          },
        ],
      };
    }
  };

  const dashboardContent = getDashboardContent();

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header with Glass Effect */}
      <header className="border-b border-border/50 glass-effect sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">PrescriptionGuard</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <p className="text-xs text-muted-foreground font-medium">
                  {roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(", ")}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="hover-lift soft-shadow"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content with Gradient Background */}
      <main className="container mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className={`mb-10 p-8 rounded-3xl bg-gradient-to-br ${dashboardContent.gradient} border border-border/50 soft-shadow`}>
          <h2 className="text-4xl font-bold mb-3 tracking-tight">{dashboardContent.title}</h2>
          <p className="text-muted-foreground text-lg">{dashboardContent.description}</p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
          {dashboardContent.features.map((feature, index) => (
            <Card
              key={index}
              className="hover-lift card-shadow cursor-pointer group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4 transition-all duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full group-hover:bg-primary/10 transition-colors"
                >
                  <span>Coming Soon</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Card */}
        <Card className="card-shadow border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Quick Stats</CardTitle>
                <CardDescription className="text-base">Overview of your activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Pill className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Active Prescriptions</p>
                </div>
                <p className="text-4xl font-bold tracking-tight">0</p>
              </div>
              <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                </div>
                <p className="text-4xl font-bold tracking-tight">0</p>
              </div>
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Actions</p>
                </div>
                <p className="text-4xl font-bold tracking-tight">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
