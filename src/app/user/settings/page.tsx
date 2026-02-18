"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { useAuth } from "@/context/auth-context";
import { AppearanceSettingsPayload, IntegrationSettingsPayload, NotificationPreferencesPayload, SecuritySettingsPayload, UserProfilePayload, WorkspaceSettingsPayload } from "@/dto/user";
import userService from "@/services/user.service";

type SettingsTab =
  | "profile"
  | "notifications"
  | "security"
  | "appearance"
  | "integrations"
  | "workspace";

interface LoadedUserShape {
  full_name?: string;
  fullName?: string;
  name?: string;
  email?: string;
  roleTitle?: string;
  role?: string;
  avatar?: string;
  avatar_url?: string;
  avatarUrl?: string;
  profile_image?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [profile, setProfile] = useState<UserProfilePayload>({
    fullName: "",
    email: "",
    roleTitle: "",
    avatarUrl: "",
  });

  const [notifications, setNotifications] =
    useState<NotificationPreferencesPayload>({
      taskAssignments: true,
      deadlineReminders: true,
      teamActivity: false,
      weeklyDigestEmail: true,
    });

  const [security, setSecurity] = useState<SecuritySettingsPayload>({
    twoFactorAuth: false,
    loginAlerts: true,
  });

  const [appearance, setAppearance] = useState<AppearanceSettingsPayload>({
    compactSidebar: false,
    reduceMotion: false,
  });

  const [integrations, setIntegrations] = useState<IntegrationSettingsPayload>({
    githubConnected: false,
    slackConnected: false,
    jiraConnected: false,
  });

  const [workspace, setWorkspace] = useState<WorkspaceSettingsPayload>({
    workspaceName: "My Workspace",
  });
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";
  const uploadFolder = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER || "taskflow/avatars";

  const displayName = useMemo(
    () =>
      profile.fullName ||
      user?.fullName ||
      user?.full_name ||
      user?.name ||
      "TaskFlow User",
    [profile.fullName, user?.fullName, user?.full_name, user?.name]
  );

  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "TF",
    [displayName]
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResponse = (await userService.getCurrentUser()) as
          | LoadedUserShape
          | { data?: LoadedUserShape };
        const me = ("data" in meResponse ? meResponse.data : meResponse) || {};

        setProfile((prev) => ({
          ...prev,
          fullName:
            me?.fullName ||
            me?.full_name ||
            me?.name ||
            user?.fullName ||
            user?.full_name ||
            user?.name ||
            "",
          email: me.email || user?.email || "",
          roleTitle: me.roleTitle || me.role || user?.role || "",
          avatarUrl:
            me.avatarUrl || me.avatar_url || me.avatar || me.profile_image || "",
        }));

