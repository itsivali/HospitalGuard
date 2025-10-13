import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import PatientDashboard from './PatientDashboard';
import * as supabaseModule from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
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

describe('PatientDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to /auth if not authenticated', async () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      render(<PatientDashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth');
      });
    });

    it('should display patient portal when authenticated', async () => {
      const mockUser = {
        id: '123',
        email: 'patient@test.com',
        user_metadata: { full_name: 'John Patient' },
      };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      render(<PatientDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Patient Portal')).toBeInTheDocument();
        expect(screen.getByText(/welcome back, john patient/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication errors', async () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockRejectedValueOnce(
        new Error('Network error')
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<PatientDashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Auth error:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Dashboard Content', () => {
    beforeEach(async () => {
      const mockUser = {
        id: '123',
        email: 'patient@test.com',
        user_metadata: { full_name: 'John Patient' },
      };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });
    });

    it('should display quick stats cards', async () => {
      render(<PatientDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Appointments')).toBeInTheDocument();
        expect(screen.getByText('Prescriptions')).toBeInTheDocument();
        expect(screen.getByText('Since Last Visit')).toBeInTheDocument();
        expect(screen.getByText('Medical Records')).toBeInTheDocument();
      });
    });

    it('should display upcoming appointments section', async () => {
      render(<PatientDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
        expect(screen.getByText(/dr\. sarah johnson/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. michael chen/i)).toBeInTheDocument();
      });
    });

    it('should display active prescriptions', async () => {
      render(<PatientDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Active Prescriptions')).toBeInTheDocument();
        expect(screen.getByText(/lisinopril/i)).toBeInTheDocument();
        expect(screen.getByText(/metformin/i)).toBeInTheDocument();
        expect(screen.getByText(/atorvastatin/i)).toBeInTheDocument();
      });
    });

    it('should display action items', async () => {
      render(<PatientDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Action Items')).toBeInTheDocument();
        expect(screen.getByText(/prescription refill due/i)).toBeInTheDocument();
        expect(screen.getByText(/lab results ready/i)).toBeInTheDocument();
        expect(screen.getByText(/telemedicine available/i)).toBeInTheDocument();
      });
    });

    it('should display recent medical history', async () => {
      render(<PatientDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Recent Medical History')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while checking auth', () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      render(<PatientDashboard />);

      // Check for the loading container instead
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    it('should logout and redirect to home', async () => {
      const mockUser = {
        id: '123',
        email: 'patient@test.com',
        user_metadata: { full_name: 'John Patient' },
      };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      render(<PatientDashboard />);

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
});
