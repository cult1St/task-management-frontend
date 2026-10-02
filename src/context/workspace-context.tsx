"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/auth-context";
import workspaceService, {
  getStoredWorkspaceId,
  setStoredWorkspaceId,
} from "@/services/workspace.service";
import type {
  WorkspaceDTO,
  WorkspaceMembershipDTO,
  WorkspaceRole,
} from "@/dto/workspace";

interface WorkspaceContextValue {
  workspace: WorkspaceDTO | null;
  role: WorkspaceRole | null;
  workspaces: WorkspaceMembershipDTO[];
  isLoading: boolean;
  isSwitching: boolean;
  refresh: () => Promise<void>;
  switchWorkspace: (workspaceId: number) => Promise<void>;
  canManageWorkspace: boolean;
  canCreateProject: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<WorkspaceDTO | null>(null);
  const [role, setRole] = useState<WorkspaceRole | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceMembershipDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const applyCurrent = useCallback((current: WorkspaceMembershipDTO | null) => {
    if (current?.workspace) {
      setWorkspace(current.workspace);
      setRole(current.role);
      setStoredWorkspaceId(current.workspace.id);
    } else {
      setWorkspace(null);
      setRole(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspace(null);
      setRole(null);
      setWorkspaces([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let memberships: WorkspaceMembershipDTO[] = [];
      try {
        memberships = (await workspaceService.list()) || [];
      } catch {
        // List endpoint may not exist yet — fall back to current only.
        memberships = [];
      }

      let current = await workspaceService.getCurrent().catch(() => null);

      if (!current && memberships.length) {
        const storedId = getStoredWorkspaceId();
        const preferred =
          memberships.find((m) => m.workspace.id === storedId) || memberships[0];
        current = preferred;
      }

      if (
        current?.workspace &&
        !memberships.some((m) => m.workspace.id === current!.workspace.id)
      ) {
        memberships = [current, ...memberships];
      }

      setWorkspaces(memberships);
      applyCurrent(current);
    } catch {
      setWorkspace(null);
      setRole(null);
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, applyCurrent]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setWorkspace(null);
      setRole(null);
      setWorkspaces([]);
      setStoredWorkspaceId(null);
      setIsLoading(false);
      return;
    }

    void refresh();
  }, [authLoading, isAuthenticated, refresh]);

  const switchWorkspace = useCallback(
    async (workspaceId: number) => {
      if (workspace?.id === workspaceId) return;

      setIsSwitching(true);
      try {
        const next = await workspaceService.switchTo(workspaceId);
        applyCurrent(next);
        setWorkspaces((prev) => {
          const exists = prev.some((m) => m.workspace.id === next.workspace.id);
          if (exists) {
            return prev.map((m) =>
              m.workspace.id === next.workspace.id ? next : m
            );
          }
          return [next, ...prev];
        });
        // Reload so chat / projects / STOMP rebind to the new workspace.
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } finally {
        setIsSwitching(false);
      }
    },
    [workspace?.id, applyCurrent]
  );

  const canManageWorkspace = role === "OWNER" || role === "ADMIN";
  const canCreateProject =
    role === null ||
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "MEMBER";

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      role,
      workspaces,
      isLoading,
      isSwitching,
      refresh,
      switchWorkspace,
      canManageWorkspace,
      canCreateProject,
    }),
    [
      workspace,
      role,
      workspaces,
      isLoading,
      isSwitching,
      refresh,
      switchWorkspace,
      canManageWorkspace,
      canCreateProject,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}
