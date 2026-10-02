"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { useAuth } from "@/context/auth-context";
import type { ChatMessageDTO } from "@/dto/chat";
import { parseChatMessageFrame } from "@/utils/chat";
import { chatUserDestination, createStompClient } from "@/utils/stomp";

export type ChatRealtimeStatus = "connecting" | "live" | "offline";

type MessageHandler = (message: ChatMessageDTO) => void;

interface ChatRealtimeContextValue {
  status: ChatRealtimeStatus;
  /** Subscribe to /user/queue/chat (all chat events for this user). */
  subscribeUserChat: (handler: MessageHandler) => () => void;
  /** Subscribe to an arbitrary STOMP topic (e.g. channel topic). Shares the same client. */
  subscribeTopic: (destination: string, handler: MessageHandler) => () => void;
}

const ChatRealtimeContext = createContext<ChatRealtimeContextValue | undefined>(
  undefined
);

export function ChatRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<ChatRealtimeStatus>("offline");

  const clientRef = useRef<Client | null>(null);
  const userHandlersRef = useRef(new Set<MessageHandler>());
  const topicHandlersRef = useRef(
    new Map<string, { sub: StompSubscription | null; handlers: Set<MessageHandler> }>()
  );
  const userSubRef = useRef<StompSubscription | null>(null);

  const dispatchUser = useCallback((msg: ChatMessageDTO) => {
    userHandlersRef.current.forEach((handler) => {
      try {
        handler(msg);
      } catch {
        // ignore listener errors
      }
    });
  }, []);

  const dispatchTopic = useCallback((destination: string, msg: ChatMessageDTO) => {
    const entry = topicHandlersRef.current.get(destination);
    if (!entry) return;
    entry.handlers.forEach((handler) => {
      try {
        handler(msg);
      } catch {
        // ignore
      }
    });
  }, []);

  const ensureTopicSubscription = useCallback(
    (destination: string) => {
      const client = clientRef.current;
      let entry = topicHandlersRef.current.get(destination);
      if (!entry) {
        entry = { sub: null, handlers: new Set() };
        topicHandlersRef.current.set(destination, entry);
      }
      if (!client?.connected || entry.sub) return;

      entry.sub = client.subscribe(destination, (frame: IMessage) => {
        const msg = parseChatMessageFrame(frame.body);
        if (!msg) return;
        dispatchTopic(destination, msg);
      });
    },
    [dispatchTopic]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus("offline");
      return;
    }

    let cancelled = false;
    setStatus("connecting");

    try {
      const client = createStompClient();
      clientRef.current = client;

      client.onConnect = () => {
        if (cancelled) return;
        setStatus("live");

        try {
          userSubRef.current?.unsubscribe();
        } catch {
          // ignore
        }

        userSubRef.current = client.subscribe(
          chatUserDestination,
          (frame: IMessage) => {
            const msg = parseChatMessageFrame(frame.body);
            if (!msg) return;
            dispatchUser(msg);
          }
        );

        // Re-bind any topic listeners that registered before connect.
        topicHandlersRef.current.forEach((_, destination) => {
          ensureTopicSubscription(destination);
        });
      };

      client.onDisconnect = () => {
        if (!cancelled) setStatus("offline");
        userSubRef.current = null;
        topicHandlersRef.current.forEach((entry) => {
          entry.sub = null;
        });
      };

      client.onStompError = () => {
        if (!cancelled) setStatus("offline");
      };

      client.onWebSocketClose = () => {
        if (!cancelled) setStatus("offline");
      };

      client.activate();
    } catch {
      setStatus("offline");
    }

    return () => {
      cancelled = true;
      try {
        userSubRef.current?.unsubscribe();
        topicHandlersRef.current.forEach((entry) => {
          try {
            entry.sub?.unsubscribe();
          } catch {
            // ignore
          }
          entry.sub = null;
        });
        void clientRef.current?.deactivate();
      } catch {
        // ignore
      }
      userSubRef.current = null;
      clientRef.current = null;
    };
  }, [isAuthenticated, dispatchUser, ensureTopicSubscription]);

  const subscribeUserChat = useCallback((handler: MessageHandler) => {
    userHandlersRef.current.add(handler);
    return () => {
      userHandlersRef.current.delete(handler);
    };
  }, []);

  const subscribeTopic = useCallback(
    (destination: string, handler: MessageHandler) => {
      let entry = topicHandlersRef.current.get(destination);
      if (!entry) {
        entry = { sub: null, handlers: new Set() };
        topicHandlersRef.current.set(destination, entry);
      }
      entry.handlers.add(handler);
      ensureTopicSubscription(destination);

      return () => {
        const current = topicHandlersRef.current.get(destination);
        if (!current) return;
        current.handlers.delete(handler);
        if (current.handlers.size === 0) {
          try {
            current.sub?.unsubscribe();
          } catch {
            // ignore
          }
          topicHandlersRef.current.delete(destination);
        }
      };
    },
    [ensureTopicSubscription]
  );

  const value = useMemo(
    () => ({ status, subscribeUserChat, subscribeTopic }),
    [status, subscribeUserChat, subscribeTopic]
  );

  return (
    <ChatRealtimeContext.Provider value={value}>
      {children}
    </ChatRealtimeContext.Provider>
  );
}

export function useChatRealtime() {
  const context = useContext(ChatRealtimeContext);
  if (!context) {
    throw new Error("useChatRealtime must be used inside ChatRealtimeProvider");
  }
  return context;
}
