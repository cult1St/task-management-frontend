"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Notifications from "./components/Notifications";
import ChatNotifyListener from "./components/ChatNotifyListener";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/auth-context";
import { getOnboardingPath } from "@/utils/onboarding";
import { Search, Plus } from "lucide-react";

const MOBILE_BREAKPOINT = 900;

export default function UserLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, onboarding, isLoading, isAuthenticated, logout, refreshUser } =
    useAuth();

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
    if (isLoading || !isAuthenticated) return;

    if (
      onboarding &&
      !onboarding.completed &&
      onboarding.currentStep !== "DONE"
    ) {
      router.replace(getOnboardingPath(onboarding.currentStep));
    }
  }, [isAuthenticated, isLoading, onboarding, router]);

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

  if (
    onboarding &&
    !onboarding.completed &&
    onboarding.currentStep !== "DONE"
  ) {
    return (
      <div className="user-auth-loading">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Continuing setup...
        </div>
      </div>
    );
  }

  return (
    <div className={userLayoutClassName}>
      {isMobile && isMobileSidebarOpen ? (
        <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      ) : null}

      <Sidebar
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
        onAddTask={() => router.push('/user/tasks?create=true')}
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
            <Search className="topbar-search-icon" size={16} strokeWidth={1.75} aria-hidden />
            <input
              type="text"
              placeholder="Search tasks, projects, teammates..."
            />
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => router.push('/user/tasks?create=true')}
            >
              <Plus size={14} strokeWidth={2} aria-hidden className="btn-inline-icon" />
              New Task
            </button>

            <Notifications />
            <ChatNotifyListener />
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
