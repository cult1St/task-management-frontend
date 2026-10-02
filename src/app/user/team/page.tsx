"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import IconCloseButton from "@/components/IconCloseButton";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useWorkspace } from "@/context/workspace-context";
import workspaceService from "@/services/workspace.service";
import type { WorkspaceMemberDTO, WorkspaceRole } from "@/dto/workspace";

const ROLE_OPTIONS: WorkspaceRole[] = ["ADMIN", "MEMBER", "GUEST"];

export default function TeamPage() {
  const { toasts, showToast, removeToast } = useToast();
  const { workspace, canManageWorkspace, role: myRole } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMemberDTO[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("MEMBER");
  const [isInviting, setIsInviting] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await workspaceService.listMembers(search.trim() || undefined);
      setMembers(list || []);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load team members.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadMembers();
    }, search ? 250 : 0);
    return () => clearTimeout(timeout);
  }, [loadMembers, search]);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email) {
      showToast("Email is required.", "error");
      return;
    }

    setIsInviting(true);
    try {
      await workspaceService.invite({ email, role: inviteRole });
      showToast(`Invitation sent to ${email}.`, "success");
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
      void loadMembers();
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not send workspace invite.";
      showToast(message, "error");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (userId: number, nextRole: WorkspaceRole) => {
    setBusyUserId(userId);
    try {
      const updated = await workspaceService.updateMember(userId, { role: nextRole });
      if (updated) {
        setMembers((prev) =>
          prev.map((m) => (m.userId === userId ? { ...m, ...updated } : m))
        );
      }
      showToast("Member role updated.", "success");
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not update member role.";
      showToast(message, "error");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemove = async (userId: number, name: string) => {
    if (!window.confirm(`Remove ${name} from this workspace?`)) return;

    setBusyUserId(userId);
    try {
      await workspaceService.removeMember(userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      showToast("Member removed.", "success");
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not remove member.";
      showToast(message, "error");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Team</h1>
        <p className="page-subtitle">
          {workspace?.name
            ? `Members of ${workspace.name}`
            : "Invite people to this workspace, then assign them to projects and tasks"}
        </p>
      </div>

      <div className="tasks-toolbar">
        <div className="topbar-search" style={{ maxWidth: 260 }}>
          <Search className="topbar-search-icon" size={16} strokeWidth={1.75} aria-hidden />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {canManageWorkspace ? (
          <button
            className="btn btn-primary btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={() => setInviteOpen(true)}
          >
            Invite to workspace
          </button>
        ) : null}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            Members ({members.length})
            {myRole ? ` · You are ${myRole}` : ""}
          </span>
        </div>
        <div style={{ padding: "1rem" }}>
          {isLoading ? (
            <div className="empty-state">
              <div className="empty-state-desc">Loading members...</div>
            </div>
          ) : members.length ? (
            members.map((member) => {
              const displayName = member.fullName || member.email || `User ${member.userId}`;
              const initials =
                member.initials ||
                displayName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join("");

              return (
                <div key={member.userId} className="task-item">
                  <div className="task-info" style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div className="user-avatar" style={{ width: 36, height: 36, fontSize: "0.75rem" }}>
                      {member.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatarUrl}
                          alt=""
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <div className="task-name">{displayName}</div>
                      <div className="task-meta-row">
                        <span className="task-due">{member.email || "No email"}</span>
                        <span className="chip">{member.role}</span>
                      </div>
                    </div>
                  </div>

                  {canManageWorkspace && member.role !== "OWNER" ? (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <select
                        className="form-input select-input"
                        style={{ width: 120, padding: "0.35rem 0.5rem" }}
                        value={member.role}
                        disabled={busyUserId === member.userId}
                        onChange={(e) =>
                          void handleRoleChange(
                            member.userId,
                            e.target.value as WorkspaceRole
                          )
                        }
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={busyUserId === member.userId}
                        onClick={() => void handleRemove(member.userId, displayName)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-state-title">No members yet</div>
              <div className="empty-state-desc">
                Invite teammates to this workspace, then assign them to projects and tasks.
              </div>
            </div>
          )}
        </div>
      </div>

      {inviteOpen ? (
        <div className="modal-backdrop open" role="dialog" aria-modal="true">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">Invite to workspace</h2>
              <IconCloseButton onClick={() => setInviteOpen(false)} />
            </div>
            <form onSubmit={(e) => void handleInvite(e)}>
              <div className="modal-body">
                <p style={{ margin: 0, color: "var(--slate-400)", fontSize: "0.875rem" }}>
                  They join the workspace first. Assign projects and tasks after they accept.
                </p>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    className="form-input"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    autoFocus
                    disabled={isInviting}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Workspace role</label>
                  <select
                    className="form-input select-input"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                    disabled={isInviting}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setInviteOpen(false)}
                  disabled={isInviting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isInviting}>
                  {isInviting ? "Sending..." : "Send invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
