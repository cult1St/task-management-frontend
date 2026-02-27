import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import {
  CreateTaskPayload,
  ProjectAssigneeDTO,
  TaskDTO,
  TaskFilters,
  UpdateTaskPayload,
} from "@/dto/tasks";

interface SuccessResponse<T> {
  message: string;
  data: T;
}

class TasksService {
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

  async list(filters?: TaskFilters) {
    try {
      const response = await http.get<SuccessResponse<TaskDTO[]>>("/tasks", {
        params: filters,
      });
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async create(payload: CreateTaskPayload) {
    try {
      const response = await http.post<SuccessResponse<TaskDTO>>("/tasks", payload);
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async update(taskId: number, payload: UpdateTaskPayload, type: string = 'all') {
    try {
      const url = type == 'status' ? `/tasks/${taskId}/update-status` : `/tasks/${taskId}`;
      const response = await http.patch<SuccessResponse<TaskDTO>>(
        url,
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async remove(taskId: number) {
    try {
      const response = await http.delete<SuccessResponse<{ id: number }>>(
        `/tasks/${taskId}`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async listProjectAssignees(projectId: number) {
    try {
      const response = await http.get<SuccessResponse<ProjectAssigneeDTO[]>>(
        `/projects/${projectId}/assignees`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const tasksService = new TasksService();
export default tasksService;
