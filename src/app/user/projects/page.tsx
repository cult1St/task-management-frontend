"use client";

import { useEffect, useMemo, useState } from "react";
import projectsService from "@/services/projects.service";
import { CreateProjectPayload, ProjectDTO, ProjectStatus } from "@/dto/projects";
import { ProjectInviteUserOptionDTO } from "@/dto/invitations";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: "Active",
  IN_REVIEW: "In Review",
  PLANNING: "Planning",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const STATUS_CLASS: Record<ProjectStatus, string> = {
  ACTIVE: "status-active",
  IN_REVIEW: "status-review",
  PLANNING: "status-planning",
  PAUSED: "status-paused",
  COMPLETED: "status-active",
  ARCHIVED: "status-paused",
};

function resolveUserName(user: ProjectInviteUserOptionDTO) {
  return user.fullName || user.full_name || user.name || user.email;
}

export default function ProjectsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "ARCHIVED">(
    "ALL"
  );
  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [draftProject, setDraftProject] = useState<CreateProjectPayload>({
    name: "",
    description: "",
    status: "ACTIVE",
    dueDate: "",
  });

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [inviteRole, setInviteRole] = useState("Contributor");
  const [userQuery, setUserQuery] = useState("");
  const [userOptions, setUserOptions] = useState<ProjectInviteUserOptionDTO[]>([]);
  const [isUserSearchLoading, setIsUserSearchLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await projectsService.list(filter === "ALL" ? undefined : filter);
        setProjects(list || []);
      } catch (err) {
        const message =
          (err as { message?: string })?.message || "Failed to load projects.";
        showToast(message, "error");
      }
    };
    void load();
  }, [filter, showToast]);

  useEffect(() => {
    if (!isInviteModalOpen) return;

    const query = userQuery.trim();
    if (query.length < 2) {
      setUserOptions([]);
      return;
    }

    const timeout = setTimeout(() => {
      void (async () => {
        setIsUserSearchLoading(true);
        try {
          const users = await projectsService.searchUsers(query);
          setUserOptions(users || []);
        } catch (err) {
          const message =
            (err as { message?: string })?.message ||
            "Could not search users right now.";
          showToast(message, "error");
          setUserOptions([]);
        } finally {
          setIsUserSearchLoading(false);
        }
      })();
    }, 300);

    return () => clearTimeout(timeout);
  }, [isInviteModalOpen, userQuery, showToast]);

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    return projects.filter((project) =>
      project.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  const openInviteModal = (projectId?: number) => {
    setSelectedProjectId(projectId || "");
    setSelectedUserId("");
    setInviteRole("Contributor");
    setUserQuery("");
    setUserOptions([]);
    setIsInviteModalOpen(true);
  };

  const handleCreateProject = async () => {
    if (!draftProject.name.trim()) {
      showToast("Project name is required.", "error");
      return;
    }

    setIsSavingProject(true);
    try {
      const created = await projectsService.create(draftProject);
      if (created) {
        setProjects((prev) => [created, ...prev]);
        showToast("Project created!", "success");
      }
      setIsCreateModalOpen(false);
      setDraftProject({ name: "", description: "", status: "ACTIVE", dueDate: "" });
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not create project.";
      showToast(message, "error");
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedProjectId) {
      showToast("Select a project.", "error");
      return;
    }

    if (!selectedUserId) {
      showToast("Select a user to invite.", "error");
      return;
    }

    setIsSendingInvite(true);
    try {
      await projectsService.inviteMember(selectedProjectId, {
        invitedUserId: selectedUserId,
        role: inviteRole || undefined,
      });
      showToast("Invitation sent successfully.", "success");
      setIsInviteModalOpen(false);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not send invitation.";
      showToast(message, "error");
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">Create projects, invite collaborators, and track progress</p>
      </div>

      <div className="tasks-toolbar">
        <div className="filter-tabs">
          {[
            { value: "ALL", label: "All Projects" },
            { value: "ACTIVE", label: "Active" },
            { value: "COMPLETED", label: "Completed" },
            { value: "ARCHIVED", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.value}
              className={`filter-tab ${filter === tab.value ? "active" : ""}`}
              onClick={() => setFilter(tab.value as typeof filter)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="topbar-search" style={{ maxWidth: 220 }}>
          <span className="topbar-search-icon">S</span>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          className="btn btn-secondary btn-sm"
          style={{ marginLeft: "auto" }}
          onClick={() => openInviteModal()}
          disabled={!projects.length}
        >
          Invite User
        </button>

        <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
          + New Project
        </button>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card c1">
            <div className="project-header">
              <div className="project-icon bg-teal">PRJ</div>
              <span className={`project-status ${STATUS_CLASS[project.status]}`}>
                * {STATUS_LABELS[project.status]}
              </span>
            </div>
            <div className="project-name">{project.name}</div>
            <div className="project-desc">{project.description || "No description yet."}</div>
            <div className="project-progress-row">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill fill-teal" style={{ width: `${project.progress}%` }} />
            </div>
            <div className="project-footer" style={{ alignItems: "center" }}>
              <div className="project-team">
                {(project.teamInitials || ["TF"]).map((member, idx) => (
                  <div key={`${project.id}-${member}-${idx}`} className="project-team-avatar">
                    {member}
                  </div>
                ))}
              </div>
              <span className="project-due">Due: {project.dueDate || "No due date"}</span>
            </div>
            <div style={{ marginTop: "0.9rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openInviteModal(project.id)}>
                Invite to Project
              </button>
            </div>
          </div>
        ))}
      </div>

      {isCreateModalOpen ? (
        <div className="modal-backdrop open">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create New Project</h3>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>
                x
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mobile App v1.0"
                  value={draftProject.name}
                  onChange={(event) =>
                    setDraftProject((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Add project details..."
                  value={draftProject.description}
                  onChange={(event) =>
                    setDraftProject((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input select-input"
                    value={draftProject.status}
                    onChange={(event) =>
                      setDraftProject((prev) => ({
                        ...prev,
                        status: event.target.value as ProjectStatus,
                      }))
                    }
                  >
                    {Object.keys(STATUS_LABELS).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status as ProjectStatus]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={draftProject.dueDate || ""}
                    onChange={(event) =>
                      setDraftProject((prev) => ({ ...prev, dueDate: event.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateProject}
                disabled={isSavingProject}
              >
                {isSavingProject ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isInviteModalOpen ? (
        <div className="modal-backdrop open">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Invite User to Project</h3>
              <button className="modal-close" onClick={() => setIsInviteModalOpen(false)}>
                x
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select
                  className="form-input select-input"
                  value={selectedProjectId}
                  onChange={(event) =>
                    setSelectedProjectId(
                      event.target.value ? Number(event.target.value) : ""
                    )
                  }
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Search existing users *</label>
                <input
                  type="text"
                  className="form-input"
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                  placeholder="Type at least 2 characters"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select user *</label>
                <select
                  className="form-input select-input"
                  value={selectedUserId}
                  onChange={(event) =>
                    setSelectedUserId(event.target.value ? Number(event.target.value) : "")
                  }
                  disabled={isUserSearchLoading || userQuery.trim().length < 2}
                >
                  <option value="">
                    {userQuery.trim().length < 2
                      ? "Search users first"
                      : isUserSearchLoading
                      ? "Searching users..."
                      : "Select user"}
                  </option>
                  {userOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {resolveUserName(user)} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role in project</label>
                <input
                  type="text"
                  className="form-input"
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  placeholder="Contributor"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleInvite} disabled={isSendingInvite}>
                {isSendingInvite ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
