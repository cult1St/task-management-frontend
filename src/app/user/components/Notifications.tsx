"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { createStompClient, notificationsDestination } from "@/utils/stomp";
import notificationsService from "@/services/notifications.service";
import { NotificationDTO } from "@/dto/notifications";

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
    if (!userId) return;

    let isMounted = true;
    let client: Client | null = null;
    let subscription: StompSubscription | null = null;

    const handleMessage = (message: IMessage) => {
      // eslint-disable-next-line no-console
      console.debug("[Notifications] STOMP message received", message.body);
      try {
        const payload = JSON.parse(message.body || "{}");
        const notification =
          (payload as any)?.notification ??
          (payload as NotificationDTO | undefined);
        if (!notification?.id) return;

        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch {
        // ignore malformed messages
      }
    };

    try {
      client = createStompClient();
      client.onConnect = () => {
        if (!isMounted || !client) return;
        subscription = client.subscribe(notificationsDestination, handleMessage);
      };
      client.onStompError = (frame) => {
        // eslint-disable-next-line no-console
        console.warn("STOMP error", frame.headers["message"], frame.body);
      };
      client.onWebSocketClose = () => {
        // eslint-disable-next-line no-console
        console.warn("Notifications socket closed");
      };
      client.activate();
    } catch (err) {
      // Fallback: if real-time transport fails, we still function.
      // eslint-disable-next-line no-console
      console.warn("Realtime notifications unavailable", err);
    }

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
      if (client) client.deactivate();
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
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
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
