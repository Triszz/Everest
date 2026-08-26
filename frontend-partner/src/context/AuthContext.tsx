import { useState, useEffect, useCallback } from 'react';
import type { AuthUser, PartnerRole, AuthState } from '../types/auth';
import {
  apiLogin,
  apiRefreshToken,
  apiGetMe,
} from '../services/auth.service';
import {
  STORAGE_KEY_ACCESS_TOKEN,
  STORAGE_KEY_REFRESH_TOKEN,
  STORAGE_KEY_USER,
  AUTH_CLEARED_EVENT,
} from '../services/api-client';
import { AuthContext } from './useAuth';

// ── Allowed roles for partner frontend ──────────────────────────────────────
const PARTNER_ROLES: PartnerRole[] = ['Partner_Owner'];

function isPartnerRole(role: string): role is PartnerRole {
  return (PARTNER_ROLES as string[]).includes(role);
}

// ── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Hydrate: check localStorage → verify token via /me if available
  useEffect(() => {
    const hydrate = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN);
        const cachedUserJson = localStorage.getItem(STORAGE_KEY_USER);

        if (!token || !refreshToken || !cachedUserJson) {
          setState({ user: null, token: null, isLoading: false });
          return;
        }

        let cachedUser: AuthUser;
        try {
          cachedUser = JSON.parse(cachedUserJson) as AuthUser;
        } catch {
          setState({ user: null, token: null, isLoading: false });
          return;
        }

        if (!isPartnerRole(cachedUser.role)) {
          // Wrong frontend for this role
          setState({ user: null, token: null, isLoading: false });
          return;
        }

        // Optimistic: show cached state while verifying
        setState({ user: cachedUser, token, isLoading: true });

        try {
          const fresh = await apiGetMe(token);
          if (!isPartnerRole(fresh.role)) {
            // Wrong role for partner frontend — clear and bail.
            setState({ user: null, token: null, isLoading: false });
            return;
          }
          const mapped: AuthUser = {
            userId: fresh.userId,
            email: fresh.email,
            fullName: fresh.fullName,
            role: fresh.role,
            status: fresh.status,
            partnerId: fresh.partnerId,
          };
          setState({ user: mapped, token, isLoading: false });
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mapped));
        } catch {
          // /me failed — token may have expired. Try refresh once.
          try {
            await apiRefreshToken(refreshToken);
            const newAccess = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
            const fresh = await apiGetMe(newAccess ?? token);
            if (!isPartnerRole(fresh.role)) {
              setState({ user: null, token: null, isLoading: false });
              return;
            }
            const mapped: AuthUser = {
              userId: fresh.userId,
              email: fresh.email,
              fullName: fresh.fullName,
              role: fresh.role,
              status: fresh.status,
              partnerId: fresh.partnerId,
            };
            setState({ user: mapped, token: newAccess, isLoading: false });
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mapped));
          } catch {
            // Refresh also failed — fall back to cached user state but unblock UI.
            setState({ user: cachedUser, token, isLoading: false });
          }
        }
      } catch {
        setState({ user: null, token: null, isLoading: false });
      }
    };

    hydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    if (!isPartnerRole(result.user.role)) {
      throw new Error('Tài khoản này không có quyền truy cập Partner');
    }
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, result.accessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, result.refreshToken);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(result.user));
    setState({ user: result.user, token: result.accessToken, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  /** Called by Settings page after updating user profile to keep header in sync */
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...updates };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  }, []);

  // Cross-tab logout sync
  useEffect(() => {
    const handler = () => {
      setState({ user: null, token: null, isLoading: false });
    };
    window.addEventListener(AUTH_CLEARED_EVENT, handler);
    return () => window.removeEventListener(AUTH_CLEARED_EVENT, handler);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}