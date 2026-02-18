"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/auth-context";

const MOBILE_BREAKPOINT = 900;

export default function UserLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, logout, refreshUser } = useAuth();

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      if (mobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }

    const hasToken =
      typeof window !== "undefined" && Boolean(sessionStorage.getItem("authToken"));

    if (hasToken) {
      // Avoid redirect race immediately after login by rehydrating auth first.
      void refreshUser();
      return;
    }

    router.replace("/login");
  }, [isAuthenticated, isLoading, refreshUser, router]);

  useEffect(() => {
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobile, pathname]);

  const sidebarOpen = isMobile ? isMobileSidebarOpen : true;
  const sidebarCollapsed = !isMobile && !isSidebarExpanded;

  const userLayoutClassName = useMemo(
    () => `user-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`,
    [sidebarCollapsed]
  );

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((prev) => !prev);
      return;
    }

    setIsSidebarExpanded((prev) => !prev);
  };

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <div className="user-auth-loading">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={userLayoutClassName}>
      {isMobile && isMobileSidebarOpen ? (
        <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      ) : null}

      <Sidebar
        openModal={setActiveModal}
        isOpen={sidebarOpen}
        isMobile={isMobile}
        isCollapsed={sidebarCollapsed}
        user={user}
        onNavigate={() => {
          if (isMobile) {
            setIsMobileSidebarOpen(false);
          }
        }}
        onLogout={handleSignOut}
      />

      <main className="main-content">
        <div className="topbar">
          <button
            type="button"
            className={`hamburger app-hamburger ${isMobile ? (isMobileSidebarOpen ? "is-active" : "") : sidebarCollapsed ? "is-active" : ""}`}
            onClick={handleSidebarToggle}
            aria-label="Toggle menu"
            aria-expanded={isMobile ? isMobileSidebarOpen : isSidebarExpanded}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="topbar-search">
            <span className="topbar-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tasks, projects, teammates..."
            />
          </div>

          <div className="topbar-right">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveModal("task")}
            >
              + New Task
            </button>

            <button className="notif-btn">🔔</button>
          </div>
        </div>

        <div className="content-area">{children}</div>
      </main>

      <Modal isOpen={activeModal === "task"} onClose={() => setActiveModal(null)}>
        <h2>Create New Task</h2>
      </Modal>
    </div>
  );
}
