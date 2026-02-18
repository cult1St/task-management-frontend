export function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: number) => void }) {
  const priorityClass: Record<Priority, string> = {
    HIGH: "priority-high",
    MED: "priority-med",
    LOW: "priority-low",
  };

  return (
    <div className="task-item">
      <div
        className={`task-checkbox ${task.done ? "checked" : ""}`}
        onClick={() => onToggle(task.id)}
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
