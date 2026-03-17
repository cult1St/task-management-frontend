/**
 * Returns today's date as YYYY-MM-DD using LOCAL time (not UTC).
 * Using toISOString() shifts to UTC and can return the wrong date
 * for timezones ahead of UTC (e.g. Lagos UTC+1).
 */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseBackendDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;

  if (typeof value === "number" && Number.isFinite(value)) {
    // Backend may return a timestamp in milliseconds
    return new Date(value);
  }

  if (typeof value === "string") {
    // Prefer ISO strings; also accept numeric string timestamps
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && value.trim().length >= 8) {
      return new Date(numeric);
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function formatShortDate(value: unknown): string {
  const date = parseBackendDate(value);
  if (!date) return "No date";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDateTime(value: unknown): string {
  const date = parseBackendDate(value);
  if (!date) return "Unknown";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(value: unknown): string {
  const date = parseBackendDate(value);
  if (!date) return "just now";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
}

export function formatMonthTitle(date: Date): string {
  return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export function buildCalendarDays(
  currentMonth: Date
): { date: Date; isCurrentMonth: boolean }[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = new Date(year, month, 1 - firstDay.getDay());
  const endDay = new Date(
    year,
    month,
    lastDay.getDate() + (6 - lastDay.getDay())
  );

  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  const cursor = new Date(startDay);
  while (cursor <= endDay) {
    days.push({
      date: new Date(cursor),
      isCurrentMonth: cursor.getMonth() === month,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
