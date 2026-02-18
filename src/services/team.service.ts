import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import { InviteMemberPayload, TeamMemberDTO, UpdateMemberPayload } from "@/dto/team";

interface SuccessResponse<T> {
  message: string;
  data: T;
}

class TeamService {
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

  async list(search?: string) {
    try {
      const response = await http.get<SuccessResponse<TeamMemberDTO[]>>("/team", {
        params: search ? { search } : undefined,
      });
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async invite(payload: InviteMemberPayload) {
    try {
      const response = await http.post<SuccessResponse<TeamMemberDTO>>(
        "/team/invite",
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async update(memberId: number, payload: UpdateMemberPayload) {
    try {
      const response = await http.patch<SuccessResponse<TeamMemberDTO>>(
        `/team/${memberId}`,
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async remove(memberId: number) {
    try {
      const response = await http.delete<SuccessResponse<{ id: number }>>(
        `/team/${memberId}`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const teamService = new TeamService();
export default teamService;
