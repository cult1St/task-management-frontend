"use client";

import { useEffect, useMemo, useState } from "react";
import tasksService from "@/services/tasks.service";
import projectsService from "@/services/projects.service";
import { CreateTaskPayload, TaskDTO, TaskPriority, TaskStatus } from "@/dto/tasks";
import { ProjectDTO } from "@/dto/projects";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  BACKLOG: "var(--slate-400)",
  TODO: "var(--amber-400)",
  IN_PROGRESS: "var(--teal-400)",
  DONE: "#4ade80",
};

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  HIGH: "priority-high",
  MED: "priority-med",
  LOW: "priority-low",
};

export default function TasksPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const assignees = [
    { id: 1, name: "Alex Johnson" },
    { id: 2, name: "Sara Kim" },
    { id: 3, name: "Marcus Lee" },
  ];
  const [activeFilter, setActiveFilter] = useState<"all" | "mine" | "team" | "overdue">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const [projectFilter, setProjectFilter] = useState<number | "ALL">("ALL");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftTask, setDraftTask] = useState<CreateTaskPayload>({
    title: "",
    description: "",
    priority: "MED",
    dueDate: "",
    projectId: undefined,
    assigneeId: undefined,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [taskList, projectList] = await Promise.all([
          tasksService.list({
            scope: activeFilter,
            projectId: projectFilter === "ALL" ? undefined : projectFilter,
            priority: priorityFilter === "ALL" ? undefined : priorityFilter,
            search: undefined,
          }),
          projectsService.list(),
        ]);

        setTasks(taskList || []);
        setProjects(projectList || []);
      } catch (err) {
        const message =
          (err as { message?: string })?.message || "Failed to load tasks.";
        showToast(message, "error");
      }
    };

    void load();
  }, [activeFilter, priorityFilter, projectFilter, showToast]);

  const groupedTasks = useMemo(() => {
    return tasks.reduce<Record<TaskStatus, TaskDTO[]>>(
      (acc, task) => {
        acc[task.status] = acc[task.status] || [];
        acc[task.status].push(task);
        return acc;
      },
      {
        BACKLOG: [],
        TODO: [],
        IN_PROGRESS: [],
        DONE: [],
      }
    );
  }, [tasks]);

  const handleCreateTask = async () => {
    if (!draftTask.title.trim()) {
      showToast("Task title is required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const created = await tasksService.create(draftTask);
      if (created) {
        setTasks((prev) => [created, ...prev]);
        showToast("Task created!", "success");
      }
      setIsModalOpen(false);
      setDraftTask({
        title: "",
        description: "",
        priority: "MED",
        dueDate: "",
        projectId: undefined,
        assigneeId: undefined,
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not create task.";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrop = async (taskId: number, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
    try {
      await tasksService.update(taskId, { status });
      showToast("Task updated", "success");
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to update task.";
      showToast(message, "error");
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Task Board</h1>
        <p className="page-subtitle">Drag and drop tasks to update their status</p>
      </div>

      <div className="tasks-toolbar">
        <div className="filter-tabs">
          {[
            { value: "all", label: "All" },
            { value: "mine", label: "Mine" },
            { value: "team", label: "Team" },
            { value: "overdue", label: "Overdue" },
          ].map((filter) => (
            <button
              key={filter.value}
              className={`filter-tab ${activeFilter === filter.value ? "active" : ""}`}
              onClick={() => setActiveFilter(filter.value as typeof activeFilter)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <select
          className="select-input"
          value={projectFilter}
          onChange={(e) =>
            setProjectFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
          }
        >
          <option value="ALL">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          className="select-input"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "ALL")}
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MED">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <div className="view-toggle" style={{ marginLeft: "auto" }}>
          <button
            className={`view-btn ${view === "kanban" ? "active" : ""}`}
            data-tip="Kanban"
            onClick={() => setView("kanban")}
          >
            ⊞
          </button>
          <button
            className={`view-btn ${view === "list" ? "active" : ""}`}
            data-tip="List"
            onClick={() => setView("list")}
          >
            ≡
          </button>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          + Add Task
        </button>
      </div>

      {view === "kanban" ? (
        <div className="kanban-board">
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
            <div
              className="kanban-col"
              key={status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const taskId = Number(event.dataTransfer.getData("taskId"));
                if (taskId) {
                  void handleDrop(taskId, status);
                }
              }}
            >
              <div className="kanban-col-header">
                <div className="col-indicator" style={{ background: STATUS_COLOR[status] }} />
                <span className="col-title">{STATUS_LABELS[status]}</span>
                <span className="col-count">{groupedTasks[status].length}</span>
              </div>
              <div className="kanban-tasks">
                {groupedTasks[status].map((task) => (
                  <div
                    key={task.id}
                    className="kanban-task"
                    draggable
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
                      <span className={`task-priority ${PRIORITY_CLASS[task.priority]}`}>
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
                      <span className="kanban-task-due">
                        📅 {task.dueDate || "No due date"}
                      </span>
                      <div className="dp-avatar avatar-a">
                        {task.assigneeInitials || "NA"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="kanban-add" onClick={() => setIsModalOpen(true)}>
                + Add task
              </button>
            </div>
          ))}
        </div>
      ) : (
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
                    <span className={`task-priority ${PRIORITY_CLASS[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="task-due">📅 {task.dueDate || "No due date"}</span>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => void handleDrop(task.id, task.status)}
                >
                  Update
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen ? (
        <div className="modal-backdrop open" id="taskModal">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create New Task</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Design new onboarding flow"
                  value={draftTask.title}
                  onChange={(event) =>
                    setDraftTask((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Add task details..."
                  value={draftTask.description}
                  onChange={(event) =>
                    setDraftTask((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input select-input"
                    value={draftTask.priority}
                    onChange={(event) =>
                      setDraftTask((prev) => ({
                        ...prev,
                        priority: event.target.value as TaskPriority,
                      }))
                    }
                  >
                    <option value="HIGH">High</option>
                    <option value="MED">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={draftTask.dueDate || ""}
                    onChange={(event) =>
                      setDraftTask((prev) => ({ ...prev, dueDate: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select
                    className="form-input select-input"
                    value={draftTask.assigneeId || ""}
                    onChange={(event) =>
                      setDraftTask((prev) => ({
                        ...prev,
                        assigneeId: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                  >
                    <option value="">Select assignee</option>
                    {assignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select
                    className="form-input select-input"
                    value={draftTask.projectId || ""}
                    onChange={(event) =>
                      setDraftTask((prev) => ({
                        ...prev,
                        projectId: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateTask}
                disabled={isSaving}
              >
                {isSaving ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
