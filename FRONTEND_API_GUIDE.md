# Frontend API Guide

## Base Setup

Base URL:

```txt
http://localhost:5000/api
```

Most endpoints require:

```txt
Authorization: Bearer <accessToken>
```

All successful responses use this shape:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

Typical error response shape:

```json
{
  "statusCode": 400,
  "message": "Some error message",
  "success": false
}
```

## Auth Flow

### Register

`POST /auth/register`

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "secret123"
}
```

### Login

`POST /auth/login`

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Normal success payload:

```json
{
  "user": {},
  "accessToken": "...",
  "refreshToken": "..."
}
```

If 2FA is enabled:

```json
{
  "is2FARequired": true,
  "userId": 1
}
```

### Google Login

`POST /auth/google`

```json
{
  "idToken": "google-id-token-from-frontend"
}
```

Behavior:

- Backend verifies the Google ID token
- If the email already exists, Google is linked to that user
- If the user does not exist, a new account is created automatically
- Backend returns the same auth shape as normal login
- If the matched user has 2FA enabled, backend returns:

```json
{
  "is2FARequired": true,
  "userId": 1
}
```

### Verify Login 2FA

`POST /auth/2fa/verify-login`

```json
{
  "userId": 1,
  "token": "123456"
}
```

### Refresh Token

`POST /auth/refresh`

```json
{
  "refreshToken": "..."
}
```

### Logout

`POST /auth/logout`

```json
{
  "refreshToken": "..."
}
```

### 2FA Settings

- `POST /auth/2fa/setup`
- `POST /auth/2fa/confirm`
- `DELETE /auth/2fa/disable`

For confirm/disable:

```json
{
  "token": "123456"
}
```

Frontend notes:

- Keep `accessToken` attached to every protected request.
- On `401`, try one refresh flow, then log the user out if refresh fails.
- Login may be a 2-step flow when `is2FARequired` is returned.
- Google Sign-In should send the Google `idToken` to `/auth/google`, not a Google access token.

## Workspace-Scoped Model

Most app features are scoped by `workspaceId` in the URL.

Frontend should keep an `activeWorkspaceId` in route state or global state and inject it into all workspace-related API calls.

## Workspaces

### Create Workspace

`POST /workspaces`

```json
{
  "name": "My Workspace"
}
```

### List Workspaces

`GET /workspaces`

Query params:

- `page`
- `limit`
- `search`

### Get Workspace Detail

`GET /workspaces/:workspaceId`

Query params:

- `includeMembers=true|false`
- `includeProjects=true|false`
- `memberPage`
- `memberLimit`
- `projectPage`
- `projectLimit`

Important:

- This endpoint returns paginated `members` and paginated `projects`.
- It also includes `_count`.

### Update Workspace

`PATCH /workspaces/:workspaceId`

```json
{
  "name": "Renamed Workspace"
}
```

### Delete Workspace

`DELETE /workspaces/:workspaceId`

## Projects

### Create Project

`POST /projects/:workspaceId`

```json
{
  "name": "Project Alpha"
}
```

### List Projects

`GET /projects/:workspaceId`

Query params:

- `page`
- `limit`
- `search`

### Update Project

`PATCH /projects/:workspaceId/:projectId`

```json
{
  "name": "Updated Project Name"
}
```

### Delete Project

`DELETE /projects/:workspaceId/:projectId`

Frontend note:

- Backend currently gates project list with `projects:create`, so frontend should handle possible `403` responses cleanly.

## Tasks

### Create Task

`POST /tasks/:workspaceId/:projectId`

Use `multipart/form-data`.

Fields:

- `title`
- `description`
- `status`
- `priority`
- `dueDate`
- `assignedToId`
- `position`
- `files` as repeated file field

### List Tasks for Project

`GET /tasks/:workspaceId/:projectId`

Query params:

- `page`
- `limit`
- `status`
- `priority`
- `assignedToId`
- `search`

Response data shape:

```json
{
  "tasks": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### Get Task Detail

`GET /tasks/:workspaceId/detail/:taskId`

### Reorder Task

`PATCH /tasks/:workspaceId/reorder/:taskId`

```json
{
  "position": 1000
}
```

### Update Task

`PATCH /tasks/:workspaceId/:taskId`

Use JSON or `multipart/form-data` if files are included.

Updatable fields:

- `title`
- `description`
- `status`
- `priority`
- `dueDate`
- `assignedToId`
- `projectId`
- `files`

### Delete Task

`DELETE /tasks/:workspaceId/:taskId`

Frontend notes:

- Use task list pagination values from the API, do not hardcode.
- Reordering uses floating positions, so the frontend should be prepared to re-fetch after drag/drop operations.

## Comments

### Create Comment

`POST /comments/:workspaceId`

```json
{
  "taskId": 12,
  "content": "Looks good",
  "parentCommentId": null
}
```

### Get Task Comments

`GET /comments/:workspaceId/task/:taskId`

Query params:

- `page`
- `limit`
- `replyLimit`
- `includeReadBy=true|false`

Response data shape:

```json
{
  "comments": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

Important:

- This endpoint no longer returns a raw array.
- Top-level comments are paginated.
- Each comment can include a limited `replies` array and a `replyCount`.

### Mark Comment as Read

`POST /comments/:workspaceId/read/:commentId`

### Update Comment

`PATCH /comments/:workspaceId/:commentId`

```json
{
  "content": "Edited comment"
}
```

### Delete Comment

`DELETE /comments/:workspaceId/:commentId`

Frontend notes:

- Render only top-level comments from `comments`.
- Use `replyCount` to decide whether to show a “more replies” state.

## Members

### List Members

`GET /members/:workspaceId`

### Update Member Role

`PATCH /members/:workspaceId/:userId`

```json
{
  "roleId": 3
}
```

### Remove Member

`DELETE /members/:workspaceId/:userId`

## Invites

### Create Invite

`POST /invites/:workspaceId`

```json
{
  "email": "new@user.com",
  "roleId": 3
}
```

### Accept Invite

`POST /invites/accept`

```json
{
  "token": "invite-token"
}
```

## Tags

### Create Tag

`POST /tags/:workspaceId`

```json
{
  "name": "Backend",
  "color": "#ff6600"
}
```

### List Workspace Tags

`GET /tags/:workspaceId`

### Delete Tag

`DELETE /tags/:workspaceId/:tagId`

### Assign Tag to Task

`POST /tags/:workspaceId/assign/:taskId/:tagId`

### Remove Tag from Task

`DELETE /tags/:workspaceId/remove/:taskId/:tagId`

## Attachments

### Upload Attachment

`POST /attachments/:workspaceId/:taskId`

Use `multipart/form-data`.

Field:

- `file`

### List Task Attachments

`GET /attachments/:workspaceId/:taskId`

### Delete Attachment

`DELETE /attachments/:workspaceId/:id`

Files are served from:

```txt
/uploads/<path>
```

Frontend note:

- Build attachment URLs using the backend origin.

## Notifications

### List Notifications

`GET /notifications`

Query params:

- `page`
- `limit`

Response data shape:

```json
{
  "notifications": [],
  "unreadCount": 0,
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### Mark One as Read

`PATCH /notifications/:notificationId/read`

### Mark All as Read

`PATCH /notifications/mark-all-read`

## Activities

### Get Workspace Activity Logs

`GET /activities/:workspaceId`

Query params:

- `page`
- `limit`

## Profile

### Get Profile

`GET /profile`

### Update Profile

`PATCH /profile`

Use JSON or `multipart/form-data` if avatar is included.

Possible field:

- `avatar`

## Realtime

Socket.io is enabled.

Example client connection:

```js
const socket = io("http://localhost:5000", {
  auth: { token: accessToken }
});
```

Current event used by backend:

- `new_notification`

## Frontend Gotchas

- Always include `workspaceId` for workspace-scoped data.
- Some endpoints are permission-gated more strictly than expected. Handle `403` in UI.
- File uploads must use `multipart/form-data`.
- Workspace detail and comment endpoints are paginated and should not be treated as raw arrays.
- Uploaded files are served from `/uploads`, so build full URLs using the backend origin.
- Auth uses Bearer tokens in headers, not cookie-based sessions.

## Required Env for Google Login

Backend needs:

```env
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

Frontend should use the same Google client ID when rendering the Google Sign-In button.
