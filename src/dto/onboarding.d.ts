export type OnboardingStep =
  | "VERIFY_EMAIL"
  | "CREATE_WORKSPACE"
  | "WORKSPACE_SETUP"
  | "INVITE_TEAM"
  | "FIRST_PROJECT"
  | "DONE";

export type TeamSizeOption = "1-5" | "6-20" | "21-50" | "51+";

export type PrimaryUseCase =
  | "engineering"
  | "product"
  | "marketing"
  | "ops"
  | "other";

export interface OnboardingStatus {
  completed: boolean;
  currentStep: OnboardingStep;
  emailVerified: boolean;
  workspaceCreated: boolean;
  workspaceSetupCompleted: boolean;
  firstProjectCreated: boolean;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface CreateWorkspacePayload {
  workspaceName: string;
}

export interface WorkspaceSetupPayload {
  roleTitle: string;
  teamSize: TeamSizeOption;
  primaryUseCase: PrimaryUseCase;
}

export interface OnboardingInviteItem {
  email: string;
  role?: string;
}

export interface OnboardingInvitesPayload {
  invites: OnboardingInviteItem[];
}

export interface OnboardingFirstProjectPayload {
  name: string;
  description?: string;
  dueDate?: string;
  status?: "ACTIVE" | "IN_REVIEW" | "PLANNING" | "PAUSED" | "COMPLETED" | "ARCHIVED";
}

export interface OnboardingMutationResponse {
  message: string;
  data: {
    onboarding: OnboardingStatus;
    [key: string]: unknown;
  };
}
