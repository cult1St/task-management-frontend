import { ProjectDTO } from "@/dto/projects";
import { TaskPriority } from "@/dto/tasks";

type FilterValue = "all" | "mine" | "team" | "overdue";
type ViewValue = "kanban" | "list";

type TaskToolbarProps = {
  activeFilter: FilterValue;
  onFilterChange: (value: FilterValue) => void;
  projectFilter: number | "ALL";
  onProjectFilterChange: (value: number | "ALL") => void;
  projects: ProjectDTO[];
  priorityFilter: TaskPriority | "ALL";
  onPriorityFilterChange: (value: TaskPriority | "ALL") => void;
  view: ViewValue;
  onViewChange: (value: ViewValue) => void;
  onAddTask: () => void;
};

export default function TaskToolbar({
  activeFilter,
  onFilterChange,
  projectFilter,
  onProjectFilterChange,
  projects,
  priorityFilter,
  onPriorityFilterChange,
  view,
  onViewChange,
  onAddTask,
}: TaskToolbarProps) {
  return (
    <div className="tasks-toolbar">
      <div className="filter-tabs">
        {[
          { value: "all", label: "All" },
          { value: "mine", label: "Mine" },
          { value: "team", label: "Team" },
          { value: "overdue", label: "Overdue" },
        ].map((filter) => (
          <button
            key={filter.value}
            className={`filter-tab ${activeFilter === filter.value ? "active" : ""}`}
            onClick={() => onFilterChange(filter.value as FilterValue)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <select
        className="select-input"
        value={projectFilter}
        onChange={(e) =>
          onProjectFilterChange(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
        }
      >
        <option value="ALL">All Projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      <select
        className="select-input"
        value={priorityFilter}
        onChange={(e) => onPriorityFilterChange(e.target.value as TaskPriority | "ALL")}
      >
        <option value="ALL">All Priorities</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      <div className="view-toggle" style={{ marginLeft: "auto" }}>
        <button
          className={`view-btn ${view === "kanban" ? "active" : ""}`}
          data-tip="Kanban"
          onClick={() => onViewChange("kanban")}
        >
          KB
        </button>
        <button
          className={`view-btn ${view === "list" ? "active" : ""}`}
          data-tip="List"
          onClick={() => onViewChange("list")}
        >
          LS
        </button>
      </div>

      <button className="btn btn-primary btn-sm" onClick={onAddTask}>
        + Add Task
      </button>
    </div>
  );
}
