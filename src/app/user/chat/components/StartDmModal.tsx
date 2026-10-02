"use client";

import { useEffect, useState } from "react";
import IconCloseButton from "@/components/IconCloseButton";
import { WorkspaceMemberDTO } from "@/dto/workspace";
import workspaceService from "@/services/workspace.service";

type StartDmModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  currentUserId?: number;
  onClose: () => void;
  onSubmit: (peerUserId: number) => void;
};

export default function StartDmModal({
  isOpen,
  isSaving,
  currentUserId,
  onClose,
  onSubmit,
}: StartDmModalProps) {
  const [members, setMembers] = useState<WorkspaceMemberDTO[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        try {
          const list = await workspaceService.listMembers(search.trim() || undefined);
          setMembers(
            (list || []).filter((member) => member.userId !== currentUserId)
          );
        } catch {
          setMembers([]);
        } finally {
          setIsLoading(false);
        }
      })();
    }, 200);

    return () => clearTimeout(timeout);
  }, [isOpen, search, currentUserId]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSearch("");
    setSelectedUserId("");
    onClose();
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Start direct message</h3>
          <IconCloseButton onClick={handleClose} />
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Search teammates</label>
            <input
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Member</label>
            <select
              className="form-input select-input"
              value={selectedUserId}
              onChange={(e) =>
                setSelectedUserId(e.target.value ? Number(e.target.value) : "")
              }
              disabled={isLoading}
            >
              <option value="">
                {isLoading ? "Loading members..." : "Select a member"}
              </option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.fullName}
                  {member.email ? ` (${member.email})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isSaving || !selectedUserId}
            onClick={() => {
              if (typeof selectedUserId === "number") {
                onSubmit(selectedUserId);
              }
            }}
          >
            {isSaving ? "Opening..." : "Open DM"}
          </button>
        </div>
      </div>
    </div>
  );
}
