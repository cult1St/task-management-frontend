"use client";

import { useEffect, useRef } from "react";
import { ChatMessageDTO } from "@/dto/chat";

type ChatMessageListProps = {
  messages: ChatMessageDTO[];
  currentUserId?: number;
  isLoading: boolean;
  emptyHint?: string;
};

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessageList({
  messages,
  currentUserId,
  isLoading,
  emptyHint,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="chat-messages">
        <div className="chat-messages-empty">
          <p>Loading messages…</p>
        </div>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="chat-messages">
        <div className="chat-messages-empty">
          <p>No messages yet</p>
          <p className="chat-messages-empty-sub">
            {emptyHint || "Say hello — be the first to post here."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages chat-messages-scroll">
      <ul className="chat-message-list">
        {messages.map((message) => {
          const mine =
            currentUserId !== undefined && message.senderId === currentUserId;
          const initials =
            message.senderInitials ||
            message.senderName
              ?.split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join("") ||
            "?";

          return (
            <li
              key={message.id}
              className={`chat-message-row ${mine ? "is-mine" : ""}`}
            >
              <div className="chat-message-avatar">{initials}</div>
              <div className="chat-message-bubble">
                <div className="chat-message-meta">
                  <span className="chat-message-author">
                    {mine ? "You" : message.senderName || "Member"}
                  </span>
                  <span className="chat-message-time">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <p className="chat-message-body">{message.body}</p>
                {message.clientStatus === "sending" ? (
                  <span className="chat-message-status">Sending…</span>
                ) : null}
                {message.clientStatus === "failed" ? (
                  <span className="chat-message-status is-failed">Failed to send</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <div ref={bottomRef} />
    </div>
  );
}
