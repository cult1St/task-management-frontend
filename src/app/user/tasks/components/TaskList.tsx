import { TaskDTO, TaskPriority } from "@/dto/tasks";

type TaskListProps = {
  tasks: TaskDTO[];
  priorityClass: Record<TaskPriority, string>;
  onOpenEdit: (task: TaskDTO) => void;
};

export default function TaskList({ tasks, priorityClass, onOpenEdit }: TaskListProps) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Task List</span>
      </div>
      <div style={{ padding: "1rem" }}>
        {tasks.map((task) => (
          <div key={task.id} className="task-item">
            <div className="task-info">
              <div className="task-name">{task.title}</div>
              <div className="task-meta-row">
                <span className={`task-priority ${priorityClass[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="task-due">Due: {task.dueDate || "No due date"}</span>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onOpenEdit(task)}>
              Update
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
