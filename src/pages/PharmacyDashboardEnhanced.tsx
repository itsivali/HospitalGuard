import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/currency";
import {
  Activity,
  Hospital,
  LogOut,
  Pill,
  Clock,
  AlertCircle,
  User,
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
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const PharmacyDashboardEnhanced = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showEditMedicationModal, setShowEditMedicationModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);

  // Data states
  const [stats, setStats] = useState({
    pendingPrescriptions: 0,
    dispensedToday: 0,
    lowStockItems: 0,
    expiringItems: 0,
    totalInventoryValue: 0,
    totalMedications: 0
  });
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [dispensingLog, setDispensingLog] = useState<any[]>([]);
  const [lowStockMeds, setLowStockMeds] = useState<any[]>([]);
  const [expiringMeds, setExpiringMeds] = useState<any[]>([]);

  // Form states
  const [newMedicationForm, setNewMedicationForm] = useState({
    medication_name: '',
    generic_name: '',
    category: '',
    dosage_form: '',
    strength: '',
    quantity_in_stock: 0,
    reorder_level: 0,
    unit_price: 0,
    manufacturer: '',
    expiry_date: '',
    requires_prescription: true,
    storage_location: '',
    batch_number: ''
  });

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

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

  const fetchAllData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Fetch prescriptions with related data
      const { data: prescriptionsData, count: pendingCount } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients(first_name, last_name, phone),
          doctor:hospital_staff(first_name, last_name),
          prescription_items(*)
        `, { count: 'exact' })
        .in('status', ['pending', 'signed'])
        .order('created_at', { ascending: false });

      setPrescriptions(prescriptionsData || []);

      // Fetch dispensing log for today
      const { data: dispensingData } = await supabase
        .from('dispensing_log')
        .select(`
          *,
          patient:patients(first_name, last_name),
          pharmacist:hospital_staff(first_name, last_name),
          prescription:prescriptions(prescription_number)
        `)
        .gte('dispensed_at', today.toISOString())
        .lt('dispensed_at', tomorrow.toISOString())
        .order('dispensed_at', { ascending: false });

      setDispensingLog(dispensingData || []);

      // Fetch all medications
      const { data: medicationsData, count: totalMedsCount } = await supabase
        .from('pharmacy_inventory')
        .select('*', { count: 'exact' })
        .order('medication_name', { ascending: true });

      setMedications(medicationsData || []);

      // Fetch low stock medications
      const lowStockData = medicationsData?.filter(
        med => med.quantity_in_stock <= med.reorder_level
      ) || [];
      setLowStockMeds(lowStockData);

      // Fetch expiring medications (within 30 days)
      const expiringData = medicationsData?.filter(med => {
        if (!med.expiry_date) return false;
        const expiryDate = new Date(med.expiry_date);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
      }) || [];
      setExpiringMeds(expiringData);

      // Calculate inventory value
      const inventoryValue = medicationsData?.reduce((sum, med) =>
        sum + (Number(med.unit_price) * Number(med.quantity_in_stock)), 0
      ) || 0;

      // Update stats
      setStats({
        pendingPrescriptions: pendingCount || 0,
        dispensedToday: dispensingData?.length || 0,
        lowStockItems: lowStockData.length,
        expiringItems: expiringData.length,
        totalInventoryValue: inventoryValue,
        totalMedications: totalMedsCount || 0
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Data Fetch Error",
        description: "Failed to load pharmacy data",
        variant: "destructive",
      });
    }
  };

  const handleDispensePrescription = async (prescription: any) => {
    try {
      const pharmacistId = user?.id;

      // Create dispensing log entries for each prescription item
      for (const item of prescription.prescription_items) {
        await supabase
          .from('dispensing_log')
          .insert({
            prescription_id: prescription.id,
            prescription_item_id: item.id,
            patient_id: prescription.patient_id,
            pharmacist_id: pharmacistId,
            medication_name: item.medication_name,
            quantity_dispensed: item.quantity,
            notes: 'Dispensed as prescribed'
          });

        // Update medication stock
        const { data: medication } = await supabase
          .from('pharmacy_inventory')
          .select('*')
          .eq('medication_name', item.medication_name)
          .single();

        if (medication) {
          await supabase
            .from('pharmacy_inventory')
            .update({
              quantity_in_stock: medication.quantity_in_stock - item.quantity
            })
            .eq('id', medication.id);
        }
      }

      // Update prescription status
      await supabase
        .from('prescriptions')
        .update({ status: 'dispensed' })
        .eq('id', prescription.id);

      toast({
        title: "Success",
        description: "Prescription dispensed successfully",
      });

      setShowDispenseModal(false);
      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to dispense prescription",
        variant: "destructive",
      });
    }
  };

  const handleAddMedication = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacy_inventory')
        .insert([newMedicationForm])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication added to inventory",
      });

      setShowAddMedicationModal(false);
      setNewMedicationForm({
        medication_name: '',
        generic_name: '',
        category: '',
        dosage_form: '',
        strength: '',
        quantity_in_stock: 0,
        reorder_level: 0,
        unit_price: 0,
        manufacturer: '',
        expiry_date: '',
        requires_prescription: true,
        storage_location: '',
        batch_number: ''
      });
      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add medication",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMedication = async () => {
    if (!selectedMedication) return;

    try {
      const { error } = await supabase
        .from('pharmacy_inventory')
        .update(selectedMedication)
        .eq('id', selectedMedication.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication updated successfully",
      });

      setShowEditMedicationModal(false);
      setSelectedMedication(null);
      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update medication",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;

    try {
      const { error } = await supabase
        .from('pharmacy_inventory')
        .delete()
        .eq('id', medicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete medication",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredPrescriptions = prescriptions.filter(rx =>
    rx.prescription_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.patient?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.patient?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMedications = medications.filter(med =>
    med.medication_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="font-bold text-2xl tracking-tight">Pharmacy Management</h1>
              <p className="text-xs text-muted-foreground">Pharmacy Inventory & Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchAllData} variant="outline" size="sm" className="btn-press">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="btn-press hover-lift">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="cursor-pointer"
            onClick={() => setActiveTab("prescriptions")}
          >
            <Card className="hover-lift card-shadow bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Pending</Badge>
                </div>
                <h3 className="text-2xl font-bold">{stats.pendingPrescriptions}</h3>
                <p className="text-sm text-muted-foreground">Prescriptions</p>
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
                <h3 className="text-2xl font-bold">{stats.dispensedToday}</h3>
                <p className="text-sm text-muted-foreground">Dispensed</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="cursor-pointer"
            onClick={() => setActiveTab("inventory")}
          >
            <Card className="hover-lift card-shadow bg-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-destructive" />
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Low</Badge>
                </div>
                <h3 className="text-2xl font-bold">{stats.lowStockItems}</h3>
                <p className="text-sm text-muted-foreground">Low Stock</p>
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
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">30 Days</Badge>
                </div>
                <h3 className="text-2xl font-bold">{stats.expiringItems}</h3>
                <p className="text-sm text-muted-foreground">Expiring</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="hover-lift card-shadow bg-tertiary/5 border-tertiary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-tertiary/10 rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-tertiary" />
                  </div>
                  <Badge variant="outline" className="bg-tertiary/10 text-tertiary border-tertiary/20">Total</Badge>
                </div>
                <h3 className="text-2xl font-bold">{stats.totalMedications}</h3>
                <p className="text-sm text-muted-foreground">Medications</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="hover-lift card-shadow gradient-emerald text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">Value</Badge>
                </div>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalInventoryValue)}</h3>
                <p className="text-sm text-white/80">Inventory Value</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground w-full sm:w-auto">
            <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
            <TabsTrigger value="prescriptions" className="rounded-lg px-6">Prescriptions</TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-lg px-6">Inventory</TabsTrigger>
            <TabsTrigger value="dispensing" className="rounded-lg px-6">Dispensing Log</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg px-6">Alerts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Quick Actions */}
              <Card className="card-shadow hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full btn-press gradient-emerald" onClick={() => setActiveTab("prescriptions")}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR & Dispense
                  </Button>
                  <Button className="w-full btn-press" variant="outline" onClick={() => setShowAddMedicationModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                  <Button className="w-full btn-press" variant="outline" onClick={() => setActiveTab("inventory")}>
                    <Package className="w-4 h-4 mr-2" />
                    Manage Inventory
                  </Button>
                  <Button className="w-full btn-press" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Prescriptions */}
              <Card className="lg:col-span-2 card-shadow hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Recent Prescriptions
                  </CardTitle>
                  <CardDescription>Latest pending prescriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prescriptions.slice(0, 5).map((rx) => (
                      <div key={rx.id} className="p-4 rounded-xl bg-muted/30 hover-lift">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">{rx.prescription_number}</h4>
                            <p className="text-sm text-muted-foreground">
                              {rx.patient?.first_name} {rx.patient?.last_name}
                            </p>
                          </div>
                          <Badge variant={rx.status === 'pending' ? 'destructive' : 'secondary'}>
                            {rx.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="btn-press gradient-emerald"
                            onClick={() => {
                              setSelectedPrescription(rx);
                              setShowDispenseModal(true);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Dispense
                          </Button>
                          <Button size="sm" variant="outline" className="btn-press">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Low Stock Alerts */}
              <Card className="card-shadow hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <TrendingDown className="w-5 h-5" />
                    Low Stock Alerts ({stats.lowStockItems})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockMeds.slice(0, 5).map((med) => (
                      <div key={med.id} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{med.medication_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Stock: {med.quantity_in_stock} | Reorder at: {med.reorder_level}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="btn-press">
                            Reorder
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expiring Soon */}
              <Card className="card-shadow hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <Clock className="w-5 h-5" />
                    Expiring Soon ({stats.expiringItems})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expiringMeds.slice(0, 5).map((med) => (
                      <div key={med.id} className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{med.medication_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Expires: {new Date(med.expiry_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            {Math.ceil((new Date(med.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <Card className="card-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <FileText className="w-6 h-6 text-primary" />
                      Prescriptions ({filteredPrescriptions.length})
                    </CardTitle>
                    <CardDescription>Pending prescription management</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search prescriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Button className="btn-press gradient-emerald">
                      <QrCode className="w-4 h-4 mr-2" />
                      Scan QR
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPrescriptions.map((rx) => (
                    <div key={rx.id} className="p-4 rounded-2xl bg-muted/30 hover-lift">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{rx.prescription_number}</h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                rx.status === 'pending' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                'bg-secondary/10 text-secondary border-secondary/20'
                              }`}
                            >
                              {rx.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {rx.patient?.first_name} {rx.patient?.last_name} • {rx.patient?.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(rx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Prescription Items */}
                      <div className="space-y-2 mb-3">
                        {rx.prescription_items?.map((item: any, idx: number) => (
                          <div key={idx} className="p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                            <p className="font-medium text-sm">{item.medication_name}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-1">
                              <span>Dosage: {item.dosage}</span>
                              <span>Frequency: {item.frequency}</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 btn-press gradient-emerald"
                          onClick={() => {
                            setSelectedPrescription(rx);
                            setShowDispenseModal(true);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Dispense
                        </Button>
                        <Button size="sm" variant="outline" className="btn-press">
                          <QrCode className="w-4 h-4 mr-1" />
                          Verify QR
                        </Button>
                        <Button size="sm" variant="outline" className="btn-press">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Check
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card className="card-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Package className="w-6 h-6 text-secondary" />
                      Medication Inventory ({filteredMedications.length})
                    </CardTitle>
                    <CardDescription>Complete drug information & management</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search medications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Button className="btn-press gradient-emerald" onClick={() => setShowAddMedicationModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMedications.map((med) => {
                    const isLowStock = med.quantity_in_stock <= med.reorder_level;
                    const daysToExpiry = med.expiry_date
                      ? Math.ceil((new Date(med.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    const isExpiringSoon = daysToExpiry !== null && daysToExpiry <= 30 && daysToExpiry >= 0;

                    return (
                      <div key={med.id} className={`p-4 rounded-2xl border hover-lift ${
                        isLowStock ? 'bg-destructive/5 border-destructive/20' :
                        isExpiringSoon ? 'bg-accent/5 border-accent/20' :
                        'bg-muted/30 border-muted'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                            <Pill className="w-5 h-5 text-secondary" />
                          </div>
                          <div className="flex gap-1">
                            {isLowStock && (
                              <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                                Low Stock
                              </Badge>
                            )}
                            {isExpiringSoon && (
                              <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                                Expiring
                              </Badge>
                            )}
                          </div>
                        </div>

                        <h4 className="font-semibold mb-1">{med.medication_name}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{med.generic_name} • {med.strength}</p>

                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stock:</span>
                            <span className="font-medium">{med.quantity_in_stock} {med.dosage_form}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <span className="font-medium text-xs">{med.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-medium">{formatCurrency(med.unit_price)}</span>
                          </div>
                          {med.expiry_date && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Expires:</span>
                              <span className="font-medium text-xs">
                                {new Date(med.expiry_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 btn-press"
                            onClick={() => {
                              setSelectedMedication(med);
                              setShowEditMedicationModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="btn-press text-destructive"
                            onClick={() => handleDeleteMedication(med.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dispensing Log Tab */}
          <TabsContent value="dispensing" className="space-y-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Activity className="w-6 h-6 text-primary" />
                  Dispensing Log
                </CardTitle>
                <CardDescription>Recent dispensing activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dispensingLog.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover-lift">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                          <PackageCheck className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {record.medication_name} - Qty: {record.quantity_dispensed}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Patient: {record.patient?.first_name} {record.patient?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pharmacist: {record.pharmacist?.first_name} {record.pharmacist?.last_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.dispensed_at).toLocaleString()}
                        </p>
                        {record.prescription && (
                          <p className="text-xs font-medium text-primary">
                            {record.prescription.prescription_number}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Low Stock */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Low Stock Items ({stats.lowStockItems})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockMeds.map((med) => (
                      <div key={med.id} className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{med.medication_name}</h4>
                            <p className="text-sm text-muted-foreground">{med.category}</p>
                          </div>
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            Critical
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Current: </span>
                            <span className="font-medium">{med.quantity_in_stock}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reorder at: </span>
                            <span className="font-medium">{med.reorder_level}</span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full btn-press" variant="outline">
                          <Plus className="w-4 h-4 mr-1" />
                          Reorder Now
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expiring Soon */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 text-accent">
                    <Clock className="w-5 h-5" />
                    Expiring Soon ({stats.expiringItems})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expiringMeds.map((med) => {
                      const daysToExpiry = Math.ceil(
                        (new Date(med.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <div key={med.id} className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{med.medication_name}</h4>
                              <p className="text-sm text-muted-foreground">{med.batch_number}</p>
                            </div>
                            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                              {daysToExpiry} days
                            </Badge>
                          </div>
                          <div className="text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Expiry Date:</span>
                              <span className="font-medium">{new Date(med.expiry_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Stock:</span>
                              <span className="font-medium">{med.quantity_in_stock} units</span>
                            </div>
                          </div>
                          <Button size="sm" className="w-full btn-press" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dispense Modal */}
      <Dialog open={showDispenseModal} onOpenChange={setShowDispenseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-secondary" />
              Dispense Prescription
            </DialogTitle>
            <DialogDescription>
              Review and confirm dispensing for {selectedPrescription?.prescription_number}
            </DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <h3 className="font-semibold mb-2">Patient Information</h3>
                <p>{selectedPrescription.patient?.first_name} {selectedPrescription.patient?.last_name}</p>
                <p className="text-sm text-muted-foreground">{selectedPrescription.patient?.phone}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Medications to Dispense:</h3>
                {selectedPrescription.prescription_items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.medication_name}</h4>
                      <Badge variant="secondary">Qty: {item.quantity}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Dosage:</span> {item.dosage}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span> {item.frequency}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {item.duration}
                      </div>
                    </div>
                    {item.instructions && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium">Instructions:</span> {item.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 btn-press gradient-emerald"
                  onClick={() => handleDispensePrescription(selectedPrescription)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm & Dispense
                </Button>
                <Button
                  variant="outline"
                  className="btn-press"
                  onClick={() => setShowDispenseModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Medication Modal */}
      <Dialog open={showAddMedicationModal} onOpenChange={setShowAddMedicationModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6 text-secondary" />
              Add New Medication
            </DialogTitle>
            <DialogDescription>Add medication to pharmacy inventory</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medication_name">Medication Name *</Label>
                <Input
                  id="medication_name"
                  value={newMedicationForm.medication_name}
                  onChange={(e) => setNewMedicationForm({...newMedicationForm, medication_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="generic_name">Generic Name</Label>
                <Input
                  id="generic_name"
                  value={newMedicationForm.generic_name}
                  onChange={(e) => setNewMedicationForm({...newMedicationForm, generic_name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newMedicationForm.category}
                  onValueChange={(value) => setNewMedicationForm({...newMedicationForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pain Management">Pain Management</SelectItem>
                    <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                    <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                    <SelectItem value="Diabetes Management">Diabetes Management</SelectItem>
                    <SelectItem value="Respiratory">Respiratory</SelectItem>
                    <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
                    <SelectItem value="Mental Health">Mental Health</SelectItem>
                    <SelectItem value="Vitamins & Supplements">Vitamins & Supplements</SelectItem>
                    <SelectItem value="Antimalarials">Antimalarials</SelectItem>
                    <SelectItem value="Antivirals">Antivirals</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dosage_form">Dosage Form *</Label>
                <Select
                  value={newMedicationForm.dosage_form}
                  onValueChange={(value) => setNewMedicationForm({...newMedicationForm, dosage_form: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Capsule">Capsule</SelectItem>
                    <SelectItem value="Syrup">Syrup</SelectItem>
                    <SelectItem value="Injection">Injection</SelectItem>
                    <SelectItem value="Cream">Cream</SelectItem>
                    <SelectItem value="Inhaler">Inhaler</SelectItem>
                    <SelectItem value="Drops">Drops</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="strength">Strength *</Label>
                <Input
                  id="strength"
                  placeholder="e.g., 500mg"
                  value={newMedicationForm.strength}
                  onChange={(e) => setNewMedicationForm({...newMedicationForm, strength: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="quantity_in_stock">Quantity *</Label>
                <Input
                  id="quantity_in_stock"
                  type="number"
                  value={newMedicationForm.quantity_in_stock}
                  onChange={(e) => setNewMedicationForm({...newMedicationForm, quantity_in_stock: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="reorder_level">Reorder Level *</Label>
                <Input
                  id="reorder_level"
                  type="number"
                  value={newMedicationForm.reorder_level}
                  onChange={(e) => setNewMedicationForm({...newMedicationForm, reorder_level: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Unit Price (KES) *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={newMedicationForm.unit_price}
                  onChange={(e) => setNewMedicationForm({...newMedicationForm, unit_price: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={newMedicationForm.expiry_date}
                  onChange={(e) => setNewMedicationForm({...newMedicationForm, expiry_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={newMedicationForm.manufacturer}
                  onChange={(e) => setNewMedicationForm({...newMedicationForm, manufacturer: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={newMedicationForm.batch_number}
                  onChange={(e) => setNewMedicationForm({...newMedicationForm, batch_number: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="storage_location">Storage Location</Label>
              <Input
                id="storage_location"
                value={newMedicationForm.storage_location}
                onChange={(e) => setNewMedicationForm({...newMedicationForm, storage_location: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 btn-press gradient-emerald" onClick={handleAddMedication}>
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
              <Button variant="outline" className="btn-press" onClick={() => setShowAddMedicationModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Medication Modal */}
      <Dialog open={showEditMedicationModal} onOpenChange={setShowEditMedicationModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Edit className="w-6 h-6 text-primary" />
              Edit Medication
            </DialogTitle>
            <DialogDescription>Update medication details</DialogDescription>
          </DialogHeader>

          {selectedMedication && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_medication_name">Medication Name</Label>
                  <Input
                    id="edit_medication_name"
                    value={selectedMedication.medication_name}
                    onChange={(e) => setSelectedMedication({...selectedMedication, medication_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_generic_name">Generic Name</Label>
                  <Input
                    id="edit_generic_name"
                    value={selectedMedication.generic_name || ''}
                    onChange={(e) => setSelectedMedication({...selectedMedication, generic_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit_quantity">Quantity</Label>
                  <Input
                    id="edit_quantity"
                    type="number"
                    value={selectedMedication.quantity_in_stock}
                    onChange={(e) => setSelectedMedication({...selectedMedication, quantity_in_stock: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_reorder">Reorder Level</Label>
                  <Input
                    id="edit_reorder"
                    type="number"
                    value={selectedMedication.reorder_level}
                    onChange={(e) => setSelectedMedication({...selectedMedication, reorder_level: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_price">Unit Price (KES)</Label>
                  <Input
                    id="edit_price"
                    type="number"
                    step="0.01"
                    value={selectedMedication.unit_price}
                    onChange={(e) => setSelectedMedication({...selectedMedication, unit_price: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 btn-press gradient-emerald" onClick={handleUpdateMedication}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Update Medication
                </Button>
                <Button variant="outline" className="btn-press" onClick={() => setShowEditMedicationModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyDashboardEnhanced;
