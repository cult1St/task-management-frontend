"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  getOnboardingPath,
  getPendingVerifyEmail,
} from "@/utils/onboarding";

type GateOptions = {
  /** Verify-email is reachable without a token (pending email in session). */
  requireAuth?: boolean;
};

/**
 * Ensures the user is on the correct onboarding step route.
 * Post-verify steps require authentication; verify-email does not.
 */
export function useOnboardingGate(expectedStep: string, options?: GateOptions) {
  const requireAuth = options?.requireAuth ?? true;
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, onboarding, refreshUser } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const hasToken =
      typeof window !== "undefined" && Boolean(sessionStorage.getItem("authToken"));

    // Pre-auth verify step: only need a pending email (from register or unverified login).
    if (!requireAuth) {
      if (isAuthenticated && onboarding) {
        if (onboarding.completed || onboarding.currentStep === "DONE") {
          router.replace("/user/dashboard");
          return;
        }
        if (onboarding.currentStep !== "VERIFY_EMAIL") {
          router.replace(getOnboardingPath(onboarding.currentStep));
        }
        return;
      }

      const pendingEmail = getPendingVerifyEmail();
      if (!pendingEmail) {
        router.replace("/register");
      }
      return;
    }

    if (!isAuthenticated) {
      if (hasToken) {
        void refreshUser();
        return;
      }
      router.replace("/login");
      return;
    }

    if (!onboarding) {
      void refreshUser();
      return;
    }

    if (onboarding.completed || onboarding.currentStep === "DONE") {
      router.replace("/user/dashboard");
      return;
    }

    const target = getOnboardingPath(onboarding.currentStep);
    const normalizedPath = pathname?.replace(/\/$/, "") || "";
    const normalizedTarget = target.replace(/\/$/, "");

    if (normalizedPath !== normalizedTarget) {
      router.replace(target);
    }
  }, [
    expectedStep,
    isAuthenticated,
    isLoading,
    onboarding,
    pathname,
    refreshUser,
    requireAuth,
    router,
  ]);

  if (!requireAuth) {
    const pendingEmail = getPendingVerifyEmail();
    const readyWithoutAuth =
      !isLoading &&
      Boolean(pendingEmail) &&
      !isAuthenticated;

    const readyWithAuth =
      !isLoading &&
      isAuthenticated &&
      onboarding?.currentStep === "VERIFY_EMAIL" &&
      !onboarding.completed;

    return {
      isReady: readyWithoutAuth || readyWithAuth,
      onboarding,
      pendingEmail: pendingEmail || undefined,
    };
  }

  return {
    isReady:
      !isLoading &&
      isAuthenticated &&
      Boolean(onboarding) &&
      !onboarding?.completed &&
      onboarding?.currentStep !== "DONE",
    onboarding,
    pendingEmail: undefined as string | undefined,
  };
}
