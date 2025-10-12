# Testing Guide for HospitalGuard

## Overview

This project uses **Vitest** as the testing framework along with **React Testing Library** for component testing. All tests follow best practices for testing React applications with TypeScript.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

### Test Files Location
- Component tests are located alongside their source files with `.test.tsx` extension
- Test utilities are in `src/test/`
- Test setup configuration is in `src/test/setup.ts`

### Test Coverage

#### Authentication Tests (`Auth.test.tsx`)
- ✅ Login flow with valid credentials
- ✅ Login failure handling
- ✅ Signup flow with role selection
- ✅ User role insertion into database
- ✅ Form validation (email, password requirements)
- ✅ Role selection dropdown functionality
- ✅ Navigation between login/signup tabs
- ✅ Security features (password masking, HIPAA badge)

#### Dashboard Routing Tests (`Dashboard.test.tsx`)
- ✅ Authentication check and redirect
- ✅ Role-based routing to specific dashboards:
  - Patient → `/patient-dashboard`
  - Nurse → `/nurse-dashboard`
  - Doctor → `/doctor-dashboard`
  - Pharmacist → `/pharmacist-dashboard`
  - Billing → `/billing-dashboard`
  - Admin stays on general dashboard
- ✅ Error handling for role fetch failures
- ✅ Missing user_roles table handling
- ✅ Loading states
- ✅ Logout functionality
- ✅ Department display

#### Patient Dashboard Tests (`PatientDashboard.test.tsx`)
- ✅ Authentication redirect
- ✅ Dashboard content display (appointments, prescriptions, records)
- ✅ Quick stats cards
- ✅ Action items
- ✅ Loading states
- ✅ Logout functionality
- ✅ Error handling

#### Nurse Dashboard Tests (`NurseDashboard.test.tsx`)
- ✅ Authentication and authorization
- ✅ Patient monitoring display
- ✅ Vital signs display
- ✅ Urgent alerts
- ✅ Medication schedule
- ✅ Daily tasks and rounds
- ✅ Interactive elements (buttons, actions)
- ✅ Error scenarios
- ✅ Loading and logout

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
  });
});
```

### Mocking Supabase

```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}));
```

### Mocking Navigation

```typescript
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
```

### Mocking Toast Notifications

```typescript
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));
```

## Best Practices

1. **Clear Mocks**: Always clear mocks in `beforeEach()` to avoid test pollution
2. **Use `waitFor`**: For async operations and state updates
3. **Query by Role**: Prefer `getByRole()` over `getByText()` for better accessibility
4. **User Events**: Use `@testing-library/user-event` instead of `fireEvent`
5. **Descriptive Tests**: Write clear test descriptions that explain what's being tested
6. **Test User Behavior**: Focus on testing what users see and do, not implementation details
7. **Mock External Dependencies**: Always mock Supabase, navigation, and other external services

## Common Testing Patterns

### Testing Form Submission
```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  render(<FormComponent />);

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Testing Error States
```typescript
it('should display error message on failure', async () => {
  vi.mocked(supabase.auth.signIn).mockRejectedValueOnce(
    new Error('Invalid credentials')
  );

  render(<LoginComponent />);
  // ... trigger error

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Invalid credentials',
      variant: 'destructive',
    });
  });
});
```

### Testing Loading States
```typescript
it('should show loading spinner', () => {
  vi.mocked(fetchData).mockImplementationOnce(
    () => new Promise(() => {}) // Never resolves
  );

  render(<Component />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

## Debugging Tests

### View Test Output
```bash
npm test -- --reporter=verbose
```

### Debug Single Test
```bash
npm test -- -t "test name"
```

### Use screen.debug()
```typescript
it('should debug render output', () => {
  render(<Component />);
  screen.debug(); // Prints DOM tree to console
});
```

## CI/CD Integration

Tests should run in your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test -- --run

- name: Generate Coverage
  run: npm run test:coverage
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Troubleshooting

### Issue: "Cannot find module"
- Ensure path aliases are configured in `vitest.config.ts`
- Check that imports use `@/` prefix

### Issue: "ReferenceError: window is not defined"
- Make sure `environment: 'jsdom'` is set in `vitest.config.ts`

### Issue: "IntersectionObserver is not defined"
- Check that the mock is defined in `src/test/setup.ts`

### Issue: Tests timing out
- Increase timeout in test: `it('test', { timeout: 10000 }, async () => {...})`
- Or globally in `vitest.config.ts`: `testTimeout: 10000`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro)
