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
  Clock,
  AlertCircle,
  User,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3
} from "lucide-react";

const BillingDashboard = () => {
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
          className="w-20 h-20 gradient-gold rounded-3xl flex items-center justify-center luxury-shadow"
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CreditCard className="w-10 h-10 text-white" />
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
              <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="relative w-14 h-14 gradient-gold rounded-3xl flex items-center justify-center luxury-shadow">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">Billing Portal</h1>
              <p className="text-xs text-muted-foreground">{user?.user_metadata?.full_name || 'Billing Staff'}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="btn-press hover-lift">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Financial Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="hover-lift card-shadow bg-accent/5 border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Today</Badge>
                </div>
                <h3 className="text-2xl font-bold">$24,850</h3>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-secondary">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% from yesterday</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover-lift card-shadow bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Pending</Badge>
                </div>
                <h3 className="text-2xl font-bold">34</h3>
                <p className="text-sm text-muted-foreground">Unpaid Bills</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <DollarSign className="w-3 h-3" />
                  <span>$18,420 outstanding</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover-lift card-shadow bg-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-secondary" />
                  </div>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">Paid</Badge>
                </div>
                <h3 className="text-2xl font-bold">112</h3>
                <p className="text-sm text-muted-foreground">Bills Today</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-secondary">
                  <TrendingUp className="w-3 h-3" />
                  <span>97% collection rate</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover-lift card-shadow bg-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Overdue</Badge>
                </div>
                <h3 className="text-2xl font-bold">8</h3>
                <p className="text-sm text-muted-foreground">Payment Issues</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  <span>Requires follow-up</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pending Payments */}
          <Card className="lg:col-span-2 card-shadow hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-primary" />
                    Pending Payments
                  </CardTitle>
                  <CardDescription>Outstanding bills requiring attention</CardDescription>
                </div>
                <Button className="btn-press gradient-gold">Process Payment</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "INV-2025-156", patient: "John Smith", date: "Jan 10, 2025", amount: "$3,450", type: "Surgery", status: "pending", dueDate: "Jan 25, 2025" },
                  { id: "INV-2025-157", patient: "Sarah Johnson", date: "Jan 11, 2025", amount: "$1,250", type: "Lab Tests", status: "overdue", dueDate: "Jan 11, 2025" },
                  { id: "INV-2025-158", patient: "Michael Chen", date: "Jan 12, 2025", amount: "$850", type: "Consultation", status: "pending", dueDate: "Jan 27, 2025" },
                  { id: "INV-2025-159", patient: "Emma Wilson", date: "Jan 12, 2025", amount: "$5,200", type: "ICU Stay", status: "pending", dueDate: "Jan 26, 2025" }
                ].map((bill, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/30 hover-lift">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{bill.id}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              bill.status === "overdue" ? "bg-destructive/10 text-destructive border-destructive/20" :
                              "bg-primary/10 text-primary border-primary/20"
                            }`}
                          >
                            {bill.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{bill.patient}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-accent">{bill.amount}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Service</p>
                          <p className="font-medium">{bill.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-medium">{bill.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="font-medium">{bill.dueDate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 btn-press gradient-gold">
                        <CreditCard className="w-4 h-4 mr-1" />
                        Process Payment
                      </Button>
                      <Button size="sm" variant="outline" className="btn-press">
                        <FileText className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="card-shadow hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="w-5 h-5 text-accent" />
                Action Items
              </CardTitle>
              <CardDescription>Tasks requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Overdue Payments</p>
                    <p className="text-xs text-muted-foreground mt-1">8 bills past due date - $12,450 total</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Send Reminders</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-2">
                  <Building2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Insurance Claims</p>
                    <p className="text-xs text-muted-foreground mt-1">12 claims pending approval from insurers</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Follow Up</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Invoices Ready</p>
                    <p className="text-xs text-muted-foreground mt-1">24 new invoices ready to be sent</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Send Invoices</Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Payment Plans</p>
                    <p className="text-xs text-muted-foreground mt-1">5 patients need payment plan setup</p>
                    <Button size="sm" className="mt-2 btn-press" variant="outline">Setup Plans</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods & Insurance */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Payment Methods Today */}
          <Card className="card-shadow hover-lift">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Wallet className="w-6 h-6 text-accent" />
                Payment Methods Today
              </CardTitle>
              <CardDescription>Breakdown by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { method: "Credit Card", count: 48, amount: "$14,250", percentage: "57%", icon: CreditCard, trend: "up" },
                  { method: "Insurance", count: 32, amount: "$8,500", percentage: "34%", icon: Building2, trend: "stable" },
                  { method: "Cash", count: 18, amount: "$1,650", percentage: "7%", icon: DollarSign, trend: "down" },
                  { method: "Payment Plan", count: 14, amount: "$450", percentage: "2%", icon: Calendar, trend: "up" }
                ].map((payment, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/30 hover-lift">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                          <payment.icon className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{payment.method}</h4>
                          <p className="text-sm text-muted-foreground">{payment.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{payment.amount}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {payment.trend === "up" && <ArrowUpRight className="w-3 h-3 text-secondary" />}
                          {payment.trend === "down" && <ArrowDownRight className="w-3 h-3 text-destructive" />}
                          <span>{payment.percentage}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Revenue */}
          <Card className="card-shadow hover-lift">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Revenue by Department
              </CardTitle>
              <CardDescription>Top earning departments today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { dept: "Surgery", amount: "$8,500", patients: 8, percentage: "34%" },
                  { dept: "ICU", amount: "$6,200", patients: 12, percentage: "25%" },
                  { dept: "Emergency", amount: "$4,150", patients: 24, percentage: "17%" },
                  { dept: "Outpatient", amount: "$3,200", patients: 42, percentage: "13%" },
                  { dept: "Laboratory", amount: "$1,850", patients: 89, percentage: "7%" },
                  { dept: "Radiology", amount: "$950", patients: 34, percentage: "4%" }
                ].map((dept, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/30 hover-lift">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{dept.dept}</h4>
                      <p className="text-lg font-bold text-accent">{dept.amount}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{dept.patients} patients</span>
                      <span>{dept.percentage} of total</span>
                    </div>
                    <div className="w-full bg-muted/50 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full gradient-gold"
                        style={{ width: dept.percentage }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="mt-6 card-shadow hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "2 min ago", type: "Payment Received", patient: "John Smith", amount: "$3,450", method: "Credit Card", status: "completed" },
                { time: "8 min ago", type: "Invoice Sent", patient: "Sarah Johnson", amount: "$1,250", method: "Email", status: "sent" },
                { time: "15 min ago", type: "Payment Received", patient: "Michael Chen", amount: "$850", method: "Insurance", status: "completed" },
                { time: "25 min ago", type: "Payment Failed", patient: "Emma Wilson", amount: "$5,200", method: "Credit Card", status: "failed" },
                { time: "35 min ago", type: "Payment Received", patient: "David Brown", amount: "$420", method: "Cash", status: "completed" }
              ].map((txn, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover-lift">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      txn.status === "completed" ? "bg-secondary/10" :
                      txn.status === "sent" ? "bg-primary/10" :
                      "bg-destructive/10"
                    }`}>
                      {txn.status === "completed" ? (
                        <CheckCircle2 className="w-6 h-6 text-secondary" />
                      ) : txn.status === "sent" ? (
                        <FileText className="w-6 h-6 text-primary" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{txn.type}</h4>
                      <p className="text-sm text-muted-foreground">{txn.patient} - {txn.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{txn.amount}</p>
                    <p className="text-xs text-muted-foreground">{txn.time}</p>
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

export default BillingDashboard;
