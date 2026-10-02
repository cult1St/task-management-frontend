# Backend: Chat realtime + push notifications

Contract for **live message delivery**, **receiver UX**, and **browser / toast notifications**. Frontend already expects this behavior.

Related: [backend-chat.md](./backend-chat.md), [backend-multi-workspace.md](./backend-multi-workspace.md).

---

## 1. Goals

| Goal | Backend responsibility |
|------|------------------------|
| Sender sees message immediately | REST `POST .../messages` returns full `ChatMessageDTO` |
| Receiver sees message without refresh | Publish STOMP frame after every successful send |
| Progress / presence of activity | Update DM `lastMessagePreview` / `lastMessageAt` via list payloads; FE also soft-polls |
| Toast + Chrome notification | Push to chat user queue **and** optionally create a `CHAT_MESSAGE` notification |
| Workspace switcher after invite accept | Membership must appear on next `GET /workspaces` |

---

## 2. REST (already live)

| Method | Path |
|--------|------|
| `GET` | `/workspaces/current/chat/channels/{channelId}/messages` |
| `POST` | `/workspaces/current/chat/channels/{channelId}/messages` `{ "body": "..." }` |
| `GET` | `/workspaces/current/chat/dms/{threadId}/messages` |
| `POST` | `/workspaces/current/chat/dms/{threadId}/messages` `{ "body": "..." }` |
| `POST` | `/workspaces/current/chat/dms` `{ "peerUserId" }` |

**Required response for every `POST .../messages`:**

```json
{
  "message": "ok",
  "data": {
    "id": 101,
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
}
```

Do **not** return an empty `data` body — FE uses it for optimistic→confirmed replacement.

---

## 3. STOMP publish rules (critical)

### Transport

- SockJS endpoint: `NEXT_PUBLIC_WS_URL` (dev: `http://localhost:8080/ws`)
- CONNECT header: `Authorization: Bearer <jwt>`
- CORS / STOMP auth must allow the FE origin

### After every successful channel message

Publish the **same** `ChatMessageDTO` (or `{ "message": ChatMessageDTO }` / `{ "data": ChatMessageDTO }`) to:

1. `/topic/workspaces.{workspaceId}.channels.{channelId}` — all channel subscribers  
2. `/user/queue/chat` — **each** workspace member who should be notified (at least members who are not the active sender UI; safest: all members except you may still include sender — FE dedupes by `id`)

### After every successful DM message

Publish to `/user/queue/chat` for **both** participants (sender + peer).  
There is **no** DM topic on the FE — user queue is mandatory for DMs.

### Payload must include

- `id`, `body`, `createdAt`, `senderId`
- `channelId` **or** `dmThreadId`
- Prefer `senderName` / `senderInitials` for toast titles

### Idempotency

FE may receive the same message via REST (sender) and STOMP (broadcast). Dedupes by `id`.

---

## 4. Soft progress signals

So the UI shows “something happened” even before open-thread render:

1. `GET /workspaces/current/chat/dms` should return updated `lastMessagePreview`, `lastMessageAt`, and ideally `unreadCount` for the peer.
2. Optional: bump channel unread later; FE currently tracks DM unread client-side from STOMP when the thread is not selected.

FE also **polls open-thread messages every ~8s** as a fallback if STOMP is down. Realtime publish is still required for good UX.

---

## 5. Toast + Chrome notifications

### Path A — chat user queue (already used by FE)

`ChatNotifyListener` in the app shell listens to `/user/queue/chat`.

On inbound message from another user:

- Shows an in-app toast when the user is not focused on that thread / chat page
- Requests Chrome `Notification` permission (localhost/HTTPS) and shows a desktop notification

**Backend only needs reliable `/user/queue/chat` publishes** for this path.

### Path B — persisted notification (recommended)

Also create a row + push on the notifications queue:

| Field | Value |
|-------|--------|
| `type` | `CHAT_MESSAGE` |
| `title` | e.g. `New message from Alex` |
| `message` | truncated body |
| `channelId` / `dmThreadId` / `workspaceId` | optional deep-link hints |
| Destination | `/user/queue/notifications` (preferred; FE env may override) |

Emit when the recipient is not the sender. FE notification bell already prepends STOMP notifications.

---

## 6. Workspace invite → switcher refresh

After `ACCEPT` on a **workspace** invitation:

1. Insert `workspace_members` immediately  
2. Next `GET /workspaces` **must** include the new membership  

FE calls `WorkspaceProvider.refresh()` after accept so the sidebar switcher updates without a full logout.

---

## 7. Security checklist

- Publish only to members of the message’s workspace  
- Never publish another workspace’s channel topic by ID guess  
- DM user-queue frames only for the two participants  
- Still authorize every REST message write with membership + role  

---

## 8. Joint testing checklist

- [ ] User A sends channel message → User B sees it within ~1s without refresh  
- [ ] User A sends DM → User B sees it in open DM + preview updates  
- [ ] User B away from `/user/chat` gets toast (and Chrome notification if permitted)  
- [ ] Sender message shows “Sending…” then confirms (no stuck pending)  
- [ ] Duplicate STOMP+REST does not double-render  
- [ ] Accept workspace invite → new workspace appears in switcher list  
- [ ] Soft poll still catches messages if WS is killed  

---

## 9. Frontend ownership

| File | Role |
|------|------|
| `src/app/user/chat/page.tsx` | Optimistic send, stable STOMP, soft poll, live pill |
| `src/app/user/components/ChatNotifyListener.tsx` | App-wide toast + Chrome notifications |
| `src/utils/stomp.ts` | Destinations + client factory |
| `src/utils/browserNotifications.ts` | Permission + `Notification` API |
| `src/app/user/invitations/page.tsx` | `refresh()` after accept |

Update this file when destinations or notification types change.
