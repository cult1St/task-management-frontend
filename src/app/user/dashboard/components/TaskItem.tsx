import { Task, Priority } from "@/dto/dashboard";

export function TaskItem({
  task,
  onToggle,
  canToggle = true,
}: {
  task: Task;
  onToggle: (id: number) => void;
  canToggle?: boolean;
}) {
  const priorityClass: Record<Priority, string> = {
    HIGH: "priority-high",
    MEDIUM: "priority-med",
    LOW: "priority-low",
  };

  return (
    <div className="task-item">
      <div
        className={`task-checkbox ${task.done ? "checked" : ""} ${
          canToggle ? "" : "disabled"
        }`}
        onClick={() => {
          if (!canToggle) return;
          onToggle(task.id);
        }}
        title={canToggle ? undefined : "Only the assignee can update status"}
      >
        {task.done && "✓"}
      </div>
      <div className="task-info">
        <div className={`task-name ${task.done ? "done" : ""}`}>{task.name}</div>
        <div className="task-meta-row">
          <span className={`task-priority ${priorityClass[task.priority]}`}>
            {task.priority}
          </span>
          <span className="task-due">
            📅 {task.due}
            {task.overdue && (
              <span style={{ color: "var(--rose-400)" }}> (overdue)</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
