# Invitations Endpoints Used By Frontend

This page documents all endpoints used by `src/app/user/invitations/page.tsx` and `src/services/invitations.service.ts`.

Base response shape for all successful requests:
```json
{
  "message": "string",
  "data": {}
}
```

## DTO used by frontend

`ProjectInvitationDTO`:
```json
{
  "id": 1,
  "projectId": 10,
  "projectName": "Website Redesign",
  "inviterId": 3,
  "inviterName": "Jane Doe",
  "invitedUserId": 8,
  "invitedUserName": "John Smith",
  "invitedUserEmail": "john@example.com",
  "role": "Contributor",
  "status": "PENDING",
  "createdAt": "2026-02-27T12:00:00.000Z",
  "updatedAt": "2026-02-27T12:00:00.000Z"
}
```

`status` enum expected:
`PENDING | ACCEPTED | REJECTED | REMOVED`

## Read endpoints

1. `GET /invitations/received`
Query params (optional):
`status`, `projectId`
Response `data`: `ProjectInvitationDTO[]`

2. `GET /invitations/sent`
Query params (optional):
`status`, `projectId`
Response `data`: `ProjectInvitationDTO[]`

## Action endpoints

Preferred implementation:

1. `PATCH /invitations/:invitationId/accept`
Body: none
Response `data`: updated `ProjectInvitationDTO` with `status: "ACCEPTED"`

2. `PATCH /invitations/:invitationId/reject`
Body: none
Response `data`: updated `ProjectInvitationDTO` with `status: "REJECTED"`

3. `PATCH /invitations/:invitationId/cancel`
Body: none
Response `data`: updated `ProjectInvitationDTO` with `status: "REMOVED"` (or equivalent canceled state)

Fallback endpoints still supported by frontend:

1. `PATCH /invitations/:invitationId/respond`
Body:
```json
{ "action": "accept" }
```
or
```json
{ "action": "reject" }
```
Response `data`: updated `ProjectInvitationDTO`

2. `DELETE /invitations/:invitationId`
Response `data`:
```json
{ "id": 1 }
```

## Notes

1. Frontend first tries preferred endpoints for accept/reject/cancel.
2. If backend returns `404` or `405` on preferred endpoints, frontend automatically falls back to `/respond` and `DELETE /invitations/:id`.
