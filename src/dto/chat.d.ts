export type ChatChannelScope = "WORKSPACE" | "PROJECT";

export interface ChannelDTO {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  scope: ChatChannelScope;
  /** Present when scope === PROJECT (future). */
  projectId?: number;
  isDefault?: boolean;
  createdAt?: string;
}

export interface DmThreadDTO {
  id: number | string;
  peerUserId: number;
  peerName: string;
  peerInitials?: string;
  peerAvatarUrl?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface ChatMessageDTO {
  id: number | string;
  workspaceId?: number;
  channelId?: number;
  dmThreadId?: number;
  senderId: number;
  senderName?: string;
  senderInitials?: string;
  senderAvatarUrl?: string;
  body: string;
  createdAt: string;
  /** Client-only: optimistic send progress */
  clientStatus?: "sending" | "failed";
}

export interface CreateChannelPayload {
  name: string;
  description?: string;
}

export interface SendMessagePayload {
  body: string;
}

export interface StartDmPayload {
  peerUserId: number;
}

export interface MessageListParams {
  limit?: number;
  before?: string | number;
}

export type ChatSelection =
  | { type: "channel"; id: number | string; title: string }
  | { type: "dm"; id: number | string; title: string };
