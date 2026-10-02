"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import IconCloseButton from "@/components/IconCloseButton";
import projectsService from "@/services/projects.service";
import workspaceService from "@/services/workspace.service";
import {
  CreateProjectPayload,
  ProjectDTO,
  ProjectStatus,
  ProjectType,
} from "@/dto/projects";
import type { WorkspaceMemberDTO } from "@/dto/workspace";
import { formatShortDate } from "@/utils/dateUtil";
import { suggestProjectKey } from "@/utils/projectKey";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useWorkspace } from "@/context/workspace-context";
import ProjectMembersModal from "./components/ProjectMembersModal";
import { DatePickerField } from "@/components/DatePickerField";

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

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  SOFTWARE: "Software",
  BUSINESS: "Business",
  MARKETING: "Marketing",
  CUSTOM: "Custom",
};

const EMPTY_DRAFT: CreateProjectPayload = {
  name: "",
  key: "",
  description: "",
  projectType: "SOFTWARE",
  status: "ACTIVE",
  dueDate: "",
};

function resolveMemberName(member: WorkspaceMemberDTO) {
  return member.fullName || member.email || `User ${member.userId}`;
}

export default function ProjectsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const { canCreateProject, workspace } = useWorkspace();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "ARCHIVED">(
    "ALL"
  );
  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [keyTouched, setKeyTouched] = useState(false);
  const [draftProject, setDraftProject] = useState<CreateProjectPayload>(EMPTY_DRAFT);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [membersProjectId, setMembersProjectId] = useState<number | null>(null);
  const [membersProjectName, setMembersProjectName] = useState<string>("");
  const [inviteRole, setInviteRole] = useState("Contributor");
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberDTO[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const list = await projectsService.list(filter === "ALL" ? undefined : filter);
      setProjects(list || []);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load projects.";
      showToast(message, "error");
    }
  }, [filter, showToast]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const projectIdParam = searchParams.get("projectId");
    const projectId = projectIdParam ? Number(projectIdParam) : undefined;
    if (!projectId || !projects.length) return;

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      openMembersModal(projectId, project.name);
    }
  }, [projects, searchParams]);

  useEffect(() => {
    if (!isInviteModalOpen) return;

    void (async () => {
      setIsMembersLoading(true);
      try {
        const list = await workspaceService.listMembers();
        setWorkspaceMembers(list || []);
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "Could not load workspace members.";
        showToast(message, "error");
        setWorkspaceMembers([]);
      } finally {
        setIsMembersLoading(false);
      }
    })();
  }, [isInviteModalOpen, showToast]);

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
    setIsInviteModalOpen(true);
  };

  const openMembersModal = (projectId: number, projectName: string) => {
    setMembersProjectId(projectId);
    setMembersProjectName(projectName);
  };

  const openCreateModal = () => {
    if (!canCreateProject) {
      showToast("Your role cannot create projects in this workspace.", "error");
      return;
    }
    setDraftProject(EMPTY_DRAFT);
    setKeyTouched(false);
    setIsCreateModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setDraftProject((prev) => ({
      ...prev,
      name,
      key: keyTouched ? prev.key : suggestProjectKey(name),
    }));
  };

  const handleCreateProject = async () => {
    if (!draftProject.name.trim()) {
      showToast("Project name is required.", "error");
      return;
    }

    const key = draftProject.key.trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9]{1,9}$/.test(key)) {
      showToast(
        "Project key must be 2–10 letters/numbers, starting with a letter.",
        "error"
      );
      return;
    }

    setIsSavingProject(true);
    try {
      const created = await projectsService.create({
        ...draftProject,
        name: draftProject.name.trim(),
        key,
        description: draftProject.description?.trim() || undefined,
      });
      if (created) {
        setProjects((prev) => [created, ...prev]);
        showToast("Project created!", "success");
      }
      setIsCreateModalOpen(false);
      setDraftProject(EMPTY_DRAFT);
      setKeyTouched(false);
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
      showToast("Select a workspace member.", "error");
      return;
    }

    setIsSendingInvite(true);
    try {
      await projectsService.inviteMember(selectedProjectId, {
        invitedUserId: selectedUserId,
        role: inviteRole || undefined,
      });
      showToast("Member assigned to project.", "success");
      setIsInviteModalOpen(false);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not assign member.";
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
        <p className="page-subtitle">
          {workspace?.name
            ? `Projects in ${workspace.name}`
            : "Create projects and assign workspace members"}
        </p>
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
          <Search className="topbar-search-icon" size={16} strokeWidth={1.75} aria-hidden />
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
          Assign member
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={openCreateModal}
          disabled={!canCreateProject}
          title={
            canCreateProject
              ? "Create a project in this workspace"
              : "Guests cannot create projects"
          }
        >
          + New Project
        </button>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card c1">
            <div className="project-header">
              <div className="project-icon bg-teal">{project.key || "PRJ"}</div>
              <span className={`project-status ${STATUS_CLASS[project.status]}`}>
                {STATUS_LABELS[project.status]}
              </span>
            </div>
            <h3 className="project-name">{project.name}</h3>
            <p className="project-desc">{project.description || "No description"}</p>
            {project.projectType ? (
              <p
                className="project-meta"
                style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}
              >
                {PROJECT_TYPE_LABELS[project.projectType]}
              </p>
            ) : null}
            <div className="project-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill fill-teal"
                  style={{
                    width: `${Math.min(100, Math.max(0, project.progress || 0))}%`,
                  }}
                />
              </div>
              <span className="progress-label">{project.progress || 0}%</span>
            </div>
            <div className="project-footer">
              <span className="project-due">
                {project.dueDate ? formatShortDate(project.dueDate) : "No due date"}
              </span>
              <div className="project-actions" style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openInviteModal(project.id)}
                >
                  Assign to Project
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openMembersModal(project.id, project.name)}
                >
                  Manage Members
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isCreateModalOpen ? (
        <div className="modal-backdrop open">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create project</h3>
              <IconCloseButton onClick={() => setIsCreateModalOpen(false)} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Project name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. TaskFlow V2"
                  value={draftProject.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Key *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="TF"
                  value={draftProject.key}
                  maxLength={10}
                  onChange={(event) => {
                    setKeyTouched(true);
                    setDraftProject((prev) => ({
                      ...prev,
                      key: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                    }));
                  }}
                />
                <small style={{ color: "var(--slate-400)" }}>
                  Short unique prefix for issues (e.g. TF-124)
                </small>
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
              <div className="form-group">
                <label className="form-label">Project type</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((type) => (
                    <label
                      key={type}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                        color: "var(--slate-300)",
                      }}
                    >
                      <input
                        type="radio"
                        name="projectType"
                        checked={draftProject.projectType === type}
                        onChange={() =>
                          setDraftProject((prev) => ({ ...prev, projectType: type }))
                        }
                      />
                      {PROJECT_TYPE_LABELS[type]}
                    </label>
                  ))}
                </div>
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
                  <DatePickerField
                    value={draftProject.dueDate || ""}
                    onChange={(value) =>
                      setDraftProject((prev) => ({ ...prev, dueDate: value }))
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
              <h3 className="modal-title">Assign workspace member</h3>
              <IconCloseButton onClick={() => setIsInviteModalOpen(false)} />
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: "var(--slate-400)", fontSize: "0.875rem" }}>
                Invite people to the workspace from Team first, then assign them here.
              </p>
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
                <label className="form-label">Workspace member *</label>
                <select
                  className="form-input select-input"
                  value={selectedUserId}
                  onChange={(event) =>
                    setSelectedUserId(event.target.value ? Number(event.target.value) : "")
                  }
                  disabled={isMembersLoading}
                >
                  <option value="">
                    {isMembersLoading
                      ? "Loading members..."
                      : workspaceMembers.length
                        ? "Select member"
                        : "No workspace members — invite from Team"}
                  </option>
                  {workspaceMembers.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {resolveMemberName(member)}
                      {member.email ? ` (${member.email})` : ""}
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
                {isSendingInvite ? "Assigning..." : "Assign to project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {membersProjectId ? (
        <ProjectMembersModal
          projectId={membersProjectId}
          projectName={membersProjectName}
          onClose={() => setMembersProjectId(null)}
          onMembersChanged={() => {
            void loadProjects();
          }}
        />
      ) : null}
    </div>
  );
}
