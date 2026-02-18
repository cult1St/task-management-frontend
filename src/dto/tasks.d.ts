export type TaskPriority = "HIGH" | "MED" | "LOW";
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
  projectId?: number;
  projectName?: string;
  progress?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: number;
  projectId?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assigneeId?: number;
  projectId?: number;
  progress?: number;
}

export interface TaskFilters {
  scope?: "all" | "mine" | "team" | "overdue";
  projectId?: number;
  priority?: TaskPriority;
  search?: string;
}
