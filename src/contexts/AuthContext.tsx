'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, AuthContextType, RegisterRequest } from '@/types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Check if user is logged in on mount (ONLY ONCE)
  useEffect(() => {
    if (isInitialized) return; // Prevent multiple calls

    const checkAuth = async () => {
      try {
        const response = await api.get('/users/me/');
        setUser(response.data);
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, [isInitialized]);

  const login = async (username: string, password: string) => {
    try {
      await api.post('/auth/login/', {
        username,
        password,
      });

      // Get user data
      const userResponse = await api.get('/users/me/');
      setUser(userResponse.data);

      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Invalid credentials';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await api.post('/users/register/', data);
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      const errors = error.response?.data;
      const message = errors?.username?.[0] || 
                      errors?.email?.[0] ||
                      errors?.phone?.[0] ||
                      errors?.password?.[0] ||
                      'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      // Ignore errors
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}