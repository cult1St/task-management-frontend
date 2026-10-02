"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import chatService from "@/services/chat.service";
import {
  ChannelDTO,
  ChatMessageDTO,
  ChatSelection,
  DmThreadDTO,
} from "@/dto/chat";
import { useAuth } from "@/context/auth-context";
import { useWorkspace } from "@/context/workspace-context";
import { useChatRealtime } from "@/context/chat-realtime-context";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import {
  FALLBACK_GENERAL_CHANNEL,
  messageMatchesSelection,
  sortChatMessages,
  upsertChatMessage,
} from "@/utils/chat";
import { chatChannelTopic } from "@/utils/stomp";
import ChatChannelList from "./components/ChatChannelList";
import ChatDmList from "./components/ChatDmList";
import ChatMessageList from "./components/ChatMessageList";
import CreateChannelModal from "./components/CreateChannelModal";
import StartDmModal from "./components/StartDmModal";

type LiveStatus = "connecting" | "live" | "polling";

function sortChannels(channels: ChannelDTO[]): ChannelDTO[] {
  return [...channels].sort((a, b) => {
    if (a.isDefault || a.slug === "general") return -1;
    if (b.isDefault || b.slug === "general") return 1;
    return (a.slug || a.name).localeCompare(b.slug || b.name);
  });
}

