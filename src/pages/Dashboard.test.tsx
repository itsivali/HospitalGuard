import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import Dashboard from './Dashboard';
import * as supabaseModule from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { pathname: '/dashboard' },
      writable: true,
    });
  });

  describe('Authentication Check', () => {
    it('should redirect to /auth if user is not authenticated', async () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth');
      });
    });

    it('should load user data when authenticated', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [],
            error: null,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('HospitalGuard')).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Routing', () => {
    it('should redirect patient to /patient-dashboard', async () => {
      const mockUser = { id: '123', email: 'patient@test.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [{ role: 'patient' }],
            error: null,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/patient-dashboard', { replace: true });
      });
    });

    it('should redirect nurse to /nurse-dashboard', async () => {
      const mockUser = { id: '456', email: 'nurse@test.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [{ role: 'nurse' }],
            error: null,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/nurse-dashboard', { replace: true });
      });
    });

    it('should redirect doctor to /doctor-dashboard', async () => {
      const mockUser = { id: '789', email: 'doctor@test.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [{ role: 'doctor' }],
            error: null,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/doctor-dashboard', { replace: true });
      });
    });

    it('should redirect pharmacist to /pharmacist-dashboard', async () => {
      const mockUser = { id: '101', email: 'pharmacist@test.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [{ role: 'pharmacist' }],
            error: null,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/pharmacist-dashboard', { replace: true });
      });
    });

    it('should redirect billing to /billing-dashboard', async () => {
      const mockUser = { id: '202', email: 'billing@test.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [{ role: 'billing' }],
            error: null,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/billing-dashboard', { replace: true });
      });
    });

    it('should stay on general dashboard for admin role', async () => {
      const mockUser = { id: '303', email: 'admin@test.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [{ role: 'admin' }],
            error: null,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.getByText('HospitalGuard')).toBeInTheDocument();
      });
    });

    it('should not redirect if already on role-specific dashboard', async () => {
      const mockUser = { id: '404', email: 'patient@test.com' };

      Object.defineProperty(window, 'location', {
        value: { pathname: '/patient-dashboard' },
        writable: true,
      });

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [{ role: 'patient' }],
            error: null,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        // Should not navigate since we're already on the correct dashboard
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when role fetch fails', async () => {
      const mockUser = { id: '505', email: 'test@example.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'Database error', code: '500' } as any,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Role Fetch Error',
          description: 'Could not load user roles. Please contact support if this persists.',
          variant: 'destructive',
        });
      });
    });

    it('should handle missing user_roles table gracefully', async () => {
      const mockUser = { id: '606', email: 'test@example.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'relation "user_roles" does not exist', code: '42P01' } as any,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
        // Component should still render with empty roles
        expect(screen.queryByText('Loading HospitalGuard...')).not.toBeInTheDocument();
      });
    });

    it('should handle auth errors gracefully', async () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Authentication Error',
          description: 'Network error',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while checking auth', () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      render(<Dashboard />);

      expect(screen.getByText('Loading HospitalGuard...')).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('should logout user and redirect to home', async () => {
      const mockUser = { id: '707', email: 'test@example.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [{ role: 'admin' }],
            error: null,
          }),
        }),
      } as any);

      vi.mocked(supabaseModule.supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await logoutButton.click();

      await waitFor(() => {
        expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Department Display', () => {
    it('should display all departments in tabs', async () => {
      const mockUser = { id: '808', email: 'admin@test.com' };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({
            data: [{ role: 'admin' }],
            error: null,
          }),
        }),
      } as any);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Emergency')).toBeInTheDocument();
        expect(screen.getByText('Pharmacy')).toBeInTheDocument();
        expect(screen.getByText('Laboratory')).toBeInTheDocument();
      });
    });
  });
});
