"use client";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const DEFAULT_WS_PATH = "/ws";

function resolveSocketUrl() {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit) return explicit;

  const base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!base) return DEFAULT_WS_PATH;

  try {
    const url = new URL(base);
    const path = url.pathname.replace(/\/?api\/v1\/?$/, "");
    url.pathname = `${path.replace(/\/$/, "")}${DEFAULT_WS_PATH}`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return `${base.replace(/\/$/, "")}${DEFAULT_WS_PATH}`;
  }
}

export function createStompClient() {
  if (typeof window === "undefined") {
    throw new Error("STOMP must be used only in the browser");
  }

  const socketUrl = resolveSocketUrl();
  const token = sessionStorage.getItem("authToken");

  const client = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: (message) => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug("[STOMP]", message);
      }
    },
  });

  return client;
}

export const notificationsDestination =
  process.env.NEXT_PUBLIC_WS_NOTIFICATIONS_DEST || "/user/queue/notifications";

