export type NotificationType =
  | "PROJECT_INVITE_SENT"
  | "PROJECT_INVITE_ACCEPTED"
  | "PROJECT_INVITE_REJECTED"
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "CHAT_MESSAGE"
  | "GENERAL";

export interface NotificationDTO {
  id: number;
  type: NotificationType;
  title?: string;
  message: string;
  read: boolean;
  userId?: number;
  createdAt: string;
  actorName?: string;
  /** Optional deep-link hints for chat */
  channelId?: number;
  dmThreadId?: number;
  workspaceId?: number;
}
