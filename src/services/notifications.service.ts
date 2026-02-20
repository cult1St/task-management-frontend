import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import { NotificationDTO } from "@/dto/notifications";

interface SuccessResponse<T> {
  message: string;
  data: T;
}

class NotificationsService {
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

  async list(params?: { unreadOnly?: boolean; limit?: number }) {
    try {
      const response = await http.get<SuccessResponse<NotificationDTO[]>>(
        "/notifications",
        { params }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async unreadCount() {
    try {
      const response = await http.get<SuccessResponse<{ count: number }>>(
        "/notifications/unread-count"
      );
      return response.data.data.count;
    } catch (err) {
      this.handleError(err);
    }
  }

  async markRead(notificationId: number) {
    try {
      const response = await http.patch<SuccessResponse<NotificationDTO>>(
        `/notifications/${notificationId}/read`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async markAllRead() {
    try {
      const response = await http.patch<SuccessResponse<{ success: true }>>(
        "/notifications/read-all"
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;
