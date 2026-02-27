import { ProjectAssigneeDTO, TaskDTO, TaskStatus } from "@/dto/tasks";

type TaskEditForm = {
  status?: TaskStatus;
  progress?: number;
  assignedToId?: number;
};

type TaskEditModalProps = {
  isOpen: boolean;
  isUpdating: boolean;
  editTask: TaskDTO | null;
  editForm: TaskEditForm;
  projectAssignees: ProjectAssigneeDTO[];
  isAssigneesLoading: boolean;
  currentUserId?: number;
  getAssigneeId: (task: TaskDTO) => number | undefined;
  getCreatorId: (task: TaskDTO) => number | undefined;
  onClose: () => void;
  onSave: () => void;
  onEditChange: (partial: TaskEditForm) => void;
};

export default function TaskEditModal({
  isOpen,
  isUpdating,
  editTask,
  editForm,
  projectAssignees,
  isAssigneesLoading,
  currentUserId,
  getAssigneeId,
  getCreatorId,
  onClose,
  onSave,
  onEditChange,
}: TaskEditModalProps) {
  if (!isOpen || !editTask) return null;

  const assigneeId = getAssigneeId(editTask);
  const creatorId = getCreatorId(editTask);
  const canUpdateStatus =
    currentUserId !== undefined && assigneeId !== undefined && currentUserId === assigneeId;
  const canReassign =
    currentUserId !== undefined && creatorId !== undefined && currentUserId === creatorId;

  return (
    <div className="modal-backdrop open" id="taskEditModal">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Update Task</h3>
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: "1rem", color: "var(--slate-400)", fontSize: "0.85rem" }}>
            {editTask.title} • {editTask.projectName || "No project"}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input select-input"
                value={editForm.status || editTask.status}
                onChange={(event) =>
                  onEditChange({ status: event.target.value as TaskStatus })
                }
                disabled={!canUpdateStatus}
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Progress (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="form-input"
                value={
                  typeof editForm.progress === "number"
                    ? editForm.progress
                    : editTask.progress ?? ""
                }
                onChange={(event) =>
                  onEditChange({
                    progress: event.target.value === "" ? undefined : Number(event.target.value),
                  })
                }
                disabled={!canUpdateStatus}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Reassign To</label>
              <select
                className="form-input select-input"
                value={editForm.assignedToId ?? assigneeId ?? ""}
                onChange={(event) =>
                  onEditChange({
                    assignedToId: event.target.value ? Number(event.target.value) : undefined,
                  })
                }
                disabled={!canReassign}
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
            </div>
          </div>

          {!currentUserId ? (
            <div style={{ marginTop: "0.5rem", color: "var(--slate-400)", fontSize: "0.8rem" }}>
              Sign in to update tasks.
            </div>
          ) : null}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onSave} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
