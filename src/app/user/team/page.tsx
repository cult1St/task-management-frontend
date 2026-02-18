"use client";

import { useEffect, useMemo, useState } from "react";
import teamService from "@/services/team.service";
import { InviteMemberPayload, TeamMemberDTO, TeamMemberStatus } from "@/dto/team";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

const STATUS_LABEL: Record<TeamMemberStatus, string> = {
  ONLINE: "Online",
  AWAY: "Away",
  OFFLINE: "Offline",
};

export default function TeamPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [members, setMembers] = useState<TeamMemberDTO[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [invite, setInvite] = useState<InviteMemberPayload>({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await teamService.list(search || undefined);
        setMembers(data || []);
      } catch (err) {
        const message =
          (err as { message?: string })?.message || "Failed to load team.";
        showToast(message, "error");
      }
    };
    void load();
  }, [search, showToast]);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    return members.filter((member) =>
      member.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const handleInvite = async () => {
    if (!invite.name.trim() || !invite.email.trim()) {
      showToast("Name and email are required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const created = await teamService.invite(invite);
      if (created) {
        setMembers((prev) => [created, ...prev]);
        showToast("Invite sent!", "success");
      }
      setIsModalOpen(false);
      setInvite({ name: "", email: "", role: "" });
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Invite failed.";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Team Members</h1>
        <p className="page-subtitle">{members.length} members in your workspace</p>
      </div>

      <div className="tasks-toolbar">
        <div className="topbar-search" style={{ maxWidth: 240 }}>
          <span className="topbar-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          + Invite Member
        </button>
      </div>

      <div className="team-grid">
        {filteredMembers.map((member) => (
          <div key={member.id} className="team-card">
            <div
              className="team-avatar"
              style={
                member.avatarUrl
                  ? {
                      backgroundImage: `url(${member.avatarUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {!member.avatarUrl ? member.initials || member.name.slice(0, 2) : null}
            </div>
            <div className="team-name">{member.name}</div>
            <div className="team-role">{member.role}</div>
            <div className="online-badge">
              <div className="online-dot" />
              {STATUS_LABEL[member.status]}
            </div>
            <div className="team-stats-row">
              <div>
                <div className="team-stat-num">{member.tasksCount}</div>
                <div className="team-stat-lbl">Tasks</div>
              </div>
              <div>
                <div className="team-stat-num">{member.projectsCount}</div>
                <div className="team-stat-lbl">Projects</div>
              </div>
              <div>
                <div className="team-stat-num">{member.completionRate}%</div>
                <div className="team-stat-lbl">Rate</div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
              View Profile
            </button>
          </div>
        ))}

        <div
          className="team-card"
          style={{
            border: "2px dashed rgba(255,255,255,0.1)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "260px",
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.4 }}>
            +
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--slate-300)",
              marginBottom: "0.4rem",
            }}
          >
            Invite Teammate
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              color: "var(--slate-400)",
              textAlign: "center",
              maxWidth: "180px",
            }}
          >
            Add team members to collaborate on projects
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop open">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Invite Team Member</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={invite.name}
                  onChange={(event) =>
                    setInvite((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={invite.email}
                  onChange={(event) =>
                    setInvite((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  type="text"
                  className="form-input"
                  value={invite.role}
                  onChange={(event) =>
                    setInvite((prev) => ({ ...prev, role: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleInvite} disabled={isSaving}>
                {isSaving ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
