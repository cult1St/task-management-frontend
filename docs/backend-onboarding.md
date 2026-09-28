# Backend: Registration & Onboarding Contract

This document describes what the **TaskFlow backend** must implement so the frontend multi-step registration/onboarding flow can be tested end-to-end.

Frontend routes (already implemented):

| Step | Route | Required? |
|------|--------|-----------|
| Create account | `POST /auth/register` → `/onboarding/verify-email` | Yes |
| Verify email | `/onboarding/verify-email` | Yes |
| Create workspace | `/onboarding/workspace` | Yes |
| Workspace setup | `/onboarding/setup` | Yes |
| Invite teammates | `/onboarding/invite` | Optional (skippable) |
| First project | `/onboarding/first-project` | Optional (skippable) |
| Dashboard | `/user/dashboard` | After onboarding completes |

**Resume rule:** After login (or any visit to `/user/*`), if `onboarding.completed !== true`, the frontend redirects to the route for `onboarding.currentStep`. Progress must be persisted server-side.

---

## 1. Shared response envelope

All successful responses:

```json
{
  "message": "string",
  "data": {}
}
```

Validation / client errors should return HTTP `400` (or `422`) with:

```json
{
  "message": "Human-readable summary",
  "errors": {
    "fieldName": "Field-specific message"
  }
}
```

Auth failures: `401`. Forbidden step (e.g. calling setup before workspace): `403` or `409` with a clear `message`.

---

## 2. Onboarding status object

Include this object on **login** (verified users), **verify-email** (success), **GET /auth/me**, and every **onboarding mutation** response (under `data.onboarding`, and optionally nested on `data.user.onboarding`).

Register may optionally return an `onboarding` snapshot **without** a token; the client does not call authenticated APIs until verify succeeds.

```ts
type OnboardingStep =
  | "VERIFY_EMAIL"
  | "CREATE_WORKSPACE"
  | "WORKSPACE_SETUP"
  | "INVITE_TEAM"
  | "FIRST_PROJECT"
  | "DONE";

interface OnboardingStatus {
  completed: boolean;
  currentStep: OnboardingStep;
  emailVerified: boolean;
  workspaceCreated: boolean;
  workspaceSetupCompleted: boolean;
  firstProjectCreated: boolean;
}
```

### Step machine (required behavior)

| After action | `currentStep` | Flags |
|--------------|---------------|--------|
| Register | `VERIFY_EMAIL` | all flags `false`, `completed: false` |
| Verify email OK | `CREATE_WORKSPACE` | `emailVerified: true` |
| Create workspace OK | `WORKSPACE_SETUP` | `workspaceCreated: true` |
| Setup OK | `INVITE_TEAM` | `workspaceSetupCompleted: true` |
| Invites send **or** skip | `FIRST_PROJECT` | (no required flag) |
| First project create **or** skip | `DONE` | `completed: true`; set `firstProjectCreated: true` only if a project was created |

**`completed` must be `true` only when `currentStep === "DONE"`.**

Required gate before dashboard (frontend enforces via `completed`):

1. Email verified  
2. Workspace created  
3. Workspace setup completed  

Invite + first project do **not** block completion if skipped via the skip endpoints.

### Legacy users

If an existing user has no onboarding record, either:

- Return `completed: true`, `currentStep: "DONE"`, and all flags `true`, **or**
- Omit `onboarding` entirely (frontend treats missing as completed for backward compatibility).

New registrations **must** always include `onboarding`.

---

## 3. Auth endpoints

### Token policy (important)

| Moment | Issue JWT / session token? |
|--------|----------------------------|
| `POST /auth/register` | **No** |
| `POST /auth/login` (email not verified) | **No** — return `EMAIL_NOT_VERIFIED` |
| `POST /auth/login` (email verified) | **Yes** |
| `POST /auth/verify-email` (success) | **Yes** — first token for new users |
| `POST /auth/resend-verification` | **No** (public, email in body) |

Unverified users must not receive a Bearer token. Frontend keeps only a pending email in `sessionStorage` until verify succeeds.

### 3.1 `POST /auth/register` (extend existing)

**Body:**

```json
{
  "fullName": "string",
  "email": "string",
  "password": "string"
}
```

**Behavior:**

1. Create user account (unverified).
2. Generate a **6-digit** email verification code; email it to the user.
3. **Do not** issue a JWT / session token.
4. Return a confirmation payload (optional `onboarding` snapshot for documentation; frontend does not need a token to proceed).

