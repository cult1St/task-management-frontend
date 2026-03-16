"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import tasksService from "@/services/tasks.service";
import projectsService from "@/services/projects.service";
import notificationsService from "@/services/notifications.service";
import { TaskDTO } from "@/dto/tasks";
import { ProjectDTO } from "@/dto/projects";
import { NotificationDTO } from "@/dto/notifications";
import { ProjectMemberDTO } from "@/dto/invitations";
import {
  StatCard,
  ActivityFeed,
  DeadlinesCard,
  ProjectProgress,
  TaskItem,
  TeamCard,
} from "./components";

const PROJECT_FILL_CLASSES = ["fill-teal", "fill-violet", "fill-amber", "fill-rose"] as const;

const formatShortDate = (value?: string) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
};

const toInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TF";

const getDeadlineMeta = (dateValue?: string) => {
  if (!dateValue) {
    return {
      when: "No due date",
      whenColor: "var(--slate-400)",
      chipLabel: "Backlog",
      chipClass: "tag-violet",
    };
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return {
      when: "No due date",
      whenColor: "var(--slate-400)",
      chipLabel: "Backlog",
      chipClass: "tag-violet",
    };
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = date.getTime() - startOfToday.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return {
      when: `${formatShortDate(dateValue)} (overdue)`,
      whenColor: "var(--rose-400)",
      chipLabel: "Overdue",
      chipClass: "tag-rose",
    };
  }

  if (diffDays === 0) {
    return {
      when: "Today",
      whenColor: "var(--rose-400)",
      chipLabel: "Urgent",
      chipClass: "tag-rose",
    };
  }

  if (diffDays === 1) {
    return {
      when: "Tomorrow",
      whenColor: "var(--amber-400)",
      chipLabel: "Soon",
      chipClass: "tag-amber",
    };
  }

  if (diffDays <= 7) {
    return {
      when: formatShortDate(dateValue),
      whenColor: "var(--amber-400)",
      chipLabel: "Upcoming",
      chipClass: "tag-amber",
    };
  }

  return {
    when: formatShortDate(dateValue),
    whenColor: "var(--slate-400)",
    chipLabel: "On Track",
    chipClass: "tag-teal",
  };
};

const mapNotificationColor = (type: NotificationDTO["type"]) => {
  switch (type) {
    case "TASK_ASSIGNED":
      return "teal";
    case "TASK_UPDATED":
      return "violet";
    case "PROJECT_INVITE_SENT":
      return "amber";
    case "PROJECT_INVITE_ACCEPTED":
      return "teal";
    case "PROJECT_INVITE_REJECTED":
      return "rose";
    default:
      return "rose";
  }
};

const buildTaskList = (tasks: TaskDTO[]) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return [...tasks]
    .sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .slice(0, 6)
    .map((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const overdue =
        Boolean(dueDate) &&
        !Number.isNaN(dueDate?.getTime()) &&
        task.status !== "DONE" &&
        dueDate!.getTime() < startOfToday;

      return {
        id: task.id,
        name: task.title,
        done: task.status === "DONE",
        priority: task.priority,
        due: formatShortDate(task.dueDate),
        overdue,
      };
    });
};

const buildProjectList = (projects: ProjectDTO[]) =>
  projects.slice(0, 4).map((project, index) => ({
    id: project.id,
    name: project.name,
    percent: Math.min(100, Math.max(0, project.progress || 0)),
    fillClass: PROJECT_FILL_CLASSES[index % PROJECT_FILL_CLASSES.length],
  }));

const buildDeadlines = (tasks: TaskDTO[]) => {
  const candidates = tasks
    .filter((task) => task.status !== "DONE")
    .filter((task) => task.dueDate)
    .sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .slice(0, 4);

  return candidates.map((task) => {
    const meta = getDeadlineMeta(task.dueDate);
    return {
      id: task.id,
      name: task.title,
      ...meta,
    };
  });
};

const buildActivityItems = (notifications: NotificationDTO[]) =>
  notifications.slice(0, 6).map((notif) => ({
    id: notif.id,
    actor: notif.actorName || "System",
    actorIsYou: notif.actorName?.toLowerCase() === "you",
    text: notif.message,
    time: formatRelativeTime(notif.createdAt),
    color: mapNotificationColor(notif.type),
  }));

