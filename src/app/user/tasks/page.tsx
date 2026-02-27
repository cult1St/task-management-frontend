"use client";

import { useEffect, useMemo, useState } from "react";
import tasksService from "@/services/tasks.service";
import projectsService from "@/services/projects.service";
import {
  CreateTaskPayload,
  ProjectAssigneeDTO,
  TaskDTO,
  TaskPriority,
  TaskStatus,
} from "@/dto/tasks";
import { ProjectDTO } from "@/dto/projects";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/context/auth-context";
import TaskToolbar from "@/app/user/tasks/components/TaskToolbar";
import KanbanBoard from "@/app/user/tasks/components/KanbanBoard";
import TaskList from "@/app/user/tasks/components/TaskList";
import TaskCreateModal from "@/app/user/tasks/components/TaskCreateModal";
import TaskEditModal from "@/app/user/tasks/components/TaskEditModal";

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
  MEDIUM: "priority-med",
  LOW: "priority-low",
};

export default function TasksPage() {
  const { toasts, showToast, removeToast } = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [projectAssignees, setProjectAssignees] = useState<ProjectAssigneeDTO[]>([]);
  const [isAssigneesLoading, setIsAssigneesLoading] = useState(false);

  const [activeFilter, setActiveFilter] = useState<"all" | "mine" | "team" | "overdue">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const [projectFilter, setProjectFilter] = useState<number | "ALL">("ALL");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [draftTask, setDraftTask] = useState<CreateTaskPayload>({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    status:"TODO",
    projectId: undefined,
    assignedToId: undefined,
  });
  const [editTask, setEditTask] = useState<TaskDTO | null>(null);
  const [editForm, setEditForm] = useState<{
    status?: TaskStatus;
    progress?: number;
    assignedToId?: number;
  }>({});

  const currentUserId = (() => {
    if (typeof user?.id === "string") {
      const parsed = Number(user.id);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return typeof user?.id === "number" ? user.id : undefined;
  })();

  const parseId = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const getCreatorId = (task: TaskDTO) => {
    return (
      parseId(task.creatorId) ??
      parseId(task.createdById) ??
      parseId(task.creator?.id) ??
      parseId(task.createdBy?.id)
    );
  };

  const getAssigneeId = (task: TaskDTO) => {
    return (
      parseId(task.assignedToId) ??
      parseId(task.assignee?.id) ??
      parseId(task.assignee?.userId)
    );
  };

  const loadProjects = async () => {
    setIsProjectsLoading(true);
    try {
      const projectList = await projectsService.list();
      setProjects(projectList || []);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load projects.";
      showToast(message, "error");
    } finally {
      setIsProjectsLoading(false);
    }
  };

  const openStatusTaskModal = (status: TaskStatus) => {
    setDraftTask((prev) => ({...prev, status:status}) );
    return setIsModalOpen(true);
  }

  const updateDraftTask = (partial: Partial<CreateTaskPayload>) => {
    setDraftTask((prev) => ({ ...prev, ...partial }));
  };

  const updateEditForm = (partial: { status?: TaskStatus; progress?: number; assignedToId?: number }) => {
    setEditForm((prev) => ({ ...prev, ...partial }));
  };

  const openEditModal = async (task: TaskDTO) => {
    setEditTask(task);
    setEditForm({
      status: task.status,
      progress: typeof task.progress === "number" ? task.progress : undefined,
      assignedToId: getAssigneeId(task),
    });
    setIsEditModalOpen(true);

    if (task.projectId) {
      setIsAssigneesLoading(true);
      try {
        const assignees = await tasksService.listProjectAssignees(task.projectId);
        setProjectAssignees(assignees || []);
      } catch {
        try {
          const members = await projectsService.listMembers(task.projectId, "ACCEPTED");
          const mapped = (members || []).map((member) => ({
            id: member.userId,
            name:
              member.fullName ||
              member.full_name ||
              member.name ||
              member.email ||
              `User ${member.userId}`,
            email: member.email,
            role: member.role,
          }));
          setProjectAssignees(mapped);
        } catch {
          setProjectAssignees([]);
        }
      } finally {
        setIsAssigneesLoading(false);
      }
    } else {
      setProjectAssignees([]);
    }
  };

  useEffect(() => {
    void loadProjects();
    // load once for options and filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const taskList = await tasksService.list({
          scope: activeFilter,
          projectId: projectFilter === "ALL" ? undefined : projectFilter,
          priority: priorityFilter === "ALL" ? undefined : priorityFilter,
          search: undefined,
        });
        setTasks(taskList || []);
      } catch (err) {
        const message =
          (err as { message?: string })?.message || "Failed to load tasks.";
        showToast(message, "error");
      }
    };

    void loadTasks();
  }, [activeFilter, priorityFilter, projectFilter, showToast]);

  useEffect(() => {
    if (!isModalOpen) return;
    if (!projects.length) {
      void loadProjects();
    }
    // refresh project options when opening modal and list is empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, projects.length]);

  useEffect(() => {
    if (projectFilter === "ALL") return;
    const exists = projects.some((project) => project.id === projectFilter);
    if (!exists) {
      setProjectFilter("ALL");
    }
  }, [projectFilter, projects]);

  useEffect(() => {
    if (!draftTask.projectId) return;
    const exists = projects.some((project) => project.id === draftTask.projectId);
    if (!exists) {
      setDraftTask((prev) => ({
        ...prev,
        projectId: undefined,
        assignedToId: undefined,
      }));
      setProjectAssignees([]);
    }
  }, [draftTask.projectId, projects]);

  useEffect(() => {
    const projectId = draftTask.projectId;

    if (!projectId) {
      setProjectAssignees([]);
      return;
    }

    const loadAssignees = async () => {
      setIsAssigneesLoading(true);
      try {
        const assignees = await tasksService.listProjectAssignees(projectId);
        setProjectAssignees(assignees || []);
      } catch {
        try {
          const members = await projectsService.listMembers(projectId, "ACCEPTED");
          const mapped = (members || []).map((member) => ({
            id: member.userId,
            name:
              member.fullName ||
              member.full_name ||
              member.name ||
              member.email ||
              `User ${member.userId}`,
            email: member.email,
            role: member.role,
          }));
          setProjectAssignees(mapped);
        } catch (err) {
          const message =
            (err as { message?: string })?.message ||
            "Could not load project collaborators.";
          showToast(message, "error");
          setProjectAssignees([]);
        }
      } finally {
        setIsAssigneesLoading(false);
      }
    };

    void loadAssignees();
  }, [draftTask.projectId, showToast]);

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

    if (!draftTask.projectId) {
      showToast("Select a project first.", "error");
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
        priority: "MEDIUM",
        dueDate: "",
        projectId: undefined,
        assignedToId: undefined,
      });
      setProjectAssignees([]);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not create task.";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrop = async (taskId: number, status: TaskStatus) => {
    const target = tasks.find((task) => task.id === taskId);
    const assigneeId = target ? getAssigneeId(target) : undefined;
    const canUpdateStatus =
      currentUserId !== undefined && assigneeId !== undefined && currentUserId === assigneeId;

    if (!canUpdateStatus) {
      showToast("Only the assignee can change task status.", "error");
      return;
    }

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

  const handleUpdateTask = async () => {
    if (!editTask) return;

    const creatorId = getCreatorId(editTask);
    const assigneeId = getAssigneeId(editTask);
    const canReassign =
      currentUserId !== undefined && creatorId !== undefined && currentUserId === creatorId;
    const canUpdateStatus =
      currentUserId !== undefined && assigneeId !== undefined && currentUserId === assigneeId;

    const payload: Record<string, unknown> = {};
    if (canUpdateStatus && editForm.status) {
      payload.status = editForm.status;
    }

    if (canUpdateStatus && typeof editForm.progress === "number") {
      const clamped = Math.max(0, Math.min(100, editForm.progress));
      payload.progress = clamped;
    }

    if (canReassign && typeof editForm.assignedToId === "number") {
      payload.assignedToId = editForm.assignedToId;
    }

    if (!Object.keys(payload).length) {
      showToast("No allowed changes for your role on this task.", "error");
      return;
    }

    setIsUpdating(true);
    try {
      console.log("second one");
      const updated = await tasksService.update(editTask.id, payload);
      if (updated) {
        setTasks((prev) =>
          prev.map((task) => (task.id === editTask.id ? updated : task))
        );
      }
      showToast("Task updated", "success");
      setIsEditModalOpen(false);
      setEditTask(null);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to update task.";
      showToast(message, "error");
    } finally {
      setIsUpdating(false);
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
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <div className="view-toggle" style={{ marginLeft: "auto" }}>
          <button
            className={`view-btn ${view === "kanban" ? "active" : ""}`}
            data-tip="Kanban"
            onClick={() => setView("kanban")}
          >
            KB
          </button>
          <button
            className={`view-btn ${view === "list" ? "active" : ""}`}
            data-tip="List"
            onClick={() => setView("list")}
          >
            LS
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
                    draggable={currentUserId !== undefined && currentUserId === getAssigneeId(task)}
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
                      <span className="kanban-task-due">Due: {task.dueDate || "No due date"}</span>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <div className="dp-avatar avatar-a">{task.assigneeInitials || "NA"}</div>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => void openEditModal(task)}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="kanban-add" onClick={() => openStatusTaskModal(status)}>
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
                    <span className="task-due">Due: {task.dueDate || "No due date"}</span>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => void openEditModal(task)}
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
                x
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
                    <option value="MEDIUM">Medium</option>
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
                  <label className="form-label">Project *</label>
                  <select
                    className="form-input select-input"
                    value={draftTask.projectId || ""}
                    disabled={isProjectsLoading}
                    onChange={(event) =>
                      setDraftTask((prev) => ({
                        ...prev,
                        projectId: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                        assignedToId: undefined,
                      }))
                    }
                  >
                    <option value="">
                      {isProjectsLoading ? "Loading projects..." : "Select project"}
                    </option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {!isProjectsLoading && !projects.length ? (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--slate-400)",
                        marginTop: "0.4rem",
                      }}
                    >
                      No projects found. Create a project first, then add tasks under it.
                    </div>
                  ) : null}
                </div>

                {draftTask.projectId ? (
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select
                      className="form-input select-input"
                      value={draftTask.assignedToId || ""}
                      onChange={(event) =>
                        setDraftTask((prev) => ({
                          ...prev,
                          assignedToId: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        }))
                      }
                      disabled={isAssigneesLoading}
                    >
                      <option value="">
                        {isAssigneesLoading
                          ? "Loading collaborators..."
                          : "Unassigned"}
                      </option>
                      {projectAssignees.map((assignee) => (
                        <option key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </option>
                      ))}
                    </select>
                    {!isAssigneesLoading && !projectAssignees.length ? (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--slate-400)",
                          marginTop: "0.4rem",
                        }}
                      >
                        No collaborators in this project yet. Invite from Projects page.
                      </div>
                    ) : null}
                  </div>
                ) : null}
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

      {isEditModalOpen && editTask ? (
        <div className="modal-backdrop open" id="taskEditModal">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Update Task</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditTask(null);
                }}
              >
                x
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  marginBottom: "1rem",
                  color: "var(--slate-400)",
                  fontSize: "0.85rem",
                }}
              >
                {editTask.title} • {editTask.projectName || "No project"}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input select-input"
                    value={editForm.status || editTask.status}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: event.target.value as TaskStatus,
                      }))
                    }
                    disabled={
                      !currentUserId ||
                      currentUserId !== getAssigneeId(editTask)
                    }
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="form-input"
                    value={
                      typeof editForm.progress === "number"
                        ? editForm.progress
                        : editTask.progress ?? ""
                    }
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        progress:
                          event.target.value === "" ? undefined : Number(event.target.value),
                      }))
                    }
                    disabled={
                      !currentUserId ||
                      currentUserId !== getAssigneeId(editTask)
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Reassign To</label>
                  <select
                    className="form-input select-input"
                    value={editForm.assignedToId ?? getAssigneeId(editTask) ?? ""}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        assignedToId: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                    disabled={
                      !currentUserId ||
                      currentUserId !== getCreatorId(editTask)
                    }
                  >
                    <option value="">
                      {isAssigneesLoading ? "Loading collaborators..." : "Unassigned"}
                    </option>
                    {projectAssignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!currentUserId ? (
                <div
                  style={{
                    marginTop: "0.5rem",
                    color: "var(--slate-400)",
                    fontSize: "0.8rem",
                  }}
                >
                  Sign in to update tasks.
                </div>
              ) : null}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditTask(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdateTask}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
