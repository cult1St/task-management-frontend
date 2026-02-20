"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
      <button className="notif-btn" onClick={() => setOpen((prev) => !prev)}>
        N
        {hasUnread ? <span className="notif-dot" /> : null}
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
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
