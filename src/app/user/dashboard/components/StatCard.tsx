
import type { LucideIcon } from "lucide-react";

export function StatCard({
  variant,
  icon: Icon,
  value,
  label,
  change,
  changeDir,
}: {
  variant: string;
  icon: LucideIcon;
  value: string | number;
  label: string;
  change: string;
  changeDir: "up" | "down";
}) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className={`stat-icon-wrap bg-${variant}`}>
        <Icon
          size={20}
          strokeWidth={1.75}
          style={{ color: `var(--${variant}-400)` }}
          aria-hidden
        />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-change ${changeDir}`}>{change}</div>
    </div>
  );
}
