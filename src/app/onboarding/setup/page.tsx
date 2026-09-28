"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import onboardingService from "@/services/onboarding.service";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/useToast";
import { ErrorResponse } from "@/dto/auth";
import {
  PrimaryUseCase,
  TeamSizeOption,
  WorkspaceSetupPayload,
} from "@/dto/onboarding";
import { getOnboardingPath } from "@/utils/onboarding";
import OnboardingShell from "../components/OnboardingShell";
import { useOnboardingGate } from "../hooks/useOnboardingGate";

const TEAM_SIZES: { value: TeamSizeOption; label: string }[] = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-20", label: "6–20 people" },
  { value: "21-50", label: "21–50 people" },
  { value: "51+", label: "51+ people" },
];

const USE_CASES: { value: PrimaryUseCase; label: string }[] = [
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "ops", label: "Operations" },
  { value: "other", label: "Other" },
];

export default function WorkspaceSetupPage() {
  const router = useRouter();
  const { setOnboarding } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const { isReady } = useOnboardingGate("WORKSPACE_SETUP");

  const [form, setForm] = useState<WorkspaceSetupPayload>({
    roleTitle: "",
    teamSize: "1-5",
    primaryUseCase: "engineering",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (form.roleTitle.trim().length < 2) {
      showToast("Enter your role or title.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const onboarding = await onboardingService.saveSetup({
        ...form,
        roleTitle: form.roleTitle.trim(),
      });
      setOnboarding(onboarding);
      showToast("Workspace setup saved.", "success");
      router.replace(getOnboardingPath(onboarding.currentStep));
    } catch (err: unknown) {
      const errData = err as ErrorResponse;
      showToast(errData?.message || "Could not save setup.", "error");
    } finally {
      setIsSubmitting(false);
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
      currentStep="WORKSPACE_SETUP"
      title="Workspace setup"
      subtitle="A few details help us tailor TaskFlow for your team."
      toasts={toasts}
      onDismissToast={removeToast}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="role-title">
            Your role / title
          </label>
          <input
            id="role-title"
            className="form-input"
            placeholder="Engineering Manager"
            value={form.roleTitle}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, roleTitle: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="team-size">
            Team size
          </label>
          <select
            id="team-size"
            className="form-input"
            value={form.teamSize}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                teamSize: e.target.value as TeamSizeOption,
              }))
            }
          >
            {TEAM_SIZES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="use-case">
            Primary use case
          </label>
          <select
            id="use-case"
            className="form-input"
            value={form.primaryUseCase}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                primaryUseCase: e.target.value as PrimaryUseCase,
              }))
            }
          >
            {USE_CASES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: "100%", padding: "0.85rem", opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </OnboardingShell>
  );
}
