"use client";

import { useState } from "react";
import IconCloseButton from "@/components/IconCloseButton";
import { slugifyChannelName } from "@/utils/chat";

type CreateChannelModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; description?: string }) => void;
};

export default function CreateChannelModal({
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const slug = slugifyChannelName(name);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    onSubmit({
      name: trimmed,
      description: description.trim() || undefined,
    });
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Create channel</h3>
          <IconCloseButton onClick={handleClose} />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="channel-name">
                Name *
              </label>
              <input
                id="channel-name"
                className="form-input"
                placeholder="development"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {slug ? (
                <small style={{ color: "var(--slate-400)" }}>#{slug}</small>
              ) : null}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="channel-description">
                Description (optional)
              </label>
              <textarea
                id="channel-description"
                className="form-input"
                rows={3}
                placeholder="What is this channel for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || name.trim().length < 2}
            >
              {isSaving ? "Creating..." : "Create channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
