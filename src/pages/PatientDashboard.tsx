import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
  TrendingUp,
  CheckCircle2
} from "lucide-react";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUser(user);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
                <h3 className="text-2xl font-bold">2</h3>
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
                <h3 className="text-2xl font-bold">3</h3>
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
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Last</Badge>
                </div>
                <h3 className="text-2xl font-bold">5 days</h3>
                <p className="text-sm text-muted-foreground">Since Last Visit</p>
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
                <h3 className="text-2xl font-bold">12</h3>
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
                <Button className="btn-press gradient-royal">Book New</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "Jan 15, 2025", time: "10:00 AM", doctor: "Dr. Sarah Johnson", type: "Follow-up", dept: "Cardiology" },
                  { date: "Jan 20, 2025", time: "2:30 PM", doctor: "Dr. Michael Chen", type: "Lab Results", dept: "Laboratory" }
                ].map((apt, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/30 hover-lift flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 gradient-royal rounded-2xl flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{apt.doctor} - {apt.dept}</h4>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{apt.date} at {apt.time}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="btn-press">View Details</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actionable Insights */}
          <Card className="card-shadow hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Action Items
              </CardTitle>
              <CardDescription>Things you should know</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Prescription Refill Due</p>
                    <p className="text-xs text-muted-foreground mt-1">Blood pressure medication expires in 3 days</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Request Refill</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Lab Results Ready</p>
                    <p className="text-xs text-muted-foreground mt-1">Blood work from Jan 10 is available</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">View Results</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-2">
                  <Video className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Telemedicine Available</p>
                    <p className="text-xs text-muted-foreground mt-1">Schedule a virtual follow-up with Dr. Johnson</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Schedule</Button>
                  </div>
                </div>
              </div>
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
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: "Lisinopril 10mg", dosage: "Once daily", refills: "2 left", expires: "Mar 15, 2025" },
                { name: "Metformin 500mg", dosage: "Twice daily", refills: "1 left", expires: "Feb 20, 2025" },
                { name: "Atorvastatin 20mg", dosage: "Once daily", refills: "3 left", expires: "Apr 10, 2025" }
              ].map((rx, i) => (
                <div key={i} className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Pill className="w-5 h-5 text-secondary" />
                    </div>
                    <Badge variant="outline" className="text-xs">{rx.refills}</Badge>
                  </div>
                  <h4 className="font-semibold mb-1">{rx.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{rx.dosage}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Expires: {rx.expires}
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-3">
              {[
                { date: "Jan 10, 2025", type: "Lab Work", dept: "Laboratory", status: "Complete", result: "Normal" },
                { date: "Jan 5, 2025", type: "Consultation", dept: "Cardiology", status: "Complete", result: "Follow-up scheduled" },
                { date: "Dec 28, 2024", type: "Prescription", dept: "Pharmacy", status: "Filled", result: "Picked up" }
              ].map((record, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover-lift">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{record.type} - {record.dept}</h4>
                      <p className="text-sm text-muted-foreground">{record.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-secondary/10 text-secondary">{record.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{record.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PatientDashboard;
