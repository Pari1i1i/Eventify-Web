import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { eventifyApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUserRoleState: (userId: string, newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('eventify_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('eventify_admin_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('eventify_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eventify_admin_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('eventify_admin_token', token);
    } else {
      localStorage.removeItem('eventify_admin_token');
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await eventifyApi.login(email, pass);

      // Strict role check: Admin Only
      if (data.user.role !== 'admin') {
        throw new Error('Akses Ditolak: Khusus Administrator');
      }

      setUser(data.user);
      setToken(data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eventify_admin_user');
    localStorage.removeItem('eventify_admin_token');
  };

  const updateUserRoleState = (userId: string, newRole: UserRole) => {
    if (user && user.id === userId) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && user.role === 'admin',
        isLoading,
        login,
        logout,
        updateUserRoleState,
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