        try {
          const settingsResponse = (await userService.getSettings()) as
            | Record<string, unknown>
            | { data?: Record<string, unknown> };

          const raw =
            (settingsResponse as { data?: Record<string, unknown> }).data ||
            (settingsResponse as Record<string, unknown>);

          if (raw?.notifications) {
            setNotifications((prev) => ({
              ...prev,
              ...(raw.notifications as Partial<NotificationPreferencesPayload>),
            }));
          }
          if (raw?.security) {
            setSecurity((prev) => ({
              ...prev,
              ...(raw.security as Partial<SecuritySettingsPayload>),
            }));
          }
          if (raw?.appearance) {
            setAppearance((prev) => ({
              ...prev,
              ...(raw.appearance as Partial<AppearanceSettingsPayload>),
            }));
          }
          if (raw?.integrations) {
            setIntegrations((prev) => ({
              ...prev,
              ...(raw.integrations as Partial<IntegrationSettingsPayload>),
            }));
          }
          if (raw?.workspace) {
            setWorkspace((prev) => ({
              ...prev,
              ...(raw.workspace as Partial<WorkspaceSettingsPayload>),
            }));
          }
        } catch {
          // Settings endpoint may not exist yet; local state still works.
        }
      } catch {
        setProfile((prev) => ({
          ...prev,
          fullName: user?.fullName || user?.full_name || user?.name || prev.fullName,
          email: user?.email || prev.email,
          roleTitle: user?.role || prev.roleTitle,
        }));
      }
    };

    void bootstrap();
  }, [user?.email, user?.fullName, user?.full_name, user?.name, user?.role]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await userService.updateProfile(profile);
      await refreshUser();
      await Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile changes were saved.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not save profile.";
      await Swal.fire({ icon: "error", title: "Save Failed", text: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUploaded = async (secureUrl: string) => {
    try {
      setIsUploadingAvatar(true);
      setProfile((prev) => ({ ...prev, avatarUrl: secureUrl }));
      await userService.updateProfile({
        ...profile,
        avatarUrl: secureUrl,
      });
      await refreshUser();

      await Swal.fire({
        icon: "success",
        title: "Avatar Updated",
        text: "Your profile image was uploaded successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not upload profile image.";
      await Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: message,
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      setIsUploadingAvatar(true);
      setProfile((prev) => ({ ...prev, avatarUrl: "" }));
      await userService.updateProfile({
        ...profile,
        avatarUrl: "",
      });
      await refreshUser();
      await Swal.fire({
        icon: "success",
        title: "Avatar Removed",
        text: "Profile image removed.",
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not remove profile image.";
      await Swal.fire({ icon: "error", title: "Remove Failed", text: message });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await userService.updateNotifications(notifications);
      await Swal.fire({
        icon: "success",
        title: "Notifications Saved",
        text: "Notification preferences updated.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not save notification settings.";
      await Swal.fire({ icon: "error", title: "Save Failed", text: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    setIsSaving(true);
    try {
      await userService.updateSecurity(security);
      await Swal.fire({
        icon: "success",
        title: "Security Saved",
        text: "Security settings updated.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not save security settings.";
      await Swal.fire({ icon: "error", title: "Save Failed", text: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      await userService.updateAppearance(appearance);
      await Swal.fire({
        icon: "success",
        title: "Appearance Saved",
        text: "Appearance preferences updated.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not save appearance settings.";
      await Swal.fire({ icon: "error", title: "Save Failed", text: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIntegrations = async () => {
    setIsSaving(true);
    try {
      await userService.updateIntegrations(integrations);
      await Swal.fire({
        icon: "success",
        title: "Integrations Saved",
        text: "Integration settings updated.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not save integration settings.";
      await Swal.fire({ icon: "error", title: "Save Failed", text: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWorkspace = async () => {
    setIsSaving(true);
    try {
      await userService.updateWorkspace(workspace);
      await Swal.fire({
        icon: "success",
        title: "Workspace Updated",
        text: "Workspace name saved.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not update workspace name.";
      await Swal.fire({ icon: "error", title: "Save Failed", text: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences</p>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          <button
            className={`settings-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`settings-nav-item ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
          <button
            className={`settings-nav-item ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
          <button
            className={`settings-nav-item ${activeTab === "appearance" ? "active" : ""}`}
            onClick={() => setActiveTab("appearance")}
          >
            Appearance
          </button>
          <button
            className={`settings-nav-item ${activeTab === "integrations" ? "active" : ""}`}
            onClick={() => setActiveTab("integrations")}
          >
            Integrations
          </button>
          <button
            className={`settings-nav-item ${activeTab === "workspace" ? "active" : ""}`}
            onClick={() => setActiveTab("workspace")}
          >
            Workspace
          </button>
          <button
            className="settings-nav-item"
            onClick={handleSignOut}
            style={{ color: "var(--rose-400)" }}
          >
            Sign Out
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "profile" ? (
            <>
              <div className="settings-section-title">Profile Information</div>
              <div className="settings-section-sub">
                Update your name, photo, and personal details.
              </div>

              <div className="avatar-upload">
                <div className="avatar-lg">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={`${displayName} avatar`}
                      className="avatar-lg-image"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--white)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {displayName}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <CldUploadWidget
                      options={{
                        maxFiles: 1,
                        resourceType: "image",
                        folder: uploadFolder,
                        sources: ["local", "url", "camera"],
                      }}
                      uploadPreset={uploadPreset}
                      config={{ cloud: { cloudName } }}
                      onQueuesStart={() => setIsUploadingAvatar(true)}
                      onSuccess={(result) => {
                        const payload = result as { info?: { secure_url?: string } };
                        const secureUrl = payload?.info?.secure_url;
                        if (secureUrl) {
                          void handleAvatarUploaded(secureUrl);
                        } else {
                          setIsUploadingAvatar(false);
                          void Swal.fire({
                            icon: "error",
                            title: "Upload Failed",
                            text: "Cloudinary did not return a valid image URL.",
                          });
                        }
                      }}
                      onError={() => {
                        setIsUploadingAvatar(false);
                        void Swal.fire({
                          icon: "error",
                          title: "Upload Failed",
                          text: "Could not upload image to Cloudinary.",
                        });
                      }}
                    >
                      {({ open }) => (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => open()}
                          disabled={isUploadingAvatar}
                          type="button"
                        >
                          {isUploadingAvatar ? "Uploading..." : "Upload photo"}
                        </button>
                      )}
                    </CldUploadWidget>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleAvatarRemove}
                      disabled={isUploadingAvatar || !profile.avatarUrl}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Role / Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.roleTitle}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, roleTitle: e.target.value }))
                  }
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : null}

          {activeTab === "notifications" ? (
            <>
              <div className="settings-section-title">Notification Preferences</div>
              <div className="settings-section-sub">
                Choose what you want to be notified about.
              </div>

              <ToggleRow
                title="Task Assignments"
                description="When someone assigns you to a task"
                value={notifications.taskAssignments}
                onToggle={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    taskAssignments: !prev.taskAssignments,
                  }))
                }
              />
              <ToggleRow
                title="Deadline Reminders"
                description="Get reminded 24 hours before a task is due"
                value={notifications.deadlineReminders}
                onToggle={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    deadlineReminders: !prev.deadlineReminders,
                  }))
                }
              />
              <ToggleRow
                title="Team Activity"
                description="Updates on project activity from your team"
                value={notifications.teamActivity}
                onToggle={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    teamActivity: !prev.teamActivity,
                  }))
                }
              />
              <ToggleRow
                title="Weekly Digest Email"
                description="Summary of your week's work every Friday"
                value={notifications.weeklyDigestEmail}
                onToggle={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    weeklyDigestEmail: !prev.weeklyDigestEmail,
                  }))
                }
              />

              <button
                className="btn btn-primary"
                onClick={handleSaveNotifications}
                disabled={isSaving}
                style={{ marginTop: "1rem" }}
              >
                {isSaving ? "Saving..." : "Save Notification Settings"}
              </button>
            </>
          ) : null}

          {activeTab === "security" ? (
            <>
              <div className="settings-section-title">Security</div>
              <div className="settings-section-sub">
                Strengthen access and account protection.
              </div>

              <ToggleRow
                title="Two-Factor Authentication"
                description="Require an extra verification step on login"
                value={security.twoFactorAuth}
                onToggle={() =>
                  setSecurity((prev) => ({
                    ...prev,
                    twoFactorAuth: !prev.twoFactorAuth,
                  }))
                }
              />
              <ToggleRow
                title="Login Alerts"
                description="Email me when a new login is detected"
                value={security.loginAlerts}
                onToggle={() =>
                  setSecurity((prev) => ({
                    ...prev,
                    loginAlerts: !prev.loginAlerts,
                  }))
                }
              />

              <button
                className="btn btn-primary"
                onClick={handleSaveSecurity}
                disabled={isSaving}
                style={{ marginTop: "1rem" }}
              >
                {isSaving ? "Saving..." : "Save Security Settings"}
              </button>
            </>
          ) : null}

          {activeTab === "appearance" ? (
            <>
              <div className="settings-section-title">Appearance</div>
              <div className="settings-section-sub">
                Control display and dashboard visual behavior.
              </div>

              <ToggleRow
                title="Compact Sidebar"
                description="Use a denser sidebar layout by default"
                value={appearance.compactSidebar}
                onToggle={() =>
                  setAppearance((prev) => ({
                    ...prev,
                    compactSidebar: !prev.compactSidebar,
                  }))
                }
              />
              <ToggleRow
                title="Reduce Motion"
                description="Minimize non-essential animations"
                value={appearance.reduceMotion}
                onToggle={() =>
                  setAppearance((prev) => ({
                    ...prev,
                    reduceMotion: !prev.reduceMotion,
                  }))
                }
              />

              <button
                className="btn btn-primary"
                onClick={handleSaveAppearance}
                disabled={isSaving}
                style={{ marginTop: "1rem" }}
              >
                {isSaving ? "Saving..." : "Save Appearance Settings"}
              </button>
            </>
          ) : null}

          {activeTab === "integrations" ? (
            <>
              <div className="settings-section-title">Integrations</div>
              <div className="settings-section-sub">
                Manage app integrations connected to your workspace.
              </div>

              <ToggleRow
                title="GitHub"
                description="Enable GitHub sync for issues and pull requests"
                value={integrations.githubConnected}
                onToggle={() =>
                  setIntegrations((prev) => ({
                    ...prev,
                    githubConnected: !prev.githubConnected,
                  }))
                }
              />
              <ToggleRow
                title="Slack"
                description="Send task and project updates to Slack"
                value={integrations.slackConnected}
                onToggle={() =>
                  setIntegrations((prev) => ({
                    ...prev,
                    slackConnected: !prev.slackConnected,
                  }))
                }
              />
              <ToggleRow
                title="Jira"
                description="Link Jira tickets with TaskFlow tasks"
                value={integrations.jiraConnected}
                onToggle={() =>
                  setIntegrations((prev) => ({
                    ...prev,
                    jiraConnected: !prev.jiraConnected,
                  }))
                }
              />

              <button
                className="btn btn-primary"
                onClick={handleSaveIntegrations}
                disabled={isSaving}
                style={{ marginTop: "1rem" }}
              >
                {isSaving ? "Saving..." : "Save Integration Settings"}
              </button>
            </>
          ) : null}

          {activeTab === "workspace" ? (
            <>
              <div className="settings-section-title">Workspace</div>
              <div className="settings-section-sub">
                Update your current workspace details.
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Workspace Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={workspace.workspaceName}
                  onChange={(e) =>
                    setWorkspace((prev) => ({
                      ...prev,
                      workspaceName: e.target.value,
                    }))
                  }
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSaveWorkspace}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Workspace"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onToggle,
}: {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-info">
        <div className="settings-row-title">{title}</div>
        <div className="settings-row-desc">{description}</div>
      </div>
      <button className={`toggle ${value ? "on" : ""}`} onClick={onToggle}>
        <div className="toggle-knob" />
      </button>
    </div>
  );
}
