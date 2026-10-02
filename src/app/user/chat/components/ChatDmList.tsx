"use client";

import { DmThreadDTO } from "@/dto/chat";

type ChatDmListProps = {
  dms: DmThreadDTO[];
  selectedId: string | number | null;
  onSelect: (dm: DmThreadDTO) => void;
};

export default function ChatDmList({ dms, selectedId, onSelect }: ChatDmListProps) {
  return (
    <div className="chat-sidebar-section">
      <div className="chat-sidebar-section-header">
        <span>Direct messages</span>
      </div>
      {dms.length === 0 ? (
        <p className="chat-sidebar-empty">No DMs yet. Message teammates once chat goes live.</p>
      ) : (
        <ul className="chat-sidebar-list">
          {dms.map((dm) => {
            const active = String(selectedId) === String(dm.id);
            const initials =
              dm.peerInitials ||
              dm.peerName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("") ||
              "?";

            return (
              <li key={String(dm.id)}>
                <button
                  type="button"
                  className={`chat-sidebar-item ${active ? "is-active" : ""}`}
                  onClick={() => onSelect(dm)}
                >
                  <span className="chat-dm-avatar">{initials}</span>
                  <span className="chat-dm-meta">
                    <span className="chat-dm-name">
                      {dm.peerName}
                      {dm.unreadCount ? (
                        <span className="chat-unread-badge">{dm.unreadCount}</span>
                      ) : null}
                    </span>
                    {dm.lastMessagePreview ? (
                      <span className="chat-dm-preview">{dm.lastMessagePreview}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
