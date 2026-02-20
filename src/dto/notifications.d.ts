export type NotificationType =
  | "PROJECT_INVITE_SENT"
  | "PROJECT_INVITE_ACCEPTED"
  | "PROJECT_INVITE_REJECTED"
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "GENERAL";

export interface NotificationDTO {
  id: number;
  type: NotificationType;
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
  actorName?: string;
}
