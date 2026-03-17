import { CalendarEventDTO, CalendarEventColor } from "@/dto/calendar";
import { toISODate } from "@/utils/dateUtil";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const COLOR_CLASS: Record<CalendarEventColor, string> = {
  teal: "tag-teal",
  violet: "tag-violet",
  rose: "tag-rose",
  amber: "tag-amber",
  blue: "",
};

interface CalendarGridProps {
  calendarDays: { date: Date; isCurrentMonth: boolean }[];
  eventsByDate: Record<string, CalendarEventDTO[]>;
  todayISO: string;
  onDayClick: (date: Date, iso: string) => void;
  onEventClick?: (event: CalendarEventDTO) => void;
}

export default function CalendarGrid({
  calendarDays,
  eventsByDate,
  todayISO,
  onDayClick,
  onEventClick,
}: CalendarGridProps) {
  return (
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
            className={`calendar-cell ${day.isCurrentMonth ? "" : "other-month"} ${
              iso === todayISO ? "today" : ""
            }`}
            role="button"
            tabIndex={0}
            onClick={() => onDayClick(day.date, iso)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onDayClick(day.date, iso);
              }
            }}
          >
            <div className="cell-num">{day.date.getDate()}</div>
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`cell-event ${event.color ? COLOR_CLASS[event.color] : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick?.(event);
                }}
              >
                {event.title}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
