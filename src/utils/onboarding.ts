import type { OnboardingStatus, OnboardingStep } from "@/dto/onboarding";

export const DEFAULT_ONBOARDING: OnboardingStatus = {
  completed: false,
  currentStep: "VERIFY_EMAIL",
  emailVerified: false,
  workspaceCreated: false,
  workspaceSetupCompleted: false,
  firstProjectCreated: false,
};

/** Used when API omits onboarding (legacy accounts / backend not yet deployed). */
export const COMPLETED_ONBOARDING: OnboardingStatus = {
  completed: true,
  currentStep: "DONE",
  emailVerified: true,
  workspaceCreated: true,
  workspaceSetupCompleted: true,
  firstProjectCreated: true,
};

const PENDING_VERIFY_EMAIL_KEY = "pendingVerifyEmail";

const STEP_PATHS: Record<Exclude<OnboardingStep, "DONE">, string> = {
  VERIFY_EMAIL: "/onboarding/verify-email",
  CREATE_WORKSPACE: "/onboarding/workspace",
  WORKSPACE_SETUP: "/onboarding/setup",
  INVITE_TEAM: "/onboarding/invite",
  FIRST_PROJECT: "/onboarding/first-project",
};

export function getOnboardingPath(step: OnboardingStep): string {
  if (step === "DONE") {
    return "/user/dashboard";
  }
  return STEP_PATHS[step];
}

export function setPendingVerifyEmail(email: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_VERIFY_EMAIL_KEY, email.trim().toLowerCase());
}

export function getPendingVerifyEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PENDING_VERIFY_EMAIL_KEY);
}

export function clearPendingVerifyEmail() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_VERIFY_EMAIL_KEY);
}

export function parseOnboardingPayload(payload: unknown): OnboardingStatus | null {
  if (!payload || typeof payload !== "object") return null;

  const raw = payload as Record<string, unknown>;
  const currentStep = raw.currentStep as OnboardingStep | undefined;

  const validSteps: OnboardingStep[] = [
    "VERIFY_EMAIL",
    "CREATE_WORKSPACE",
    "WORKSPACE_SETUP",
    "INVITE_TEAM",
    "FIRST_PROJECT",
    "DONE",
  ];

  if (!currentStep || !validSteps.includes(currentStep)) {
    return null;
  }

  return {
    completed: Boolean(raw.completed),
    currentStep,
    emailVerified: Boolean(raw.emailVerified),
    workspaceCreated: Boolean(raw.workspaceCreated),
    workspaceSetupCompleted: Boolean(raw.workspaceSetupCompleted),
    firstProjectCreated: Boolean(raw.firstProjectCreated),
  };
}

/** Infer onboarding from nested API envelopes when present. */
export function extractOnboardingFromResponse(payload: unknown): OnboardingStatus | null {
  if (!payload || typeof payload !== "object") return null;

  const root = payload as Record<string, unknown>;
  const data = (root.data as Record<string, unknown> | undefined) ?? root;

  if (data.onboarding && typeof data.onboarding === "object") {
    return parseOnboardingPayload(data.onboarding);
  }

  if (data.user && typeof data.user === "object") {
    const user = data.user as Record<string, unknown>;
    if (user.onboarding && typeof user.onboarding === "object") {
      return parseOnboardingPayload(user.onboarding);
    }
  }

  return parseOnboardingPayload(data);
}
