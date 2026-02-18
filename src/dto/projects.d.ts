export type ProjectStatus = "ACTIVE" | "IN_REVIEW" | "PLANNING" | "PAUSED" | "COMPLETED" | "ARCHIVED";

export interface ProjectDTO {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  dueDate?: string;
  teamInitials?: string[];
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  progress?: number;
  dueDate?: string;
}
