# SaaS Task Manager Backend (Multi-Tenant) — Project Document

## 🎯 Goal
Build a real-world backend system using Node.js, Express, and PostgreSQL that simulates a SaaS product like Notion/Jira. The focus is on backend architecture, database design, and API development (tested via Postman).

---

## 🧱 Core Concepts You Will Learn
- Authentication (JWT + Refresh Tokens)
- Relational Database Design (PostgreSQL)
- Multi-tenancy (Workspaces)
- Role-based Access Control (RBAC)
- REST API Design
- Pagination, Filtering
- Middleware Architecture

---

## 🧩 Core Features (Phase 1 → Phase 3)

### 1. Authentication
- Register user
- Login user
- Logout user

### 2. Workspaces (Multi-Tenant)
- Create workspace
- Invite users (later phase)
- Users belong to workspace

### 3. Projects
- Create project inside workspace
- Update/Delete project

### 4. Tasks
- Create task inside project
- Assign task to user
- Update task status (todo, in-progress, done)

### 5. Comments
- Add comments on tasks

---

## 🧠 Database Design (Initial Schema)

### Users
- id (PK)
- name
- email (unique)
- password
- created_at

### Workspaces
- id (PK)
- name
- owner_id (FK → Users)

### WorkspaceMembers (Join Table)
- id (PK)
- user_id (FK → Users)
- workspace_id (FK → Workspaces)
- role (admin/member)

### Projects
- id (PK)
- name
- workspace_id (FK → Workspaces)

### Tasks
- id (PK)
- title
- description
- status (todo/in-progress/done)
- project_id (FK → Projects)
- assigned_to (FK → Users)

### Comments
- id (PK)
- content
- task_id (FK → Tasks)
- user_id (FK → Users)

---

## 🔗 Relationships (Important)
- One User → Many Workspaces (as owner)
- Many Users ↔ Many Workspaces (via WorkspaceMembers)
- One Workspace → Many Projects
- One Project → Many Tasks
- One Task → Many Comments

---

## 🔌 API Structure (Basic)

### Auth
- POST /auth/register
- POST /auth/login

### Workspaces
- POST /workspaces
- GET /workspaces

### Projects
- POST /projects
- GET /projects?workspaceId=

### Tasks
- POST /tasks
- GET /tasks?projectId=
- PATCH /tasks/:id

### Comments
- POST /comments
- GET /comments?taskId=

---

## 🏗️ Folder Structure

```
src/
 ├── controllers/
 ├── routes/
 ├── services/
 ├── middlewares/
 ├── prisma/
 ├── utils/
```

---

## ⚙️ Tech Stack
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Postman (API testing)

---

## 🚀 Phase 4+ (Future Expansion)
- Role-based permissions (admin/member)
- Invite system (email-based)
- Activity logs
- File uploads
- Notifications
- Redis caching

---

## 📌 Rules While Building
- Build step by step (don’t jump ahead)
- Test every API in Postman
- Think in terms of data relationships
- Keep code modular (controller → service → DB)

---

## 💡 Final Note
This is not a small project. Treat it like a real product. Expand it gradually as your understanding of backend systems improves.

