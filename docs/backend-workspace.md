# Backend: Workspace V2 Contract

This document describes the **workspace-centric** model TaskFlow frontend expects for V2.

Related: [backend-onboarding.md](./backend-onboarding.md) (registration creates the user’s first workspace + OWNER membership).

---

## 1. Product rules (V2)

| Rule | Detail |
|------|--------|
| One workspace per user (free plan) | Soft limit; multi-workspace list/create/switch is now in [backend-multi-workspace.md](./backend-multi-workspace.md). |
| Workspace is the security boundary | Projects, tasks, members, chat, meetings, files all belong to a workspace. |
| Server-side workspace context | Prefer resolving the caller’s current workspace from the auth token. Do **not** trust a client-supplied `workspaceId` for authorization. |
| Roles | `OWNER`, `ADMIN`, `MEMBER`, `GUEST` on `workspace_members`. |

---

## 2. Suggested schema

```
users
  └── workspace_members (workspace_id, user_id, role, joined_at)
        └── workspaces
              ├── projects (workspace_id, key, project_type, ...)
              │     └── tasks / issues
              ├── channels / chat (future)
              └── meetings (future)
```

`workspace_members.role`:

```ts
type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
```

Onboarding `POST /onboarding/workspace` must:

1. Create `workspaces` row  
2. Insert `workspace_members` with `role: OWNER`  
3. Enforce one owned workspace per free-plan user  

---

## 3. Authorization pipeline

Every workspace-scoped request:

```
Authenticated user
  → load membership for resource’s workspace
  → resource.workspace_id matches membership
  → role permits action
  → allow / 403
```

**Cross-workspace ID guessing** must return `403` (or `404` if you prefer not to leak existence). Never return another workspace’s project/task because the ID was guessed.

---

## 4. Role permission matrix (baseline)

| Capability | OWNER | ADMIN | MEMBER | GUEST |
|------------|-------|-------|--------|-------|
| View workspace dashboard | ✓ | ✓ | ✓ | ✓ (limited) |
| Rename workspace / settings | ✓ | ✓ | ✗ | ✗ |
| Manage members / invites | ✓ | ✓ | ✗ | ✗ |
| Delete workspace | ✓ | ✗ | ✗ | ✗ |
| Create projects | ✓ | ✓ | ✓ | ✗ |
| Manage projects (edit/archive) | ✓ | ✓ | own / allowed | ✗ |
| Create / edit tasks | ✓ | ✓ | ✓ | view-only / assigned |
| Chat / meetings (future) | ✓ | ✓ | ✓ | restricted |

Frontend gates:

- `canManageWorkspace` = OWNER \| ADMIN  
- `canCreateProject` = OWNER \| ADMIN \| MEMBER  

**Backend must still enforce** these rules; UI gating is not security.

---

## 5. Endpoints

### 5.1 `GET /workspaces/current`

**Auth:** Bearer required.

**Response `data`:**

```json
{
  "workspace": {
    "id": 1,
    "name": "Wealth Technologies",
    "slug": "wealth-technologies",
    "createdAt": "2026-03-01T12:00:00.000Z"
  },
  "role": "OWNER"
}
```

If the user has no workspace yet (onboarding incomplete), return `404` or `409` with a clear message — frontend onboarding gate should prevent this for completed users.

### 5.2 `PATCH /workspaces/current`

**Auth:** Bearer + OWNER/ADMIN.

**Body:**

```json
{ "name": "Wealth Technologies" }
```

**Response `data`:** updated `WorkspaceDTO`.

Frontend Settings → Workspace calls this first; may fall back to legacy `PATCH /users/me/settings/workspace` if needed during migration.

### 5.3 `GET /workspaces/current/dashboard` (recommended aggregate)

Optional but preferred so the FE can stop composing multiple calls.

**Response `data` example:**

```json
{
  "stats": {
    "projects": 8,
    "myOpenTasks": 14,
    "activeSprints": 0
  },
  "myWork": [ /* TaskDTO[] */ ],
  "recentActivity": [ /* NotificationDTO[] or ActivityDTO[] */ ],
  "projectProgress": [ /* ProjectDTO[] */ ]
}
```

Until this exists, frontend composes:

