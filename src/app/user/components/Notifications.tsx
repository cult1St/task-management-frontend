"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { createStompClient, notificationsDestination } from "@/utils/stomp";
import notificationsService from "@/services/notifications.service";
import { NotificationDTO } from "@/dto/notifications";

interface NotificationPayload {
  notification?: NotificationDTO;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = (() => {
    if (!user) return null;
    if (typeof user.id === "number") return user.id;
    const parsed = Number(user.id);
    return Number.isFinite(parsed) ? parsed : null;
  })();

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsService.unreadCount();
      setUnreadCount(count || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const loadLatestUnread = async () => {
    setLoading(true);
    try {
      const list = await notificationsService.list({ unreadOnly: true, limit: 6 });
      setNotifications(list || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUnreadCount();
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadLatestUnread();
  }, [open]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      const target = event.target as Node;
      if (!rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!userId) {
      console.warn("[Notifications] ❌ No userId, skipping WebSocket connection");
      return;
    }

    console.log("[Notifications] 🚀 Initializing WebSocket connection");
    console.log("[Notifications] 👤 userId:", userId);
    console.log("[Notifications] 📡 destination:", notificationsDestination);

    let isMounted = true;
    let client: Client | null = null;
    let subscription: StompSubscription | null = null;

    const handleMessage = (message: IMessage) => {
      console.debug("[Notifications] 📩 RAW MESSAGE:", message);
      console.debug("[Notifications] 📩 BODY:", message.body);

      try {
        const payload: NotificationPayload = JSON.parse(message.body || "{}");
        console.debug("[Notifications] ✅ Parsed payload:", payload);

        const notification =
          payload.notification ??
          (payload as NotificationDTO | undefined);

        if (!notification?.id) {
          console.warn("[Notifications] ⚠️ Invalid notification payload", payload);
          return;
        }
        if(notification?.userId != userId){
          return;
        }

        console.log("[Notifications] 🎉 New notification received:", notification);

        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Off-page chat alerts (dashboard, etc.) when BE emits CHAT_MESSAGE.
        if (notification.type === "CHAT_MESSAGE") {
          const title = notification.title || "New chat message";
          const body = notification.message || "";
          window.dispatchEvent(
            new CustomEvent("taskflow:chat-notification", {
              detail: { title, body, notification },
            })
          );
        }
      } catch (err) {
        console.error("[Notifications] ❌ Failed to parse message", err);
      }
    };

    try {
      client = createStompClient();

      console.log("[Notifications] 🧩 STOMP client created");

      client.onConnect = (frame) => {
        console.log("[Notifications] ✅ STOMP CONNECTED");
        console.log("[Notifications] 🔗 Connected frame:", frame);

        if (!isMounted || !client) {
          console.warn("[Notifications] ⚠️ Component unmounted before subscribe");
          return;
        }

        console.log("[Notifications] 📡 Subscribing to:", notificationsDestination);

        subscription = client.subscribe(notificationsDestination, handleMessage);

        console.log("[Notifications] ✅ Subscription created:", subscription?.id);
      };

      client.onDisconnect = () => {
        console.warn("[Notifications] 🔌 STOMP disconnected");
      };

      client.onStompError = (frame) => {
        console.error("[Notifications] ❌ STOMP ERROR");
        console.error("[Notifications] 🧾 Headers:", frame.headers);
        console.error("[Notifications] 🧾 Body:", frame.body);
      };

      client.onWebSocketClose = (event) => {
        console.warn("[Notifications] 🔌 WebSocket CLOSED");
        console.warn("[Notifications] 📉 Code:", event.code);
        console.warn("[Notifications] 📉 Reason:", event.reason);
      };

      client.onWebSocketError = (event) => {
        console.error("[Notifications] ❌ WebSocket ERROR", event);
      };

      client.beforeConnect = () => {
        console.log("[Notifications] ⏳ Attempting STOMP connection...");
      };

      client.debug = (msg) => {
        console.debug("[STOMP DEBUG]", msg);
      };

      console.log("[Notifications] ⚡ Activating client...");
      client.activate();
    } catch (err) {
      console.error("[Notifications] ❌ Failed to initialize WebSocket", err);
    }

    return () => {
      console.log("[Notifications] 🧹 Cleaning up WebSocket");

      isMounted = false;

      if (subscription) {
        console.log("[Notifications] 📴 Unsubscribing:", subscription.id);
        subscription.unsubscribe();
      }

      if (client) {
        console.log("[Notifications] 🔌 Deactivating client");
        client.deactivate();
      }
    };
  }, [userId]);

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount]);

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationsService.markRead(notificationId);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // keep UI usable even when API fails
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // keep UI usable even when API fails
    }
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        className="notif-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={1.75} aria-hidden />
        {hasUnread ? <span className="notif-dot" /> : null}
        {hasUnread ? (
          <span className="notif-count" aria-live="polite">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="notif-dropdown open">
          <div className="notif-header">
            <span className="notif-title">Unread Notifications</span>
            <button className="notif-mark" onClick={() => void markAllRead()}>
              Mark all read
            </button>
          </div>

          {loading ? (
            <div className="notif-item">
              <div className="notif-text">
                <div className="notif-msg">Loading notifications...</div>
              </div>
            </div>
          ) : notifications.length ? (
            notifications.map((notif) => (
              <button
                key={notif.id}
                className="notif-item unread"
                onClick={() => void markAsRead(notif.id)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                }}
              >
                <div className="notif-text">
                  <div className="notif-msg">{notif.message}</div>
                  <div className="notif-time">{formatRelativeTime(notif.createdAt)}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="notif-item">
              <div className="notif-text">
                <div className="notif-msg">No unread notifications</div>
              </div>
            </div>
          )}

          <div
            className="notif-header"
            style={{ borderBottom: "none", borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Link href="/user/notifications" onClick={() => setOpen(false)} className="notif-mark">
              View more
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
