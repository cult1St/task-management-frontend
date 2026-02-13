"use client";

import type Echo from "laravel-echo";
import type Pusher from "pusher-js";

/**
 * Extend globalThis safely (no `any`)
 */
declare global {
  // eslint-disable-next-line no-var
  var __NEXT_ECHO__: Echo | undefined;
}

/**
 * Runtime-only Echo loader.
 * - No SSR evaluation
 * - Fully typed
 * - Cached singleton
 */
export async function getEchoInstance(): Promise<Echo> {
  if (typeof window === "undefined") {
    throw new Error("Echo must be used only in the browser");
  }

  if (globalThis.__NEXT_ECHO__) {
    return globalThis.__NEXT_ECHO__;
  }

  // Dynamic imports (runtime only)
  const [{ default: Pusher }, { default: EchoConstructor }] = await Promise.all(
    [import("pusher-js"), import("laravel-echo")]
  );

  // Make Pusher available globally (required by Echo)
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

  const authUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/broadcasting/auth`;
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null;
  console.log("[Echo] Initializing with auth endpoint:", authUrl);
  const echo = new EchoConstructor({
    broadcaster: "pusher",

    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,

    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST!,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),

    forceTLS: false,
    encrypted: false,

    enabledTransports: ["ws"],
    disableStats: true,

    // Required by pusher-js even for Reverb
    cluster: "mt1",

    //  IMPORTANT: prevent Next.js default auth URL
    authEndpoint: authUrl,

    //auth headers
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
    },
  });

  // --- Optional debug hooks (still type-safe) ---
  const connector = echo.connector;

  if (connector && "pusher" in connector && connector.pusher?.connection) {
    connector.pusher.connection.bind("connected", () => {
      console.debug("[Echo] Pusher connected");
    });

    connector.pusher.connection.bind("error", (error) => {
      console.error("[Echo] Pusher error", error);
    });

    connector.pusher.connection.bind("state_change", (states) => {
      console.debug("[Echo] State change", states);
    });
  }

  globalThis.__NEXT_ECHO__ = echo;
  return echo;
}
