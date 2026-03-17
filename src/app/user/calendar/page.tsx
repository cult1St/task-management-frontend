"use client";

import { useEffect, useMemo, useState } from "react";
import { logEvent } from "@/utils/telemetry";
import calendarService from "@/services/calendar.service";
import {
  CalendarEventDTO,
  CalendarEventFilters,
  CreateCalendarEventPayload,
} from "@/dto/calendar";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

import { toISODate, buildCalendarDays } from "@/utils/dateUtil";
import CalendarNav from "./components/CalendarNav";
import CalendarGrid from "./components/Calendargrid";
import TodayPanel from "./components/Todaypanel";
import UpcomingPanel from "./components/Upcomingpanel";
import CreateEventModal from "./components/Createeventmodal";

const EMPTY_DRAFT: CreateCalendarEventPayload = {
  title: "",
  date: toISODate(new Date()),   // ✅ now uses local time — no UTC shift
  startTime: "",
  endTime: "",
  color: "teal",
};

export default function CalendarPage() {
  const { toasts, showToast, removeToast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEventDTO[]>([]);
  const [search] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draftEvent, setDraftEvent] = useState<CreateCalendarEventPayload>(EMPTY_DRAFT);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDTO | null>(null);

  // ✅ todayISO derived from local date — fixes the off-by-one highlight
  const todayISO = toISODate(new Date());

  // ── Data fetching ────────────────────────────────────────────────────────────
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
        const message = (err as { message?: string })?.message || "Failed to load events.";
        showToast(message, "error");
      }
    };

    void load();
  }, [currentMonth, search, showToast]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const eventsByDate = useMemo(
    () =>
      events.reduce<Record<string, CalendarEventDTO[]>>((acc, event) => {
        acc[event.date] = acc[event.date] || [];
        acc[event.date].push(event);
        return acc;
      }, {}),
    [events]
  );

  const todaysEvents = eventsByDate[todayISO] || [];

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => e.date >= todayISO)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [events, todayISO]
  );

  // ── Month navigation ──────────────────────────────────────────────────────────
  const goToPrevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const goToNextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleDayClick = (_date: Date, iso: string) => {
    setSelectedEvent(null);
    setDraftEvent({ ...EMPTY_DRAFT, date: iso });
    setIsModalOpen(true);
  };

  // ── Event creation ────────────────────────────────────────────────────────────
  const handleSaveEvent = async () => {
    if (!draftEvent.title.trim()) {
      showToast("Event title is required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (selectedEvent) {
        const updated = await calendarService.update(selectedEvent.id, draftEvent);
        if (updated) {
          setEvents((prev) =>
            prev.map((event) => (event.id === selectedEvent.id ? updated : event))
          );
          showToast("Event updated!", "success");
          logEvent("calendar.event_updated", { eventId: updated.id });
        }
      } else {
        const created = await calendarService.create(draftEvent);
        if (created) {
          setEvents((prev) => [...prev, created]);
          showToast("Event created!", "success");
          logEvent("calendar.event_created", { eventId: created.id });
        }
      }

      setIsModalOpen(false);
      setSelectedEvent(null);
      setDraftEvent(EMPTY_DRAFT);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not save event. Please try again.";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    setIsDeleting(true);
    try {
      await calendarService.remove(selectedEvent.id);
      setEvents((prev) => prev.filter((event) => event.id !== selectedEvent.id));
      showToast("Event deleted.", "success");
      logEvent("calendar.event_deleted", { eventId: selectedEvent.id });
      setIsModalOpen(false);
      setSelectedEvent(null);
      setDraftEvent(EMPTY_DRAFT);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not delete event. Please try again.";
      showToast(message, "error");
      logEvent("calendar.event_delete_failed", { error: message });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <p className="page-subtitle">Tasks, deadlines and milestones</p>
      </div>

      <div className="calendar-layout">
        {/* ── Main grid ── */}
        <div className="calendar-main">
          <CalendarNav
            currentMonth={currentMonth}
            onPrev={goToPrevMonth}
            onNext={goToNextMonth}
          />
          <CalendarGrid
            calendarDays={calendarDays}
            eventsByDate={eventsByDate}
            todayISO={todayISO}
            onDayClick={handleDayClick}
            onEventClick={(event) => {
              setSelectedEvent(event);
              setDraftEvent({
                title: event.title,
                date: event.date,
                startTime: event.startTime || "",
                endTime: event.endTime || "",
                color: event.color || "teal",
                description: event.description || "",
              });
              setIsModalOpen(true);
            }}
          />
        </div>

        {/* ── Sidebar ── */}
        <div>
          <TodayPanel todaysEvents={todaysEvents} />
          <UpcomingPanel upcomingEvents={upcomingEvents} />
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <CreateEventModal
          draftEvent={draftEvent}
          isSaving={isSaving || isDeleting}
          onChange={setDraftEvent}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSubmit={handleSaveEvent}
          onDelete={selectedEvent ? handleDeleteEvent : undefined}
          isEditMode={Boolean(selectedEvent)}
        />
      )}
    </div>
  );
}
