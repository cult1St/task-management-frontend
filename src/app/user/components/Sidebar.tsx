"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/context/auth-context";
import { useWorkspace } from "@/context/workspace-context";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  ListTodo,
  Zap,
  CalendarDays,
  MessageSquare,
  Video,
  Users,
  Bell,
  Mail,
  ScrollText,
  Settings,
  Plus,
  LogOut,
  type LucideIcon,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  isCollapsed: boolean;
  user: AuthUser | null;
  onNavigate: () => void;
  onLogout: () => Promise<void>;
  onAddTask: () => void;
}

type NavItem = {
  href?: string;
  icon: LucideIcon;
  label: string;
  comingSoon?: boolean;
};

type NavSection = {
  section: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    section: "Overview",
    items: [
      { href: "/user/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    section: "Work",
    items: [
      { href: "/user/projects", icon: FolderKanban, label: "Projects" },
      { href: "/user/tasks", icon: CheckSquare, label: "My Tasks" },
      { icon: ListTodo, label: "Backlog", comingSoon: true },
      { icon: Zap, label: "Sprints", comingSoon: true },
      { href: "/user/calendar", icon: CalendarDays, label: "Calendar" },
    ],
  },
  {
    section: "Collaborate",
    items: [
      { href: "/user/chat", icon: MessageSquare, label: "Chat" },
      { icon: Video, label: "Meetings", comingSoon: true },
      { href: "/user/team", icon: Users, label: "Team" },
    ],
  },
  {
    section: "Activity",
    items: [
      { href: "/user/notifications", icon: Bell, label: "Notifications" },
      { href: "/user/invitations", icon: Mail, label: "Invitations" },
      { icon: ScrollText, label: "Activity", comingSoon: true },
    ],
  },
];

function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="sidebar-link-icon" size={18} strokeWidth={1.75} aria-hidden />;
}

export default function Sidebar({
  isOpen,
  isMobile,
  isCollapsed,
  user,
  onNavigate,
  onLogout,
  onAddTask,
}: SidebarProps) {
  const pathname = usePathname();
  const { role } = useWorkspace();

  const sidebarClassName = [
    "sidebar",
    isMobile ? (isOpen ? "open" : "") : "",
    !isMobile && isCollapsed ? "collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const displayName = user?.fullName || user?.full_name || user?.name || "TaskFlow User";
  const displayInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const avatarUrl = user?.avatarUrl || user?.avatar_url;

  const workspaceRole = role || "MEMBER";

  return (
    <aside className={sidebarClassName}>
      <div className="sidebar-logo">
        <div className="brand-icon">TF</div>
        <span className="brand-name">
          Task<span>Flow</span>
        </span>
      </div>

      <WorkspaceSwitcher />

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((group) => (
          <div key={group.section}>
            <div className="nav-section-title">{group.section}</div>

            {group.items.map((item) => {
              if (item.comingSoon || !item.href) {
                return (
                  <span
                    key={item.label}
                    className="sidebar-link sidebar-link-coming-soon"
                    title="Coming soon"
                    aria-disabled="true"
                  >
                    <NavIcon icon={item.icon} />
                    <span className="sidebar-link-label">{item.label}</span>
                    <span className="sidebar-coming-soon-badge">Soon</span>
                  </span>
                );
              }

              const isActive =
                pathname === item.href ||
                pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  onClick={onNavigate}
                >
                  <NavIcon icon={item.icon} />
                  <span className="sidebar-link-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        <div className="nav-section-title">Account</div>

        <Link
          href="/user/settings"
          className={`sidebar-link ${
            pathname?.startsWith("/user/settings") ? "active" : ""
          }`}
          onClick={onNavigate}
        >
          <NavIcon icon={Settings} />
          <span className="sidebar-link-label">Settings</span>
        </Link>

        <button type="button" onClick={onAddTask} className="sidebar-link">
          <NavIcon icon={Plus} />
          <span className="sidebar-link-label">New Task</span>
        </button>

        <button type="button" className="sidebar-link" onClick={onLogout}>
          <NavIcon icon={LogOut} />
          <span className="sidebar-link-label">Sign Out</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`${displayName} avatar`}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              displayInitials || "TF"
            )}
          </div>
          <div>
            <div className="user-name">{displayName}</div>
            <div className="user-role">{workspaceRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
