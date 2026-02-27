export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export interface TaskDTO {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assigneeInitials?: string;
  assigneeName?: string;
  assignedToId?: number;
  creatorId?: number;
  createdById?: number;
  createdBy?: { id?: number | string };
  creator?: { id?: number | string };
  assignee?: { id?: number | string; userId?: number | string };
  projectId?: number;
  projectName?: string;
  progress?: number;
}

export interface ProjectAssigneeDTO {
  id: number;
  name: string;
  email?: string;
  role?: string;
  initials?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  status?: TaskStatus;
  assignedToId?: number;
  projectId?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assignedToId?: number;
  projectId?: number;
  progress?: number;
}

export interface TaskFilters {
  scope?: "all" | "mine" | "team" | "overdue";
  projectId?: number;
  priority?: TaskPriority;
  search?: string;
}
