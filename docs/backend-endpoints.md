# Backend Endpoints Reference

This document lists the endpoints expected by the frontend pages (settings, tasks, projects, calendar, team).

## Auth

1. `POST /auth/login`
Body:
```
{ "email": "string", "password": "string" }
```

2. `POST /auth/register`
Body:
```
{ "fullName": "string", "email": "string", "password": "string" }
```

3. `GET /auth/me`
Response:
```
{ "message": "string", "data": { "id": 1, "fullName": "string", "email": "string", "role": "string", "avatarUrl": "string?" } }
```

4. `DELETE /auth/logout`

## Settings

1. `GET /users/me`
Response:
```
{ "message": "string", "data": { "id": 1, "fullName": "string", "email": "string", "role": "string", "avatarUrl": "string?" } }
```

2. `PATCH /users/me`
Body:
```
{ "fullName": "string", "email": "string", "roleTitle": "string", "avatarUrl": "string?" }
```

3. `GET /users/me/settings`
Response:
```
{
  "message": "string",
  "data": {
    "notifications": { "taskAssignments": true, "deadlineReminders": true, "teamActivity": false, "weeklyDigestEmail": true },
    "security": { "twoFactorAuth": false, "loginAlerts": true },
    "appearance": { "compactSidebar": false, "reduceMotion": false },
    "integrations": { "githubConnected": false, "slackConnected": false, "jiraConnected": false },
    "workspace": { "workspaceName": "string" }
  }
}
```

4. `PATCH /users/me/settings/notifications`
Body:
```
{ "taskAssignments": true, "deadlineReminders": true, "teamActivity": false, "weeklyDigestEmail": true }
```

5. `PATCH /users/me/settings/security`
Body:
```
{ "twoFactorAuth": false, "loginAlerts": true }
```

6. `PATCH /users/me/settings/appearance`
Body:
```
{ "compactSidebar": false, "reduceMotion": false }
```

7. `PATCH /users/me/settings/integrations`
Body:
```
{ "githubConnected": false, "slackConnected": false, "jiraConnected": false }
```

8. `PATCH /users/me/settings/workspace`
Body:
```
{ "workspaceName": "string" }
```

## Tasks

1. `GET /tasks`
Query params:
`scope=all|mine|team|overdue`, `projectId`, `priority=HIGH|MED|LOW`
Response:
```
{ "message": "string", "data": [TaskDTO] }
```

2. `POST /tasks`
Body:
```
{ "title": "string", "description": "string?", "priority": "HIGH|MED|LOW", "dueDate": "YYYY-MM-DD?", "assigneeId": 1?, "projectId": 2? }
```

3. `PATCH /tasks/:id`
Body:
```
{ "title?": "...", "description?": "...", "priority?": "HIGH|MED|LOW", "status?": "BACKLOG|TODO|IN_PROGRESS|DONE", "dueDate?": "YYYY-MM-DD", "assigneeId?": 1, "projectId?": 2, "progress?": 0-100 }
```

4. `DELETE /tasks/:id`
Response:
```
{ "message": "string", "data": { "id": 1 } }
```

TaskDTO:
```
{ "id": 1, "title": "string", "description": "string?", "priority": "HIGH|MED|LOW", "status": "BACKLOG|TODO|IN_PROGRESS|DONE", "dueDate": "YYYY-MM-DD?", "assigneeInitials": "string?", "assigneeName": "string?", "projectId": 1?, "projectName": "string?", "progress": 0? }
```

## Projects

1. `GET /projects`
Query params:
`status=ACTIVE|IN_REVIEW|PLANNING|PAUSED|COMPLETED|ARCHIVED`
Response:
```
{ "message": "string", "data": [ProjectDTO] }
```

2. `POST /projects`
Body:
```
{ "name": "string", "description": "string?", "status": "ACTIVE", "dueDate": "YYYY-MM-DD?" }
```

3. `PATCH /projects/:id`
Body:
```
{ "name?": "...", "description?": "...", "status?": "...", "progress?": 0-100, "dueDate?": "YYYY-MM-DD" }
```

4. `DELETE /projects/:id`
Response:
```
{ "message": "string", "data": { "id": 1 } }
```

ProjectDTO:
```
{ "id": 1, "name": "string", "description": "string?", "status": "ACTIVE", "progress": 72, "dueDate": "YYYY-MM-DD?", "teamInitials": ["AJ", "SK"] }
```

## Calendar

1. `GET /calendar/events`
Query params:
`start=YYYY-MM-DD`, `end=YYYY-MM-DD`, `search`
Response:
```
{ "message": "string", "data": [CalendarEventDTO] }
```

2. `POST /calendar/events`
Body:
```
{ "title": "string", "date": "YYYY-MM-DD", "startTime": "HH:mm?", "endTime": "HH:mm?", "color": "teal|violet|rose|amber|blue", "description": "string?" }
```

3. `PATCH /calendar/events/:id`
Body:
```
{ "title?": "...", "date?": "YYYY-MM-DD", "startTime?": "HH:mm", "endTime?": "HH:mm", "color?": "teal|violet|rose|amber|blue", "description?": "string?" }
```

4. `DELETE /calendar/events/:id`
Response:
```
{ "message": "string", "data": { "id": 1 } }
```

CalendarEventDTO:
```
{ "id": 1, "title": "string", "date": "YYYY-MM-DD", "startTime": "HH:mm?", "endTime": "HH:mm?", "color": "teal|violet|rose|amber|blue", "description": "string?" }
```

## Team

1. `GET /team`
Query params:
`search`
Response:
```
{ "message": "string", "data": [TeamMemberDTO] }
```

2. `POST /team/invite`
Body:
```
{ "name": "string", "email": "string", "role": "string" }
```

3. `PATCH /team/:id`
Body:
```
{ "role?": "string", "status?": "ONLINE|AWAY|OFFLINE" }
```

4. `DELETE /team/:id`
Response:
```
{ "message": "string", "data": { "id": 1 } }
```

TeamMemberDTO:
```
{ "id": 1, "name": "string", "role": "string", "status": "ONLINE|AWAY|OFFLINE", "tasksCount": 0, "projectsCount": 0, "completionRate": 0, "initials": "AJ", "avatarUrl": "string?" }
```




Invitations

POST /projects/:projectId/invitations
body: { invitedUserId, role }
GET /invitations/received?status=pending
GET /invitations/sent?projectId=...
PATCH /invitations/:invitationId/respond
body: { action: "accept" | "reject" }
DELETE /invitations/:invitationId (cancel by inviter)
Tasks

POST /tasks
validate projectId membership and optional assigneeId membership
GET /tasks?projectId=...
PATCH /tasks/:taskId
GET /projects/:projectId/assignees (accepted collaborators; can also reuse members endpoint)
Notifications

GET /notifications?unreadOnly=false&limit=20
GET /notifications/unread-count
PATCH /notifications/:id/read
PATCH /notifications/read-all

Project collaborators

GET /projects/:projectId/members?status=accepted
DELETE /projects/:projectId/members/:userId remove collaborator
User search for inviting

GET /users/search?q=sam (existing users only)
Invitations