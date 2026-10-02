import { Activity } from "lucide-react";
import { ActivityItem } from "@/dto/dashboard";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <Activity size={16} strokeWidth={1.75} aria-hidden className="inline-icon" />
          Recent Activity
        </span>
        <span style={{ fontSize: "0.78rem", color: "var(--slate-400)" }}>Today</span>
      </div>
      <div style={{ padding: "0.5rem 1.5rem" }}>
        {items.map((item) => (
          <div key={item.id} className="activity-item">
            <div
              className="activity-dot"
              style={{ background: `var(--${item.color}-400)` }}
            />
            <div>
              <div className="activity-text">
                <strong style={{ color: "var(--white)" }}>
                  {item.actorIsYou ? "You" : item.actor}
                </strong>{" "}
                {item.text}
              </div>
              <div className="activity-time">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
