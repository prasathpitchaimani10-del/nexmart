import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUser } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<{ otpCodeForTesting?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexmart_token'));
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem('nexmart_token')) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      localStorage.removeItem('nexmart_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      localStorage.setItem('nexmart_token', res.token);
      setToken(res.token);
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      toastError(err.message || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('nexmart_token', res.token);
      setToken(res.token);
      setUser(res.user);
      success('Account created! Please verify your email.');
      return { otpCodeForTesting: res.otpCodeForTesting };
    } catch (err: any) {
      toastError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nexmart_token');
    setToken(null);
    setUser(null);
    success('You have logged out.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
