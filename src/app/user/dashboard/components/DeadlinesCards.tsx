export function DeadlinesCard({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <div className="card" style={{ marginBottom: "1.25rem" }}>
      <div className="card-header">
        <span className="card-title">⏰ Deadlines</span>
      </div>
      <div style={{ padding: "0.5rem 1.25rem" }}>
        {deadlines.map((d, i) => (
          <div
            key={d.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.6rem 0",
              borderBottom:
                i < deadlines.length - 1
                  ? "1px solid rgba(255,255,255,0.04)"
                  : undefined,
            }}
          >
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--slate-200)" }}>
                {d.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: d.whenColor }}>{d.when}</div>
            </div>
            <span className={`chip ${d.chipClass}`}>{d.chipLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}