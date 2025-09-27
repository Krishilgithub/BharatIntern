import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import Login from '../src/pages/Login';
import Signup from '../src/pages/Signup';
import ProtectedRoute from '../src/components/ProtectedRoute';

// Mock Supabase
jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
  },
  getUserProfile: jest.fn(),
  createUserProfile: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams()],
}));

// Test component to access auth context
const TestComponent = () => {
  const { user, login, signup, logout, loading } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => login('test@example.com', 'password', 'candidate')}>
        Login
      </button>
      <button onClick={() => signup({ email: 'test@example.com', password: 'password', role: 'candidate' })}>
        Signup
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuth = (component) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('AuthContext', () => {
    test('should provide auth context', () => {
      renderWithAuth(<TestComponent />);
      expect(screen.getByTestId('user')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('should handle login successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockProfile = { role: 'candidate', name: 'Test User' };
      
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      const { getUserProfile } = require('../src/lib/supabase');
      getUserProfile.mockResolvedValue(mockProfile);

      renderWithAuth(<TestComponent />);
      
      fireEvent.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        });
      });
    });

    test('should handle signup successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockProfile = { role: 'candidate', name: 'Test User' };
      
      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      const { createUserProfile } = require('../src/lib/supabase');
      createUserProfile.mockResolvedValue(mockProfile);

      renderWithAuth(<TestComponent />);
      
      fireEvent.click(screen.getByText('Signup'));
      
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        });
      });
    });

    test('should handle logout', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      renderWithAuth(<TestComponent />);
      
      fireEvent.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalled();
      });
    });
  });

  describe('Login Component', () => {
    test('should render login form', () => {
      renderWithAuth(<Login />);
      
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('should handle form submission', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockProfile = { role: 'candidate', name: 'Test User' };
      
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      const { getUserProfile } = require('../src/lib/supabase');
      getUserProfile.mockResolvedValue(mockProfile);

      renderWithAuth(<Login />);
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    test('should handle password reset', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      renderWithAuth(<Login />);
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      });
      
      fireEvent.click(screen.getByText('Forgot your password?'));
      
      await waitFor(() => {
        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          expect.objectContaining({
            redirectTo: expect.stringContaining('/reset-password'),
          })
        );
      });
    });
  });

  describe('Signup Component', () => {
    test('should render signup form', () => {
      renderWithAuth(<Signup />);
      
      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    test('should handle form submission', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockProfile = { role: 'candidate', name: 'Test User' };
      
      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      const { createUserProfile } = require('../src/lib/supabase');
      createUserProfile.mockResolvedValue(mockProfile);

      renderWithAuth(<Signup />);
      
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Phone Number'), {
        target: { value: '1234567890' },
      });
      fireEvent.change(screen.getByLabelText('Location'), {
        target: { value: 'Test City' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: 'password123' },
      });
      
      // Check terms agreement
      fireEvent.click(screen.getByLabelText(/i agree to the/i));
      
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    test('should validate password confirmation', async () => {
      renderWithAuth(<Signup />);
      
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: 'different123' },
      });
      
      fireEvent.click(screen.getByLabelText(/i agree to the/i));
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      
      // Should not call signup due to password mismatch
      await waitFor(() => {
        expect(supabase.auth.signUp).not.toHaveBeenCalled();
      });
    });
  });

  describe('ProtectedRoute Component', () => {
    test('should redirect to login when user is not authenticated', () => {
      renderWithAuth(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );
      
      // Should redirect to login (Navigate component behavior)
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    test('should show loading state', () => {
      // Mock loading state
      jest.spyOn(React, 'useContext').mockReturnValue({
        user: null,
        loading: true,
      });

      renderWithAuth(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );
      
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
  });
});

describe('Supabase Integration', () => {
  test('should initialize Supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  test('should handle authentication errors', async () => {
    const error = new Error('Invalid credentials');
    supabase.auth.signInWithPassword.mockRejectedValue(error);

    renderWithAuth(<TestComponent />);
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });
});