- `GET /projects`
- `GET /tasks?scope=mine`
- `GET /notifications`

### 5.4 Projects (server-side workspace)

#### `GET /projects`

Return only projects in workspaces the user belongs to (V2: typically one).

#### `POST /projects`

**Do not require `workspaceId` from the client.** Attach the user’s current/primary workspace server-side.

**Body:**

```json
{
  "name": "TaskFlow V2",
  "key": "TF",
  "description": "optional",
  "projectType": "SOFTWARE",
  "status": "ACTIVE",
  "dueDate": "YYYY-MM-DD"
}
```

**Enums:**

- `projectType`: `SOFTWARE` | `BUSINESS` | `MARKETING` | `CUSTOM`
- `key`: 2–10 chars, `^[A-Z][A-Z0-9]{1,9}$`, unique **within workspace**

**Response `data`:** `ProjectDTO` including `id`, `name`, `key`, `projectType`, `workspaceId`, `status`, `progress`, …

#### `PATCH /projects/:id` / `DELETE /projects/:id`

Must verify membership on that project’s workspace.

Onboarding `POST /onboarding/first-project` should accept the same create fields (`name`, `key`, `projectType`, …) and create under the user’s workspace.

---

## 6. Frontend alignment

| FE surface | Behavior |
|------------|----------|
| `WorkspaceProvider` | Loads `GET /workspaces/current` after auth |
| Sidebar | Shows workspace name + role; **switcher live** (needs list/create/switch APIs) |
| Dashboard | Workspace title; stats: Projects / My Tasks / Active Sprints |
| Projects create | name, key, type, description; gated by `canCreateProject` |
| Settings → Workspace | `PATCH /workspaces/current`; gated by `canManageWorkspace` |

Coming soon (no APIs yet): Backlog, Sprints, Meetings, Activity feed page.

Team is live at `/user/team` (members + workspace email invites). Chat at `/user/chat`. Multi-workspace: [backend-multi-workspace.md](./backend-multi-workspace.md).

**Full remaining-feature queue for backend:** [backend-roadmap.md](./backend-roadmap.md).

---

## 7. Workspace invitations (vs project assignment)

Onboarding and Team invites are **workspace-level**.

| Concern | Workspace invites | Project assignment |
|---------|-------------------|--------------------|
| When | Onboarding / Team page | After user is a workspace member |
| Endpoints | `POST /onboarding/invites`, `POST /workspaces/current/invites` | `POST /projects/:projectId/invitations` |
| Body | `{ email, role? }` or `{ invites: [{ email, role? }] }` | `{ invitedUserId, role? }` |
| Effect on accept | Insert `workspace_members` | Project collaborator membership |
| Skip | Allowed during onboarding | N/A |

Rules:

1. Skipping invites must still allow reaching the dashboard.  
2. Accepting a workspace invite grants access to that workspace (chat, projects list per role).  
3. Do **not** invite to a project by email as the primary path — invite to workspace, then assign project/task.  
4. `InvitationDTO` should include `workspaceId` / `workspaceName` for workspace invites (see multi-workspace doc).

Also documented in [backend-onboarding.md](./backend-onboarding.md).

---

## 8. Joint testing checklist

- [ ] After onboarding workspace step, `GET /workspaces/current` returns workspace + `OWNER`  
- [ ] `POST /projects` without `workspaceId` creates project in that workspace  
- [ ] Guest cannot create projects (`403`)  
- [ ] Member of workspace A cannot `GET/PATCH` project from workspace B by ID  
- [ ] OWNER/ADMIN can rename via `PATCH /workspaces/current`  
- [ ] MEMBER gets `403` on rename  
- [ ] Project `key` uniqueness enforced per workspace  
- [ ] Login resume still respects onboarding; completed users see workspace shell  
- [ ] Skip onboarding invites → still reach dashboard after remaining steps  
- [ ] `POST /workspaces/current/invites` creates workspace invite (not project)  

---

## 9. Out of scope (this doc)

- Billing  
- Full GUEST project-scoped ACLs  
- Meetings / sprints implementations  

Multi-workspace list/create/switch: **in scope** — see [backend-multi-workspace.md](./backend-multi-workspace.md).

Update this file when endpoints or enums change so FE/BE stay aligned.
