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
  CheckCircle2,
  Users,
  Stethoscope,
  ClipboardPlus,
  Microscope,
  BedDouble,
  Phone,
  QrCode,
  FileSignature
} from "lucide-react";

const DoctorDashboard = () => {
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
              <p className="text-xs text-muted-foreground">Dr. {user?.user_metadata?.full_name || 'Doctor'}</p>
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
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Today</Badge>
                </div>
                <h3 className="text-2xl font-bold">8</h3>
                <p className="text-sm text-muted-foreground">Appointments</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover-lift card-shadow bg-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">Active</Badge>
                </div>
                <h3 className="text-2xl font-bold">24</h3>
                <p className="text-sm text-muted-foreground">Under My Care</p>
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
                <h3 className="text-2xl font-bold">3</h3>
                <p className="text-sm text-muted-foreground">Require Attention</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover-lift card-shadow bg-accent/5 border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Microscope className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Pending</Badge>
                </div>
                <h3 className="text-2xl font-bold">5</h3>
                <p className="text-sm text-muted-foreground">Lab Results to Review</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2 card-shadow hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>Your appointments for today</CardDescription>
                </div>
                <Button className="btn-press gradient-royal">Add Patient</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "09:00 AM", patient: "John Smith", type: "Follow-up", dept: "Cardiology", room: "301" },
                  { time: "09:30 AM", patient: "Sarah Johnson", type: "Consultation", dept: "General", room: "302" },
                  { time: "10:00 AM", patient: "Michael Chen", type: "Lab Review", dept: "Cardiology", room: "301" },
                  { time: "11:00 AM", patient: "Emma Wilson", type: "New Patient", dept: "General", room: "303" }
                ].map((apt, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/30 hover-lift flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 gradient-royal rounded-2xl flex items-center justify-center flex-col">
                        <span className="text-white text-xs font-medium">{apt.time.split(' ')[0]}</span>
                        <span className="text-white/80 text-xs">{apt.time.split(' ')[1]}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{apt.patient}</h4>
                        <p className="text-sm text-muted-foreground">{apt.type} - {apt.dept}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <BedDouble className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Room {apt.room}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="btn-press">View Chart</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="card-shadow hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Action Items
              </CardTitle>
              <CardDescription>Tasks requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-2">
                  <Microscope className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Lab Results Ready</p>
                    <p className="text-xs text-muted-foreground mt-1">5 patients awaiting results review</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Review Now</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Patient Follow-ups</p>
                    <p className="text-xs text-muted-foreground mt-1">3 patients need follow-up scheduling</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Schedule</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-2">
                  <Video className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Telemedicine Queue</p>
                    <p className="text-xs text-muted-foreground mt-1">2 patients waiting for video consultation</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Join Call</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-tertiary/10 border border-tertiary/20">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-tertiary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Referrals Pending</p>
                    <p className="text-xs text-muted-foreground mt-1">4 specialist referrals need completion</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Complete</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 card-shadow hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <ClipboardPlus className="w-6 h-6 text-secondary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and workflows</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button className="h-24 flex flex-col gap-2 btn-press gradient-royal">
                <Pill className="w-8 h-8" />
                <span className="text-sm font-semibold">Create Prescription</span>
              </Button>
              <Button className="h-24 flex flex-col gap-2 btn-press gradient-emerald" variant="outline">
                <QrCode className="w-8 h-8" />
                <span className="text-sm font-semibold">Sign with QR</span>
              </Button>
              <Button className="h-24 flex flex-col gap-2 btn-press gradient-purple" variant="outline">
                <Microscope className="w-8 h-8" />
                <span className="text-sm font-semibold">Order Lab Test</span>
              </Button>
              <Button className="h-24 flex flex-col gap-2 btn-press gradient-gold" variant="outline">
                <FileSignature className="w-8 h-8" />
                <span className="text-sm font-semibold">Medical Note</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Patients Under Care */}
        <Card className="mt-6 card-shadow hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Patients Under My Care
            </CardTitle>
            <CardDescription>Currently active patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "John Smith", condition: "Post-op Cardiac", status: "Stable", room: "ICU-301", lastVisit: "2 hours ago" },
                { name: "Sarah Johnson", condition: "Hypertension", status: "Monitoring", room: "Ward-205", lastVisit: "1 day ago" },
                { name: "Michael Chen", condition: "Diabetes Type 2", status: "Stable", room: "Outpatient", lastVisit: "3 days ago" },
                { name: "Emma Wilson", condition: "Cardiac Arrhythmia", status: "Critical", room: "ICU-302", lastVisit: "30 min ago" },
                { name: "David Brown", condition: "Post-surgery", status: "Recovery", room: "Ward-310", lastVisit: "5 hours ago" },
                { name: "Lisa Anderson", condition: "Pneumonia", status: "Improving", room: "Ward-208", lastVisit: "1 day ago" }
              ].map((patient, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-muted hover-lift cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center text-white font-semibold">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        patient.status === "Critical" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        patient.status === "Stable" ? "bg-secondary/10 text-secondary border-secondary/20" :
                        "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {patient.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-1">{patient.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{patient.condition}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BedDouble className="w-3 h-3" />
                      {patient.room}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {patient.lastVisit}
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3 btn-press" variant="outline">
                    View Full Chart
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-6 card-shadow hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "10 min ago", action: "Prescription created", patient: "John Smith", detail: "Lisinopril 10mg" },
                { time: "25 min ago", action: "Lab results reviewed", patient: "Sarah Johnson", detail: "Blood work - Normal" },
                { time: "1 hour ago", action: "Consultation completed", patient: "Michael Chen", detail: "Follow-up scheduled" },
                { time: "2 hours ago", action: "Telemedicine session", patient: "Emma Wilson", detail: "30 min video call" },
                { time: "3 hours ago", action: "Medical note signed", patient: "David Brown", detail: "Post-op assessment" }
              ].map((record, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover-lift">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{record.action}</h4>
                      <p className="text-sm text-muted-foreground">{record.patient} - {record.detail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{record.time}</p>
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

export default DoctorDashboard;
