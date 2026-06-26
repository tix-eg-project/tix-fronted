"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import api from "@/lib/api";
import type { AuthContextType, AuthState } from "@/utils/Types/auth";
import type { User } from "@/utils/Types/common";

const AuthContext = createContext<AuthContextType | null>(null);

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

function saveAuth(token: string, user: object) {
  // localStorage is primary (works on all browsers/platforms)
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(user));
  }
  // cookies are secondary (for Next.js middleware route protection)
  setCookie("auth_token", token, COOKIE_OPTIONS);
  setCookie("user_data", JSON.stringify(user), COOKIE_OPTIONS);
}

function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  }
  deleteCookie("auth_token");
  deleteCookie("user_data");
}

function readAuth(): { token: string | null; userData: string | null } {
  const token =
    (typeof window !== "undefined" ? localStorage.getItem("token") : null) ||
    (getCookie("auth_token") as string | undefined) ||
    null;
  const userData =
    (typeof window !== "undefined" ? localStorage.getItem("userData") : null) ||
    (getCookie("user_data") as string | undefined) ||
    null;
  return { token, userData };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore session on mount
  useEffect(() => {
    const { token, userData } = readAuth();

    if (token) {
      try {
        const user = userData ? JSON.parse(userData) : null;
        setState({
          user: user && Object.keys(user).length ? user : null,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        clearAuth();
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post("/auth/user/login", { email, password });
    const data = response.data;

    if (!data.status) {
      throw new Error(data.message || "فشل تسجيل الدخول");
    }

    const token = data.data?.token || data.token;
    const user = data.data?.user || data.user;

    saveAuth(token, user ?? {});

    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(
    async (name: string, email: string, phone: string, password: string) => {
      const response = await api.post("/auth/user/register", {
        name,
        email,
        phone,
        password,
        password_confirmation: password,
      });

      const data = response.data;
      if (!data.status) {
        throw new Error(data.message || "فشل إنشاء الحساب");
      }

      const token = data.data?.token || data.token;
      const user = data.data?.user || data.user;

      if (token && user) {
        saveAuth(token, user);

        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(async (googleToken: string) => {
    const response = await api.post("/auth/user/google", { token: googleToken });
    const data = response.data;

    if (!data.status) {
      throw new Error(data.message || "فشل تسجيل الدخول بجوجل");
    }

    const token = data.data?.token || data.token;
    const user = data.data?.user || data.user || {};

    saveAuth(token, user);

    setState({
      user: Object.keys(user).length ? user : null,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch {
      // Ignore logout API errors
    } finally {
      clearAuth();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...userData };
      if (typeof window !== "undefined") localStorage.setItem("userData", JSON.stringify(updatedUser));
      setCookie("user_data", JSON.stringify(updatedUser), COOKIE_OPTIONS);
      return { ...prev, user: updatedUser };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, register, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
