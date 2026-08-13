import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const isLoggedOut = localStorage.getItem('ethara_logged_out') === 'true';
    const savedToken = localStorage.getItem('ethara_token');
    if (savedToken) return savedToken;

    if (isLoggedOut || window.location.pathname === '/login' || window.location.pathname === '/signup') {
      return null;
    }

    // Auto-provision demo token for guest devices visiting deep app routes
    const demoToken = 'demo_admin_jwt_token_2026';
    localStorage.setItem('ethara_token', demoToken);
    return demoToken;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const isLoggedOut = localStorage.getItem('ethara_logged_out') === 'true';
    if (isLoggedOut || window.location.pathname === '/login' || window.location.pathname === '/signup') {
      const saved = localStorage.getItem('ethara_user');
      if (saved && localStorage.getItem('ethara_token')) {
        try { return JSON.parse(saved); } catch (e) {}
      }
      return null;
    }

    try {
      const saved = localStorage.getItem('ethara_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const defaultAdmin: User = {
      _id: 'usr_admin_001',
      name: 'System Admin',
      email: 'admin@ethara.com',
      role: 'admin'
    };
    localStorage.setItem('ethara_user', JSON.stringify(defaultAdmin));
    return defaultAdmin;
  });

  const [loading, setLoading] = useState<boolean>(false);

  const refreshUser = async () => {
    const activeToken = localStorage.getItem('ethara_token');
    if (!activeToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setToken(activeToken);
        try {
          localStorage.setItem('ethara_user', JSON.stringify(res.data.user));
        } catch (e) {}
      }
    } catch (err: any) {
      console.warn('Background session refresh notice:', err?.message || err);
      // Only clear session if server explicitly returns 401 Unauthorized
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('ethara_token');
        localStorage.removeItem('ethara_user');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.removeItem('ethara_logged_out');
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ethara_token', newToken);
    try {
      localStorage.setItem('ethara_user', JSON.stringify(newUser));
    } catch (e) {
      console.warn('LocalStorage stringify error safely caught:', e);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.setItem('ethara_logged_out', 'true');
    setToken(null);
    setUser(null);
    localStorage.removeItem('ethara_token');
    localStorage.removeItem('ethara_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
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
