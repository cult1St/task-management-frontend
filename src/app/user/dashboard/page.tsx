"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { 
  StatCard,
  ActivityFeed,
  DeadlinesCard,
  ProjectProgress,
  TaskItem,
  TeamCard
} from "./components";


// ─── Static seed data (replace with API calls / context as needed) ────────────

const INITIAL_TASKS: Task[] = [
  { id: 1, name: "Setup Spring Boot project structure", done: true,  priority: "HIGH", due: "Feb 10", overdue: true },
  { id: 2, name: "Implement JWT authentication",        done: false, priority: "HIGH", due: "Feb 14" },
  { id: 3, name: "Design RESTful API endpoints",        done: false, priority: "MED",  due: "Feb 16" },
  { id: 4, name: "Write unit tests for task service",   done: false, priority: "MED",  due: "Feb 18" },
  { id: 5, name: "Deploy to staging environment",       done: false, priority: "LOW",  due: "Feb 22" },
];

const ACTIVITY_ITEMS: ActivityItem[] = [
  { id: 1, actor: "Sara Kim",   text: 'completed "API Integration Tests" in Mobile App', time: "5 minutes ago", color: "teal"   },
  { id: 2, actor: "You", actorIsYou: true, text: 'moved "Dashboard Charts" to In Review', time: "1 hour ago",   color: "violet" },
  { id: 3, actor: "Marcus Lee", text: 'added a comment on "User Auth Backend"',           time: "2 hours ago",  color: "amber"  },
  { id: 4, actor: "System",     text: 'deadline approaching: "Mobile App v1.0 release" in 3 days', time: "3 hours ago", color: "rose" },
];

const PROJECTS: Project[] = [
  { id: 1, name: "Mobile App v1.0",  percent: 72, fillClass: "fill-teal"   },
  { id: 2, name: "Website Redesign", percent: 45, fillClass: "fill-violet" },
  { id: 3, name: "API Platform",     percent: 88, fillClass: "fill-amber"  },
];

const DEADLINES: Deadline[] = [
  { id: 1, name: "JWT Auth",         when: "Tomorrow", whenColor: "var(--rose-400)",  chipLabel: "Urgent",   chipClass: "tag-rose"  },
  { id: 2, name: "API Endpoints",    when: "Feb 16",   whenColor: "var(--amber-400)", chipLabel: "Soon",     chipClass: "tag-amber" },
  { id: 3, name: "App v1.0 Release", when: "Feb 28",   whenColor: "var(--slate-400)", chipLabel: "On Track", chipClass: "tag-teal"  },
];

const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, initials: "SK", name: "Sara Kim",   role: "Frontend Dev", status: "Online", tasks: 6 },
  { id: 2, initials: "ML", name: "Marcus Lee", role: "Backend Dev",  status: "Online", tasks: 8,
    avatarStyle: { background: "linear-gradient(135deg,var(--amber-400),var(--rose-400))" } },
  { id: 3, initials: "JP", name: "Julia Park", role: "Designer",     status: "Away",   tasks: 4,
    avatarStyle: { background: "linear-gradient(135deg,var(--violet-400),var(--teal-400))" } },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const displayName = user?.fullName || user?.full_name || user?.name || "Alex";
  const openTasks = tasks.filter((t) => !t.done).length;

  const toggleTask = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="content-area">
      {/* Header */}
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}
      >
        <div>
          <h1 className="page-title">Good morning, {displayName} 👋</h1>
          <p className="page-subtitle">You have {openTasks} open tasks and 2 deadlines this week.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm">📊 Reports</button>
          <button className="btn btn-primary btn-sm">＋ Add Task</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <StatCard variant="teal"   icon="📋" value={24} label="Total Tasks"  change="↑ 4 this week"      changeDir="up"   />
        <StatCard variant="amber"  icon="🚧" value={8}  label="In Progress"  change="↑ 2 from yesterday" changeDir="up"   />
        <StatCard variant="violet" icon="✅" value={16} label="Completed"    change="↑ 67% rate"         changeDir="up"   />
        <StatCard variant="rose"   icon="⚠" value={2}  label="Overdue"      change="↑ needs attention"  changeDir="down" />
      </div>

      {/* Two-column grid */}
      <div className="dashboard-grid">
        {/* Left */}
        <div>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div className="card-header">
              <span className="card-title">📌 My Tasks</span>
              <button className="btn btn-secondary btn-sm">View All →</button>
            </div>
            <div style={{ padding: "0.25rem 1.5rem" }}>
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </div>
          <ActivityFeed items={ACTIVITY_ITEMS} />
        </div>

        {/* Right */}
        <div>
          <ProjectProgress projects={PROJECTS} />
          <DeadlinesCard deadlines={DEADLINES} />
          <TeamCard members={TEAM_MEMBERS} />
        </div>
      </div>
    </div>
  );
}
