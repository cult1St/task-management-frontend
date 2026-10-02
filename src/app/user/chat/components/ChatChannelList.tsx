"use client";

import { ChannelDTO } from "@/dto/chat";

type ChatChannelListProps = {
  channels: ChannelDTO[];
  selectedId: string | number | null;
  onSelect: (channel: ChannelDTO) => void;
  canCreate: boolean;
  onCreateClick: () => void;
};

export default function ChatChannelList({
  channels,
  selectedId,
  onSelect,
  canCreate,
  onCreateClick,
}: ChatChannelListProps) {
  return (
    <div className="chat-sidebar-section">
      <div className="chat-sidebar-section-header">
        <span>Channels</span>
        {canCreate ? (
          <button
            type="button"
            className="chat-sidebar-add"
            onClick={onCreateClick}
            aria-label="Create channel"
            title="Create channel"
          >
            +
          </button>
        ) : null}
      </div>
      <ul className="chat-sidebar-list">
        {channels.map((channel) => {
          const active = String(selectedId) === String(channel.id);
          return (
            <li key={String(channel.id)}>
              <button
                type="button"
                className={`chat-sidebar-item ${active ? "is-active" : ""}`}
                onClick={() => onSelect(channel)}
              >
                <span className="chat-hash">#</span>
                {channel.slug || channel.name}
                {channel.isDefault ? (
                  <span className="chat-default-badge">default</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