**Response `data` (no token):**

```json
{
  "email": "alex@company.com",
  "onboarding": {
    "completed": false,
    "currentStep": "VERIFY_EMAIL",
    "emailVerified": false,
    "workspaceCreated": false,
    "workspaceSetupCompleted": false,
    "firstProjectCreated": false
  }
}
```

Frontend then navigates to `/onboarding/verify-email` and stores the email locally for verify/resend.

### 3.2 `POST /auth/login` (extend existing)

Same body as today (`email`, `password`).

**If email is verified:** return `token`, `user`, and `onboarding` (resume mid-onboarding if `completed: false`).

**If email is not verified:**

- Do **not** return a token.
- Respond with HTTP `403` (or `401`) and:

```json
{
  "message": "Please verify your email before signing in.",
  "code": "EMAIL_NOT_VERIFIED"
}
```

Frontend stores the email and redirects to `/onboarding/verify-email`.

### 3.3 `GET /auth/me` (extend existing)

Requires Bearer token. Must include `onboarding` on the user/profile payload. Only callable after successful verify (or login of a verified user).

### 3.4 `POST /auth/verify-email`

**Auth:** **None** (public). Identify the user by email + code.

**Body:**

```json
{
  "email": "alex@company.com",
  "code": "123456"
}
```

**Behavior:**

- Validate email exists and code matches (exact, not expired).
- Mark email verified.
- Advance onboarding to `CREATE_WORKSPACE` (`emailVerified: true`).
- **Issue the auth token here** (first session for the user).

**Success `data`:**

```json
{
  "token": "jwt...",
  "user": {
    "id": 1,
    "fullName": "Alex Johnson",
    "email": "alex@company.com",
    "role": "Member",
    "onboarding": {
      "completed": false,
      "currentStep": "CREATE_WORKSPACE",
      "emailVerified": true,
      "workspaceCreated": false,
      "workspaceSetupCompleted": false,
      "firstProjectCreated": false
    }
  },
  "onboarding": { "...same as user.onboarding..." }
}
```

**Errors:**

- Invalid/expired code → `400` `{ "message": "Invalid or expired verification code." }`
- Unknown email → `400` (generic message; avoid user enumeration if preferred)
- Already verified → prefer idempotent `200` with token + current onboarding, **or** `409`

### 3.5 `POST /auth/resend-verification`

**Auth:** **None** (public).

**Body:**

```json
{ "email": "alex@company.com" }
```

**Behavior:**

- Generate new 6-digit code; invalidate previous.
- Send email.
- Rate-limit (recommended: max 1 per 60 seconds per email; frontend shows 60s cooldown).
- Use a generic success message even if the email is unknown (optional anti-enumeration).

**Success:** `{ "message": "Verification code sent.", "data": {} }`

**Errors:** already verified → `400`; rate limited → `429` with message.

### 3.6 `DELETE /auth/logout`

Unchanged (requires Bearer token).

---

## 4. Onboarding endpoints

All require `Authorization: Bearer <token>`.

Reject with `403`/`409` if the user is not on the expected step (or allow idempotent replay of the current step).

### 4.1 `POST /onboarding/workspace`

**Body:**

```json
{ "workspaceName": "Acme Engineering" }
```

**Validation:** `workspaceName` required, min length 2, max ~80.

**Behavior:**

- Create workspace (or set workspace settings name) owned by the user.
- Sync with existing settings if applicable: `PATCH /users/me/settings/workspace` semantics (`workspaceName`).
- Set `workspaceCreated: true`, `currentStep: "WORKSPACE_SETUP"`.

**Response:** `{ message, data: { onboarding, workspace?: { id, name } } }`

### 4.2 `POST /onboarding/setup`

**Body:**

```json
{
  "roleTitle": "Engineering Manager",
  "teamSize": "1-5",
  "primaryUseCase": "engineering"
}
```

**Enums:**

- `teamSize`: `"1-5"` | `"6-20"` | `"21-50"` | `"51+"`
- `primaryUseCase`: `"engineering"` | `"product"` | `"marketing"` | `"ops"` | `"other"`

**Behavior:**

- Persist setup fields on user/workspace profile (`roleTitle` may map to existing profile `roleTitle`).
- Set `workspaceSetupCompleted: true`, `currentStep: "INVITE_TEAM"`.

**Response:** `{ message, data: { onboarding } }`

### 4.3 `POST /onboarding/invites`

**Body:**

