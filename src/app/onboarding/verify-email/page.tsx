"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/useToast";
import { ErrorResponse } from "@/dto/auth";
import {
  clearPendingVerifyEmail,
  getOnboardingPath,
  getPendingVerifyEmail,
} from "@/utils/onboarding";
import OnboardingShell from "../components/OnboardingShell";
import { useOnboardingGate } from "../hooks/useOnboardingGate";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { setOnboarding, refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const { isReady } = useOnboardingGate("VERIFY_EMAIL", { requireAuth: false });

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setEmail(getPendingVerifyEmail() || "");
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!trimmedEmail) {
      showToast("Email is required to verify your account.", "error");
      return;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      showToast("Enter the 6-digit code from your email.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const onboarding = await authService.verifyEmail({
        email: trimmedEmail,
        code: trimmedCode,
      });
      clearPendingVerifyEmail();
      setOnboarding(onboarding);
      await refreshUser();
      showToast("Email verified.", "success");
      router.replace(getOnboardingPath(onboarding.currentStep));
    } catch (err: unknown) {
      const errData = err as ErrorResponse;
      showToast(errData?.message || "Could not verify email.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isResending || cooldown > 0) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      showToast("Email is required to resend the code.", "error");
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerification({ email: trimmedEmail });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      showToast("Verification code sent.", "success");
    } catch (err: unknown) {
      const errData = err as ErrorResponse;
      showToast(errData?.message || "Could not resend code.", "error");
    } finally {
      setIsResending(false);
    }
  };

  if (!isReady) {
    return (
      <div className="user-auth-loading">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Loading onboarding...
        </div>
      </div>
    );
  }

  return (
    <OnboardingShell
      currentStep="VERIFY_EMAIL"
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email || "your email"}.`}
      toasts={toasts}
      onDismissToast={removeToast}
    >
      <form className="auth-form" onSubmit={handleVerify}>
        <div className="form-group">
          <label className="form-label" htmlFor="verify-email">
            Email
          </label>
          <input
            id="verify-email"
            className="form-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@company.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="verify-code">
            Verification code
          </label>
          <input
            id="verify-code"
            className="form-input onboarding-code-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: "100%", padding: "0.85rem", opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? "Verifying..." : "Verify email"}
        </button>
      </form>

      <div className="auth-footer-link" style={{ marginTop: "1.25rem" }}>
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          className="onboarding-link-btn"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
        >
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : isResending
              ? "Sending..."
              : "Resend code"}
        </button>
      </div>
    </OnboardingShell>
  );
}
