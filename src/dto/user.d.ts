export interface UserDetailsDTO{
    id:number,
    fullName:string,
    email:string,
    last_login_at: string,
}
export interface UserProfilePayload {
  fullName: string;
  email: string;
  roleTitle: string;
  avatarUrl?: string;
}

export interface NotificationPreferencesPayload {
  taskAssignments: boolean;
  deadlineReminders: boolean;
  teamActivity: boolean;
  weeklyDigestEmail: boolean;
}

export interface SecuritySettingsPayload {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
}

export interface AppearanceSettingsPayload {
  compactSidebar: boolean;
  reduceMotion: boolean;
}

export interface IntegrationSettingsPayload {
  githubConnected: boolean;
  slackConnected: boolean;
  jiraConnected: boolean;
}

export interface WorkspaceSettingsPayload {
  workspaceName: string;
}

export interface UserSettingsPayload {
  notifications: NotificationPreferencesPayload;
  security: SecuritySettingsPayload;
  appearance: AppearanceSettingsPayload;
  integrations: IntegrationSettingsPayload;
  workspace: WorkspaceSettingsPayload;
}