# Backend corrections: chat latency + off-page notifications

Frontend updates for low-latency delivery and dashboard toasts/Chrome notifications are already shipped. This document lists **backend fixes required** so those features work end-to-end.

Related: [backend-chat.md](./backend-chat.md), [backend-chat-realtime-notifications.md](./backend-chat-realtime-notifications.md).

---

## 1. Observed FE symptoms

| Symptom | Likely backend cause |
|---------|----------------------|
| ~1–2s delay before peer sees a message | STOMP publish delayed, missing, or SockJS falls back because WS/STOMP auth fails; FE then relies on 2s REST poll |
| Peer on **dashboard** gets no toast / Chrome notification | Message never sent to `/user/queue/chat` for that user (channel topic alone is not enough when they are not on `/user/chat`) |
| Live pill shows “Syncing…” | Client never stays `CONNECTED` on `/ws` — check auth headers / CORS / SockJS |

---

## 2. Latency — required backend behavior

### 2.1 Publish **before** (or immediately when) the HTTP response returns

After `POST .../messages` persists the row:

1. Build the full `ChatMessageDTO`  
2. **Publish STOMP frames synchronously** (same request thread after DB commit)  
3. Then return `200` with `data: ChatMessageDTO`

Avoid:

- `@Async` publish with no urgency  
- Publishing only after a scheduled job  
- Returning HTTP **before** `SimpMessagingTemplate` send completes  

Target: peer receives STOMP frame within **200ms** after sender’s POST succeeds.

Recommended Spring pattern:

```java
TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
  @Override
  public void afterCommit() {
    messagingTemplate.convertAndSend(channelTopic, dto);
    messagingTemplate.convertAndSendToUser(peerUsername, "/queue/chat", dto);
  }
});
```

`afterCommit` is fine **as long as** it runs immediately after commit (not queued behind slow work).

### 2.2 Destinations (mandatory)

| Event | Publish to |
|-------|------------|
| Channel message | `/topic/workspaces.{workspaceId}.channels.{channelId}` **and** `/user/queue/chat` for each member who should be alerted (at minimum: all members except optional skip of sender) |
| DM message | `/user/queue/chat` for **both** participants |

FE user-queue subscription path: `/user/queue/chat`  
(Spring `convertAndSendToUser(user, "/queue/chat", payload)`).

**Username for `convertAndSendToUser`:** must match the principal name used when the SockJS/STOMP client authenticates with `Authorization: Bearer <jwt>` (usually email or user id string — keep consistent).

### 2.3 WebSocket transport

- Endpoint: `/ws` (SockJS)  
- Prefer enabling raw WebSocket under SockJS so clients do not fall back to xhr-streaming (extra latency)  
- CONNECT must accept `Authorization: Bearer …`  
- CORS must allow the FE origin for WS upgrade  

---

## 3. Off-page toast / Chrome notifications — required backend behavior

FE `ChatNotifyListener` runs in the **user shell** (dashboard, projects, etc.) and listens to `/user/queue/chat`.

### 3.1 Always fan out to the recipient user queue

Whenever user B should learn about a new message from user A:

```
convertAndSendToUser(B, "/queue/chat", chatMessageDto)
```

even if B is **not** subscribed to the channel topic (they are on `/user/dashboard`).

Without this, B only learns when they open chat (REST) — **no toast**.

### 3.2 Recommended: also persist `CHAT_MESSAGE` notification

| Field | Example |
|-------|---------|
| `type` | `CHAT_MESSAGE` |
| `title` | `New message from Ada` |
| `message` | truncated body |
| `userId` | recipient id |
| `channelId` / `dmThreadId` / `workspaceId` | optional |

Push the notification DTO on `/user/queue/notifications` (or the configured notifications destination). FE bell already listens and forwards `CHAT_MESSAGE` into the same toast/Chrome path.

### 3.3 When to notify

| Recipient state | Backend |
|-----------------|---------|
| Always (simplest) | Always user-queue chat frame; FE suppresses toast if user is already viewing that thread |
| Optimized | Skip user-queue toast payload only if you track “active thread” presence (optional; not required) |

Do **not** skip `/user/queue/chat` for DMs.

---

## 4. Payload contract (unchanged, strict)

```json
{
  "id": 101,
  "workspaceId": 1,
  "channelId": 2,
  "dmThreadId": null,
  "senderId": 3,
  "senderName": "Alex",
  "senderInitials": "AJ",
  "body": "Hello",
  "createdAt": "2026-03-01T12:00:00.000Z"
}
```

Wrappers `{ "message": ... }` or `{ "data": ... }` are also accepted by FE.

---

## 5. Acceptance tests (backend)

- [ ] A sends channel message → B’s browser (on **dashboard**) gets STOMP `/user/queue/chat` within **200ms** of A’s HTTP 200  
- [ ] A sends DM → B gets `/user/queue/chat` within **200ms**  
- [ ] Channel topic subscribers still receive `/topic/workspaces.{ws}.channels.{id}`  
- [ ] SockJS connects with Bearer token; transport is `websocket` in FE network panel  
- [ ] Optional: `CHAT_MESSAGE` appears on notifications queue for B  
- [ ] Wrong-workspace IDs never publish to B  

---

## 6. Frontend already done (do not block on)

- Shared `ChatRealtimeProvider` (one chat SockJS client)  
- Prefer WebSocket transports; reconnect 2s  
- Adaptive REST poll: **2s when offline**, 15s backup when live  
- Off-page toast (7s) + Chrome `Notification` via `ChatNotifyListener`  
- Portal toasts (`z-index` 10050)  

If latency remains ~2s with Live pill green, the delay is almost certainly **server-side publish timing** — fix §2.

---

Update this file when publish destinations or principal mapping change.
