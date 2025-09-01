import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiService } from '../services/api';

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
    // Check for stored user session
    const storedUser = localStorage.getItem('careconnect_user');
    const storedToken = localStorage.getItem('careconnect_token');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (storedToken) {
          setUser(userData);
        } else {
          // User data exists but no token, clear user data
          localStorage.removeItem('careconnect_user');
        }
      } catch (error) {
        // Invalid user data, clear it
        localStorage.removeItem('careconnect_user');
        localStorage.removeItem('careconnect_token');
      }
    }
    
    setLoading(false);
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
