"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginDTO, ErrorResponse, ValidationErrors } from "@/dto/auth";
import authService from "@/services/auth.service";
import { useAuth } from "@/context/auth-context";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { getOnboardingPath, setPendingVerifyEmail } from "@/utils/onboarding";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState<LoginDTO>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error properly (no undefined issue)
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.login(formData);

      showToast("Login successful. Redirecting...", "success");

      const profile = await refreshUser();
      const onboarding = profile?.onboarding;

      if (onboarding && !onboarding.completed && onboarding.currentStep !== "DONE") {
        router.replace(getOnboardingPath(onboarding.currentStep));
      } else {
        router.push("/user/dashboard");
      }
    } catch (err: unknown) {
      const errData = err as ErrorResponse;

      // Unverified accounts get no token — send them to complete email verification.
      if (errData?.code === "EMAIL_NOT_VERIFIED") {
        setPendingVerifyEmail(formData.email);
        showToast(
          errData.message || "Please verify your email before signing in.",
          "info"
        );
        router.push("/onboarding/verify-email");
        return;
      }

      if (errData?.errors) {
        setErrors(errData.errors);
      }

      if (errData?.message) {
        showToast(errData.message, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="page-login">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div className="form-input-wrap">
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="form-input"
                placeholder="alex@company.com"
              />
            </div>
            {errors.email && (
              <small className="form-error">{errors.email}</small>
            )}
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrap">
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Your password"
              />
              <button
                type="button"
                className="form-input-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                👁
              </button>
            </div>
            {errors.password && (
              <small className="form-error">{errors.password}</small>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "0.85rem",
              fontSize: "0.95rem",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        <div className="auth-footer-link">
          Don’t have an account?{" "}
          <span
            style={{ cursor: "pointer", color: "var(--teal-400)" }}
            onClick={() => router.push("/register")}
          >
            Create one free
          </span>
        </div>
      </div>
    </div>
  );
}
