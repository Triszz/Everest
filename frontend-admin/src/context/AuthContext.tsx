import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  apiLogin,
  apiGetMe,
  STORAGE_KEY_ACCESS_TOKEN,
  STORAGE_KEY_REFRESH_TOKEN,
  STORAGE_KEY_USER,
} from '../services/auth.service';
import { AUTH_CLEARED_EVENT } from '../services/api-client';
import type { AuthUser, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setState({
      user: null,
      token: null,
      isLoading: false,
    });
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    try {
      const response = await apiLogin(email, password);

      // Security Check: Only allow 'Admin' role users to access the admin portal
      if (response.user.role !== 'Admin') {
        throw new Error('Bạn không có quyền truy cập trang quản trị.');
      }

      localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));

      setState({
        user: response.user,
        token: response.accessToken,
        isLoading: false,
      });

      return response.user;
    } catch (error) {
      throw error;
    }
  };

  // Re-hydrate authentication state on mount
  useEffect(() => {
    const hydrate = async () => {
      const token = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);

      if (!token || !savedUser) {
        setState({ user: null, token: null, isLoading: false });
        return;
      }

      try {
        JSON.parse(savedUser);
        
        // Quick verification with backend
        const me = await apiGetMe(token);
        if (me.role !== 'Admin') {
          throw new Error('Not an admin');
        }

        setState({
          user: {
            userId: me.userId,
            email: me.email,
            fullName: me.fullName,
            role: 'Admin',
            status: me.status,
          },
          token,
          isLoading: false,
        });
      } catch (err) {
        console.error('Auth hydration failed:', err);
        logout();
      }
    };

    hydrate();
  }, [logout]);

  // Listen to API client events (e.g. token expired & cleared, or manual logout)
  useEffect(() => {
    const handleAuthCleared = () => {
      setState({
        user: null,
        token: null,
        isLoading: false,
      });
    };

    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    return () => {
      window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
