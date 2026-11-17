"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import api from "@/lib/api";
import { ApiValidationError, EmailNotVerifiedError, type AuthContextType, type AuthState, type PendingVerification } from "@/utils/Types/auth";
import type { User } from "@/utils/Types/common";
import { translateAuthError } from "@/utils/helpers";

const AuthContext = createContext<AuthContextType | null>(null);

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

function saveAuth(token: string, user: object) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(user));
  }
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

/** Extract a translated Arabic error message from any API response or error object. */
function extractApiError(err: unknown): string {
  if (err && typeof err === "object") {
    // Axios error
    const axiosData = (err as any)?.response?.data;
    if (axiosData?.message) return translateAuthError(axiosData.message);
    if ((err as Error).message) return translateAuthError((err as Error).message);
  }
  return translateAuthError(err);
}

/** Laravel's 422 body `{errors: {phone: ["The phone has already been taken."]}}` as `{phone: "..."}`. */
function extractFieldErrors(err: unknown): Record<string, string> {
  const errors = (err as any)?.response?.data?.errors;
  const fields: Record<string, string> = {};
  if (!errors || typeof errors !== "object") return fields;
  for (const [field, messages] of Object.entries(errors)) {
    const first = Array.isArray(messages) ? messages[0] : messages;
    if (typeof first === "string" && first) fields[field] = first;
  }
  return fields;
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

  const signIn = useCallback((token: string, user: any) => {
    saveAuth(token, user ?? {});
    setState({
      user: user && Object.keys(user).length ? user : null,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    let data: any;
    try {
      const response = await api.post("/auth/user/login", { email, password });
      data = response.data;
    } catch (err: unknown) {
      // 403 + needs_verification: the password was right, the email was never
      // confirmed, and the API has just emailed a fresh code.
      const body = (err as any)?.response?.data;
      if (body?.errors?.needs_verification) {
        throw new EmailNotVerifiedError(translateAuthError("email_not_verified"), {
          email: body.errors.email || email,
          emailSent: body.errors.email_sent !== false,
        });
      }
      throw new Error(extractApiError(err));
    }

    if (!data?.status) {
      throw new Error(translateAuthError(data?.message || "invalid_credentials"));
    }

    signIn(data.data?.token || data.token, data.data?.user || data.user);
  }, [signIn]);

  // Registering never signs in by itself: the API emails a 6-digit code and
  // the account is usable once verifyEmail() succeeds.
  const register = useCallback(
    async (name: string, email: string, phone: string, password: string): Promise<PendingVerification> => {
      try {
        const response = await api.post("/auth/user/register", {
          name,
          email,
          phone,
          password,
          password_confirmation: password,
        });

        const data = response.data;
        if (!data.status) {
          throw new Error(translateAuthError(data.message || "register_failed"));
        }

        return {
          email: data.data?.email || email,
          emailSent: data.data?.email_sent !== false,
        };
      } catch (err: unknown) {
        const fields = extractFieldErrors(err);
        if (Object.keys(fields).length) {
          throw new ApiValidationError(extractApiError(err), fields);
        }
        throw new Error(extractApiError(err));
      }
    },
    [],
  );

  const verifyEmail = useCallback(async (email: string, code: string) => {
    let data: any;
    try {
      const response = await api.post("/auth/user/verify", { email, code: Number(code) });
      data = response.data;
    } catch (err: unknown) {
      throw new Error(extractApiError(err));
    }

    if (!data?.status || !data.data?.token) {
      throw new Error(translateAuthError(data?.message || "verify_code_failed"));
    }

    signIn(data.data.token, data.data.user);
  }, [signIn]);

  const resendVerificationCode = useCallback(async (email: string) => {
    try {
      const response = await api.post("/auth/user/resend-verify-code", { email });
      return response.data?.data?.email_sent !== false;
    } catch (err: unknown) {
      throw new Error(extractApiError(err));
    }
  }, []);

  const loginWithGoogle = useCallback(async (googleToken: string) => {
    try {
      const response = await api.post("/auth/user/google", { token: googleToken });
      const data = response.data;

      if (!data.status) {
        throw new Error(translateAuthError(data.message || "google_auth_failed"));
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
    } catch (err: unknown) {
      throw new Error(extractApiError(err));
    }
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
    <AuthContext.Provider value={{ state, login, register, verifyEmail, resendVerificationCode, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