export default function ChatPage() {
  const { user } = useAuth();
  const { workspace, canManageWorkspace } = useWorkspace();
  const { status: realtimeStatus, subscribeUserChat, subscribeTopic } =
    useChatRealtime();
  const { toasts, showToast, removeToast } = useToast();

  const [channels, setChannels] = useState<ChannelDTO[]>([FALLBACK_GENERAL_CHANNEL]);
  const [dms, setDms] = useState<DmThreadDTO[]>([]);
  const [selection, setSelection] = useState<ChatSelection | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [draft, setDraft] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDmOpen, setIsDmOpen] = useState(false);
  const [isStartingDm, setIsStartingDm] = useState(false);

  const selectionRef = useRef<ChatSelection | null>(null);
  selectionRef.current = selection;

  const currentUserId = (() => {
    if (!user?.id) return undefined;
    if (typeof user.id === "number") return user.id;
    const parsed = Number(user.id);
    return Number.isFinite(parsed) ? parsed : undefined;
  })();
  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  const liveStatus: LiveStatus =
    realtimeStatus === "live"
      ? "live"
      : realtimeStatus === "connecting"
        ? "connecting"
        : "polling";

  const applyIncomingMessage = useCallback((msg: ChatMessageDTO) => {
    const sel = selectionRef.current;
    const matches = messageMatchesSelection(msg, sel);
    const fromSelf =
      currentUserIdRef.current != null &&
      Number(msg.senderId) === Number(currentUserIdRef.current);

    if (matches) {
      setMessages((prev) => upsertChatMessage(prev, msg));
    }

    if (msg.dmThreadId != null) {
      setDms((prev) => {
        const exists = prev.some(
          (thread) => String(thread.id) === String(msg.dmThreadId)
        );
        if (!exists) return prev;
        return prev.map((thread) =>
          String(thread.id) === String(msg.dmThreadId)
            ? {
                ...thread,
                lastMessagePreview: msg.body,
                lastMessageAt: msg.createdAt,
                unreadCount:
                  !matches && !fromSelf
                    ? (thread.unreadCount || 0) + 1
                    : thread.unreadCount,
              }
            : thread
        );
      });
    }
  }, []);

  const loadChat = useCallback(async () => {
    setIsLoading(true);
    try {
      const [channelData, dmData] = await Promise.all([
        chatService.listChannels().catch(() => null),
        chatService.listDms().catch(() => null),
      ]);

      const nextChannels = sortChannels(
        channelData && channelData.length
          ? channelData
          : [FALLBACK_GENERAL_CHANNEL]
      );
      setChannels(nextChannels);
      setDms(dmData || []);

      setSelection((prev) => {
        if (prev) return prev;
        const general =
          nextChannels.find((c) => c.isDefault || c.slug === "general") ||
          nextChannels[0];
        if (!general) return null;
        return {
          type: "channel",
          id: general.id,
          title: `#${general.slug || general.name}`,
        };
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChat();
  }, [loadChat]);

  const loadMessages = useCallback(
    async (sel: ChatSelection, opts?: { soft?: boolean }) => {
      if (!opts?.soft) setIsLoadingMessages(true);
      try {
        const data =
          sel.type === "channel"
            ? await chatService.listChannelMessages(sel.id, { limit: 50 })
            : await chatService.listDmMessages(sel.id, { limit: 50 });
        const next = sortChatMessages(data || []);
        setMessages((prev) => {
          const pending = prev.filter(
            (m) => m.clientStatus === "sending" || m.clientStatus === "failed"
          );
          let merged = next;
          for (const item of pending) {
            merged = upsertChatMessage(merged, item);
          }
          return merged;
        });
      } catch (err) {
        if (!opts?.soft) {
          setMessages([]);
          const message =
            (err as { message?: string })?.message || "Could not load messages.";
          showToast(message, "error");
        }
      } finally {
        if (!opts?.soft) setIsLoadingMessages(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (!selection) {
      setMessages([]);
      return;
    }
    void loadMessages(selection);
  }, [selection, loadMessages]);

  // Adaptive soft poll: 2s only when realtime is down; slow backup when live.
  useEffect(() => {
    if (!selection) return;
    const intervalMs = liveStatus === "live" ? 15000 : 2000;
    const timer = window.setInterval(() => {
      void loadMessages(selection, { soft: true });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [selection, loadMessages, liveStatus]);

  useEffect(() => {
    return subscribeUserChat(applyIncomingMessage);
  }, [subscribeUserChat, applyIncomingMessage]);

  useEffect(() => {
    if (!workspace?.id || selection?.type !== "channel") return;
    const destination = chatChannelTopic(workspace.id, selection.id);
    return subscribeTopic(destination, applyIncomingMessage);
  }, [
    workspace?.id,
    selection?.type,
    selection?.id,
    subscribeTopic,
    applyIncomingMessage,
  ]);

  useEffect(() => {
    if (selection?.type !== "dm") return;
    setDms((prev) =>
      prev.map((thread) =>
        String(thread.id) === String(selection.id)
          ? { ...thread, unreadCount: 0 }
          : thread
      )
    );
  }, [selection]);

  const selectedChannelId =
    selection?.type === "channel" ? selection.id : null;
  const selectedDmId = selection?.type === "dm" ? selection.id : null;

  const headerSubtitle = useMemo(() => {
    if (!selection) return "Select a channel or DM";
    if (selection.type === "channel") {
      const channel = channels.find((c) => String(c.id) === String(selection.id));
      return channel?.description || "Workspace channel";
    }
    return "Direct message";
  }, [selection, channels]);

  const liveLabel =
    liveStatus === "live"
      ? "Live"
      : liveStatus === "connecting"
        ? "Connecting…"
        : "Syncing…";

  const handleCreateChannel = async (payload: {
    name: string;
    description?: string;
  }) => {
    setIsCreating(true);
    try {
      const created = await chatService.createChannel(payload);
      if (created) {
        setChannels((prev) => sortChannels([...prev, created]));
        setSelection({
          type: "channel",
          id: created.id,
          title: `#${created.slug || created.name}`,
        });
        showToast("Channel created.", "success");
        setIsCreateOpen(false);
      }
    } catch (err) {
      const status = (err as { status?: number })?.status;
      const message =
        (err as { message?: string })?.message ||
        (status === 403
          ? "Only workspace owners and admins can create channels."
          : "Could not create channel.");
      showToast(message, "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartDm = async (peerUserId: number) => {
    setIsStartingDm(true);
    try {
      const thread = await chatService.startDm({ peerUserId });
      if (thread) {
        setDms((prev) => {
          const exists = prev.some((item) => String(item.id) === String(thread.id));
          return exists
            ? prev.map((item) =>
                String(item.id) === String(thread.id) ? thread : item
              )
            : [thread, ...prev];
        });
        setSelection({
          type: "dm",
          id: thread.id,
          title: thread.peerName,
        });
        setIsDmOpen(false);
        showToast(`Opened chat with ${thread.peerName}.`, "success");
      }
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not start DM.";
      showToast(message, "error");
    } finally {
      setIsStartingDm(false);
    }
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selection || isSending) return;

    const body = draft.trim();
    if (!body) return;

    const tempId = `tmp-${Date.now()}`;
    const optimistic: ChatMessageDTO = {
      id: tempId,
      body,
      senderId: currentUserId ?? -1,
      senderName: user?.fullName || user?.full_name || user?.name || "You",
      createdAt: new Date().toISOString(),
      clientStatus: "sending",
      ...(selection.type === "channel"
        ? { channelId: Number(selection.id) || undefined }
        : { dmThreadId: Number(selection.id) || undefined }),
    };

    setMessages((prev) => upsertChatMessage(prev, optimistic));
    setDraft("");
    setIsSending(true);

    try {
      const sent =
        selection.type === "channel"
          ? await chatService.sendChannelMessage(selection.id, { body })
          : await chatService.sendDmMessage(selection.id, { body });

      if (!sent) {
        throw new Error("Message was not returned by the server.");
      }

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => String(m.id) !== tempId);
        return upsertChatMessage(withoutTemp, { ...sent, clientStatus: undefined });
      });

      if (selection.type === "dm") {
        setDms((prev) =>
          prev.map((thread) =>
            String(thread.id) === String(selection.id)
              ? {
                  ...thread,
                  lastMessagePreview: sent.body,
                  lastMessageAt: sent.createdAt,
                }
              : thread
          )
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === tempId ? { ...m, clientStatus: "failed" } : m
        )
      );
      const message =
        (err as { message?: string })?.message || "Could not send message.";
      showToast(message, "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-page">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header chat-page-header">
        <div>
          <h1 className="page-title">Chat</h1>
          <p className="page-subtitle">
            {workspace?.name
              ? `Conversations in ${workspace.name}`
              : "Workspace channels and direct messages"}
          </p>
        </div>
        <div className="chat-page-header-actions">
          <span
            className={`chat-live-pill chat-live-pill--${liveStatus}`}
            title="Realtime connection status"
          >
            <span className="chat-live-dot" aria-hidden />
            {liveLabel}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsDmOpen(true)}
          >
            + New DM
          </button>
        </div>
      </div>

      <div className="chat-layout">
        <aside className="chat-sidebar">
          {isLoading ? (
            <p className="chat-sidebar-empty">Loading…</p>
          ) : (
            <>
              <ChatChannelList
                channels={channels}
                selectedId={selectedChannelId}
                onSelect={(channel) =>
                  setSelection({
                    type: "channel",
                    id: channel.id,
                    title: `#${channel.slug || channel.name}`,
                  })
                }
                canCreate={canManageWorkspace}
                onCreateClick={() => setIsCreateOpen(true)}
              />
              <ChatDmList
                dms={dms}
                selectedId={selectedDmId}
                onSelect={(dm) =>
                  setSelection({
                    type: "dm",
                    id: dm.id,
                    title: dm.peerName,
                  })
                }
              />
            </>
          )}
        </aside>

        <section className="chat-main">
          {selection ? (
            <>
              <header className="chat-main-header">
                <div>
                  <h2 className="chat-main-title">{selection.title}</h2>
                  <p className="chat-main-sub">{headerSubtitle}</p>
                </div>
              </header>

              <ChatMessageList
                messages={messages}
                currentUserId={currentUserId}
                isLoading={isLoadingMessages}
              />

              <form className="chat-composer" onSubmit={(e) => void handleSend(e)}>
                <input
                  className="form-input chat-composer-input"
                  placeholder={`Message ${selection.title}`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={isSending}
                  maxLength={5000}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSending || !draft.trim()}
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div className="chat-messages-empty">
              <p>Select a channel to get started</p>
            </div>
          )}
        </section>
      </div>

      <CreateChannelModal
        isOpen={isCreateOpen}
        isSaving={isCreating}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateChannel}
      />

      <StartDmModal
        isOpen={isDmOpen}
        isSaving={isStartingDm}
        currentUserId={currentUserId}
        onClose={() => setIsDmOpen(false)}
        onSubmit={handleStartDm}
      />
    </div>
  );
}
