export type ProjectStatus =
  | "ACTIVE"
  | "IN_REVIEW"
  | "PLANNING"
  | "PAUSED"
  | "COMPLETED"
  | "ARCHIVED";

export type ProjectType = "SOFTWARE" | "BUSINESS" | "MARKETING" | "CUSTOM";

export interface ProjectDTO {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  dueDate?: string;
  teamInitials?: string[];
  key?: string;
  projectType?: ProjectType;
  workspaceId?: number;
}

export interface CreateProjectPayload {
  name: string;
  key: string;
  description?: string;
  projectType?: ProjectType;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  key?: string;
  description?: string;
  projectType?: ProjectType;
  status?: ProjectStatus;
  progress?: number;
  dueDate?: string;
}
