export type TeamMemberStatus = "ONLINE" | "AWAY" | "OFFLINE";

export interface TeamMemberDTO {
  id: number;
  name: string;
  role: string;
  status: TeamMemberStatus;
  tasksCount: number;
  projectsCount: number;
  completionRate: number;
  initials?: string;
  avatarUrl?: string;
}

export interface InviteMemberPayload {
  name: string;
  email: string;
  role: string;
}

export interface UpdateMemberPayload {
  role?: string;
  status?: TeamMemberStatus;
}
