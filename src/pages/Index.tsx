import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Hospital,
  Stethoscope,
  Activity,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Users,
  Heart,
  Brain,
  Baby,
  Pill,
  Video,
  CreditCard,
  Microscope,
  Ambulance,
  Clock,
  QrCode,
  FileSignature
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Activity,
      title: "Complete Patient Journey",
      description: "Track every patient from admission to discharge, across all departments including emergency, ICU, maternity, and mental health services",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Stethoscope,
      title: "Multi-Department Management",
      description: "Seamlessly manage outpatient, inpatient, surgery, radiology, laboratory, and specialized departments from one unified platform",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: QrCode,
      title: "Digital Prescriptions with QR",
      description: "Digitally signed prescriptions authenticated with QR codes, tracked by hospital pharmacy from doctor to patient",
      color: "text-tertiary",
      bgColor: "bg-tertiary/10"
    },
    {
      icon: Video,
      title: "Telemedicine & Aftercare",
      description: "Doctors maintain continuity of care through telemedicine consultations after patient discharge for comprehensive follow-up",
      color: "text-teal",
      bgColor: "bg-teal/10"
    },
    {
      icon: CreditCard,
      title: "Integrated Billing",
      description: "Complete financial management from patient registration through discharge, with insurance tracking and payment processing",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Security",
      description: "Secure access control for doctors, nurses, pharmacists, billing staff, administrators, and all hospital personnel",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
  ];

  const departments = [
    { icon: Ambulance, name: "Emergency", color: "text-destructive" },
    { icon: Heart, name: "ICU", color: "text-destructive" },
    { icon: Baby, name: "Maternity", color: "text-coral" },
    { icon: Brain, name: "Mental Health", color: "text-teal" },
    { icon: Stethoscope, name: "Outpatient", color: "text-primary" },
    { icon: Microscope, name: "Laboratory", color: "text-tertiary" },
    { icon: Pill, name: "Pharmacy", color: "text-secondary" },
    { icon: CreditCard, name: "Billing", color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Premium Header */}
      <header className="glass-luxury sticky top-0 z-50 border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl"></div>
              <div className="relative w-14 h-14 gradient-royal rounded-3xl flex items-center justify-center luxury-shadow hover-scale">
                <Hospital className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="font-bold text-2xl tracking-tight bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              HospitalGuard
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="gradient-royal hover-lift luxury-shadow group btn-press"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-royal rounded-full mb-8 luxury-shadow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">The Future of Hospital Management</span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Complete Hospital Management{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              from Admission to Aftercare
            </span>
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Track every patient journey through all departments - from emergency admission to recovery.
            Digital prescriptions with QR authentication, telemedicine aftercare, and comprehensive billing in one luxurious platform.
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-royal hover-scale luxury-shadow px-10 py-7 text-lg group btn-press"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hover-lift card-shadow px-10 py-7 text-lg group btn-press border-2"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:text-primary transition-colors" />
              <span>Watch Demo</span>
            </Button>
          </motion.div>

          {/* Department Pills */}
          <motion.div
            className="flex flex-wrap gap-3 justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {departments.map((dept, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-4 py-2 text-sm font-medium bg-card/50 backdrop-blur-sm hover-lift cursor-pointer"
              >
                <dept.icon className={`w-4 h-4 mr-2 ${dept.color}`} />
                {dept.name}
              </Badge>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge className="px-4 py-2 bg-secondary/10 text-secondary border-secondary/20 mb-6">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Core Features
          </Badge>
          <h3 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Everything Your Hospital Needs,{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              All in One Place
            </span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From patient registration to discharge and beyond, manage every aspect of hospital operations seamlessly
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover-lift card-shadow group border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden h-full">
                <CardHeader className="space-y-4 pb-6">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Patient Journey Section */}
      <section className="container mx-auto px-6 py-24">
        <Card className="luxury-shadow border-none overflow-hidden relative bg-gradient-to-br from-primary via-secondary to-tertiary">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none"></div>
          <div className="absolute inset-0 shimmer opacity-10"></div>
          <CardHeader className="text-center py-20 relative z-10">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 rounded-full mb-6 border border-white/20 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Complete Patient Journey</span>
            </div>
            <CardTitle className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
              From Walk-In to Recovery
            </CardTitle>
            <CardDescription className="text-white/90 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
              Track every step: Registration → Triage → Consultation → Lab/Radiology → Prescription →
              Billing → Discharge → Telemedicine Follow-up. Your doctor stays with you even after you leave.
            </CardDescription>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="elevated-shadow hover:scale-105 transition-all duration-300 px-12 py-7 text-lg font-semibold group btn-press"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Digital Prescription Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge className="px-4 py-2 bg-tertiary/10 text-tertiary border-tertiary/20 mb-6">
              <FileSignature className="w-4 h-4 mr-2" />
              Digital Innovation
            </Badge>
            <h3 className="text-4xl font-bold mb-6 tracking-tight">
              Prescriptions Signed, Sealed,{" "}
              <span className="bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent">
                Delivered Securely
              </span>
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Doctors digitally sign prescriptions that are authenticated with QR codes. Hospital pharmacies
              track every medication from prescription to dispensing, ensuring complete accountability and patient safety.
            </p>
            <div className="space-y-4">
              {[
                "Digital signature authentication",
                "QR code verification at pharmacy",
                "Complete medication tracking",
                "Automatic dispensing logs"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-tertiary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-tertiary" />
                  </div>
                  <span className="text-base font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="luxury-shadow bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-2 border-tertiary/20">
              <CardContent className="p-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-48 h-48 bg-gradient-to-br from-tertiary/20 to-secondary/20 rounded-3xl flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-tertiary" />
                  </div>
                </div>
                <p className="text-center text-muted-foreground">
                  Scan, Verify, Dispense - It's that simple
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <Card className="elevated-shadow border-none overflow-hidden relative bg-gradient-to-br from-teal via-primary to-secondary">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none"></div>
          <div className="absolute inset-0 shimmer opacity-20"></div>
          <CardHeader className="text-center py-20 relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Transform Your Hospital Today</span>
            </div>
            <CardTitle className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
              Experience Luxury in Healthcare Management
            </CardTitle>
            <CardDescription className="text-white/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Join modern hospitals in delivering exceptional patient care with seamless technology
            </CardDescription>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="elevated-shadow hover:scale-105 transition-all duration-300 px-12 py-7 text-lg font-semibold group btn-press"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="glass-effect border-t mt-16">
        <div className="container mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg"></div>
              <div className="relative w-12 h-12 gradient-royal rounded-2xl flex items-center justify-center luxury-shadow">
                <Hospital className="w-7 h-7 text-white" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              HospitalGuard
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Enterprise-grade hospital management system
          </p>
          <p className="text-xs text-muted-foreground/70">
            © 2025 HospitalGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
