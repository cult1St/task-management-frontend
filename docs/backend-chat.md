# Backend: Workspace Chat Contract

Frontend chat at `/user/chat` talks to **localhost** in development via:

```
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
```

Related: [backend-workspace.md](./backend-workspace.md) (workspace security boundary + roles).

---

## 1. Product model

```
Workspace
  ├── Channels (workspace-scoped)
  │     ├── #general          ← auto-created with workspace
  │     ├── #development      ← OWNER/ADMIN create
  │     └── …
  ├── Direct Messages         ← 1:1 between workspace members
  └── Project channels        ← V2.1+ (schema-ready, not in FE yet)
        └── Project: TaskFlow V2
              ├── #general
              └── …
```

### Status

| Feature | Status |
|---------|--------|
| Auto-create `#general` | Done (BE) |
| List / create workspace channels | Done — FE wired |
| List DMs / start DM | Done — FE wired |
| Channel + DM messages (REST) | Done — FE wired |
| STOMP realtime | Done — FE subscribes to channel topic + `/user/queue/chat` |
| Project-scoped channels UI | Later |

---

## 2. Suggested schema

```
chat_channels
  id, workspace_id, project_id NULL,
  name, slug, description,
  scope: WORKSPACE | PROJECT,
  is_default boolean,
  created_by, created_at

chat_channel_members   -- optional if all workspace members see WORKSPACE channels
  channel_id, user_id, …

chat_dm_threads
  id, workspace_id, created_at

chat_dm_participants
  thread_id, user_id

chat_messages          -- next phase
  id, workspace_id,
  channel_id NULL, dm_thread_id NULL,
  sender_id, body, created_at
```

All rows must include `workspace_id` for authorization.

---

## 3. Roles

| Action | OWNER | ADMIN | MEMBER | GUEST |
|--------|-------|-------|--------|-------|
| View `#general` + workspace channels | ✓ | ✓ | ✓ | limited / read-only |
| Post messages (next phase) | ✓ | ✓ | ✓ | ✗ or restricted |
| Create / archive channels | ✓ | ✓ | ✗ | ✗ |
| Start / view own DMs | ✓ | ✓ | ✓ | ✗ |

Frontend uses `canManageWorkspace` (OWNER \| ADMIN) to show **Create channel**.

---

## 4. Endpoints (current FE)

Base: authenticated user; workspace resolved server-side (`/workspaces/current/...`).

### 4.1 `GET /workspaces/current/chat/channels`

**Response `data`:** `ChannelDTO[]`

```json
[
  {
    "id": 1,
    "name": "general",
    "slug": "general",
    "description": "Workspace-wide conversation",
    "scope": "WORKSPACE",
    "isDefault": true,
    "createdAt": "2026-03-01T12:00:00.000Z"
  }
]
```

Sort: `#general` / `isDefault` first, then alphabetical by slug.

If the API is missing, the FE falls back to a local `#general` placeholder.

### 4.2 `POST /workspaces/current/chat/channels`

**Auth:** OWNER or ADMIN only (`403` otherwise).

**Body:**

```json
{
  "name": "development",
  "description": "optional"
}
```

**Behavior:**

- Normalize `slug` from name (`^[a-z0-9]+(-[a-z0-9]+)*$`, unique per workspace).
- `scope: WORKSPACE`, `projectId` omitted.
- Do not allow recreating reserved `general` slug.

**Response `data`:** created `ChannelDTO`.

### 4.3 `GET /workspaces/current/chat/dms`

**Response `data`:** `DmThreadDTO[]`

```json
[
  {
    "id": 10,
    "peerUserId": 5,
    "peerName": "Jane Doe",
    "peerInitials": "JD",
    "peerAvatarUrl": null,
    "lastMessagePreview": null,
    "lastMessageAt": null,
    "unreadCount": 0
  }
]
```

Empty array is fine until DMs are used.

---

## 5. Messages + DMs (live)

Verified against OpenAPI on `http://localhost:8080/v3/api-docs`.

### 5.1 Channel messages

- `GET /workspaces/current/chat/channels/{channelId}/messages?limit=&before=`
- `POST /workspaces/current/chat/channels/{channelId}/messages` `{ "body": "..." }`

### 5.2 DM threads

- `GET /workspaces/current/chat/dms`
- `POST /workspaces/current/chat/dms` `{ "peerUserId": 5 }` — start or return existing thread
- `GET /workspaces/current/chat/dms/{threadId}/messages?limit=&before=`
- `POST /workspaces/current/chat/dms/{threadId}/messages` `{ "body": "..." }`

### 5.3 Message DTO

```json
{
  "id": 1,
  "workspaceId": 1,
  "channelId": 2,
  "dmThreadId": null,
  "senderId": 3,
  "senderName": "Alex",
  "senderInitials": "AJ",
  "senderAvatarUrl": null,
  "body": "Hello",
  "createdAt": "2026-03-01T12:00:00.000Z"
}
```

### 5.4 Realtime (SockJS + STOMP)

- WS: `http://localhost:8080/ws` (env `NEXT_PUBLIC_WS_URL`)
- Channel topic: `/topic/workspaces.{workspaceId}.channels.{channelId}`
- User queue: `/user/queue/chat`
- CONNECT header: `Authorization: Bearer <token>`

### Project channels (V2.1+)

- `scope: PROJECT` + `projectId`
- Nested under project resources later; not required for current FE.

---

## 6. Security

Same pipeline as workspace resources:

```
Authenticated user → workspace membership → channel/DM belongs to workspace → role → allow/403
```

Never leak channels or DMs across workspaces by ID.

---

## 7. Alignment with workspace creation

When `POST /onboarding/workspace` (or equivalent) succeeds:

1. Create workspace + OWNER membership  
2. **Also** create default `#general` channel (`is_default: true`)

---

## 8. Joint testing checklist

- [ ] New workspace has `#general` via list channels  
- [ ] MEMBER can list channels; cannot create (`403`)  
- [ ] OWNER/ADMIN can create `#development`  
- [ ] Duplicate slug rejected  
- [ ] DM list returns `[]` or valid threads for members only  
- [ ] Cross-workspace channel ID returns `403`/`404`  

---

## 9. Frontend ownership

- `src/app/user/chat/**`
- `src/services/chat.service.ts`
- `src/dto/chat.d.ts`

Update this file when message/realtime endpoints ship.

Realtime publish + toast/Chrome notifications: [backend-chat-realtime-notifications.md](./backend-chat-realtime-notifications.md).
