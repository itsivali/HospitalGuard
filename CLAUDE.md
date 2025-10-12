# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HospitalGuard** is a comprehensive, luxury hospital management system built with React, TypeScript, Vite, and Supabase. The application provides complete patient journey tracking from admission to discharge and beyond, with telemedicine aftercare, across all hospital departments.

### Core Features
- **Complete Patient Journey**: Track patients from walk-in through registration, triage, consultation, treatment, lab/radiology, prescriptions, billing, discharge, and telemedicine follow-up
- **Multi-Department Management**: Emergency, ICU, Maternity, Mental Health, Pediatrics, Surgery, Laboratory, Radiology, Pharmacy, Billing, Outpatient, and more
- **Digital Prescriptions**: QR code authenticated prescriptions with digital signatures, tracked from doctor to pharmacy
- **Telemedicine Aftercare**: Doctors maintain patient care through remote consultations post-discharge
- **Integrated Billing**: Complete financial tracking from registration to final payment
- **Luxurious UI/UX**: Premium, hotel-like experience with smooth animations, rich colors, and beautiful micro-interactions

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Components**: shadcn/ui (Radix UI primitives) + Tailwind CSS
- **Animations**: Framer Motion for smooth, luxurious animations
- **Icons**: Lucide React icons
- **Backend**: Supabase (authentication, database, storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **QR Codes**: qrcode & qr-scanner libraries
- **Styling**: Tailwind CSS with extensive custom theming

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build in development mode
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
│   └── ui/              # shadcn/ui components (auto-generated, modify with caution)
├── hooks/               # Custom React hooks (use-toast, use-mobile)
├── integrations/
│   └── supabase/        # Supabase client and type definitions
│       ├── client.ts    # Configured Supabase client instance
│       └── types.ts     # Auto-generated database types
├── lib/
│   └── utils.ts         # Utility functions (cn for classNames)
├── pages/               # Route components
│   ├── Index.tsx        # Landing page (/) - HospitalGuard marketing
│   ├── Auth.tsx         # Authentication page (/auth)
│   ├── Dashboard.tsx    # Main dashboard (/dashboard) - Multi-department interface
│   └── NotFound.tsx     # 404 page
├── App.tsx              # Root component with routing setup
├── main.tsx             # Application entry point
└── index.css            # Global styles, custom animations, and Tailwind imports
```

## Architecture Patterns

### Routing

Routes are defined in [App.tsx](src/App.tsx) using React Router. The route structure is:
- `/` - Landing page (public) - HospitalGuard marketing site
- `/auth` - Login/signup page (public)
- `/dashboard` - Main dashboard (protected, role-based department access)
- `/*` - 404 Not Found (catch-all)

**Important**: When adding new routes, place them ABOVE the catch-all `*` route.

### Authentication & Authorization

Authentication is handled via Supabase Auth with email/password. The app uses:
- `supabase.auth.signInWithPassword()` for login
- `supabase.auth.signUp()` for registration
- `supabase.auth.signOut()` for logout
- `supabase.auth.getUser()` for checking auth status

User roles are stored in a `user_roles` table. Supported roles:
- `doctor` - Full access to patient care, prescriptions, consultations
- `nurse` - Patient monitoring, vitals, medication administration
- `pharmacist` - Prescription validation, medication dispensing, inventory
- `receptionist` - Patient registration, appointment scheduling
- `billing` - Financial management, invoicing, payments
- `admin` - System oversight, user management, compliance
- `lab_tech` - Laboratory test management
- `radiologist` - Medical imaging and diagnostics
- `psychiatrist` - Mental health services
- `obstetrician` - Maternity care
- `patient` - View own medical records and appointments

The Dashboard component (src/pages/Dashboard.tsx:83-90) fetches roles and renders department-specific content based on user permissions.

### Supabase Integration

The Supabase client is configured in [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts) and uses environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

These must be set in a `.env` file at the project root.

**Database Schema**: A comprehensive schema is defined in [supabase-schema.sql](supabase-schema.sql) including:
- Patients, hospital staff, departments
- Patient visits with complete journey tracking
- Medical records, diagnoses
- Prescriptions with QR code authentication
- Pharmacy inventory and dispensing logs
- Laboratory and radiology orders
- Maternity and mental health records
- Billing, payments, and insurance
- Telemedicine sessions and aftercare plans
- Appointments across all departments
- Complete audit logging

To set up the database, run the SQL file in your Supabase SQL editor.

### State Management

- **TanStack Query** (React Query): Used for server state management and caching. The QueryClient is configured in [App.tsx:11](src/App.tsx#L11).
- **React useState**: Used for local component state (forms, loading states, department selection)
- **Framer Motion**: Used for animations and transitions

### UI Components & Theming

This project uses shadcn/ui components located in `src/components/ui/`. These are:
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Fully customizable but auto-generated from shadcn CLI

**Luxurious Color System** ([src/index.css:10-83](src/index.css#L10-L83)):
- **Royal Blue** (`--primary`): Trust, professional excellence
- **Emerald Green** (`--secondary`): Health, growth, wellness
- **Soft Purple** (`--tertiary`): Care, compassion
- **Gold/Amber** (`--accent`): Premium, attention
- **Coral/Rose** (`--coral`): Maternity, warmth
- **Teal** (`--teal`): Mental health, calm
- **Crimson** (`--destructive`): Emergency, critical

**Gradient Classes**:
- `.gradient-royal` - Royal blue gradient
- `.gradient-emerald` - Emerald green gradient
- `.gradient-coral` - Coral/rose gradient
- `.gradient-purple` - Soft purple gradient
- `.gradient-gold` - Gold/amber gradient
- `.gradient-teal` - Teal gradient

**Animation Classes** ([src/index.css:192-295](src/index.css#L192-L295)):
- `.btn-press` - Scale down on click
- `.btn-spring` - Spring-like transitions
- `.btn-pulse` - Pulsing animation
- `.hover-lift` - Lift on hover
- `.hover-scale` - Scale on hover
- `.hover-glow` - Glow effect on hover
- `.shimmer` - Shimmer animation for premium feel

**Shadow Classes**:
- `.soft-shadow` - Subtle shadow
- `.card-shadow` - Standard card shadow
- `.elevated-shadow` - Elevated card shadow
- `.luxury-shadow` - Premium luxury shadow

### Dashboard Structure

The main Dashboard ([src/pages/Dashboard.tsx](src/pages/Dashboard.tsx)) features:

1. **Department Tabs** (Dashboard.tsx:438-450): Horizontal scrolling tabs for all hospital departments
2. **Hero Stats Section** (Dashboard.tsx:393-435): Dynamic stats display per department with animated gradient backgrounds
3. **Department Content** (Dashboard.tsx:453-578): Three-column grid layout with:
   - Quick Actions card
   - Active Now card (current patients/tasks)
   - Alerts/Notifications card
4. **Department List** (Dashboard.tsx:113-296):
   - Overview, Registration, Emergency, ICU
   - Outpatient, Maternity, Mental Health, Pediatrics
   - Surgery, Laboratory, Radiology, Pharmacy
   - Billing, Telemedicine

Each department has unique color coding, icons, and statistics.

### Styling Approach

- Uses Tailwind CSS with custom configuration in [tailwind.config.ts](tailwind.config.ts)
- Path alias `@/` maps to `./src/` (configured in both [vite.config.ts](vite.config.ts#L14-L16) and [tsconfig.json](tsconfig.json#L5-L8))
- Uses `cn()` utility from [src/lib/utils.ts](src/lib/utils.ts) to merge Tailwind classes
- Custom scrollbar styling for premium feel (index.css:277-295)
- Smooth scroll behavior enabled globally (index.css:272-274)

### Digital Prescriptions with QR Codes

The system includes digital prescription management:
- Doctors create prescriptions digitally
- Prescriptions are digitally signed (stored in `digital_signature` field)
- QR codes are generated for each prescription (`qr_code_data` field)
- Pharmacists scan QR codes to authenticate and dispense
- Hospital pharmacy tracks all medication from prescription to patient
- Complete audit trail maintained

**Libraries**: `qrcode` for generation, `qr-scanner` for scanning

### Telemedicine & Aftercare

Post-discharge patient care:
- Doctors create aftercare plans during discharge
- Telemedicine sessions scheduled for follow-up
- Video consultations maintained by original treating doctor
- Session notes and prescriptions tracked
- Enables continuity of care beyond hospital walls

## TypeScript Configuration

The project has relaxed TypeScript settings for rapid development:
- `noImplicitAny: false` - Implicit any types allowed
- `noUnusedParameters: false` - Unused params won't error
- `noUnusedLocals: false` - Unused variables won't error
- `strictNullChecks: false` - Null checks are not strict

When writing new code, prefer explicit typing even though these are relaxed.

## Important Implementation Notes

1. **Adding New Routes**: Always add custom routes in [App.tsx](src/App.tsx) ABOVE the `*` catch-all route.

2. **Protected Routes**: The Dashboard checks auth on mount. When adding new protected routes, follow the same pattern: check `supabase.auth.getUser()` and redirect to `/auth` if not authenticated.

3. **Department-Specific Features**: The Dashboard uses a department array to render different content. Follow this pattern when adding department-specific features.

4. **Animations**: Use Framer Motion's `motion` components with `initial`, `animate`, and `transition` props for smooth animations. Always provide accessible experiences.

5. **Toast Notifications**: Use the `useToast()` hook from `@/hooks/use-toast` for user feedback.

6. **Form Validation**: The project includes React Hook Form and Zod. When adding forms, prefer using these libraries.

7. **Database Queries**: As you develop the database schema, types will be auto-generated in [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts). Always use type-safe queries.

8. **Button Animations**: Always add `btn-press` class to buttons for click animations. Use `hover-lift` for hover effects.

9. **Color Consistency**: Use the semantic color tokens (`primary`, `secondary`, `tertiary`, etc.) rather than hard-coded colors.

10. **Icons**: Use Lucide React icons for consistency. They provide a clean, modern aesthetic that matches our luxury theme.

## Development Workflow

When adding new features:

1. **Plan Department Integration**: Consider which departments need this feature
2. **Update Database Schema**: Modify `supabase-schema.sql` if database changes needed
3. **Create UI Components**: Build reusable components in `src/components/`
4. **Add Animations**: Use Framer Motion for smooth transitions
5. **Test Across Roles**: Verify feature works for relevant user roles
6. **Update Documentation**: Keep this file updated with architectural decisions

## Performance Considerations

- Use React Query for data fetching to enable caching
- Lazy load heavy components when possible
- Optimize images and assets
- Use the `motion` component's `viewport={{ once: true }}` for scroll animations that should only trigger once
- Minimize bundle size by importing only needed components

## Accessibility

- Maintain semantic HTML structure
- Ensure keyboard navigation works
- Provide ARIA labels where needed
- Test with screen readers
- Maintain color contrast ratios (WCAG AA minimum)

## Future Roadmap

Core features to implement:
- [ ] Patient registration and check-in flow
- [ ] Complete visit tracking through all departments
- [ ] Digital prescription creation with QR code generation
- [ ] Pharmacy QR scanning and dispensing workflow
- [ ] Laboratory order management and results
- [ ] Radiology imaging workflow
- [ ] Billing and payment processing
- [ ] Telemedicine video consultation integration
- [ ] Medical records management
- [ ] Appointment scheduling system
- [ ] Real-time notifications and alerts
- [ ] Comprehensive reporting and analytics
- [ ] Mobile responsive optimization
- [ ] Progressive Web App (PWA) capabilities

---

**Note**: This is a comprehensive hospital management system designed to feel luxurious and seamless, like a 5-star hotel experience applied to healthcare.