```json
{
  "invites": [
    { "email": "sam@company.com", "role": "Contributor" }
  ]
}
```

**Behavior:**

- Accept 1+ invites; validate emails.
- Send invitation emails to join the **workspace** (not necessarily a project yet). Recipients may or may not already have accounts.
- This is **separate from** existing project invitations (`POST /projects/:projectId/invitations`), but may reuse invitation infrastructure.
- Advance to `FIRST_PROJECT` whether or not invitees already exist.

**Response:** `{ message, data: { onboarding, invitesSent?: number } }`

### 4.4 `POST /onboarding/invites/skip`

**Body:** none.

**Behavior:** Advance to `FIRST_PROJECT` without sending invites.

**Response:** `{ message, data: { onboarding } }`

### 4.5 `POST /onboarding/first-project`

**Body:**

```json
{
  "name": "Website Redesign",
  "description": "optional",
  "dueDate": "YYYY-MM-DD",
  "status": "ACTIVE"
}
```

**Behavior:**

- Create a project in the user’s workspace (same shape as `POST /projects`).
- Set `firstProjectCreated: true`, `currentStep: "DONE"`, `completed: true`.

**Response:** `{ message, data: { onboarding, project?: { id, name, ... } } }`

### 4.6 `POST /onboarding/first-project/skip`

**Body:** none.

**Behavior:** Set `currentStep: "DONE"`, `completed: true`, leave `firstProjectCreated: false`.

**Response:** `{ message, data: { onboarding } }`

---

## 5. Email verification details

| Item | Requirement |
|------|-------------|
| Code format | Exactly 6 digits |
| Expiry | Recommend 10–15 minutes |
| Resend | New code invalidates old; rate limit ~60s |
| Delivery | Plain text + HTML email with code |
| Security | Do not return the code in API responses |

---

## 6. What “completed” unlocks

When `onboarding.completed === true`:

- Frontend allows `/user/dashboard` and the rest of the app shell.
- Incomplete users must **not** access `/user/*` (frontend redirects; backend should still enforce for write APIs if desired).

Suggested backend enforcement (optional but recommended):

- Block task/project mutations until `workspaceSetupCompleted` (or `completed`).
- Allow public `/auth/verify-email` and `/auth/resend-verification` without a token.
- Require Bearer token for all `/onboarding/*` endpoints (workspace onward).

---

## 7. Frontend ↔ backend field map

| Frontend field | Suggested storage |
|----------------|-------------------|
| `workspaceName` | Workspace entity / `users.me.settings.workspace.workspaceName` |
| `roleTitle` | User profile `roleTitle` |
| `teamSize` | New column/JSON on user or workspace |
| `primaryUseCase` | New column/JSON on user or workspace |
| Invite emails | Workspace invitation table + email job |
| First project | Existing `projects` table |

---

## 8. Joint testing checklist

Once backend is deployed, verify:

- [ ] Register → **no token** in response → lands on verify-email → email arrives with 6-digit code  
- [ ] Verify with `{ email, code }` → **token issued** → advances to workspace  
- [ ] Wrong code shows error; resend works with `{ email }` and respects rate limit  
- [ ] Login while unverified → `code: EMAIL_NOT_VERIFIED`, **no token** → redirected to verify-email  
- [ ] Login after verify → token + resume onboarding if incomplete  
- [ ] Create workspace → setup → invite (send) → first project → dashboard  
- [ ] Create workspace → setup → **skip** invite → **skip** project → dashboard (`completed: true`)  
- [ ] Logout mid-flow (after verify) → login → resumes at same `currentStep`  
- [ ] Hitting `/user/dashboard` while incomplete redirects to correct onboarding step  
- [ ] `GET /auth/me` returns up-to-date `onboarding` after each authenticated step  
- [ ] Legacy user without onboarding still reaches dashboard  
- [ ] Duplicate submit on a completed step is safe (idempotent or clear error)

---

## 9. Out of scope for this contract

- OAuth / Google signup  
- Real Slack/GitHub integration toggles  
- Changing JWT storage (frontend still uses `sessionStorage`)  
- Replacing existing project-scoped invitation APIs  

---

## 10. Contact / ownership

Frontend implementation lives under:

- `src/app/onboarding/**`
- `src/services/auth.service.ts` (verify / resend)
- `src/services/onboarding.service.ts`
- `src/utils/onboarding.ts`
- `src/context/auth-context.tsx`

Update this file if endpoint paths or enums change so FE/BE stay aligned.
