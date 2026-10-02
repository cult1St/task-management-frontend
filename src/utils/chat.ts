import type { ChatMessageDTO } from "@/dto/chat";

type ChatMessageEnvelope =
  | ChatMessageDTO
  | { message?: ChatMessageDTO; data?: ChatMessageDTO };

export function parseChatMessagePayload(raw: unknown): ChatMessageDTO | null {
  if (!raw || typeof raw !== "object") return null;

  const envelope = raw as ChatMessageEnvelope;
  const msg =
    (envelope as { message?: ChatMessageDTO }).message ||
    (envelope as { data?: ChatMessageDTO }).data ||
    (envelope as ChatMessageDTO);

  if (msg == null || typeof msg !== "object") return null;
  if (msg.id == null || msg.body == null || String(msg.body).length === 0) {
    return null;
  }

  return {
    ...msg,
    id: typeof msg.id === "string" ? Number(msg.id) || (msg.id as unknown as number) : msg.id,
    senderId:
      typeof msg.senderId === "string"
        ? Number(msg.senderId)
        : msg.senderId,
    body: String(msg.body),
    createdAt: msg.createdAt || new Date().toISOString(),
  };
}

export function parseChatMessageFrame(body: string): ChatMessageDTO | null {
  try {
    return parseChatMessagePayload(JSON.parse(body));
  } catch {
    return null;
  }
}

export function messageMatchesSelection(
  msg: ChatMessageDTO,
  selection: { type: "channel" | "dm"; id: string | number } | null
): boolean {
  if (!selection) return false;
  if (selection.type === "channel") {
    return (
      msg.channelId !== undefined &&
      msg.channelId !== null &&
      String(msg.channelId) === String(selection.id)
    );
  }
  return (
    msg.dmThreadId !== undefined &&
    msg.dmThreadId !== null &&
    String(msg.dmThreadId) === String(selection.id)
  );
}

export function sortChatMessages(messages: ChatMessageDTO[]): ChatMessageDTO[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function upsertChatMessage(
  list: ChatMessageDTO[],
  incoming: ChatMessageDTO
): ChatMessageDTO[] {
  const incomingKey = String(incoming.id);
  const withoutDupes = list.filter((item) => {
    if (String(item.id) === incomingKey) return false;
    // Drop optimistic placeholder once the real message lands.
    if (
      item.clientStatus === "sending" &&
      item.body === incoming.body &&
      item.senderId === incoming.senderId
    ) {
      return false;
    }
    return true;
  });
  return sortChatMessages([...withoutDupes, incoming]);
}

/**
 * Normalize a channel display name into a URL-safe slug (e.g. "Dev Team" → "dev-team").
 */
export function slugifyChannelName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export const FALLBACK_GENERAL_CHANNEL = {
  id: "general",
  name: "general",
  slug: "general",
  scope: "WORKSPACE" as const,
  isDefault: true,
  description: "Workspace-wide conversation",
};
