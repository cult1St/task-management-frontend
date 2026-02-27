import { CreateTaskPayload, ProjectAssigneeDTO, TaskPriority } from "@/dto/tasks";
import { ProjectDTO } from "@/dto/projects";

type TaskCreateModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  draftTask: CreateTaskPayload;
  projects: ProjectDTO[];
  projectAssignees: ProjectAssigneeDTO[];
  isProjectsLoading: boolean;
  isAssigneesLoading: boolean;
  onClose: () => void;
  onCreate: () => void;
  onDraftChange: (partial: Partial<CreateTaskPayload>) => void;
};

export default function TaskCreateModal({
  isOpen,
  isSaving,
  draftTask,
  projects,
  projectAssignees,
  isProjectsLoading,
  isAssigneesLoading,
  onClose,
  onCreate,
  onDraftChange,
}: TaskCreateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop open" id="taskModal">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Create New Task</h3>
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Design new onboarding flow"
              value={draftTask.title}
              onChange={(event) => onDraftChange({ title: event.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Add task details..."
              value={draftTask.description}
              onChange={(event) => onDraftChange({ description: event.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-input select-input"
                value={draftTask.priority}
                onChange={(event) =>
                  onDraftChange({ priority: event.target.value as TaskPriority })
                }
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={draftTask.dueDate || ""}
                onChange={(event) => onDraftChange({ dueDate: event.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select
                className="form-input select-input"
                value={draftTask.projectId || ""}
                disabled={isProjectsLoading}
                onChange={(event) =>
                  onDraftChange({
                    projectId: event.target.value ? Number(event.target.value) : undefined,
                    assignedToId: undefined,
                  })
                }
              >
                <option value="">
                  {isProjectsLoading ? "Loading projects..." : "Select project"}
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {!isProjectsLoading && !projects.length ? (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--slate-400)",
                    marginTop: "0.4rem",
                  }}
                >
                  No projects found. Create a project first, then add tasks under it.
                </div>
              ) : null}
            </div>

            {draftTask.projectId ? (
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select
                  className="form-input select-input"
                  value={draftTask.assignedToId || ""}
                  onChange={(event) =>
                    onDraftChange({
                      assignedToId: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  disabled={isAssigneesLoading}
                >
                  <option value="">
                    {isAssigneesLoading ? "Loading collaborators..." : "Unassigned"}
                  </option>
                  {projectAssignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </option>
                  ))}
                </select>
                {!isAssigneesLoading && !projectAssignees.length ? (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--slate-400)",
                      marginTop: "0.4rem",
                    }}
                  >
                    No collaborators in this project yet. Invite from Projects page.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onCreate} disabled={isSaving}>
            {isSaving ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
