/**
 * hooks/useAuth.ts
 * ------------------------------------------------------------------
 * Hook cung cấp trạng thái auth + hàm login/register/logout.
 * Đồng bộ user info qua state React + localStorage.
 *
 * Cung cấp:
 *  - `user`        : Thông tin user hiện tại (null nếu chưa đăng nhập).
 *  - `loading`     : Đang fetch /me.
 *  - `isLoggedIn`  : Boolean tiện lợi.
 *  - `login(...)`  : Wrapper gọi authApi.login + lưu token + set user.
 *  - `register(...)`: Wrapper gọi authApi.register + lưu token + set user.
 *  - `logout()`    : Clear token + user.
 *  - `refreshUser()`: Reload thông tin user từ /me.
 * ------------------------------------------------------------------
 */
import { useState, useEffect, useCallback } from "react";
import { authApi, setTokens, clearTokens, getAccessToken } from "../services";
import type { User } from "../services";

const STORAGE_KEY_USER = "everest_user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  /** Lưu user xuống localStorage. */
  const persist = (u: User | null) => {
    if (u) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY_USER);
    setUser(u);
  };

  /** Auto-fetch /me khi có token. */
  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      persist(null);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.me();
      persist(res.data.user);
    } catch {
      persist(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getAccessToken() && !user) refreshUser();
  }, [refreshUser, user]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setTokens(res.data.accessToken, res.data.refreshToken);
    persist(res.data.user);
    return res.data;
  };

  const register = async (data: { email: string; password: string; fullName: string; phoneNumber?: string }) => {
    const res = await authApi.register(data);
    setTokens(res.data.accessToken, res.data.refreshToken);
    persist(res.data.user);
    return res.data;
  };

  const logout = () => {
    clearTokens();
    persist(null);
    // Route guard nên navigate về /login ở caller.
  };

  return {
    user,
    loading,
    isLoggedIn: !!user,
    login,
    register,
    logout,
    refreshUser,
  };
}