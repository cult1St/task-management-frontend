"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useWorkspace } from "@/context/workspace-context";
import { useToast } from "@/hooks/useToast";
import tasksService from "@/services/tasks.service";
import projectsService from "@/services/projects.service";
import notificationsService from "@/services/notifications.service";
import { TaskDTO, TaskStatus } from "@/dto/tasks";
import { ProjectDTO } from "@/dto/projects";
import { NotificationDTO } from "@/dto/notifications";
import { ProjectMemberDTO } from "@/dto/invitations";
import { TeamMember, ActivityItem, Project } from "@/dto/dashboard";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/utils/dateUtil";
import ToastContainer from "@/components/ToastContainer";
import { FolderKanban, CheckSquare, Zap } from "lucide-react";
import {
  StatCard,
  ActivityFeed,
  DeadlinesCard,
  ProjectProgress,
  TaskItem,
  TeamCard,
} from "./components";

const PROJECT_FILL_CLASSES = ["fill-teal", "fill-violet", "fill-amber", "fill-rose"] as const;

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

const buildTaskList = (tasks: TaskDTO[], currentUserId?: number) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const parseAssigneeId = (task: TaskDTO) => {
    if (typeof task.assignedToId === "number") return task.assignedToId;
    if (typeof task.assignee?.id === "number") return task.assignee.id;
    if (typeof task.assignee?.userId === "number") return task.assignee.userId;
    const parsed = Number(task.assignedToId ?? task.assignee?.id ?? task.assignee?.userId);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

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

      const assigneeId = parseAssigneeId(task);
      const canToggle = currentUserId !== undefined && assigneeId !== undefined && currentUserId === assigneeId;

      return {
        id: task.id,
        name: task.title,
        done: task.status === "DONE",
        priority: task.priority,
        due: formatShortDate(task.dueDate),
        overdue,
        canToggle,
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

  return Array.from(unique.values()).map((member): TeamMember => {
    const name =
      member.fullName || member.full_name || member.name || member.email || "Team member";
    const status: "Online" | "Away" | "Offline" =
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
  const { workspace } = useWorkspace();
  const { toasts, showToast, removeToast } = useToast();
  const router = useRouter();

  const [rawTasks, setRawTasks] = useState<TaskDTO[]>([]);
  const [myTasks, setMyTasks] = useState<TaskDTO[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [allTasks, mineTasks, projectData, notificationData] = await Promise.all([
        tasksService.list(),
        tasksService.list({ scope: "mine" }),
        projectsService.list(),
        notificationsService.list({ limit: 8 }),
      ]);

      if (!isMounted.current) return;

      const safeAllTasks = allTasks || [];
      const safeMine = mineTasks || safeAllTasks;
      const safeProjects = projectData || [];
      const safeNotifications = notificationData || [];

      setRawTasks(safeAllTasks);
      setMyTasks(safeMine);
      setProjectCount(safeProjects.length);
      setProjects(buildProjectList(safeProjects));
      setActivityItems(buildActivityItems(safeNotifications));

      const members = await loadProjectMembers(safeProjects, safeAllTasks);
      if (!isMounted.current) return;
      setTeamMembers(members);
    } catch (err) {
      if (!isMounted.current) return;
      const message =
        (err as { message?: string })?.message ||
        "Unable to load dashboard data. Please try again.";
      setError(message);
      showToast(message, "error");
    } finally {
      if (!isMounted.current) return;
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    isMounted.current = true;
    void loadDashboard();
    return () => {
      isMounted.current = false;
    };
  }, [loadDashboard]);

  const displayName = user?.fullName || user?.full_name || user?.name || "there";
  const workspaceName = workspace?.name || "Workspace";

  const currentUserId = (() => {
    if (!user) return undefined;
    if (typeof user.id === "number") return user.id;
    const parsed = Number(user.id);
    return Number.isFinite(parsed) ? parsed : undefined;
  })();

  const tasks = useMemo(
    () => buildTaskList(myTasks.length ? myTasks : rawTasks, currentUserId),
    [myTasks, rawTasks, currentUserId]
  );
  const deadlines = useMemo(() => buildDeadlines(rawTasks), [rawTasks]);

  const stats = useMemo(() => {
    const myOpen = (myTasks.length ? myTasks : rawTasks).filter(
      (task) => task.status !== "DONE"
    ).length;
    return {
      projects: projectCount,
      myTasks: myOpen,
      activeSprints: 0,
    };
  }, [myTasks, rawTasks, projectCount]);

  const handleToggleTask = async (taskId: number) => {
    const target =
      myTasks.find((task) => task.id === taskId) ||
      rawTasks.find((task) => task.id === taskId);
    if (!target) return;

    const nextStatus: TaskStatus = target.status === "DONE" ? "IN_PROGRESS" : "DONE";

    const applyOptimistic = (list: TaskDTO[]): TaskDTO[] =>
      list.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      );

    setMyTasks((prev) => applyOptimistic(prev));
    setRawTasks((prev) => applyOptimistic(prev));

    try {
      const updated = await tasksService.update(taskId, { status: nextStatus }, "status");
      if (updated) {
        const resolvedStatus: TaskStatus = updated.status ?? nextStatus;
        const applyServer = (list: TaskDTO[]): TaskDTO[] =>
          list.map((task) =>
            task.id === taskId ? { ...task, status: resolvedStatus } : task
          );
        setMyTasks((prev) => applyServer(prev));
        setRawTasks((prev) => applyServer(prev));
      }
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Unable to update task status. Please try again.";
      showToast(message, "error");

      const revert = (list: TaskDTO[]) =>
        list.map((task) =>
          task.id === taskId ? { ...task, status: target.status } : task
        );
      setMyTasks((prev) => revert(prev));
      setRawTasks((prev) => revert(prev));
    }
  };

  return (
    <div className="content-area">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

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
          <h1 className="page-title">{workspaceName}</h1>
          <p className="page-subtitle">
            Welcome back, {displayName}. You have {stats.myTasks} open tasks in this
            workspace.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => router.push("/user/projects")}
          >
            View Projects
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => router.push("/user/tasks?create=true")}
          >
            + Add Task
          </button>
        </div>
      </div>

      {error ? (
        <div className="card" style={{ marginBottom: "1.25rem", border: "1px solid var(--rose-500)" }}>
          <div className="card-header">
            <span className="card-title">Unable to load dashboard</span>
          </div>
          <div style={{ padding: "1rem" }}>
            <p style={{ margin: 0, color: "var(--rose-200)" }}>{error}</p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "0.75rem" }}
              onClick={() => void loadDashboard()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="stats-grid">
        <StatCard
          variant="teal"
          icon={FolderKanban}
          value={isLoading ? "—" : stats.projects}
          label="Projects"
          change={isLoading ? "Loading" : "In this workspace"}
          changeDir="up"
        />
        <StatCard
          variant="amber"
          icon={CheckSquare}
          value={isLoading ? "—" : stats.myTasks}
          label="My Tasks"
          change={isLoading ? "Loading" : "Open items"}
          changeDir="up"
        />
        <StatCard
          variant="violet"
          icon={Zap}
          value={isLoading ? "—" : stats.activeSprints}
          label="Active Sprints"
          change="Coming soon"
          changeDir="up"
        />
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div className="card-header">
              <span className="card-title">My Work</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => router.push("/user/tasks")}
              >
                View All
              </button>
            </div>
            <div style={{ padding: "0.25rem 1.5rem" }}>
              {tasks.length ? (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    canToggle={task.canToggle}
                  />
                ))
              ) : (
                <div style={{ padding: "0.75rem 0", color: "var(--slate-400)" }}>
                  {isLoading ? "Loading your work..." : "No open tasks assigned to you."}
                </div>
              )}
            </div>
          </div>
          <ActivityFeed items={activityItems} />
        </div>

        <div>
          <ProjectProgress projects={projects} />
          <DeadlinesCard deadlines={deadlines} />
          {teamMembers.length ? <TeamCard members={teamMembers} /> : null}
        </div>
      </div>
    </div>
  );
}
