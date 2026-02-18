"use client";

import { useEffect, useMemo, useState } from "react";
import calendarService from "@/services/calendar.service";
import {
  CalendarEventDTO,
  CalendarEventFilters,
  CalendarEventColor,
  CreateCalendarEventPayload,
} from "@/dto/calendar";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const COLOR_CLASS: Record<CalendarEventColor, string> = {
  teal: "tag-teal",
  violet: "tag-violet",
  rose: "tag-rose",
  amber: "tag-amber",
  blue: "",
};

function formatMonthTitle(date: Date) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEventDTO[]>([]);
  const [search] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftEvent, setDraftEvent] = useState<CreateCalendarEventPayload>({
    title: "",
    date: toISODate(new Date()),
    startTime: "",
    endTime: "",
    color: "teal",
  });

  useEffect(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const filters: CalendarEventFilters = {
      start: toISODate(start),
      end: toISODate(end),
      search: search || undefined,
    };

    const load = async () => {
      try {
        const data = await calendarService.list(filters);
        setEvents(data || []);
      } catch (err) {
        const message =
          (err as { message?: string })?.message || "Failed to load events.";
        showToast(message, "error");
      }
    };

    void load();
  }, [currentMonth, search, showToast]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = new Date(year, month, 1 - firstDay.getDay());
    const endDay = new Date(year, month, lastDay.getDate() + (6 - lastDay.getDay()));

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
  }, [currentMonth]);

  const todayISO = toISODate(new Date());
  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEventDTO[]>>((acc, event) => {
      acc[event.date] = acc[event.date] || [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, [events]);

  const todaysEvents = eventsByDate[todayISO] || [];
  const upcomingEvents = events
    .filter((event) => event.date >= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handleCreateEvent = async () => {
    if (!draftEvent.title.trim()) {
      showToast("Event title is required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const created = await calendarService.create(draftEvent);
      if (created) {
        setEvents((prev) => [...prev, created]);
        showToast("Event created!", "success");
      }
      setIsModalOpen(false);
      setDraftEvent({
        title: "",
        date: toISODate(new Date()),
        startTime: "",
        endTime: "",
        color: "teal",
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not create event.";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <p className="page-subtitle">Tasks, deadlines and milestones</p>
      </div>

      <div className="calendar-layout">
        <div className="calendar-main">
          <div className="calendar-nav">
            <button
              className="calendar-nav-btn"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                )
              }
            >
              ‹
            </button>
            <div className="calendar-title">{formatMonthTitle(currentMonth)}</div>
            <button
              className="calendar-nav-btn"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                )
              }
            >
              ›
            </button>
          </div>
          <div className="calendar-grid">
            {DAY_LABELS.map((label) => (
              <div key={label} className="calendar-day-header">
                {label}
              </div>
            ))}
            {calendarDays.map((day) => {
              const iso = toISODate(day.date);
              const dayEvents = eventsByDate[iso] || [];
              return (
                <div
                  key={iso}
                  className={`calendar-cell ${
                    day.isCurrentMonth ? "" : "other-month"
                  } ${iso === todayISO ? "today" : ""}`}
                >
                  <div className="cell-num">{day.date.getDate()}</div>
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`cell-event ${
                        event.color ? COLOR_CLASS[event.color] : ""
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div className="card-header">
              <span className="card-title">
                Today — {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              {todaysEvents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-title">No events today</div>
                  <div className="empty-state-desc">Add an event to get started.</div>
                </div>
              ) : (
                todaysEvents.map((event, index) => (
                  <div
                    key={event.id}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      padding: "0.75rem 0",
                      borderBottom:
                        index < todaysEvents.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "3px",
                        background: "var(--amber-400)",
                        borderRadius: "3px",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 500,
                          color: "var(--white)",
                        }}
                      >
                        {event.title}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--slate-400)" }}>
                        {event.startTime || "--"} — {event.endTime || "--"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Upcoming</span>
            </div>
            <div
              style={{
                padding: "0.75rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {upcomingEvents.length === 0 ? (
                <div className="empty-state-desc">No upcoming events.</div>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      padding: "0.4rem 0",
                    }}
                  >
                    <span style={{ color: "var(--slate-200)" }}>{event.title}</span>
                    <span style={{ color: "var(--teal-400)", fontWeight: 500 }}>
                      {event.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop open">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create New Event</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sprint Planning"
                  value={draftEvent.title}
                  onChange={(event) =>
                    setDraftEvent((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={draftEvent.date}
                    onChange={(event) =>
                      setDraftEvent((prev) => ({ ...prev, date: event.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <select
                    className="form-input select-input"
                    value={draftEvent.color}
                    onChange={(event) =>
                      setDraftEvent((prev) => ({
                        ...prev,
                        color: event.target.value as CalendarEventColor,
                      }))
                    }
                  >
                    <option value="teal">Teal</option>
                    <option value="violet">Violet</option>
                    <option value="rose">Rose</option>
                    <option value="amber">Amber</option>
                    <option value="blue">Blue</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={draftEvent.startTime || ""}
                    onChange={(event) =>
                      setDraftEvent((prev) => ({ ...prev, startTime: event.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={draftEvent.endTime || ""}
                    onChange={(event) =>
                      setDraftEvent((prev) => ({ ...prev, endTime: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={draftEvent.description || ""}
                  onChange={(event) =>
                    setDraftEvent((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateEvent}
                disabled={isSaving}
              >
                {isSaving ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
