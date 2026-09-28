export function logEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const payload = {
    event: eventName,
    properties: properties || {},
    timestamp: new Date().toISOString(),
  };

  // Local console for debugging
  console.debug("[Telemetry] event", payload);

  const endpoint = process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT;
  if (!endpoint) return;

  try {
    navigator.sendBeacon(
      endpoint,
      JSON.stringify(payload)
    );
  } catch {
    // ignore sendBeacon failures
  }
}

export function logError(error: unknown, context?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  // Ensure we can log non-serializable errors safely
  const message =
    error instanceof Error ? error.message : (error as { message?: string })?.message || String(error);

  console.error("[Telemetry] error", { message, context, error });

  const endpoint = process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT;
  if (!endpoint) return;

  try {
    navigator.sendBeacon(
      endpoint,
      JSON.stringify({
        event: "error",
        message,
        context: context || {},
        timestamp: new Date().toISOString(),
      })
    );
  } catch {
    // ignore sendBeacon failures
  }
}
