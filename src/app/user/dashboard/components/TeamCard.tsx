export function TeamCard({ members }: { members: TeamMember[] }) {
  const statusColor: Record<TeamMember["status"], string> = {
    Online: "var(--teal-400)",
    Away: "var(--slate-400)",
    Offline: "var(--slate-500)",
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">👥 Team</span>
        <button className="btn btn-secondary btn-sm">View All</button>
      </div>
      <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {members.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              className="user-avatar"
              style={{ width: 32, height: 32, fontSize: "0.72rem", ...m.avatarStyle }}
            >
              {m.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.82rem", color: "var(--slate-200)", fontWeight: 500 }}>
                {m.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: statusColor[m.status] }}>
                {m.role} · {m.status}
              </div>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--slate-400)" }}>
              {m.tasks} tasks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}