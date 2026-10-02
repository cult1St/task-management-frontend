"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import onboardingService from "@/services/onboarding.service";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/useToast";
import { ErrorResponse } from "@/dto/auth";
import { OnboardingInviteItem } from "@/dto/onboarding";
import { getOnboardingPath } from "@/utils/onboarding";
import OnboardingShell from "../components/OnboardingShell";
import { useOnboardingGate } from "../hooks/useOnboardingGate";
import { Plus, X } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyInvite = (): OnboardingInviteItem => ({
  email: "",
  role: "Contributor",
});

export default function InviteTeammatesPage() {
  const router = useRouter();
  const { setOnboarding } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const { isReady } = useOnboardingGate("INVITE_TEAM");

  const [invites, setInvites] = useState<OnboardingInviteItem[]>([emptyInvite()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const updateInvite = (
    index: number,
    field: keyof OnboardingInviteItem,
    value: string
  ) => {
    setInvites((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addRow = () => {
    setInvites((prev) => [...prev, emptyInvite()]);
  };

  const removeRow = (index: number) => {
    setInvites((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const advance = (onboarding: Awaited<ReturnType<typeof onboardingService.skipInvites>>) => {
    if (!onboarding) return;
    setOnboarding(onboarding);
    router.replace(getOnboardingPath(onboarding.currentStep));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const cleaned = invites
      .map((item) => ({
        email: item.email.trim().toLowerCase(),
        role: item.role?.trim() || "Contributor",
      }))
      .filter((item) => item.email.length > 0);

    if (cleaned.length === 0) {
      showToast("Add at least one email, or skip this step.", "error");
      return;
    }

    const invalid = cleaned.find((item) => !EMAIL_REGEX.test(item.email));
    if (invalid) {
      showToast(`Invalid email: ${invalid.email}`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const onboarding = await onboardingService.sendInvites({ invites: cleaned });
      showToast("Invites sent.", "success");
      advance(onboarding);
    } catch (err: unknown) {
      const errData = err as ErrorResponse;
      showToast(errData?.message || "Could not send invites.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);
    try {
      const onboarding = await onboardingService.skipInvites();
      showToast("Skipped invites.", "info");
      advance(onboarding);
    } catch (err: unknown) {
      const errData = err as ErrorResponse;
      showToast(errData?.message || "Could not skip invites.", "error");
    } finally {
      setIsSkipping(false);
    }
  };

  if (!isReady) {
    return (
      <div className="user-auth-loading">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Loading onboarding...
        </div>
      </div>
    );
  }

  return (
    <OnboardingShell
      currentStep="INVITE_TEAM"
      title="Invite teammates"
      subtitle="Optional — you can always invite people later from Team."
      toasts={toasts}
      onDismissToast={removeToast}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {invites.map((invite, index) => (
          <div key={index} className="onboarding-invite-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="teammate@company.com"
                value={invite.email}
                onChange={(e) => updateInvite(index, "email", e.target.value)}
              />
            </div>
            <div className="form-group" style={{ width: 140 }}>
              <label className="form-label">Role</label>
              <input
                className="form-input"
                value={invite.role || ""}
                onChange={(e) => updateInvite(index, "role", e.target.value)}
                placeholder="Contributor"
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary onboarding-invite-remove"
              onClick={() => removeRow(index)}
              disabled={invites.length <= 1}
              aria-label="Remove invite row"
            >
              <X size={16} strokeWidth={2} aria-hidden />
            </button>
          </div>
        ))}

        <button type="button" className="btn btn-secondary" onClick={addRow}>
          <Plus size={16} strokeWidth={2} aria-hidden className="btn-inline-icon" />
          Add another
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: "100%", padding: "0.85rem", opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? "Sending..." : "Send invites"}
        </button>

        <button
          type="button"
          className="btn btn-outline"
          onClick={handleSkip}
          disabled={isSkipping}
          style={{ width: "100%", padding: "0.85rem" }}
        >
          {isSkipping ? "Skipping..." : "Skip for now"}
        </button>
      </form>
    </OnboardingShell>
  );
}
