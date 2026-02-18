"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import authService from "@/services/auth.service";

export interface AuthUser {
  id?: string | number;
  full_name?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  avatar_url?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseProfilePayload(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== "object") return null;

  const asRecord = payload as Record<string, unknown>;
  const maybeNested = asRecord.data as Record<string, unknown> | undefined;
  const user = (maybeNested?.user ?? maybeNested ?? asRecord) as Record<
    string,
    unknown
  >;

  const normalized: AuthUser = {
    id: (user.id as string | number | undefined) ?? undefined,
    full_name: (user.full_name as string | undefined) ?? undefined,
    fullName: (user.fullName as string | undefined) ?? undefined,
    name: (user.name as string | undefined) ?? undefined,
    email: (user.email as string | undefined) ?? undefined,
    role: (user.role as string | undefined) ?? undefined,
    avatarUrl: (user.avatarUrl as string | undefined) ?? undefined,
    avatar_url: (user.avatar_url as string | undefined) ?? undefined,
  };

  if (
    !normalized.fullName &&
    !normalized.full_name &&
    !normalized.name &&
    !normalized.email
  ) {
    return null;
  }

  return normalized;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
  }, []);

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return;
    setIsLoading(true);

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getProfile();
      const parsedUser = parseProfilePayload(response);
      setUser(parsedUser);

      if (parsedUser) {
        sessionStorage.setItem("authUser", JSON.stringify(parsedUser));
      } else {
        sessionStorage.removeItem("authUser");
      }
    } catch {
      clearAuthStorage();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthStorage]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ensure local session is cleared even if backend logout fails.
    } finally {
      clearAuthStorage();
      setUser(null);
    }
  }, [clearAuthStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cached = sessionStorage.getItem("authUser");
    if (cached) {
      try {
        setUser(JSON.parse(cached) as AuthUser);
      } catch {
        sessionStorage.removeItem("authUser");
      }
    }

    void refreshUser();
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      refreshUser,
      logout,
    }),
    [isLoading, logout, refreshUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