const loadProjectMembers = async (projects: ProjectDTO[], tasks: TaskDTO[]) => {
  if (!projects.length) return [] as TeamMember[];

  const tasksByAssignee = tasks.reduce<Record<number, number>>((acc, task) => {
    if (task.assignedToId) {
      acc[task.assignedToId] = (acc[task.assignedToId] || 0) + 1;
    }
    return acc;
  }, {});

  const memberLists = await Promise.all(
    projects.slice(0, 3).map((project) =>
      projectsService
        .listMembers(project.id)
        .then((data) => data || [])
        .catch(() => [])
    )
  );

  const unique = new Map<number, ProjectMemberDTO>();
  memberLists.flat().forEach((member) => {
    if (!member.userId) return;
    if (!unique.has(member.userId)) {
      unique.set(member.userId, member);
    }
  });

  return Array.from(unique.values()).map((member) => {
    const name =
      member.fullName || member.full_name || member.name || member.email || "Team member";
    const status =
      member.status === "ACCEPTED"
        ? "Online"
        : member.status === "PENDING"
          ? "Away"
          : "Offline";

    return {
      id: member.userId,
      initials: toInitials(name),
      name,
      role: member.role || "Member",
      status,
      tasks: tasksByAssignee[member.userId] || 0,
    };
  });
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [rawTasks, setRawTasks] = useState<TaskDTO[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const [taskData, projectData, notificationData] = await Promise.all([
          tasksService.list(),
          projectsService.list(),
          notificationsService.list({ limit: 8 }),
        ]);

        if (!active) return;

        const safeTasks = taskData || [];
        const safeProjects = projectData || [];
        const safeNotifications = notificationData || [];

        setRawTasks(safeTasks);
        setProjects(buildProjectList(safeProjects));
        setActivityItems(buildActivityItems(safeNotifications));

        const members = await loadProjectMembers(safeProjects, safeTasks);
        if (!active) return;
        setTeamMembers(members);
      } catch {
        if (!active) return;
        setRawTasks([]);
        setProjects([]);
        setActivityItems([]);
        setTeamMembers([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const displayName = user?.fullName || user?.full_name || user?.name || "Alex";

  const tasks = useMemo(() => buildTaskList(rawTasks), [rawTasks]);
  const deadlines = useMemo(() => buildDeadlines(rawTasks), [rawTasks]);

  const stats = useMemo(() => {
    const total = rawTasks.length;
    const inProgress = rawTasks.filter((task) => task.status === "IN_PROGRESS").length;
    const completed = rawTasks.filter((task) => task.status === "DONE").length;
    const overdue = rawTasks.filter((task) => {
      if (!task.dueDate || task.status === "DONE") return false;
      const due = new Date(task.dueDate);
      if (Number.isNaN(due.getTime())) return false;
      const today = new Date();
      return due.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    }).length;

    const openTasks = rawTasks.filter((task) => task.status !== "DONE").length;
    return { total, inProgress, completed, overdue, openTasks };
  }, [rawTasks]);

  const handleToggleTask = async (taskId: number) => {
    const target = rawTasks.find((task) => task.id === taskId);
    if (!target) return;

    const nextStatus = target.status === "DONE" ? "IN_PROGRESS" : "DONE";
    try {
      const updated = await tasksService.update(taskId, { status: nextStatus }, "status");
      setRawTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, status: updated?.status || nextStatus }
            : task
        )
      );
    } catch {
      // keep UI stable even if update fails
    }
  };

  return (
    <div className="content-area">
      {/* Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 className="page-title">Good morning, {displayName}</h1>
          <p className="page-subtitle">
            You have {stats.openTasks} open tasks and {deadlines.length} deadlines this week.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm">?? Reports</button>
          <button className="btn btn-primary btn-sm">+ Add Task</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <StatCard
          variant="teal"
          icon="??"
          value={stats.total}
          label="Total Tasks"
          change={isLoading ? "Loading" : "Updated from backend"}
          changeDir="up"
        />
        <StatCard
          variant="amber"
          icon="??"
          value={stats.inProgress}
          label="In Progress"
          change={isLoading ? "Loading" : "Live status"}
          changeDir="up"
        />
        <StatCard
          variant="violet"
          icon="?"
          value={stats.completed}
          label="Completed"
          change={isLoading ? "Loading" : "This period"}
          changeDir="up"
        />
        <StatCard
          variant="rose"
          icon="?"
          value={stats.overdue}
          label="Overdue"
          change={isLoading ? "Loading" : "Needs attention"}
          changeDir="down"
        />
      </div>

      {/* Two-column grid */}
      <div className="dashboard-grid">
        {/* Left */}
        <div>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div className="card-header">
              <span className="card-title">?? My Tasks</span>
              <button className="btn btn-secondary btn-sm">View All ?</button>
            </div>
            <div style={{ padding: "0.25rem 1.5rem" }}>
              {tasks.length ? (
                tasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
                ))
              ) : (
                <div style={{ padding: "0.75rem 0", color: "var(--slate-400)" }}>
                  No tasks to display.
                </div>
              )}
            </div>
          </div>
          <ActivityFeed items={activityItems} />
        </div>

        {/* Right */}
        <div>
          <ProjectProgress projects={projects} />
          <DeadlinesCard deadlines={deadlines} />
          {teamMembers.length ? <TeamCard members={teamMembers} /> : null}
        </div>
      </div>
    </div>
  );
}
