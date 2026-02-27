"use client";

import { useCallback, useEffect, useState } from "react";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import invitationsService from "@/services/invitations.service";
import { InvitationStatus, ProjectInvitationDTO } from "@/dto/invitations";

type InvitationTab = "received" | "sent";

const STATUS_COLOR: Record<InvitationStatus, string> = {
  PENDING: "var(--amber-400)",
  ACCEPTED: "#4ade80",
  REJECTED: "var(--rose-400)",
  REMOVED: "var(--slate-400)",
};

export default function InvitationsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<InvitationTab>("received");
  const [received, setReceived] = useState<ProjectInvitationDTO[]>([]);
  const [sent, setSent] = useState<ProjectInvitationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

  const loadInvitations = useCallback(async () => {
    setIsLoading(true);
    try {
      const [receivedData, sentData] = await Promise.all([
        invitationsService.listReceived(),
        invitationsService.listSent(),
      ]);
      setReceived(receivedData || []);
      setSent(sentData || []);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load invitations.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  const handleRespond = async (
    invitationId: number,
    action: "ACCEPT" | "REJECT"
  ) => {
    setIsSubmitting(invitationId);
    try {
      const updated =
        action === "ACCEPT"
          ? await invitationsService.accept(invitationId)
          : await invitationsService.reject(invitationId);
      if (!updated) {
        throw new Error("Invitation update returned no data.");
      }
      setReceived((prev) =>
        prev.map((item) => (item.id === invitationId ? updated : item))
      );
      showToast(
        action === "ACCEPT" ? "Invitation accepted." : "Invitation rejected.",
        "success"
      );
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not update invitation.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCancel = async (invitationId: number) => {
    setIsSubmitting(invitationId);
    try {
      const result = await invitationsService.cancel(invitationId);
      setSent((prev) => {
        if (result && typeof result === "object" && "status" in result) {
          return prev.map((item) => (item.id === invitationId ? result : item));
        }
        return prev.filter((item) => item.id !== invitationId);
      });
      showToast("Invitation canceled.", "success");
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not cancel invitation.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const current = activeTab === "received" ? received : sent;


  console.log(isSubmitting);
  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Invitations</h1>
        <p className="page-subtitle">Manage project invitations and collaboration access</p>
      </div>

      <div className="tasks-toolbar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === "received" ? "active" : ""}`}
            onClick={() => setActiveTab("received")}
          >
            Received ({received.length})
          </button>
          <button
            className={`filter-tab ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Sent ({sent.length})
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {activeTab === "received" ? "Received Invitations" : "Sent Invitations"}
          </span>
        </div>
        <div style={{ padding: "1rem" }}>
          {isLoading ? (
            <div className="empty-state">
              <div className="empty-state-desc">Loading invitations...</div>
            </div>
          ) : current.length ? (
            current.map((invite) => (
              <div key={invite.id} className="task-item">
                <div className="task-info">
                  <div className="task-name">{invite.projectName}</div>
                  <div className="task-meta-row">
                    <span className="task-due">
                      {activeTab === "received"
                        ? `Invited by ${invite.inviterName || "Project owner"}`
                        : `Invited ${invite.invitedUserName || invite.invitedUserEmail || "user"}`}
                    </span>
                    <span
                      className="chip"
                      style={{
                        color: STATUS_COLOR[invite.status],
                        border: `1px solid ${STATUS_COLOR[invite.status]}`,
                      }}
                    >
                      {invite.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {activeTab === "received" && invite.status === "PENDING" ? (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={isSubmitting === invite.id}
                        onClick={() => void handleRespond(invite.id, "REJECT")}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={isSubmitting === invite.id}
                        onClick={() => void handleRespond(invite.id, "ACCEPT")}
                      >
                        Accept
                      </button>
                    </>
                  ) : null}

                  {activeTab === "sent" && invite.status === "PENDING" ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={isSubmitting === invite.id}
                      onClick={() => void handleCancel(invite.id)}
                    >
                      Cancel Invite
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-title">No invitations found</div>
              <div className="empty-state-desc">
                {activeTab === "received"
                  ? "You have no incoming invitations right now."
                  : "No project invitations have been sent yet."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
