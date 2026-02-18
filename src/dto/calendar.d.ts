export type CalendarEventColor = "teal" | "violet" | "rose" | "amber" | "blue";

export interface CalendarEventDTO {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  color?: CalendarEventColor;
  description?: string;
}

export interface CreateCalendarEventPayload {
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color?: CalendarEventColor;
  description?: string;
}

export interface UpdateCalendarEventPayload {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  color?: CalendarEventColor;
  description?: string;
}

export interface CalendarEventFilters {
  start?: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
  search?: string;
}
