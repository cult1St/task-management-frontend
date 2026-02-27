import { CalendarEventDTO } from "@/dto/calendar";

interface UpcomingPanelProps {
  upcomingEvents: CalendarEventDTO[];
}

export default function UpcomingPanel({ upcomingEvents }: UpcomingPanelProps) {
  return (
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
  );
}