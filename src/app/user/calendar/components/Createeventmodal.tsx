import { CalendarEventColor, CreateCalendarEventPayload } from "@/dto/calendar";

interface CreateEventModalProps {
  draftEvent: CreateCalendarEventPayload;
  isSaving: boolean;
  onChange: (updated: CreateCalendarEventPayload) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const COLOR_OPTIONS: CalendarEventColor[] = ["teal", "violet", "rose", "amber", "blue"];

export default function CreateEventModal({
  draftEvent,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}: CreateEventModalProps) {
  const set = (partial: Partial<CreateCalendarEventPayload>) =>
    onChange({ ...draftEvent, ...partial });

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Create New Event</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sprint Planning"
              value={draftEvent.title}
              onChange={(e) => set({ title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={draftEvent.date}
                onChange={(e) => set({ date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <select
                className="form-input select-input"
                value={draftEvent.color}
                onChange={(e) => set({ color: e.target.value as CalendarEventColor })}
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={draftEvent.startTime || ""}
                onChange={(e) => set({ startTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={draftEvent.endTime || ""}
                onChange={(e) => set({ endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={draftEvent.description || ""}
              onChange={(e) => set({ description: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}