export function ProjectProgress({ projects }: { projects: Project[] }) {
  return (
    <div className="progress-card">
      <div className="card-header" style={{ padding: "0 0 1rem" }}>
        <span className="card-title">📁 Project Progress</span>
      </div>
      <div>
        {projects.map((p, i) => (
          <div key={p.id}>
            <div className="progress-label">
              {p.name} <span>{p.percent}%</span>
            </div>
            <div
              className="progress-bar"
              style={i === projects.length - 1 ? { marginBottom: "0.25rem" } : undefined}
            >
              <div
                className={`progress-fill ${p.fillClass}`}
                style={{ width: `${p.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}