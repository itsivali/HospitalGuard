# HospitalGuard

> **A Luxurious, Comprehensive Hospital Management System**

HospitalGuard is a complete hospital management platform that tracks every patient's journey from admission to discharge and beyond, with telemedicine aftercare. Built with modern web technologies and designed to feel like a 5-star hotel experience.

![HospitalGuard](https://img.shields.io/badge/Status-In_Development-blue) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)

## Features

### Complete Patient Journey Tracking
Track patients from the moment they walk in until recovery at home:
- **Registration & Check-In**: Streamlined patient registration with triage
- **Multi-Department Care**: Emergency, ICU, Maternity, Mental Health, Pediatrics, Surgery, and more
- **Comprehensive Visits**: Track consultations, lab tests, radiology, prescriptions, and treatments
- **Billing Integration**: Complete financial management from admission to discharge
- **Telemedicine Aftercare**: Doctors continue caring for patients remotely post-discharge

### Digital Prescriptions with QR Authentication
- Doctors digitally sign prescriptions
- QR codes authenticate each prescription
- Hospital pharmacy scans and dispenses medication
- Complete tracking from prescription to patient
- Audit trail for accountability

### Multi-Department Management
- **Emergency Room**: Critical care and triage
- **ICU**: Intensive care unit monitoring
- **Maternity**: Prenatal, delivery, and postnatal care
- **Mental Health**: Psychiatric services and counseling
- **Laboratory**: Diagnostic testing and results
- **Radiology**: Medical imaging (X-Ray, CT, MRI, Ultrasound)
- **Pharmacy**: Medication inventory and dispensing
- **Billing**: Financial services and payment processing
- **Outpatient**: General consultations and follow-ups
- **Surgery**: Surgical procedures and operations

### Luxurious User Experience
- **Smooth Animations**: Framer Motion powered transitions
- **Rich Color Palette**: Department-specific color coding
- **Button Animations**: Press, hover, and spring effects
- **Premium Shadows**: Multi-layer shadow system
- **Shimmer Effects**: Elegant visual feedback
- **Custom Scrollbars**: Styled for premium feel
- **Responsive Design**: Works beautifully on all devices

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC
- **UI Library**: shadcn/ui (Radix UI) + Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **QR Codes**: qrcode & qr-scanner
- **Styling**: Tailwind CSS with custom theming

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([sign up free](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `supabase-schema.sql`

   This will create all necessary tables, indexes, and functions.

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── integrations/
│   └── supabase/        # Supabase client & types
├── lib/
│   └── utils.ts         # Utility functions
├── pages/
│   ├── Index.tsx        # Landing page
│   ├── Auth.tsx         # Authentication
│   ├── Dashboard.tsx    # Main dashboard (14 departments)
│   └── NotFound.tsx     # 404 page
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles & animations
```

## Database Schema

The complete database schema is in `supabase-schema.sql` and includes:

- **Core Tables**: Patients, staff, departments
- **Visit Management**: Complete patient journey tracking
- **Medical Records**: Diagnoses, prescriptions, lab results
- **Pharmacy**: Inventory, dispensing logs with QR codes
- **Specialized Care**: Maternity, mental health records
- **Billing**: Bills, payments, insurance tracking
- **Telemedicine**: Video consultations and aftercare plans
- **Appointments**: Scheduling across all departments
- **Audit Logs**: Complete system activity tracking

## User Roles

- **Doctor**: Create prescriptions, manage consultations
- **Nurse**: Patient monitoring, vitals, medication administration
- **Pharmacist**: Prescription validation, medication dispensing
- **Receptionist**: Patient registration, appointment scheduling
- **Billing**: Financial management, invoicing, payments
- **Lab Tech**: Laboratory test management
- **Radiologist**: Medical imaging and diagnostics
- **Psychiatrist**: Mental health services
- **Obstetrician**: Maternity care
- **Admin**: System oversight, user management
- **Patient**: View own records and appointments

## Color System

Our luxurious color palette:
- **Royal Blue** - Trust & professional excellence
- **Emerald Green** - Health, growth & wellness
- **Soft Purple** - Care & compassion
- **Gold/Amber** - Premium & attention
- **Coral/Rose** - Maternity & warmth
- **Teal** - Mental health & calm
- **Crimson** - Emergency & critical care

## Custom Animations

Available animation classes:
- `.btn-press` - Scale down on click
- `.hover-lift` - Lift effect on hover
- `.hover-scale` - Scale up on hover
- `.hover-glow` - Glow effect on hover
- `.shimmer` - Premium shimmer animation
- `.btn-spring` - Spring-like transitions

## Deployment

### Quick Deploy to Netlify ⚡

Deploy HospitalGuard to Netlify in 5 minutes:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

**Quick Start:**
1. Click the deploy button above
2. Connect your GitHub repository
3. Add environment variables (Supabase URL & Key)
4. Deploy!

📖 **Detailed Guides:**
- **[Quick Deploy Guide](./QUICK_DEPLOY.md)** - 5-minute deployment
- **[Full Deployment Guide](./DEPLOYMENT.md)** - Complete setup with CI/CD
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist

### CI/CD Pipeline

Automatic deployments configured via GitHub Actions:
- ✅ Push to `main` → Production deployment
- ✅ Push to `dev` → Preview deployment
- ✅ Pull Requests → Preview with comments
- ✅ Manual triggers available

### Environment Variables

Required for deployment:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Set these in:
- **Netlify**: Site Settings → Environment Variables
- **GitHub**: Repository → Settings → Secrets

### Custom Domain

To connect a custom domain to Netlify:
1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. HTTPS enabled automatically ✅

## Roadmap

### Phase 1: Core Patient Flow (Current)
- [x] Landing page with animations
- [x] Multi-department dashboard
- [x] Database schema design
- [x] Luxurious UI theme
- [ ] Patient registration flow
- [ ] Visit tracking system

### Phase 2: Medical Features
- [ ] Digital prescription creation
- [ ] QR code generation & scanning
- [ ] Pharmacy dispensing workflow
- [ ] Laboratory order management
- [ ] Radiology imaging workflow

### Phase 3: Telemedicine & Advanced
- [ ] Video consultation integration
- [ ] Aftercare plan management
- [ ] Medical records system
- [ ] Comprehensive reporting
- [ ] Real-time notifications
- [ ] Mobile app (PWA)

## Contributing

This is a private project, but contributions are welcome:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Documentation

- **[supabase-schema.sql](supabase-schema.sql)** - Complete database schema

## License

This project is private and proprietary.

## Support

For questions or issues:
- Open an issue in this repository
- Contact the development team

---

**Built with care for exceptional healthcare experiences** 🏥✨
