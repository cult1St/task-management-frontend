"use client";

import { useState } from "react";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Sara Kim completed "API Integration Test"', time: "5 min ago", unread: true },
    { id: 2, text: 'Task "User Authentication" is due tomorrow', time: "2 hours ago", unread: true },
    { id: 3, text: 'Marcus commented on "Dashboard Design"', time: "Yesterday", unread: false },
  ]);

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  return (
    <div style={{ position: "fixed", top: 70, right: "1rem", zIndex: 201 }}>
      <button onClick={() => setOpen(!open)}>🔔</button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            <button onClick={markAllRead}>Mark all read</button>
          </div>

          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${notif.unread ? "unread" : ""}`}
            >
              <div className="notif-text">
                <div className="notif-msg">{notif.text}</div>
                <div className="notif-time">{notif.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
