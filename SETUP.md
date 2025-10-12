# HospitalGuard Setup Instructions

## 🚀 Quick Start

Follow these steps to set up and run the HospitalGuard application with your new Supabase instance.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- A Supabase account and project

## Step 1: Environment Configuration

Your `.env` file has already been updated with the new Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="hdpavdwanzydfcudogar"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://hdpavdwanzydfcudogar.supabase.co"
```

✅ **Status**: Complete

## Step 2: Database Schema Setup

You need to run the SQL schema on your Supabase instance to create all necessary tables.

### Instructions:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/hdpavdwanzydfcudogar

2. Navigate to **SQL Editor** in the left sidebar

3. Create a new query and copy the contents of `supabase-schema.sql`

4. Click **Run** to execute the schema

5. Verify tables were created:
   - Go to **Table Editor**
   - You should see tables like: `user_roles`, `patients`, `hospital_staff`, `prescriptions`, etc.

⚠️ **Important**: This step is **required** before proceeding. The app will not work without these tables.

## Step 3: Install Dependencies

If you haven't already, install the project dependencies:

```bash
npm install
```

✅ **Status**: Complete (dependencies already installed)

## Step 4: Create Test Accounts

After setting up the database schema, create test accounts for each role:

```bash
npm run setup-test-accounts
```

This will create accounts for:
- **Patient**: patient@test.com / test123
- **Doctor**: doctor@test.com / test123
- **Nurse**: nurse@test.com / test123
- **Pharmacist**: pharmacist@test.com / test123
- **Billing**: billing@test.com / test123
- **Admin**: admin@test.com / test123
- And more...

⚠️ **Note**: This script will check if the database is properly set up first.

## Step 5: Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at: **http://localhost:8080**

## Step 6: Test the Application

### Login Test

1. Navigate to: http://localhost:8080/auth

2. Try logging in with test credentials:
   - **Email**: patient@test.com
   - **Password**: test123

3. You should be automatically redirected to `/patient-dashboard`

4. Verify that the patient dashboard loads correctly

### Test Other Roles

Test each role by logging in with their respective credentials:

| Role | Email | Dashboard Route |
|------|-------|----------------|
| Patient | patient@test.com | /patient-dashboard |
| Nurse | nurse@test.com | /nurse-dashboard |
| Doctor | doctor@test.com | /doctor-dashboard |
| Pharmacist | pharmacist@test.com | /pharmacist-dashboard |
| Billing | billing@test.com | /billing-dashboard |
| Admin | admin@test.com | /dashboard (general) |

## Step 7: Run Tests

Verify that all tests pass:

```bash
npm test
```

Or run tests with UI:

```bash
npm run test:ui
```

See `TESTING.md` for more details on testing.

## Troubleshooting

### Issue: "user_roles table does not exist"

**Solution**: You need to run the database schema first (Step 2).

### Issue: "Could not load user roles"

**Possible Causes**:
1. Database schema not set up
2. User doesn't have a role in `user_roles` table
3. Supabase credentials are incorrect

**Solution**:
1. Verify Step 2 is complete
2. Run the test accounts setup script (Step 4)
3. Double-check `.env` file credentials

### Issue: "Cannot login with test accounts"

**Solution**:
1. Make sure you ran `npm run setup-test-accounts`
2. Check Supabase Authentication settings:
   - Go to **Authentication** → **Providers**
   - Ensure **Email** provider is enabled
   - Disable email confirmations for testing (go to **Authentication** → **Email Templates** → uncheck "Confirm email")

### Issue: Tests are failing

**Solution**:
1. Make sure all dependencies are installed: `npm install`
2. Clear cache: `rm -rf node_modules/.vite`
3. Re-run tests: `npm test`

## Database Password

Your Supabase database password: `VwH7m9DydEObcvFP`

Direct PostgreSQL connection:
```
postgresql://postgres:VwH7m9DydEObcvFP@db.hdpavdwanzydfcudogar.supabase.co:5432/postgres
```

## Development Workflow

### Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run linter
npm run lint
```

## Features Fixed

### ✅ Authentication & Dashboard Routing

**Problem**: Users were being redirected to a common dashboard and getting error notifications when logging in with role-specific accounts (patient@test.com, nurse@test.com, etc.).

**Solution**:
1. **Improved Error Handling** (Dashboard.tsx:88-98):
   - Added proper error handling for role fetching
   - Shows user-friendly error messages
   - Prevents infinite redirect loops

2. **Fixed Routing Logic** (Dashboard.tsx:104-125):
   - Only redirects when on `/dashboard` route
   - Uses `replace: true` to prevent back button issues
   - Properly handles missing roles

3. **Database Setup Script** (setup-test-accounts.js:162-187):
   - Validates database setup before creating accounts
   - Provides clear error messages if schema is missing
   - Automatically retries role insertion if needed

### ✅ Comprehensive Testing

Added complete test coverage:
- **Auth.test.tsx**: Login, signup, validation, role selection
- **Dashboard.test.tsx**: Role-based routing, error handling, loading states
- **PatientDashboard.test.tsx**: Patient-specific functionality
- **NurseDashboard.test.tsx**: Nurse-specific functionality

## Next Steps

1. ✅ Complete database schema setup (Step 2)
2. ✅ Create test accounts (Step 4)
3. ✅ Test login with different roles
4. Start developing features!

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error messages in the browser console
3. Check the database tables in Supabase
4. Verify your `.env` configuration

## Project Structure

```
prescription-manager/
├── src/
│   ├── components/ui/      # Reusable UI components
│   ├── integrations/       # Supabase client & types
│   ├── pages/              # Route components & tests
│   │   ├── Auth.tsx
│   │   ├── Auth.test.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Dashboard.test.tsx
│   │   ├── PatientDashboard.tsx
│   │   ├── NurseDashboard.tsx
│   │   └── ...
│   ├── test/               # Test utilities & setup
│   └── lib/                # Utility functions
├── .env                    # Environment variables (configured)
├── supabase-schema.sql     # Database schema
├── setup-test-accounts.js  # Account creation script
├── vitest.config.ts        # Test configuration
├── SETUP.md               # This file
├── TESTING.md             # Testing guide
└── package.json           # Dependencies & scripts
```

---

**Happy coding! 🏥**
