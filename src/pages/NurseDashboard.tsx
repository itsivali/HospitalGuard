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
  Heart,
  Hospital,
  LogOut,
  Pill,
  Clock,
  AlertCircle,
  User,
  CheckCircle2,
  Users,
  Stethoscope,
  BedDouble,
  Syringe,
  Thermometer,
  Droplets,
  Wind,
  ClipboardCheck,
  Bell,
  XCircle
} from "lucide-react";

const NurseDashboard = () => {
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
          className="w-20 h-20 gradient-emerald rounded-3xl flex items-center justify-center luxury-shadow"
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart className="w-10 h-10 text-white" />
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
              <div className="absolute inset-0 bg-secondary/20 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="relative w-14 h-14 gradient-emerald rounded-3xl flex items-center justify-center luxury-shadow">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">Nurse Station</h1>
              <p className="text-xs text-muted-foreground">{user?.user_metadata?.full_name || 'Nurse'}</p>
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
                    <BedDouble className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Assigned</Badge>
                </div>
                <h3 className="text-2xl font-bold">12</h3>
                <p className="text-sm text-muted-foreground">Patients on Ward</p>
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
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">Pending</Badge>
                </div>
                <h3 className="text-2xl font-bold">8</h3>
                <p className="text-sm text-muted-foreground">Medications Due</p>
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
                <h3 className="text-2xl font-bold">2</h3>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover-lift card-shadow bg-accent/5 border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Today</Badge>
                </div>
                <h3 className="text-2xl font-bold">18</h3>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient Monitoring */}
          <Card className="lg:col-span-2 card-shadow hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Activity className="w-6 h-6 text-secondary" />
                    Active Patient Monitoring
                  </CardTitle>
                  <CardDescription>Real-time vitals and status</CardDescription>
                </div>
                <Button className="btn-press gradient-emerald">Record Vitals</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "John Smith", room: "301", temp: "98.6°F", bp: "120/80", hr: "72", spo2: "98%", status: "stable" },
                  { name: "Sarah Johnson", room: "302", temp: "99.2°F", bp: "135/85", hr: "88", spo2: "96%", status: "monitoring" },
                  { name: "Michael Chen", room: "303", temp: "101.3°F", bp: "145/92", hr: "95", spo2: "94%", status: "critical" },
                  { name: "Emma Wilson", room: "304", temp: "98.4°F", bp: "118/75", hr: "68", spo2: "99%", status: "stable" }
                ].map((patient, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/30 hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 gradient-emerald rounded-full flex items-center justify-center text-white font-semibold">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold">{patient.name}</h4>
                          <p className="text-sm text-muted-foreground">Room {patient.room}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          patient.status === "critical" ? "bg-destructive/10 text-destructive border-destructive/20" :
                          patient.status === "monitoring" ? "bg-accent/10 text-accent border-accent/20" :
                          "bg-secondary/10 text-secondary border-secondary/20"
                        }`}
                      >
                        {patient.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-2 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-1 mb-1">
                          <Thermometer className="w-3 h-3 text-destructive" />
                          <span className="text-xs text-muted-foreground">Temp</span>
                        </div>
                        <p className="text-sm font-semibold">{patient.temp}</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-1 mb-1">
                          <Activity className="w-3 h-3 text-primary" />
                          <span className="text-xs text-muted-foreground">BP</span>
                        </div>
                        <p className="text-sm font-semibold">{patient.bp}</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-1 mb-1">
                          <Heart className="w-3 h-3 text-secondary" />
                          <span className="text-xs text-muted-foreground">HR</span>
                        </div>
                        <p className="text-sm font-semibold">{patient.hr}</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-1 mb-1">
                          <Wind className="w-3 h-3 text-teal" />
                          <span className="text-xs text-muted-foreground">SpO2</span>
                        </div>
                        <p className="text-sm font-semibold">{patient.spo2}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Urgent Alerts */}
          <Card className="card-shadow hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Urgent Alerts
              </CardTitle>
              <CardDescription>Requires immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">High Temperature Alert</p>
                    <p className="text-xs text-muted-foreground mt-1">Michael Chen - Room 303 - 101.3°F</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Respond</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-2">
                  <Pill className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Medication Overdue</p>
                    <p className="text-xs text-muted-foreground mt-1">Sarah Johnson - Pain medication due 15 min ago</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Administer</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Discharge Ready</p>
                    <p className="text-xs text-muted-foreground mt-1">John Smith - Room 301 - Doctor approved</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Process</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Droplets className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">IV Fluid Low</p>
                    <p className="text-xs text-muted-foreground mt-1">Emma Wilson - Room 304 - Replace within 1 hour</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Check Now</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medication Schedule */}
        <Card className="mt-6 card-shadow hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Pill className="w-6 h-6 text-secondary" />
                  Medication Administration Schedule
                </CardTitle>
                <CardDescription>Upcoming and overdue medications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { patient: "John Smith", room: "301", medication: "Lisinopril 10mg", time: "Now", route: "Oral", status: "overdue" },
                { patient: "Sarah Johnson", room: "302", medication: "Metformin 500mg", time: "10:00 AM", route: "Oral", status: "due" },
                { patient: "Michael Chen", room: "303", medication: "Acetaminophen 500mg", time: "10:30 AM", route: "Oral", status: "scheduled" },
                { patient: "Emma Wilson", room: "304", medication: "IV Antibiotics", time: "11:00 AM", route: "IV", status: "scheduled" },
                { patient: "David Brown", room: "305", medication: "Insulin 10 units", time: "Before lunch", route: "SC", status: "scheduled" },
                { patient: "Lisa Anderson", room: "306", medication: "Aspirin 81mg", time: "12:00 PM", route: "Oral", status: "scheduled" }
              ].map((med, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-muted hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{med.patient}</h4>
                      <p className="text-sm text-muted-foreground">Room {med.room}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        med.status === "overdue" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        med.status === "due" ? "bg-accent/10 text-accent border-accent/20" :
                        "bg-secondary/10 text-secondary border-secondary/20"
                      }`}
                    >
                      {med.status}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <p className="font-medium text-sm">{med.medication}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {med.time}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Syringe className="w-3 h-3" />
                        {med.route}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 btn-press gradient-emerald">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Administered
                    </Button>
                    <Button size="sm" variant="outline" className="btn-press">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Tasks */}
        <Card className="mt-6 card-shadow hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-primary" />
              Daily Tasks & Rounds
            </CardTitle>
            <CardDescription>Shift checklist and routine care</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: "Morning vital signs round", time: "08:00 AM", status: "completed", patients: "12/12 completed" },
                { task: "Medication administration - Morning dose", time: "09:00 AM", status: "in_progress", patients: "8/12 completed" },
                { task: "Wound dressing changes", time: "10:00 AM", status: "pending", patients: "0/3 completed" },
                { task: "Patient hygiene assistance", time: "11:00 AM", status: "pending", patients: "0/5 completed" },
                { task: "Lunch meal assistance", time: "12:00 PM", status: "pending", patients: "Scheduled" },
                { task: "Afternoon vital signs", time: "02:00 PM", status: "pending", patients: "Scheduled" }
              ].map((task, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover-lift">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      task.status === "completed" ? "bg-secondary/10" :
                      task.status === "in_progress" ? "bg-accent/10" :
                      "bg-primary/10"
                    }`}>
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-6 h-6 text-secondary" />
                      ) : task.status === "in_progress" ? (
                        <Clock className="w-6 h-6 text-accent" />
                      ) : (
                        <ClipboardCheck className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{task.task}</h4>
                      <p className="text-sm text-muted-foreground">{task.time} - {task.patients}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={`${
                        task.status === "completed" ? "bg-secondary/10 text-secondary border-secondary/20" :
                        task.status === "in_progress" ? "bg-accent/10 text-accent border-accent/20" :
                        "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
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

export default NurseDashboard;
