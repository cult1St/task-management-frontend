import { TaskDTO, TaskPriority, TaskStatus } from "@/dto/tasks";

type KanbanBoardProps = {
  groupedTasks: Record<TaskStatus, TaskDTO[]>;
  statusLabels: Record<TaskStatus, string>;
  statusColors: Record<TaskStatus, string>;
  priorityClass: Record<TaskPriority, string>;
  onDropTask: (taskId: number, status: TaskStatus) => void;
  onOpenEdit: (task: TaskDTO) => void;
  canDrag: (task: TaskDTO) => boolean;
  onAddTask: (status: TaskStatus) => void;
};

export default function KanbanBoard({
  groupedTasks,
  statusLabels,
  statusColors,
  priorityClass,
  onDropTask,
  onOpenEdit,
  canDrag,
  onAddTask,
}: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
        <div
          className="kanban-col"
          key={status}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const taskId = Number(event.dataTransfer.getData("taskId"));
            if (taskId) {
              onDropTask(taskId, status);
            }
          }}
        >
          <div className="kanban-col-header">
            <div className="col-indicator" style={{ background: statusColors[status] }} />
            <span className="col-title">{statusLabels[status]}</span>
            <span className="col-count">{groupedTasks[status].length}</span>
          </div>
          <div className="kanban-tasks">
            {groupedTasks[status].map((task) => (
              <div
                key={task.id}
                className="kanban-task"
                draggable={canDrag(task)}
                onDragStart={(event) => {
                  event.dataTransfer.setData("taskId", String(task.id));
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span className="dp-tag tag-violet">{task.projectName || "Task"}</span>
                  <span className={`task-priority ${priorityClass[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="kanban-task-title">{task.title}</div>
                {task.progress ? (
                  <div style={{ margin: "0.5rem 0" }}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--slate-400)",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Progress
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill fill-teal"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                ) : null}
                <div className="kanban-task-footer">
                  <span className="kanban-task-due">Due: {task.dueDate || "No due date"}</span>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div className="dp-avatar avatar-a">{task.assigneeInitials || "NA"}</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenEdit(task)}>
                      Update
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="kanban-add" onClick={() => onAddTask(status)}>
            + Add task
          </button>
        </div>
      ))}
    </div>
  );
}
