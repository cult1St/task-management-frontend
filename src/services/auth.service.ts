import http from "./http";
import { AxiosError } from "axios";
import { RegisterDTO, ErrorResponse, LoginDTO } from "@/dto/auth";
import {
  OnboardingStatus,
  ResendVerificationPayload,
  VerifyEmailPayload,
} from "@/dto/onboarding";
import { extractOnboardingFromResponse } from "@/utils/onboarding";

class AuthService {
  private saveAuthSession(payload: unknown) {
    if (typeof window === "undefined" || !payload || typeof payload !== "object") {
      return;
    }

    const root = payload as Record<string, unknown>;
    const data = (root.data as Record<string, unknown> | undefined) ?? root;
    const token = data.token as string | undefined;
    const user = (data.user as Record<string, unknown> | undefined) ?? undefined;
    const onboarding = extractOnboardingFromResponse(payload);

    if (token) {
      sessionStorage.setItem("authToken", token);
    }

    if (user) {
      const cached = onboarding ? { ...user, onboarding } : user;
      sessionStorage.setItem("authUser", JSON.stringify(cached));
    } else if (onboarding) {
      try {
        const existing = sessionStorage.getItem("authUser");
        if (existing) {
          const parsed = JSON.parse(existing) as Record<string, unknown>;
          sessionStorage.setItem(
            "authUser",
            JSON.stringify({ ...parsed, onboarding })
          );
        }
      } catch {
        // ignore cache merge failures
      }
    }
  }

  private unwrapOnboarding(responseData: unknown): OnboardingStatus {
    const onboarding = extractOnboardingFromResponse(responseData);
    if (!onboarding) {
      throw { message: "Invalid onboarding response from server." };
    }
    return onboarding;
  }

  async login(formData: LoginDTO) {
    try {
      const response = await http.post("/auth/login", formData);

      this.saveAuthSession(response.data);

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      return Promise.reject(data || { message: "Network error" });
    }
  }

  /**
   * Creates the account and triggers a verification email.
   * Does NOT store an auth token — token is issued only after verify-email succeeds.
   */
  async register(formData: RegisterDTO) {
    try {
      const response = await http.post("/auth/register", formData);
      // Intentionally do not call saveAuthSession — no token until email is verified.
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      return Promise.reject(data || { message: "Network error" });
    }
  }

  /**
   * Public endpoint: email + code. Issues token + advances onboarding on success.
   */
  async verifyEmail(payload: VerifyEmailPayload) {
    try {
      const response = await http.post("/auth/verify-email", payload);
      this.saveAuthSession(response.data);
      return this.unwrapOnboarding(response.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      return Promise.reject(data || { message: "Network error" });
    }
  }

  /**
   * Public endpoint: resend by email (no Bearer token).
   */
  async resendVerification(payload: ResendVerificationPayload) {
    try {
      const response = await http.post("/auth/resend-verification", payload);
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const data = axiosError.response?.data;
      return Promise.reject(data || { message: "Network error" });
    }
  }

  async logout() {
    try {
      const response = await http.delete("/auth/logout");
      if (typeof window != "undefined") {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("authUser");
      }

      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Network error";

      throw new Error(message);
    }
  }

  async getProfile() {
    try {
      const response = await http.get("/auth/me");
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Network error";

      throw new Error(message);
    }
  }
}

const authService = new AuthService();
export default authService;
