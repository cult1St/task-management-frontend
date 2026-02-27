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

export function formatMonthTitle(date: Date): string {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
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
