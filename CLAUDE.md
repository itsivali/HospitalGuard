# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PrescriptionGuard is a secure prescription management system built with React, TypeScript, Vite, and Supabase. The application provides role-based access control for healthcare stakeholders (doctors, pharmacists, patients, and administrators) to manage prescriptions, prevent misuse, and ensure compliance.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Components**: shadcn/ui (Radix UI primitives) + Tailwind CSS
- **Backend**: Supabase (authentication, database, storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom theming

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
│   ├── Index.tsx        # Landing page (/)
│   ├── Auth.tsx         # Authentication page (/auth)
│   ├── Dashboard.tsx    # Main dashboard (/dashboard)
│   └── NotFound.tsx     # 404 page
├── App.tsx              # Root component with routing setup
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind imports
```

## Architecture Patterns

### Routing

Routes are defined in [App.tsx](src/App.tsx) using React Router. The route structure is:
- `/` - Landing page (public)
- `/auth` - Login/signup page (public)
- `/dashboard` - Main dashboard (protected, role-based content)
- `/*` - 404 Not Found (catch-all)

**Important**: When adding new routes, place them ABOVE the catch-all `*` route.

### Authentication & Authorization

Authentication is handled via Supabase Auth with email/password. The app uses:
- `supabase.auth.signInWithPassword()` for login
- `supabase.auth.signUp()` for registration
- `supabase.auth.signOut()` for logout
- `supabase.auth.getUser()` for checking auth status

User roles are stored in a `user_roles` table and queried on the Dashboard to determine what content to display. Supported roles:
- `doctor` - Create and manage prescriptions
- `pharmacist` - Validate and dispense prescriptions
- `patient` - View prescription history
- `admin` - System oversight and compliance

The Dashboard component fetches roles and renders different UI based on the user's role (see [Dashboard.tsx:69-111](src/pages/Dashboard.tsx#L69-L111)).

### Supabase Integration

The Supabase client is configured in [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts) and uses environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

These must be set in a `.env` file at the project root.

Database types are auto-generated in [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts). The current schema is minimal (empty Tables/Views/Functions), suggesting the database schema is still being developed.

### State Management

- **TanStack Query** (React Query): Used for server state management and caching. The QueryClient is configured in [App.tsx:11](src/App.tsx#L11) and wrapped around the app.
- **React useState**: Used for local component state (forms, loading states, etc.)

### UI Components

This project uses shadcn/ui components located in `src/components/ui/`. These are:
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Fully customizable but auto-generated from shadcn CLI

**When modifying UI components**: Be aware these files may be regenerated. For custom modifications, consider creating wrapper components instead.

### Styling

- Uses Tailwind CSS with custom configuration in [tailwind.config.ts](tailwind.config.ts)
- Path alias `@/` maps to `./src/` (configured in both [vite.config.ts](vite.config.ts#L14-L16) and [tsconfig.json](tsconfig.json#L5-L8))
- Uses `cn()` utility from [src/lib/utils.ts](src/lib/utils.ts) to merge Tailwind classes with class-variance-authority

### Theming

The app includes theme support via `next-themes` for dark/light mode (imported in dependencies).

## TypeScript Configuration

The project has relaxed TypeScript settings for rapid development:
- `noImplicitAny: false` - Implicit any types allowed
- `noUnusedParameters: false` - Unused params won't error
- `noUnusedLocals: false` - Unused variables won't error
- `strictNullChecks: false` - Null checks are not strict

When writing new code, prefer explicit typing even though these are relaxed.

## Linting

ESLint is configured with:
- TypeScript ESLint recommended rules
- React Hooks rules (enforced)
- React Refresh plugin for fast refresh support
- `@typescript-eslint/no-unused-vars` is disabled

## Environment Variables

Required in `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Important Implementation Notes

1. **Adding New Routes**: Always add custom routes in [App.tsx](src/App.tsx) ABOVE the `*` catch-all route (see comment on line 23).

2. **Protected Routes**: The Dashboard currently checks auth on mount. When adding new protected routes, follow the same pattern: check `supabase.auth.getUser()` and redirect to `/auth` if not authenticated.

3. **Role-Based Features**: The Dashboard uses a `getDashboardContent()` function to render different content based on user roles. Follow this pattern when adding role-specific features.

4. **Toast Notifications**: Use the `useToast()` hook from `@/hooks/use-toast` for user feedback. Examples: login success, errors, etc.

5. **Form Validation**: The project includes React Hook Form and Zod but they're not yet fully utilized. When adding forms, prefer using these libraries.

6. **Database Queries**: The current Supabase types file is minimal. As you develop the database schema, types will be auto-generated. Always use type-safe queries with the Database generic.

7. **Lovable Integration**: This project was created with Lovable (see README). It includes the `lovable-tagger` plugin in development mode for component tagging.
