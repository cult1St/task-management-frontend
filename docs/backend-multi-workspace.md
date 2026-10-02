# Backend: Multi-workspace (list / switch)

Frontend supports Slack-style workspace **switching** (not creating extra workspaces from the shell). These endpoints are **required** for list + switch. Today OpenAPI only exposes `/workspaces/current*`.

Related: [backend-workspace.md](./backend-workspace.md), [backend-roadmap.md](./backend-roadmap.md).

---

## 1. Product rules

| Rule | Detail |
|------|--------|
| Users can belong to many workspaces | Via ownership (onboarding) or invite accept — **not** by creating more from the app shell |
| No multi-create in product UI | Frontend switcher is **switch-only**. Extra workspaces come from invites / onboarding only |
| One **active** workspace per session | All `/workspaces/current/*`, projects, tasks, chat resolve to that workspace |
| Switcher in sidebar | Lists memberships; switch reloads app shell |
| Invites are workspace-scoped | `POST /workspaces/current/invites` `{ email, role }` — **not** project email invites |
| Project assignment | After someone is a workspace member, assign them to a project via `POST /projects/{id}/invitations` with `invitedUserId` |

---

## 2. Endpoints to add

### 2.1 `GET /workspaces`

**Auth:** Bearer.

List every workspace the caller belongs to.

**Response `data`:**

```json
[
  {
    "workspace": {
      "id": 1,
      "name": "Wealth Technologies",
      "slug": "wealth-technologies",
      "createdAt": "2026-03-01T12:00:00.000Z"
    },
    "role": "OWNER"
  },
  {
    "workspace": {
      "id": 2,
      "name": "Side Project",
      "slug": "side-project",
      "createdAt": "2026-03-10T09:00:00.000Z"
    },
    "role": "MEMBER"
  }
]
```

Same shape as `CurrentWorkspaceResponse` / `CurrentWorkspaceDTO` items.

### 2.2 `POST /workspaces/{workspaceId}/switch`

**Auth:** Bearer + membership on `{workspaceId}`.

Sets the caller’s **active** workspace for subsequent `/workspaces/current/*` calls.

**Response `data`:** current workspace + role for the newly active workspace.

**403/404** if not a member.

---

## 3. Active workspace resolution

Use both (FE already does):

1. **Server preference** — `switch` updates the caller’s active workspace. All `/workspaces/current/*` use that by default.
2. **`X-Workspace-Id` header** — FE sends the selected workspace id on every request after switch. Backend CORS must allow this header (alongside `authorization` and `content-type`). Still verify membership server-side; do not trust the header alone for authorization.

Existing `GET/PATCH /workspaces/current` and all `/workspaces/current/chat/*`, `members`, `invites`, `dashboard` stay unchanged — they just resolve against the active workspace.

---

## 4. Invitation model changes

`InvitationDTO` (received/sent) should support workspace invites:

```json
{
  "id": 10,
  "workspaceId": 2,
  "workspaceName": "Acme Engineering",
  "projectId": null,
  "projectName": null,
  "inviterName": "Ada",
  "invitedUserEmail": "bob@example.com",
  "role": "MEMBER",
  "status": "PENDING",
  "createdAt": "2026-03-10"
}
```

Rules:

1. `POST /workspaces/current/invites` creates a **workspace** invitation (email + role).
2. Accept → insert `workspace_members`; do **not** require a project.
3. Legacy project invitations may still appear with `projectId` / `projectName`.
4. FE Invitations page shows a Workspace vs Project chip and links Team / Projects accordingly.

Project collaborator add remains:

```
POST /projects/{projectId}/invitations
{ "invitedUserId": 8, "role": "Contributor" }
```

Caller should only assign users who are already workspace members (FE enforces this; BE should too).

---

## 5. Frontend alignment (already shipped)

| Surface | Behavior |
|---------|----------|
| Sidebar switcher | Lists memberships; switch → reload (**no create**) |
| `WorkspaceProvider` | `list` + `current`; `switchWorkspace` |
| `X-Workspace-Id` | Sent from `sessionStorage.selectedWorkspaceId` (CORS allows it) |
| `/user/team` | Members + invite by email (`POST .../invites`) |
| `/user/projects` | “Assign member” from workspace members (not global email search) |
| `/user/invitations` | Workspace-first labels |

Until `GET /workspaces` and `POST /workspaces/{id}/switch` exist, switch will error; Team + current-workspace chat still work on the single current workspace.

---

## 6. Joint testing checklist

- [ ] `GET /workspaces` returns all memberships  
- [ ] `POST /workspaces/{id}/switch` changes current; previous workspace data no longer returned from `/projects`  
- [ ] Non-member switch → 403  
- [ ] `POST /workspaces/current/invites` → invitee sees workspace invite in `/invitations/received`  
- [ ] Accept join → member appears in `GET /workspaces/current/members`  
- [ ] Assign project only works for workspace members  
- [ ] DM/channel messages stay isolated per workspace after switch  

Update this file when enums or paths change.
