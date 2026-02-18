"use client";

import { useEffect, useMemo, useState } from "react";
import projectsService from "@/services/projects.service";
import { CreateProjectPayload, ProjectDTO, ProjectStatus } from "@/dto/projects";
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

export default function ProjectsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "ARCHIVED">(
    "ALL"
  );
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftProject, setDraftProject] = useState<CreateProjectPayload>({
    name: "",
    description: "",
    status: "ACTIVE",
    dueDate: "",
  });

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

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    return projects.filter((project) =>
      project.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  const handleCreateProject = async () => {
    if (!draftProject.name.trim()) {
      showToast("Project name is required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const created = await projectsService.create(draftProject);
      if (created) {
        setProjects((prev) => [created, ...prev]);
        showToast("Project created!", "success");
      }
      setIsModalOpen(false);
      setDraftProject({ name: "", description: "", status: "ACTIVE", dueDate: "" });
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not create project.";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">Active projects across your workspace</p>
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
          <span className="topbar-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          className="btn btn-primary btn-sm"
          style={{ marginLeft: "auto" }}
          onClick={() => setIsModalOpen(true)}
        >
          + New Project
        </button>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card c1">
            <div className="project-header">
              <div className="project-icon bg-teal">📁</div>
              <span className={`project-status ${STATUS_CLASS[project.status]}`}>
                ● {STATUS_LABELS[project.status]}
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
            <div className="project-footer">
              <div className="project-team">
                {(project.teamInitials || ["TF"]).map((member, idx) => (
                  <div key={`${project.id}-${member}-${idx}`} className="project-team-avatar">
                    {member}
                  </div>
                ))}
              </div>
              <span className="project-due">📅 {project.dueDate || "No due date"}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop open">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create New Project</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
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
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateProject}
                disabled={isSaving}
              >
                {isSaving ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
