import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Activity,
  Lock,
  FileCheck,
  Users,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Smartphone,
  QrCode,
  BarChart3,
  ShieldCheck,
  Globe,
  Database
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Secure Role-Based Access",
      description: "Advanced authentication for doctors, pharmacists, patients, and administrators with SHA integration for Nairobi facilities",
    },
    {
      icon: FileCheck,
      title: "Digital Prescription Tracking",
      description: "Real-time monitoring of prescription lifecycle from creation to dispensing with counterfeit drug verification",
    },
    {
      icon: Lock,
      title: "Controlled Substance Management",
      description: "PPB-compliant handling and alerts for controlled medications to prevent misuse and ensure regulatory compliance",
    },
    {
      icon: AlertCircle,
      title: "Fraud Detection System",
      description: "AI-powered alerts for duplicate prescriptions, early refills, and suspicious patterns across Nairobi's network",
    },
    {
      icon: Activity,
      title: "Complete Audit Trail",
      description: "Immutable activity logs ensuring accountability for all prescription actions with SHA claims integration",
    },
    {
      icon: Smartphone,
      title: "Mobile-First Access",
      description: "SMS/WhatsApp notifications and M-Pesa payments for seamless prescription management on any device",
    },
  ];

  const roleDescriptions = [
    {
      role: "Doctors & Hospitals",
      description: "Create and digitally sign prescriptions with built-in safety checks, SHA pre-authorization, and patient medication history",
      color: "text-primary",
    },
    {
      role: "Pharmacists",
      description: "Validate prescriptions, verify drug authenticity, process SHA/M-Pesa payments, and track dispensing with secure verification",
      color: "text-secondary",
    },
    {
      role: "Patients",
      description: "View prescription history, track refill status, receive SMS/WhatsApp notifications, and verify medication authenticity",
      color: "text-accent-foreground",
    },
    {
      role: "Administrators",
      description: "Monitor system usage, detect fraud patterns, ensure PPB compliance, and generate comprehensive audit reports",
      color: "text-destructive",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass-effect sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-bold text-2xl tracking-tight">PrescriptionGuard</h1>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="hover-lift soft-shadow group"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 rounded-full mb-8 soft-shadow border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Launching in Nairobi · 2025</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Secure Prescription Management for{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              Modern Healthcare
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
            Prevent prescription misuse, ensure accountability, and streamline healthcare delivery for Nairobi's
            hospitals and pharmacies with SHA integration, M-Pesa payments, and PPB-compliant tracking
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="elevated-shadow hover:scale-105 transition-all duration-300 px-10 py-7 text-lg group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hover-lift soft-shadow px-10 py-7 text-lg group"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:text-primary transition-colors" />
              <span>Learn More</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-24 bg-muted/30 rounded-3xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 soft-shadow border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Core Features</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Built for{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Excellence
            </span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Security, compliance, and usability at the heart of everything we do
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover-lift card-shadow group border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <CardHeader className="space-y-4 pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Role-Based Access */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full mb-6 soft-shadow border border-secondary/20">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">Role-Based Access</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Tailored for{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Every Role
            </span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Customized experiences for every stakeholder in the prescription lifecycle
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {roleDescriptions.map((item, index) => (
            <Card
              key={index}
              className="hover-lift card-shadow border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group"
            >
              <CardContent className="pt-8 pb-8 px-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${item.color === 'text-primary' ? 'bg-primary/10' : item.color === 'text-secondary' ? 'bg-secondary/10' : item.color === 'text-destructive' ? 'bg-destructive/10' : 'bg-accent/20'} rounded-xl flex items-center justify-center`}>
                    <CheckCircle2 className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h4 className={`text-2xl font-bold ${item.color}`}>
                    {item.role}
                  </h4>
                </div>
                <p className="text-muted-foreground text-base leading-relaxed pl-15">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <Card className="elevated-shadow border-none overflow-hidden relative bg-gradient-to-br from-primary/95 via-primary to-primary/90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none"></div>
          <CardHeader className="text-center py-20 relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-foreground/10 rounded-full mb-6 border border-primary-foreground/20">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-semibold text-primary-foreground">Join Today</span>
            </div>
            <CardTitle className="text-4xl md:text-6xl font-bold mb-6 text-primary-foreground tracking-tight">
              Ready to Transform Healthcare?
            </CardTitle>
            <CardDescription className="text-primary-foreground/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Join Nairobi's hospitals and pharmacies in secure, compliant prescription management with SHA integration
            </CardDescription>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="elevated-shadow hover:scale-105 transition-all duration-300 px-12 py-7 text-lg font-semibold group"
              >
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 glass-effect mt-16">
        <div className="container mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight">PrescriptionGuard</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Enterprise-grade prescription management
          </p>
          <p className="text-xs text-muted-foreground/70">
            © 2025 PrescriptionGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
