import { useEffect, useState } from "react";
import projectsService from "@/services/projects.service";
import { ProjectMemberDTO } from "@/dto/invitations";
import { useToast } from "@/hooks/useToast";

export default function ProjectMembersModal({
  projectId,
  projectName,
  onClose,
  onMembersChanged,
}: {
  projectId: number;
  projectName?: string;
  onClose: () => void;
  onMembersChanged?: () => void;
}) {
  const { showToast } = useToast();
  const [members, setMembers] = useState<ProjectMemberDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await projectsService.listMembers(projectId, "ACCEPTED");
      setMembers(data || []);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not load project collaborators.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const updateRole = async (userId: number, role: string) => {
    setUpdatingIds((prev) => ({ ...prev, [userId]: true }));
    try {
      await projectsService.updateMember(projectId, userId, { role });
      setMembers((prev) =>
        prev.map((member) => (member.userId === userId ? { ...member, role } : member))
      );
      showToast("Member role updated.", "success");
      onMembersChanged?.();
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not update member role.";
      showToast(message, "error");
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const removeMember = async (userId: number) => {
    setUpdatingIds((prev) => ({ ...prev, [userId]: true }));
    try {
      await projectsService.removeMember(projectId, userId);
      setMembers((prev) => prev.filter((member) => member.userId !== userId));
      showToast("Member removed.", "success");
      onMembersChanged?.();
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not remove member.";
      showToast(message, "error");
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal" style={{ minWidth: 520 }}>
        <div className="modal-header">
          <h3 className="modal-title">Project Members</h3>
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>
        <div className="modal-body">
          <p style={{ margin: 0, color: "var(--slate-400)" }}>
            {projectName ? `Project: ${projectName}` : ""}
          </p>
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-desc">Loading members...</div>
            </div>
          ) : members.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {members.map((member) => (
                <div key={member.userId} className="task-item">
                  <div className="task-info">
                    <div className="task-name">
                      {member.fullName || member.name || member.email || "Unknown"}
                    </div>
                    <div className="task-meta-row">
                      <span className="task-due">{member.email}</span>
                      <select
                        className="form-input select-input"
                        value={member.role || "Member"}
                        onChange={(event) => updateRole(member.userId, event.target.value)}
                        disabled={Boolean(updatingIds[member.userId])}
                        style={{ minWidth: 140 }}
                      >
                        <option value="Member">Member</option>
                        <option value="Contributor">Contributor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={Boolean(updatingIds[member.userId])}
                    onClick={() => removeMember(member.userId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-title">No members yet</div>
              <div className="empty-state-desc">
                Invite users to collaborate on this project.
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
