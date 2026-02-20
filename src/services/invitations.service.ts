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

  async listReceived(filters?: InvitationFilters) {
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

  async listSent(filters?: InvitationFilters) {
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

  async respond(invitationId: number, payload: RespondToInvitationPayload) {
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

  async cancel(invitationId: number) {
    try {
      const response = await http.delete<SuccessResponse<{ id: number }>>(
        `/invitations/${invitationId}`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const invitationsService = new InvitationsService();
export default invitationsService;
