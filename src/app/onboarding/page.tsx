"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getOnboardingPath, getPendingVerifyEmail } from "@/utils/onboarding";

export default function OnboardingIndexPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, onboarding, refreshUser } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const hasToken =
      typeof window !== "undefined" && Boolean(sessionStorage.getItem("authToken"));

    if (!isAuthenticated) {
      if (hasToken) {
        void refreshUser();
        return;
      }

      if (getPendingVerifyEmail()) {
        router.replace("/onboarding/verify-email");
        return;
      }

      router.replace("/login");
      return;
    }

    if (!onboarding || onboarding.completed || onboarding.currentStep === "DONE") {
      router.replace("/user/dashboard");
      return;
    }

    router.replace(getOnboardingPath(onboarding.currentStep));
  }, [isAuthenticated, isLoading, onboarding, refreshUser, router]);

  return (
    <div className="user-auth-loading">
      <div className="hero-badge">
        <div className="hero-badge-dot" />
        Continuing setup...
      </div>
    </div>
  );
}
