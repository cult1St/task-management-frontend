export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";

export interface WorkspaceDTO {
  id: number;
  name: string;
  slug?: string;
  createdAt?: string;
}

export interface CurrentWorkspaceDTO {
  workspace: WorkspaceDTO;
  role: WorkspaceRole;
}

/** Membership row returned by GET /workspaces */
export type WorkspaceMembershipDTO = CurrentWorkspaceDTO;

export interface UpdateWorkspacePayload {
  name: string;
}

export interface WorkspaceMemberDTO {
  userId: number;
  fullName: string;
  email?: string;
  role: WorkspaceRole;
  initials?: string;
  avatarUrl?: string;
  joinedAt?: string;
}

export interface WorkspaceInvitePayload {
  email: string;
  role?: WorkspaceRole;
}

export interface UpdateWorkspaceMemberPayload {
  role: WorkspaceRole;
}
