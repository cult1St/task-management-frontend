import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import { CreateProjectPayload, ProjectDTO, ProjectStatus, UpdateProjectPayload } from "@/dto/projects";
import {
  InvitationStatus,
  InviteProjectMemberPayload,
  ProjectInvitationDTO,
  ProjectInviteUserOptionDTO,
  ProjectMemberDTO,
} from "@/dto/invitations";

interface SuccessResponse<T> {
  message: string;
  data: T;
}

class ProjectsService {
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

  async list(status?: ProjectStatus) {
    try {
      const response = await http.get<SuccessResponse<ProjectDTO[]>>("/projects", {
        params: status ? { status } : undefined,
      });
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async create(payload: CreateProjectPayload) {
    try {
      const response = await http.post<SuccessResponse<ProjectDTO>>("/projects", payload);
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async update(projectId: number, payload: UpdateProjectPayload) {
    try {
      const response = await http.patch<SuccessResponse<ProjectDTO>>(
        `/projects/${projectId}`,
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async remove(projectId: number) {
    try {
      const response = await http.delete<SuccessResponse<{ id: number }>>(
        `/projects/${projectId}`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async searchUsers(q: string) {
    try {
      const response = await http.get<SuccessResponse<ProjectInviteUserOptionDTO[]>>(
        "/users/search",
        { params: { q } }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async inviteMember(projectId: number, payload: InviteProjectMemberPayload) {
    try {
      const response = await http.post<SuccessResponse<ProjectInvitationDTO>>(
        `/projects/${projectId}/invitations`,
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async listMembers(projectId: number, status: InvitationStatus = "ACCEPTED") {
    try {
      const response = await http.get<SuccessResponse<ProjectMemberDTO[]>>(
        `/projects/${projectId}/members`,
        { params: { status } }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const projectsService = new ProjectsService();
export default projectsService;
