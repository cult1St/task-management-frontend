export interface Task {
  id: number;
  name: string;
  done: boolean;
  priority: Priority;
  due: string;
  overdue?: boolean;
}

export interface ActivityItem {
  id: number;
  actor: string;
  actorIsYou?: boolean;
  text: string;
  time: string;
  color: string;
}

export interface Project {
  id: number;
  name: string;
  percent: number;
  fillClass: string;
}

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Deadline {
  id: number;
  name: string;
  when: string;
  whenColor: string;
  chipLabel: string;
  chipClass: string;
}

export interface TeamMember {
  id: number;
  initials: string;
  name: string;
  role: string;
  status: "Online" | "Away" | "Offline";
  tasks: number;
  avatarStyle?: React.CSSProperties;
}