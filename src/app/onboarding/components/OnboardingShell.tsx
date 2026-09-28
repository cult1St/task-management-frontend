"use client";

import Link from "next/link";
import type { OnboardingStep } from "@/dto/onboarding";
import ToastContainer from "@/components/ToastContainer";
import type { ToastItem } from "@/hooks/useToast";

type WizardStep = {
  key: OnboardingStep;
  label: string;
  optional?: boolean;
};

const WIZARD_STEPS: WizardStep[] = [
  { key: "VERIFY_EMAIL", label: "Verify" },
  { key: "CREATE_WORKSPACE", label: "Workspace" },
  { key: "WORKSPACE_SETUP", label: "Setup" },
  { key: "INVITE_TEAM", label: "Invite", optional: true },
  { key: "FIRST_PROJECT", label: "Project", optional: true },
];

const STEP_ORDER: OnboardingStep[] = [
  "VERIFY_EMAIL",
  "CREATE_WORKSPACE",
  "WORKSPACE_SETUP",
  "INVITE_TEAM",
  "FIRST_PROJECT",
  "DONE",
];

type OnboardingShellProps = {
  currentStep: OnboardingStep;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  toasts: ToastItem[];
  onDismissToast: (id: number) => void;
};

export default function OnboardingShell({
  currentStep,
  title,
  subtitle,
  children,
  toasts,
  onDismissToast,
}: OnboardingShellProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="onboarding-page">
      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />

      <div className="onboarding-brand">
        <Link href="/" className="navbar-brand" style={{ textDecoration: "none" }}>
          <div className="brand-icon">TF</div>
          <span className="brand-name">
            Task<span>Flow</span>
          </span>
        </Link>
      </div>

      <nav className="onboarding-steps" aria-label="Onboarding progress">
        {WIZARD_STEPS.map((step, index) => {
          const stepIndex = STEP_ORDER.indexOf(step.key);
          const isActive = step.key === currentStep;
          const isDone = currentIndex > stepIndex;

          return (
            <div
              key={step.key}
              className={[
                "onboarding-step",
                isActive ? "is-active" : "",
                isDone ? "is-done" : "",
                step.optional ? "is-optional" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="onboarding-step-index">{index + 1}</span>
              <span className="onboarding-step-label">
                {step.label}
                {step.optional ? (
                  <span className="onboarding-step-optional">optional</span>
                ) : null}
              </span>
            </div>
          );
        })}
      </nav>

      <div className="auth-card onboarding-card">
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
