import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import {
  InvitationFilters,
  ProjectInvitationDTO,
  RespondToInvitationPayload,
} from "@/dto/invitations";

interface SuccessResponse<T> {
  message: string;
  data: T;
}

class InvitationsService {
  private isMissingEndpoint(err: unknown): boolean {
    const axiosError = err as AxiosError<ErrorResponse>;
    const status = axiosError.response?.status;
    return status === 404 || status === 405;
  }

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

  async listReceived(filters?: InvitationFilters): Promise<ProjectInvitationDTO[]> {
    try {
      const response = await http.get<SuccessResponse<ProjectInvitationDTO[]>>(
        "/invitations/received",
        { params: filters }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async listSent(filters?: InvitationFilters): Promise<ProjectInvitationDTO[]> {
    try {
      const response = await http.get<SuccessResponse<ProjectInvitationDTO[]>>(
        "/invitations/sent",
        { params: filters }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async respond(
    invitationId: number,
    payload: RespondToInvitationPayload
  ): Promise<ProjectInvitationDTO> {
    try {
      const response = await http.patch<SuccessResponse<ProjectInvitationDTO>>(
        `/invitations/${invitationId}/respond`,
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async accept(invitationId: number): Promise<ProjectInvitationDTO> {
    try {
      const response = await http.patch<SuccessResponse<ProjectInvitationDTO>>(
        `/invitations/${invitationId}/accept`
      );
      return response.data.data;
    } catch (err) {
      if (this.isMissingEndpoint(err)) {
        return this.respond(invitationId, { action: "ACCEPT" });
      }
      this.handleError(err);
    }
  }

  async reject(invitationId: number): Promise<ProjectInvitationDTO> {
    try {
      const response = await http.patch<SuccessResponse<ProjectInvitationDTO>>(
        `/invitations/${invitationId}/reject`
      );
      return response.data.data;
    } catch (err) {
      if (this.isMissingEndpoint(err)) {
        return this.respond(invitationId, { action: "REJECT" });
      }
      this.handleError(err);
    }
  }

  async cancel(invitationId: number): Promise<ProjectInvitationDTO | { id: number }> {
    try {
      const response = await http.patch<SuccessResponse<ProjectInvitationDTO>>(
        `/invitations/${invitationId}/cancel`
      );
      return response.data.data;
    } catch (err) {
      if (this.isMissingEndpoint(err)) {
        try {
          const fallback = await http.delete<SuccessResponse<{ id: number }>>(
            `/invitations/${invitationId}`
          );
          return fallback.data.data;
        } catch (fallbackErr) {
          this.handleError(fallbackErr);
        }
      }
      this.handleError(err);
    }
  }
}

const invitationsService = new InvitationsService();
export default invitationsService;
