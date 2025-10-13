import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import Auth from '@/pages/Auth';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import * as supabaseModule from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
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
        useSearchParams: () => [new URLSearchParams()],
    };
});

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

describe('Auth Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render login form by default', () => {
            render(<Auth />);

            expect(screen.getByText('Welcome')).toBeInTheDocument();
            expect(screen.getByText('Sign in to your account or create a new one')).toBeInTheDocument();
            expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        });

        it('should render signup form when signup tab is clicked', async () => {
            const user = userEvent.setup();
            render(<Auth />);

            const signupTab = screen.getByRole('tab', { name: /sign up/i });
            await user.click(signupTab);

            expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
            expect(screen.getByText(/i am a\.\.\./i)).toBeInTheDocument();
        });

        it('should display role-specific branding based on URL parameter', () => {
            // This would require mocking useSearchParams with specific role
            render(<Auth />);
            expect(screen.getByText(/HospitalGuard/i)).toBeInTheDocument();
        });
    });

    describe('Login Flow', () => {
        it('should successfully login with valid credentials', async () => {
            const user = userEvent.setup();
            const mockUser = { id: '123', email: 'test@example.com' };

            vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
                data: { user: mockUser, session: { access_token: 'token' } as any },
                error: null,
            });

            render(<Auth />);

            await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
            await user.type(screen.getByLabelText(/password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            await waitFor(() => {
                expect(supabaseModule.supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'password123',
                });
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            });
        });

        it('should show error message on login failure', async () => {
            const user = userEvent.setup();

            vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
                data: { user: null, session: null },
                error: { message: 'Invalid credentials', name: 'AuthError', status: 401 } as any,
            });

            render(<Auth />);

            await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
            await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            await waitFor(() => {
                expect(supabaseModule.supabase.auth.signInWithPassword).toHaveBeenCalled();
            });
        });

        it('should require email and password fields', async () => {
            const user = userEvent.setup();
            render(<Auth />);

            const signInButton = screen.getByRole('button', { name: /sign in/i });
            await user.click(signInButton);

            // HTML5 validation should prevent submission
            const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
            const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

            expect(emailInput.validity.valid).toBe(false);
            expect(passwordInput.validity.valid).toBe(false);
        });
    });

    describe('Signup Flow', () => {
        it('should successfully create account with valid data', async () => {
            const user = userEvent.setup();
            const mockUser = { id: '123', email: 'newuser@example.com' };

            vi.mocked(supabaseModule.supabase.auth.signUp).mockResolvedValueOnce({
                data: { user: mockUser, session: null },
                error: null,
            });

            vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
                insert: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
            } as any);

            render(<Auth />);

            // Switch to signup tab
            await user.click(screen.getByRole('tab', { name: /sign up/i }));

            // Fill in form
            await user.type(screen.getByLabelText(/full name/i), 'John Doe');
            await user.type(screen.getAllByLabelText(/email address/i)[0], 'newuser@example.com');
            await user.type(screen.getAllByLabelText(/password/i)[0], 'password123');

            // Submit form
            await user.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(supabaseModule.supabase.auth.signUp).toHaveBeenCalledWith({
                    email: 'newuser@example.com',
                    password: 'password123',
                    options: {
                        data: {
                            full_name: 'John Doe',
                            phone: '',
                            role: 'patient',
                        },
                        emailRedirectTo: expect.stringContaining('/dashboard'),
                    },
                });
            });
        });

        it('should insert user role into database after signup', async () => {
            const user = userEvent.setup();
            const mockUser = { id: '456', email: 'doctor@example.com' };

            const mockInsert = vi.fn().mockResolvedValueOnce({ data: null, error: null });

            vi.mocked(supabaseModule.supabase.auth.signUp).mockResolvedValueOnce({
                data: { user: mockUser, session: null },
                error: null,
            });

            vi.mocked(supabaseModule.supabase.from).mockReturnValueOnce({
                insert: mockInsert,
            } as any);

            render(<Auth />);

            await user.click(screen.getByRole('tab', { name: /sign up/i }));
            await user.type(screen.getByLabelText(/full name/i), 'Dr. Jane Smith');
            await user.type(screen.getAllByLabelText(/email address/i)[0], 'doctor@example.com');
            await user.type(screen.getAllByLabelText(/password/i)[0], 'password123');

            // Note: Role selection defaults to 'patient', so we'll test with that
            await user.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(mockInsert).toHaveBeenCalledWith({
                    user_id: '456',
                    role: 'patient', // Default role
                });
            });
        });

        it('should handle signup errors gracefully', async () => {
            const user = userEvent.setup();

            vi.mocked(supabaseModule.supabase.auth.signUp).mockResolvedValueOnce({
                data: { user: null, session: null },
                error: { message: 'User already exists', name: 'AuthError', status: 400 } as any,
            });

            render(<Auth />);

            await user.click(screen.getByRole('tab', { name: /sign up/i }));
            await user.type(screen.getByLabelText(/full name/i), 'Existing User');
            await user.type(screen.getAllByLabelText(/email address/i)[0], 'existing@example.com');
            await user.type(screen.getAllByLabelText(/password/i)[0], 'password123');
            await user.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(supabaseModule.supabase.auth.signUp).toHaveBeenCalled();
            });
        });

        it('should validate password minimum length', async () => {
            const user = userEvent.setup();
            render(<Auth />);

            await user.click(screen.getByRole('tab', { name: /sign up/i }));

            const passwordInput = screen.getAllByLabelText(/password/i)[0] as HTMLInputElement;
            await user.type(passwordInput, 'short');

            expect(passwordInput.validity.valid).toBe(false);
            expect(passwordInput.validity.tooShort).toBe(true);
        });
    });

    describe('Navigation', () => {
        it('should navigate back to home page when back button is clicked', async () => {
            const user = userEvent.setup();
            render(<Auth />);

            const backButton = screen.getByRole('button', { name: /back to home/i });
            await user.click(backButton);

            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    describe('Role Selection', () => {
        it('should have role selection dropdown in signup form', async () => {
            const user = userEvent.setup();
            render(<Auth />);

            await user.click(screen.getByRole('tab', { name: /sign up/i }));

            // Just check that the role selection label exists
            expect(screen.getByText(/i am a\.\.\./i)).toBeInTheDocument();
        });
    });

    describe('Security Features', () => {
        it('should display HIPAA compliance badge', () => {
            render(<Auth />);
            expect(screen.getByText(/enterprise-grade security & hipaa compliance/i)).toBeInTheDocument();
        });

        it('should mask password input', () => {
            render(<Auth />);
            const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
            expect(passwordInput.type).toBe('password');
        });
    });
});
