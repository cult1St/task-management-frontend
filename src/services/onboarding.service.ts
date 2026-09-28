import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import {
  CreateWorkspacePayload,
  OnboardingFirstProjectPayload,
  OnboardingInvitesPayload,
  OnboardingMutationResponse,
  OnboardingStatus,
  WorkspaceSetupPayload,
} from "@/dto/onboarding";
import { extractOnboardingFromResponse } from "@/utils/onboarding";

class OnboardingService {
  private handleError(err: unknown): never {
    const axiosError = err as AxiosError<ErrorResponse>;
    const data = axiosError.response?.data;

    if (data) {
      throw data;
    }

    throw {
      message: axiosError.message || "Network error",
      status: axiosError.response?.status,
    };
  }

  private unwrapOnboarding(responseData: unknown): OnboardingStatus {
    const onboarding = extractOnboardingFromResponse(responseData);
    if (!onboarding) {
      throw { message: "Invalid onboarding response from server." };
    }
    return onboarding;
  }

  async createWorkspace(payload: CreateWorkspacePayload) {
    try {
      const response = await http.post<OnboardingMutationResponse>(
        "/onboarding/workspace",
        payload
      );
      return this.unwrapOnboarding(response.data);
    } catch (err) {
      this.handleError(err);
    }
  }

  async saveSetup(payload: WorkspaceSetupPayload) {
    try {
      const response = await http.post<OnboardingMutationResponse>(
        "/onboarding/setup",
        payload
      );
      return this.unwrapOnboarding(response.data);
    } catch (err) {
      this.handleError(err);
    }
  }

  async sendInvites(payload: OnboardingInvitesPayload) {
    try {
      const response = await http.post<OnboardingMutationResponse>(
        "/onboarding/invites",
        payload
      );
      return this.unwrapOnboarding(response.data);
    } catch (err) {
      this.handleError(err);
    }
  }

  async skipInvites() {
    try {
      const response = await http.post<OnboardingMutationResponse>(
        "/onboarding/invites/skip"
      );
      return this.unwrapOnboarding(response.data);
    } catch (err) {
      this.handleError(err);
    }
  }

  async createFirstProject(payload: OnboardingFirstProjectPayload) {
    try {
      const response = await http.post<OnboardingMutationResponse>(
        "/onboarding/first-project",
        payload
      );
      return this.unwrapOnboarding(response.data);
    } catch (err) {
      this.handleError(err);
    }
  }

  async skipFirstProject() {
    try {
      const response = await http.post<OnboardingMutationResponse>(
        "/onboarding/first-project/skip"
      );
      return this.unwrapOnboarding(response.data);
    } catch (err) {
      this.handleError(err);
    }
  }
}

const onboardingService = new OnboardingService();
export default onboardingService;
