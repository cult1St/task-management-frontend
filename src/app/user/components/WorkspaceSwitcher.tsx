"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";

export default function WorkspaceSwitcher() {
  const { workspace, role, workspaces, isSwitching, switchWorkspace } =
    useWorkspace();
  const { toasts, showToast, removeToast } = useToast();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const workspaceName = workspace?.name || "My Workspace";
  const workspaceRole = role || "MEMBER";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSwitch = async (workspaceId: number) => {
    if (workspaceId === workspace?.id) {
      setOpen(false);
      return;
    }
    try {
      await switchWorkspace(workspaceId);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not switch workspace.";
      showToast(message, "error");
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div className="sidebar-workspace" ref={rootRef}>
        <button
          type="button"
          className="sidebar-workspace-switcher"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Switch workspace"
          disabled={isSwitching}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="sidebar-workspace-name">{workspaceName}</span>
          <span className="sidebar-workspace-chevron" aria-hidden>
            {open ? <ChevronUp size={14} strokeWidth={2} /> : <ChevronDown size={14} strokeWidth={2} />}
          </span>
        </button>
        <div className="sidebar-workspace-role">{workspaceRole}</div>

        {open ? (
          <div className="workspace-switcher-menu" role="listbox">
            <div className="workspace-switcher-label">Workspaces</div>
            {(workspaces.length
              ? workspaces
              : workspace
                ? [{ workspace, role: workspaceRole }]
                : []
            ).map((item) => {
              const active = item.workspace.id === workspace?.id;
              return (
                <button
                  key={item.workspace.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`workspace-switcher-item ${active ? "active" : ""}`}
                  disabled={isSwitching}
                  onClick={() => void handleSwitch(item.workspace.id)}
                >
                  <span className="workspace-switcher-item-name">
                    {item.workspace.name}
                  </span>
                  <span className="workspace-switcher-item-role">{item.role}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
