import { AxiosError } from "axios";
import http from "./http";
import { ErrorResponse } from "@/dto/auth";
import {
  ChannelDTO,
  ChatMessageDTO,
  CreateChannelPayload,
  DmThreadDTO,
  MessageListParams,
  SendMessagePayload,
  StartDmPayload,
} from "@/dto/chat";

interface SuccessResponse<T> {
  message: string;
  data: T;
}

class ChatService {
  private handleError(err: unknown): never {
    const axiosError = err as AxiosError<ErrorResponse>;
    const data = axiosError.response?.data;

    if (data) {
      throw {
        ...data,
        status: axiosError.response?.status,
      };
    }

    throw {
      message: axiosError.message || "Network error",
      status: axiosError.response?.status,
    };
  }

  async listChannels() {
    try {
      const response = await http.get<SuccessResponse<ChannelDTO[]>>(
        "/workspaces/current/chat/channels"
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async createChannel(payload: CreateChannelPayload) {
    try {
      const response = await http.post<SuccessResponse<ChannelDTO>>(
        "/workspaces/current/chat/channels",
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async listDms() {
    try {
      const response = await http.get<SuccessResponse<DmThreadDTO[]>>(
        "/workspaces/current/chat/dms"
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async startDm(payload: StartDmPayload) {
    try {
      const response = await http.post<SuccessResponse<DmThreadDTO>>(
        "/workspaces/current/chat/dms",
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async listChannelMessages(
    channelId: number | string,
    params?: MessageListParams
  ) {
    try {
      const response = await http.get<SuccessResponse<ChatMessageDTO[]>>(
        `/workspaces/current/chat/channels/${channelId}/messages`,
        { params }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async sendChannelMessage(
    channelId: number | string,
    payload: SendMessagePayload
  ) {
    try {
      const response = await http.post<SuccessResponse<ChatMessageDTO>>(
        `/workspaces/current/chat/channels/${channelId}/messages`,
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async listDmMessages(threadId: number | string, params?: MessageListParams) {
    try {
      const response = await http.get<SuccessResponse<ChatMessageDTO[]>>(
        `/workspaces/current/chat/dms/${threadId}/messages`,
        { params }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async sendDmMessage(threadId: number | string, payload: SendMessagePayload) {
    try {
      const response = await http.post<SuccessResponse<ChatMessageDTO>>(
        `/workspaces/current/chat/dms/${threadId}/messages`,
        payload
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const chatService = new ChatService();
export default chatService;
