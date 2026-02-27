interface Task {
  id: number;
  name: string;
  done: boolean;
  priority: Priority;
  due: string;
  overdue?: boolean;
}

interface ActivityItem {
  id: number;
  actor: string;
  actorIsYou?: boolean;
  text: string;
  time: string;
  color: string;
}

interface Project {
  id: number;
  name: string;
  percent: number;
  fillClass: string;
}

type Priority = "HIGH" | "MEDIUM" | "LOW";

interface Deadline {
  id: number;
  name: string;
  when: string;
  whenColor: string;
  chipLabel: string;
  chipClass: string;
}

interface TeamMember {
  id: number;
  initials: string;
  name: string;
  role: string;
  status: "Online" | "Away" | "Offline";
  tasks: number;
  avatarStyle?: React.CSSProperties;
}