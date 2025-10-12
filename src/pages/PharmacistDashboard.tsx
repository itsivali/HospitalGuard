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
  Hospital,
  LogOut,
  Pill,
  Clock,
  AlertCircle,
  User,
  Sparkles,
  CheckCircle2,
  QrCode,
  Package,
  PackageCheck,
  TrendingDown,
  TrendingUp,
  Search,
  FileText,
  ShieldCheck,
  XCircle,
  ArrowRight,
  BarChart3
} from "lucide-react";

const PharmacistDashboard = () => {
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
          <Pill className="w-10 h-10 text-white" />
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
                <Pill className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">Pharmacy Portal</h1>
              <p className="text-xs text-muted-foreground">{user?.user_metadata?.full_name || 'Pharmacist'}</p>
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
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Pending</Badge>
                </div>
                <h3 className="text-2xl font-bold">24</h3>
                <p className="text-sm text-muted-foreground">Prescriptions to Fill</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover-lift card-shadow bg-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <PackageCheck className="w-6 h-6 text-secondary" />
                  </div>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">Today</Badge>
                </div>
                <h3 className="text-2xl font-bold">48</h3>
                <p className="text-sm text-muted-foreground">Dispensed</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover-lift card-shadow bg-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-destructive" />
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Low</Badge>
                </div>
                <h3 className="text-2xl font-bold">6</h3>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover-lift card-shadow bg-accent/5 border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Review</Badge>
                </div>
                <h3 className="text-2xl font-bold">3</h3>
                <p className="text-sm text-muted-foreground">Interaction Alerts</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pending Prescriptions */}
          <Card className="lg:col-span-2 card-shadow hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Pending Prescriptions
                  </CardTitle>
                  <CardDescription>Awaiting verification and dispensing</CardDescription>
                </div>
                <Button className="btn-press gradient-emerald">
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "RX-2025-001", patient: "John Smith", doctor: "Dr. Sarah Johnson", medication: "Lisinopril 10mg", qty: "30 tablets", priority: "normal" },
                  { id: "RX-2025-002", patient: "Sarah Johnson", doctor: "Dr. Michael Chen", medication: "Metformin 500mg", qty: "60 tablets", priority: "urgent" },
                  { id: "RX-2025-003", patient: "Michael Chen", doctor: "Dr. Sarah Johnson", medication: "Atorvastatin 20mg", qty: "30 tablets", priority: "normal" },
                  { id: "RX-2025-004", patient: "Emma Wilson", doctor: "Dr. James Brown", medication: "Amoxicillin 500mg", qty: "21 capsules", priority: "urgent" }
                ].map((rx, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/30 hover-lift">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{rx.id}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              rx.priority === "urgent" ? "bg-destructive/10 text-destructive border-destructive/20" :
                              "bg-secondary/10 text-secondary border-secondary/20"
                            }`}
                          >
                            {rx.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rx.patient}</p>
                      </div>
                      <Button variant="outline" size="sm" className="btn-press">
                        <QrCode className="w-4 h-4 mr-1" />
                        Verify
                      </Button>
                    </div>
                    <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                      <p className="font-medium text-sm mb-1">{rx.medication}</p>
                      <p className="text-xs text-muted-foreground">Quantity: {rx.qty}</p>
                      <p className="text-xs text-muted-foreground">Prescribed by: {rx.doctor}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 btn-press gradient-emerald">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Dispense
                      </Button>
                      <Button size="sm" variant="outline" className="btn-press">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Check Interactions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Actions */}
          <Card className="card-shadow hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Action Items
              </CardTitle>
              <CardDescription>Requires attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Low Stock Alert</p>
                    <p className="text-xs text-muted-foreground mt-1">6 medications below reorder level</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">View Inventory</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Drug Interactions</p>
                    <p className="text-xs text-muted-foreground mt-1">3 prescriptions with potential interactions</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Review</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Expiring Soon</p>
                    <p className="text-xs text-muted-foreground mt-1">8 medications expire within 30 days</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Check Dates</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Controlled Substances</p>
                    <p className="text-xs text-muted-foreground mt-1">2 prescriptions require extra verification</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Verify</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Management */}
        <Card className="mt-6 card-shadow hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Package className="w-6 h-6 text-secondary" />
                  Inventory Status
                </CardTitle>
                <CardDescription>Current stock levels</CardDescription>
              </div>
              <Button className="btn-press gradient-emerald">
                <Package className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: "Lisinopril 10mg", current: 120, reorder: 50, status: "adequate", trend: "stable" },
                { name: "Metformin 500mg", current: 35, reorder: 100, status: "low", trend: "down" },
                { name: "Atorvastatin 20mg", current: 200, reorder: 75, status: "good", trend: "up" },
                { name: "Amoxicillin 500mg", current: 25, reorder: 80, status: "critical", trend: "down" },
                { name: "Omeprazole 20mg", current: 150, reorder: 60, status: "good", trend: "stable" },
                { name: "Aspirin 81mg", current: 45, reorder: 100, status: "low", trend: "down" }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-muted hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Pill className="w-5 h-5 text-secondary" />
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.status === "critical" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        item.status === "low" ? "bg-accent/10 text-accent border-accent/20" :
                        "bg-secondary/10 text-secondary border-secondary/20"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-2">{item.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-medium">{item.current} units</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reorder at:</span>
                      <span className="font-medium">{item.reorder} units</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {item.trend === "up" && <TrendingUp className="w-3 h-3 text-secondary" />}
                      {item.trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
                      <span className="text-muted-foreground">Trend: {item.trend}</span>
                    </div>
                  </div>
                  {(item.status === "low" || item.status === "critical") && (
                    <Button size="sm" className="w-full mt-3 btn-press" variant="outline">
                      Reorder Now
                    </Button>
                  )}
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
              Recent Dispensing Activity
            </CardTitle>
            <CardDescription>Latest prescription fulfillments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "5 min ago", action: "Dispensed", rx: "RX-2024-998", patient: "John Smith", medication: "Lisinopril 10mg", qty: "30 tablets" },
                { time: "12 min ago", action: "Verified", rx: "RX-2024-999", patient: "Sarah Johnson", medication: "Metformin 500mg", qty: "60 tablets" },
                { time: "25 min ago", action: "Dispensed", rx: "RX-2024-997", patient: "Michael Chen", medication: "Atorvastatin 20mg", qty: "30 tablets" },
                { time: "45 min ago", action: "Rejected", rx: "RX-2024-996", patient: "Emma Wilson", medication: "N/A", qty: "Drug interaction found" },
                { time: "1 hour ago", action: "Dispensed", rx: "RX-2024-995", patient: "David Brown", medication: "Amoxicillin 500mg", qty: "21 capsules" }
              ].map((record, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover-lift">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      record.action === "Dispensed" ? "bg-secondary/10" :
                      record.action === "Verified" ? "bg-primary/10" :
                      "bg-destructive/10"
                    }`}>
                      {record.action === "Dispensed" ? (
                        <PackageCheck className="w-6 h-6 text-secondary" />
                      ) : record.action === "Verified" ? (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      ) : (
                        <XCircle className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{record.action} - {record.rx}</h4>
                      <p className="text-sm text-muted-foreground">{record.patient} - {record.medication}</p>
                      <p className="text-xs text-muted-foreground">{record.qty}</p>
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

export default PharmacistDashboard;
