"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import onboardingService from "@/services/onboarding.service";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/useToast";
import { ErrorResponse } from "@/dto/auth";
import { getOnboardingPath } from "@/utils/onboarding";
import OnboardingShell from "../components/OnboardingShell";
import { useOnboardingGate } from "../hooks/useOnboardingGate";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const { setOnboarding } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const { isReady } = useOnboardingGate("CREATE_WORKSPACE");

  const [workspaceName, setWorkspaceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const name = workspaceName.trim();
    if (name.length < 2) {
      showToast("Workspace name must be at least 2 characters.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const onboarding = await onboardingService.createWorkspace({
        workspaceName: name,
      });
      setOnboarding(onboarding);
      showToast("Workspace created.", "success");
      router.replace(getOnboardingPath(onboarding.currentStep));
    } catch (err: unknown) {
      const errData = err as ErrorResponse;
      showToast(errData?.message || "Could not create workspace.", "error");
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
      currentStep="CREATE_WORKSPACE"
      title="Create your workspace"
      subtitle="This is your team's home base in TaskFlow."
      toasts={toasts}
      onDismissToast={removeToast}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="workspace-name">
            Workspace name
          </label>
          <input
            id="workspace-name"
            className="form-input"
            placeholder="Acme Engineering"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            maxLength={80}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: "100%", padding: "0.85rem", opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? "Creating..." : "Continue"}
        </button>
      </form>
    </OnboardingShell>
  );
}
