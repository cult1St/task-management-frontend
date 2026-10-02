const NOTIFICATION_PERMISSION_KEY = "chatNotificationPermissionAsked";

export function canUseBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensureBrowserNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!canUseBrowserNotifications()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  // Ask at most once per browser session unless user already decided.
  if (sessionStorage.getItem(NOTIFICATION_PERMISSION_KEY) === "1") {
    return Notification.permission;
  }
  sessionStorage.setItem(NOTIFICATION_PERMISSION_KEY, "1");
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function showBrowserNotification(options: {
  title: string;
  body: string;
  tag?: string;
  onClickUrl?: string;
}) {
  if (!canUseBrowserNotifications()) return;

  const permission = await ensureBrowserNotificationPermission();
  if (permission !== "granted") return;

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      tag: options.tag,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      if (options.onClickUrl) {
        window.location.href = options.onClickUrl;
      }
      notification.close();
    };
  } catch {
    // Ignore environments that block Notification construction.
  }
}
