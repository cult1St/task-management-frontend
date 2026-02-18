import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import {
  AppearanceSettingsPayload,
  IntegrationSettingsPayload,
  NotificationPreferencesPayload,
  SecuritySettingsPayload,
  UserProfilePayload,
  WorkspaceSettingsPayload,
} from "@/dto/user";

/**
 * Backend response wrapper:
 * SuccessResponse<T> {
 *   message: string;
 *   data: T;
 * }
 */
interface SuccessResponse<T> {
  message: string;
  data: T;
}

class UserService {
  private handleError(err: unknown): never {
    const axiosError = err as AxiosError<ErrorResponse>;
    console.log(axiosError);
    const data = axiosError.response?.data;

    if (data) {
      throw data;
    }

    throw {
      message: axiosError.message || "Network error",
      status: axiosError.response?.status,
    };
  }

  // ==============================
  // SETTINGS
  // ==============================

  async getCurrentUser() {
    try {
      const response =
        await http.get<SuccessResponse<any>>("/users/me");

      return response.data.data; // unwrap SuccessResponse
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateProfile(payload: UserProfilePayload) {
    try {
      const response =
        await http.patch<SuccessResponse<any>>("/users/me", payload);

      return response.data.data; // unwrap SuccessResponse
    } catch (err) {
      console.log(err);
      this.handleError(err);
    }
  }

  async getSettings() {
    try {
      const response =
        await http.get<SuccessResponse<any>>("/users/me/settings");

      return response.data.data; // unwrap SuccessResponse
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateNotifications(payload: NotificationPreferencesPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<any>>(
          "/users/me/settings/notifications",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateSecurity(payload: SecuritySettingsPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<any>>(
          "/users/me/settings/security",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateAppearance(payload: AppearanceSettingsPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<any>>(
          "/users/me/settings/appearance",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateIntegrations(payload: IntegrationSettingsPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<any>>(
          "/users/me/settings/integrations",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateWorkspace(payload: WorkspaceSettingsPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<any>>(
          "/users/me/settings/workspace",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const userService = new UserService();
export default userService;
