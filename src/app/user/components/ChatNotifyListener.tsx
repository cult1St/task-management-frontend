"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useChatRealtime } from "@/context/chat-realtime-context";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import {
  ensureBrowserNotificationPermission,
  showBrowserNotification,
} from "@/utils/browserNotifications";
import type { ChatMessageDTO } from "@/dto/chat";

/**
 * App-shell listener: toasts + Chrome notifications for inbound chat
 * when the user is on dashboard / any non-chat page (or the tab is hidden).
 */
export default function ChatNotifyListener() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { subscribeUserChat } = useChatRealtime();
  const { toasts, showToast, removeToast } = useToast();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const currentUserId = (() => {
    if (!user?.id) return undefined;
    if (typeof user.id === "number") return user.id;
    const parsed = Number(user.id);
    return Number.isFinite(parsed) ? parsed : undefined;
  })();
  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  // Ask for Chrome notification permission once the shell is ready.
  useEffect(() => {
    if (!isAuthenticated) return;
    void ensureBrowserNotificationPermission();
  }, [isAuthenticated]);

  // Backup path: bell STOMP CHAT_MESSAGE notifications (when BE persists them).
  useEffect(() => {
    const onChatNotification = (event: Event) => {
      const detail = (event as CustomEvent<{ title: string; body: string }>).detail;
      if (!detail) return;
      const onChatPage = pathnameRef.current?.startsWith("/user/chat") ?? false;
      if (onChatPage && !document.hidden) return;

      showToast(`${detail.title}: ${detail.body}`, "info", 7000);
      void showBrowserNotification({
        title: detail.title,
        body: detail.body,
        tag: `notif-chat-${Date.now()}`,
        onClickUrl: "/user/chat",
      });
    };

    window.addEventListener("taskflow:chat-notification", onChatNotification);
    return () =>
      window.removeEventListener("taskflow:chat-notification", onChatNotification);
  }, [showToast]);

  useEffect(() => {
    if (!isAuthenticated || currentUserId == null) return;

    const notify = (msg: ChatMessageDTO) => {
      const me = currentUserIdRef.current;
      if (me != null && Number(msg.senderId) === Number(me)) return;

      const onChatPage = pathnameRef.current?.startsWith("/user/chat") ?? false;
      const shouldAlert = !onChatPage || document.hidden;
      if (!shouldAlert) return;

      const who = msg.senderName || "A teammate";
      const title = msg.dmThreadId
        ? `New message from ${who}`
        : `${who} sent a chat message`;
      const preview =
        msg.body.length > 120 ? `${msg.body.slice(0, 117)}…` : msg.body;

      showToast(`${title}: ${preview}`, "info", 7000);
      void showBrowserNotification({
        title,
        body: preview,
        tag: `chat-${msg.channelId ?? msg.dmThreadId ?? msg.id}`,
        onClickUrl: "/user/chat",
      });
    };

    return subscribeUserChat(notify);
  }, [isAuthenticated, currentUserId, subscribeUserChat, showToast]);

  return <ToastContainer toasts={toasts} onDismiss={removeToast} />;
}
