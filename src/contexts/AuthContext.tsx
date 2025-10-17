import React, { createContext, useContext, useEffect, useState } from 'react';
import { BackendApiService } from '../services/backendApi';

// Rename ApiService to BackendApiService for clarity
const ApiService = BackendApiService;

interface User {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('careconnect_token');
      if (token) {
        try {
          // Assuming ApiService will have a method to get current user
          const response = await ApiService.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('AuthContext: Failed to load user from token', error);
          localStorage.removeItem('careconnect_token');
          localStorage.removeItem('careconnect_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext.signIn called');
      const response = await ApiService.login(email, password);
      console.log('Login response:', response);
      setUser(response.user);
    } catch (error) {
      console.error('AuthContext signIn error:', error);
      throw new Error('Invalid email or password');
    }
  };

  const signUp = async (email: string, password: string) => {
    // For now, signup is not implemented in the backend
    throw new Error('Signup not available');
  };

  const signOut = async () => {
    await ApiService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  console.log('AuthContext Provider Value:', value);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  console.log('useAuth context:', context);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
