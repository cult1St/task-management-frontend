export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "REMOVED";

export interface ProjectInviteUserOptionDTO {
  id: number;
  fullName?: string;
  full_name?: string;
  name?: string;
  email: string;
}

export interface ProjectMemberDTO {
  id: number;
  userId: number;
  fullName?: string;
  full_name?: string;
  name?: string;
  email?: string;
  role?: string;
  status: InvitationStatus;
  joinedAt?: string;
}

export interface InviteProjectMemberPayload {
  invitedUserId: number;
  role?: string;
}

/** Workspace or (legacy) project invitation */
export interface ProjectInvitationDTO {
  id: number;
  /** Present for legacy project invites */
  projectId?: number;
  projectName?: string;
  /** Present for workspace invites */
  workspaceId?: number;
  workspaceName?: string;
  inviterId?: number;
  inviterName?: string;
  invitedUserId?: number;
  invitedUserName?: string;
  invitedUserEmail?: string;
  role?: string;
  status: InvitationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvitationFilters {
  status?: InvitationStatus;
  projectId?: number;
  workspaceId?: number;
}

export interface RespondToInvitationPayload {
  action: "ACCEPT" | "REJECT";
}
