import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import NurseDashboard from './NurseDashboard';
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

describe('NurseDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to /auth if not authenticated', async () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      render(<NurseDashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth');
      });
    });

    it('should display nurse station when authenticated', async () => {
      const mockUser = {
        id: '456',
        email: 'nurse@test.com',
        user_metadata: { full_name: 'Emily Nurse' },
      };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      render(<NurseDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Nurse Station')).toBeInTheDocument();
        expect(screen.getByText(/emily nurse/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication errors gracefully', async () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockRejectedValueOnce(
        new Error('Authentication failed')
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<NurseDashboard />);

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
        id: '456',
        email: 'nurse@test.com',
        user_metadata: { full_name: 'Emily Nurse' },
      };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });
    });

    it('should display quick stats for nurse', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Patients on Ward')).toBeInTheDocument();
        expect(screen.getByText('Medications Due')).toBeInTheDocument();
        expect(screen.getByText('Critical Alerts')).toBeInTheDocument();
        expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
      });
    });

    it('should display active patient monitoring section', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Active Patient Monitoring')).toBeInTheDocument();
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/sarah johnson/i)).toBeInTheDocument();
        expect(screen.getByText(/michael chen/i)).toBeInTheDocument();
      });
    });

    it('should display patient vital signs', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        // Check for vital signs labels
        expect(screen.getAllByText(/temp/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/bp/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/hr/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/spo2/i).length).toBeGreaterThan(0);
      });
    });

    it('should display urgent alerts', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Urgent Alerts')).toBeInTheDocument();
        expect(screen.getByText(/high temperature alert/i)).toBeInTheDocument();
        expect(screen.getByText(/medication overdue/i)).toBeInTheDocument();
        expect(screen.getByText(/discharge ready/i)).toBeInTheDocument();
      });
    });

    it('should display medication administration schedule', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Medication Administration Schedule')).toBeInTheDocument();
      });
    });

    it('should display daily tasks and rounds', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Daily Tasks & Rounds')).toBeInTheDocument();
        expect(screen.getByText(/morning vital signs round/i)).toBeInTheDocument();
        expect(screen.getByText(/wound dressing changes/i)).toBeInTheDocument();
      });
    });

    it('should show patient status badges', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        expect(screen.getByText('stable')).toBeInTheDocument();
        expect(screen.getByText('monitoring')).toBeInTheDocument();
        expect(screen.getByText('critical')).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Elements', () => {
    beforeEach(async () => {
      const mockUser = {
        id: '456',
        email: 'nurse@test.com',
        user_metadata: { full_name: 'Emily Nurse' },
      };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });
    });

    it('should have record vitals button', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /record vitals/i })).toBeInTheDocument();
      });
    });

    it('should have medication administration buttons', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        const administerButtons = screen.getAllByText(/administered/i);
        expect(administerButtons.length).toBeGreaterThan(0);
      });
    });

    it('should have respond buttons for alerts', async () => {
      render(<NurseDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /respond/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /administer/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /process/i })).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while checking auth', () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      render(<NurseDashboard />);

      // Check for loading container or text
      const loadingElements = screen.queryAllByText(/loading/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Logout', () => {
    it('should logout and redirect to home', async () => {
      const mockUser = {
        id: '456',
        email: 'nurse@test.com',
        user_metadata: { full_name: 'Emily Nurse' },
      };

      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabaseModule.supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      render(<NurseDashboard />);

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

  describe('Error Scenarios', () => {
    it('should handle network errors during authentication', async () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<NurseDashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth');
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle null user response', async () => {
      vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      render(<NurseDashboard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth');
      });
    });
  });
});
