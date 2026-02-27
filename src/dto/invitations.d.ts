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

export interface ProjectInvitationDTO {
  id: number;
  projectId: number;
  projectName: string;
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
}

export interface RespondToInvitationPayload {
  action: "ACCEPT" | "REJECT";
}
