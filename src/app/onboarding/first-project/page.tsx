"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import onboardingService from "@/services/onboarding.service";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/useToast";
import { ErrorResponse } from "@/dto/auth";
import { OnboardingFirstProjectPayload } from "@/dto/onboarding";
import { DatePickerField } from "@/components/DatePickerField";
import { getOnboardingPath } from "@/utils/onboarding";
import OnboardingShell from "../components/OnboardingShell";
import { useOnboardingGate } from "../hooks/useOnboardingGate";

export default function FirstProjectPage() {
  const router = useRouter();
  const { setOnboarding } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const { isReady } = useOnboardingGate("FIRST_PROJECT");

  const [form, setForm] = useState<OnboardingFirstProjectPayload>({
    name: "",
    description: "",
    dueDate: "",
    status: "ACTIVE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const advance = (
    onboarding: Awaited<ReturnType<typeof onboardingService.skipFirstProject>>
  ) => {
    if (!onboarding) return;
    setOnboarding(onboarding);
    router.replace(getOnboardingPath(onboarding.currentStep));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const name = form.name.trim();
    if (name.length < 2) {
      showToast("Project name must be at least 2 characters.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const onboarding = await onboardingService.createFirstProject({
        name,
        description: form.description?.trim() || undefined,
        dueDate: form.dueDate || undefined,
        status: "ACTIVE",
      });
      showToast("Project created.", "success");
      advance(onboarding);
    } catch (err: unknown) {
      const errData = err as ErrorResponse;
      showToast(errData?.message || "Could not create project.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);
    try {
      const onboarding = await onboardingService.skipFirstProject();
      showToast("You can create a project anytime.", "info");
      advance(onboarding);
    } catch (err: unknown) {
      const errData = err as ErrorResponse;
      showToast(errData?.message || "Could not skip this step.", "error");
    } finally {
      setIsSkipping(false);
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
      currentStep="FIRST_PROJECT"
      title="Create your first project"
      subtitle="Optional — start with one project your team can share."
      toasts={toasts}
      onDismissToast={removeToast}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="project-name">
            Project name
          </label>
          <input
            id="project-name"
            className="form-input"
            placeholder="Website Redesign"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="project-description">
            Description (optional)
          </label>
          <textarea
            id="project-description"
            className="form-input"
            rows={3}
            placeholder="What is this project about?"
            value={form.description || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Due date (optional)</label>
          <DatePickerField
            value={form.dueDate}
            onChange={(value) => setForm((prev) => ({ ...prev, dueDate: value }))}
            placeholder="Select due date"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: "100%", padding: "0.85rem", opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? "Creating..." : "Create project & finish"}
        </button>

        <button
          type="button"
          className="btn btn-outline"
          onClick={handleSkip}
          disabled={isSkipping}
          style={{ width: "100%", padding: "0.85rem" }}
        >
          {isSkipping ? "Skipping..." : "Skip for now"}
        </button>
      </form>
    </OnboardingShell>
  );
}
