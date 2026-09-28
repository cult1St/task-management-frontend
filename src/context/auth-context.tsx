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
import type { OnboardingStatus } from "@/dto/onboarding";
import {
  COMPLETED_ONBOARDING,
  extractOnboardingFromResponse,
} from "@/utils/onboarding";

export interface AuthUser {
  id?: string | number;
  full_name?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  avatar_url?: string;
  onboarding?: OnboardingStatus;
}

interface AuthContextValue {
  user: AuthUser | null;
  onboarding: OnboardingStatus | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  setOnboarding: (status: OnboardingStatus) => void;
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

  const onboarding =
    extractOnboardingFromResponse(payload) ??
    (user.onboarding && typeof user.onboarding === "object"
      ? extractOnboardingFromResponse({ data: { onboarding: user.onboarding } })
      : null);

  const normalized: AuthUser = {
    id: (user.id as string | number | undefined) ?? undefined,
    full_name: (user.full_name as string | undefined) ?? undefined,
    fullName: (user.fullName as string | undefined) ?? undefined,
    name: (user.name as string | undefined) ?? undefined,
    email: (user.email as string | undefined) ?? undefined,
    role: (user.role as string | undefined) ?? undefined,
    avatarUrl: (user.avatarUrl as string | undefined) ?? undefined,
    avatar_url: (user.avatar_url as string | undefined) ?? undefined,
    onboarding: onboarding ?? undefined,
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
  const [onboarding, setOnboardingState] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
  }, []);

  const setOnboarding = useCallback((status: OnboardingStatus) => {
    setOnboardingState(status);
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, onboarding: status };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("authUser", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return null;
    setIsLoading(true);

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setUser(null);
      setOnboardingState(null);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await authService.getProfile();
      const parsedUser = parseProfilePayload(response);
      setUser(parsedUser);

      const nextOnboarding =
        parsedUser?.onboarding ??
        extractOnboardingFromResponse(response) ??
        (parsedUser ? COMPLETED_ONBOARDING : null);
      setOnboardingState(nextOnboarding);

      if (parsedUser) {
        const toCache = {
          ...parsedUser,
          onboarding: nextOnboarding ?? parsedUser.onboarding,
        };
        sessionStorage.setItem("authUser", JSON.stringify(toCache));
      } else {
        sessionStorage.removeItem("authUser");
      }

      return parsedUser
        ? { ...parsedUser, onboarding: nextOnboarding ?? undefined }
        : null;
    } catch {
      clearAuthStorage();
      setUser(null);
      setOnboardingState(null);
      return null;
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
      setOnboardingState(null);
    }
  }, [clearAuthStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cached = sessionStorage.getItem("authUser");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AuthUser;
        setUser(parsed);
        if (parsed.onboarding) {
          setOnboardingState(parsed.onboarding);
        }
      } catch {
        sessionStorage.removeItem("authUser");
      }
    }

    void refreshUser();
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      onboarding,
      isLoading,
      isAuthenticated: Boolean(user),
      refreshUser,
      setOnboarding,
      logout,
    }),
    [isLoading, logout, onboarding, refreshUser, setOnboarding, user]
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
