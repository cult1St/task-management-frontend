

export function StatCard({
  variant,
  icon,
  value,
  label,
  change,
  changeDir,
}: {
  variant: string;
  icon: string;
  value: string | number;
  label: string;
  change: string;
  changeDir: "up" | "down";
}) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className={`stat-icon-wrap bg-${variant}`}>
        <span style={{ color: `var(--${variant}-400)` }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-change ${changeDir}`}>{change}</div>
    </div>
  );
}
