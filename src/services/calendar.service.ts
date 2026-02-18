import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import {
  CalendarEventDTO,
  CalendarEventFilters,
  CreateCalendarEventPayload,
  UpdateCalendarEventPayload,
} from "@/dto/calendar";

interface SuccessResponse<T> {
  message: string;
  data: T;
}

class CalendarService {
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

  async list(filters?: CalendarEventFilters) {
    try {
      const response = await http.get<SuccessResponse<CalendarEventDTO[]>>(
        "/calendar/events",
        { params: filters }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async create(payload: CreateCalendarEventPayload) {
    try {
      const response = await http.post<SuccessResponse<CalendarEventDTO>>(
        "/calendar/events",
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async update(eventId: number, payload: UpdateCalendarEventPayload) {
    try {
      const response = await http.patch<SuccessResponse<CalendarEventDTO>>(
        `/calendar/events/${eventId}`,
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async remove(eventId: number) {
    try {
      const response = await http.delete<SuccessResponse<{ id: number }>>(
        `/calendar/events/${eventId}`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const calendarService = new CalendarService();
export default calendarService;
