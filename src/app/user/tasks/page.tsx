"use client";

import { useEffect, useMemo, useState } from "react";
import { logEvent } from "@/utils/telemetry";
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

const DEFAULT_DRAFT_TASK: CreateTaskPayload = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
  status: "TODO",
  projectId: undefined,
  assignedToId: undefined,
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
  const [draftTask, setDraftTask] = useState<CreateTaskPayload>(DEFAULT_DRAFT_TASK);
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
      const message = (err as { message?: string })?.message || "Failed to load projects.";
      showToast(message, "error");
    } finally {
      setIsProjectsLoading(false);
    }
  };

  const openCreateModal = (status?: TaskStatus) => {
    setDraftTask((prev) => ({
      ...prev,
      status: status ?? prev.status ?? "TODO",
    }));
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
  };

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

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditTask(null);
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
        const message = (err as { message?: string })?.message || "Failed to load tasks.";
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
        logEvent("task.created", {
          id: created.id,
          projectId: created.projectId,
          priority: created.priority,
        });
      }
      closeCreateModal();
      setDraftTask(DEFAULT_DRAFT_TASK);
      setProjectAssignees([]);
    } catch (err) {
      const message = (err as { message?: string })?.message || "Could not create task.";
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

    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
    try {
      await tasksService.update(taskId, { status }, "status");
      showToast("Task updated", "success");
      logEvent("task.status_updated", { taskId, status });
    } catch (err) {
      const message = (err as { message?: string })?.message || "Failed to update task.";
      showToast(message, "error");
      logEvent("task.status_update_failed", { taskId, status, error: message });
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
      const updated = await tasksService.update(editTask.id, payload);
      if (updated) {
        setTasks((prev) => prev.map((task) => (task.id === editTask.id ? updated : task)));
        logEvent("task.updated", { taskId: updated.id, changes: payload });
      }
      showToast("Task updated", "success");
      closeEditModal();
    } catch (err) {
      const message = (err as { message?: string })?.message || "Failed to update task.";
      showToast(message, "error");
      logEvent("task.update_failed", { taskId: editTask.id, error: message });
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

      <TaskToolbar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        projects={projects}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        view={view}
        onViewChange={setView}
        onAddTask={() => openCreateModal()}
      />

      {view === "kanban" ? (
        <KanbanBoard
          groupedTasks={groupedTasks}
          statusLabels={STATUS_LABELS}
          statusColors={STATUS_COLOR}
          priorityClass={PRIORITY_CLASS}
          onDropTask={(taskId, status) => void handleDrop(taskId, status)}
          onOpenEdit={(task) => void openEditModal(task)}
          canDrag={(task) =>
            currentUserId !== undefined && currentUserId === getAssigneeId(task)
          }
          onAddTask={(status) => openCreateModal(status)}
        />
      ) : (
        <TaskList
          tasks={tasks}
          priorityClass={PRIORITY_CLASS}
          onOpenEdit={(task) => void openEditModal(task)}
        />
      )}

      <TaskCreateModal
        isOpen={isModalOpen}
        isSaving={isSaving}
        draftTask={draftTask}
        projects={projects}
        projectAssignees={projectAssignees}
        isProjectsLoading={isProjectsLoading}
        isAssigneesLoading={isAssigneesLoading}
        onClose={closeCreateModal}
        onCreate={() => void handleCreateTask()}
        onDraftChange={updateDraftTask}
      />

      <TaskEditModal
        isOpen={isEditModalOpen}
        isUpdating={isUpdating}
        editTask={editTask}
        editForm={editForm}
        projectAssignees={projectAssignees}
        isAssigneesLoading={isAssigneesLoading}
        currentUserId={currentUserId}
        getAssigneeId={getAssigneeId}
        getCreatorId={getCreatorId}
        onClose={closeEditModal}
        onSave={() => void handleUpdateTask()}
        onEditChange={updateEditForm}
      />
    </div>
  );
}
