import { CalendarEventDTO } from "@/dto/calendar";

interface TodayPanelProps {
  todaysEvents: CalendarEventDTO[];
}

export default function TodayPanel({ todaysEvents }: TodayPanelProps) {
  const label = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="card" style={{ marginBottom: "1.25rem" }}>
      <div className="card-header">
        <span className="card-title">Today — {label}</span>
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
  );
}