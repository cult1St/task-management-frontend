import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import {
  CurrentWorkspaceDTO,
  UpdateWorkspaceMemberPayload,
  UpdateWorkspacePayload,
  WorkspaceDTO,
  WorkspaceInvitePayload,
  WorkspaceMemberDTO,
  WorkspaceMembershipDTO,
} from "@/dto/workspace";

interface SuccessResponse<T> {
  message: string;
  data: T;
}

const WORKSPACE_ID_KEY = "selectedWorkspaceId";

export function getStoredWorkspaceId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(WORKSPACE_ID_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function setStoredWorkspaceId(id: number | null) {
  if (typeof window === "undefined") return;
  if (id == null) {
    sessionStorage.removeItem(WORKSPACE_ID_KEY);
  } else {
    sessionStorage.setItem(WORKSPACE_ID_KEY, String(id));
  }
}

class WorkspaceService {
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

  async list(): Promise<WorkspaceMembershipDTO[]> {
    try {
      const response =
        await http.get<SuccessResponse<WorkspaceMembershipDTO[]>>("/workspaces");
      return response.data.data || [];
    } catch (err) {
      this.handleError(err);
    }
  }

  async switchTo(workspaceId: number): Promise<CurrentWorkspaceDTO> {
    try {
      const response = await http.post<SuccessResponse<CurrentWorkspaceDTO>>(
        `/workspaces/${workspaceId}/switch`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getCurrent() {
    try {
      const response =
        await http.get<SuccessResponse<CurrentWorkspaceDTO>>("/workspaces/current");
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateCurrent(payload: UpdateWorkspacePayload) {
    try {
      const response = await http.patch<SuccessResponse<WorkspaceDTO>>(
        "/workspaces/current",
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async listMembers(search?: string) {
    try {
      const response = await http.get<SuccessResponse<WorkspaceMemberDTO[]>>(
        "/workspaces/current/members",
        { params: search ? { search } : undefined }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async invite(payload: WorkspaceInvitePayload) {
    try {
      const response = await http.post<SuccessResponse<Record<string, unknown>>>(
        "/workspaces/current/invites",
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateMember(userId: number, payload: UpdateWorkspaceMemberPayload) {
    try {
      const response = await http.patch<SuccessResponse<WorkspaceMemberDTO>>(
        `/workspaces/current/members/${userId}`,
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async removeMember(userId: number) {
    try {
      const response = await http.delete<SuccessResponse<{ userId: number }>>(
        `/workspaces/current/members/${userId}`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const workspaceService = new WorkspaceService();
export default workspaceService;
