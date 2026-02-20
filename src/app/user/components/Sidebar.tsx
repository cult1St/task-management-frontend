"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/context/auth-context";

interface SidebarProps {
  openModal: (modal: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  isCollapsed: boolean;
  user: AuthUser | null;
  onNavigate: () => void;
  onLogout: () => Promise<void>;
}

export default function Sidebar({
  openModal,
  isOpen,
  isMobile,
  isCollapsed,
  user,
  onNavigate,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      section: "Main",
      items: [
        { href: "/user/dashboard", icon: "⊞", label: "Dashboard" },
        { href: "/user/tasks", icon: "✓", label: "My Tasks" },
        { href: "/user/projects", icon: "📁", label: "Projects" },
        { href: "/user/calendar", icon: "📅", label: "Calendar" },
      ],
    },
    {
      section: "Team",
      items: [
        { href: "/user/team", icon: "👥", label: "Team Members" },
        { href: "/user/invitations", icon: "✉", label: "Invitations" },
      ],
    },
    {
      section: "Account",
      items: [
        { href: "/user/notifications", icon: "🔔", label: "Notifications" },
        { href: "/user/settings", icon: "⚙", label: "Settings" },
      ],
    },
  ];

  const sidebarClassName = [
    "sidebar",
    isMobile ? (isOpen ? "open" : "") : "",
    !isMobile && isCollapsed ? "collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const displayName = user?.fullName || user?.full_name || user?.name || "TaskFlow User";
  const displayRole = user?.role || "Member";
  const displayInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <aside className={sidebarClassName}>
      <div className="sidebar-logo">
        <div className="brand-icon">TF</div>
        <span className="brand-name">
          Task<span>Flow</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="nav-section-title">{group.section}</div>

            {group.items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  onClick={onNavigate}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span className="sidebar-link-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        <button onClick={() => openModal("task")} className="sidebar-link">
          <span className="sidebar-link-icon">＋</span>
          <span className="sidebar-link-label">New Task</span>
        </button>

        <button className="sidebar-link" onClick={onLogout}>
          <span className="sidebar-link-icon">⇦</span>
          <span className="sidebar-link-label">Sign Out</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{displayInitials || "TF"}</div>
          <div>
            <div className="user-name">{displayName}</div>
            <div className="user-role">{displayRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
