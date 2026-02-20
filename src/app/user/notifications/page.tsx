"use client";

import { useCallback, useEffect, useState } from "react";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import notificationsService from "@/services/notifications.service";
import { NotificationDTO } from "@/dto/notifications";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const loadNotifications = useCallback(async (unreadOnly: boolean) => {
    setIsLoading(true);
    try {
      const data = await notificationsService.list({ unreadOnly, limit: 50 });
      setNotifications(data || []);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load notifications.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadNotifications(showUnreadOnly);
  }, [loadNotifications, showUnreadOnly]);

  const handleMarkRead = async (notificationId: number) => {
    try {
      await notificationsService.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not update notification.";
      showToast(message, "error");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      showToast("All notifications marked as read.", "success");
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not mark notifications as read.";
      showToast(message, "error");
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Stay updated on invites, tasks, and project activity</p>
      </div>

      <div className="tasks-toolbar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${showUnreadOnly ? "active" : ""}`}
            onClick={() => setShowUnreadOnly(true)}
          >
            Unread
          </button>
          <button
            className={`filter-tab ${!showUnreadOnly ? "active" : ""}`}
            onClick={() => setShowUnreadOnly(false)}
          >
            All
          </button>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => void handleMarkAllRead()}>
          Mark all read
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {showUnreadOnly ? `Unread (${unreadCount})` : "Notification History"}
          </span>
        </div>
        <div style={{ padding: "1rem" }}>
          {isLoading ? (
            <div className="empty-state">
              <div className="empty-state-desc">Loading notifications...</div>
            </div>
          ) : notifications.length ? (
            notifications.map((item) => (
              <div
                key={item.id}
                className="task-item"
                style={
                  item.read
                    ? undefined
                    : {
                        border: "1px solid rgba(45,212,191,0.18)",
                        background: "rgba(45,212,191,0.04)",
                      }
                }
              >
                <div className="task-info">
                  <div className="task-name">{item.title || "Notification"}</div>
                  <div className="task-meta-row">
                    <span className="task-due">{item.message}</span>
                    <span className="task-due">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                {!item.read ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => void handleMarkRead(item.id)}
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            ))
          ) : (
              <div className="empty-state">
                <div className="empty-state-title">No notifications</div>
                <div className="empty-state-desc">You&apos;re all caught up.</div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
