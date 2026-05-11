# TaskFlow — Team Task Manager

> A full-stack MERN collaboration app with role-based access control, JWT authentication, and a real-time task board for teams.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-6366f1?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-JWT-06b6d4?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Role-Based Access](#role-based-access)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## Overview

TaskFlow is a lightweight Jira/Trello-style team collaboration tool where Admins can create projects, manage team members, and assign tasks — while Members can view and update the status of tasks assigned to them. All routes are protected by JWT-based authentication and role-aware Express middleware.

---

## Live Demo

| Resource | Link |
|---|---|
| Frontend | https://team-task-manager-ivory.vercel.app/login |
| Backend API |https://team-task-manager-zbjw.onrender.com/|

---

## Features

### Authentication
- User registration with full name, email, phone, password, and role selection
- Secure login returning an `httpOnly` JWT cookie
- Protected routes via `validateToken` middleware
- Passwords hashed with **bcrypt**

### Admin Capabilities
- Create, view, and manage all projects across the workspace
- Add and remove members from specific projects
- Create tasks inside any project
- Assign and reassign tasks to any registered member
- Update task status (To Do / In Progress / Done)
- Delete tasks
- Admin dashboard with workspace-wide stats

### Member Capabilities
- View projects they have been added to
- View only tasks assigned to them
- Update the status of their own assigned tasks

### UI / UX
- Role-aware sidebar navigation (admin-only links hidden from members)
- Expandable project cards with inline task management
- Stacked member avatar previews on project cards
- Member detail panel with slide-in animation
- Search/filter on Projects and Members pages
- Loading spinners, empty states, and error banners on every page
- Fully responsive dark theme built with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router v6, React Hook Form, Axios, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| Deployment | Railway (backend), Railway / Render (frontend) |

---

## Project Structure

```
taskflow/
├── client/                         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx         # Role-aware navigation sidebar
│   │   ├── pages/
│   │   │   ├── Login.jsx           # JWT login with react-hook-form
│   │   │   ├── Register.jsx        # Registration with role selection
│   │   │   ├── AdminDashboard.jsx  # Admin overview + quick actions
│   │   │   ├── MemberDashboard.jsx # Member's assigned projects grid
│   │   │   ├── AllProjects.jsx     # Admin — all projects with search
│   │   │   ├── MembersPage.jsx     # Admin — all members with detail panel
│   │   │   └── ProjectDetails.jsx  # Role-based task board per project
│   │   └── App.jsx
│   └── package.json
│
└── server/                         # Express backend
    ├── models/
    │   ├── user.js                 # User schema (fullname, email, password, role)
    │   ├── project.js              # Project schema (name, description, members, createdBy)
    │   └── task.js                 # Task schema (title, description, status, assignee, project)
    ├── routes/
    │   ├── user.js                 # /user — register, login, me
    │   ├── project.js              # /project — CRUD + member management
    │   └── task.js                 # /task — CRUD + assign + status
    ├── services/
    │   └── auth.js                 # validateToken middleware
    └── index.js
```

---

## API Reference

### Auth — Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/user/register` | Register a new user |
| `POST` | `/user/login` | Login and receive JWT cookie |
| `GET` | `/user/me` | Get current user profile + role |

### Projects — Protected

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/project/create` | Admin | Create a new project |
| `POST` | `/project/all_projects` | Admin | Fetch all projects in workspace |
| `GET` | `/project/my_projects` | Member | Fetch projects the member belongs to |
| `GET` | `/project/members` | Admin | List all registered members |
| `POST` | `/project/add_member/:projectId/:id` | Admin | Add a member to a project |
| `DELETE` | `/project/del_member/:projectId/:id` | Admin | Remove a member from a project |

### Tasks — Protected

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/task/create/:projectId` | Admin | Create a task inside a project |
| `GET` | `/task/all/:projectId` | Admin | Get all tasks in a project |
| `GET` | `/task/project/:projectId` | Member | Get tasks assigned to current user |
| `POST` | `/task/assign/:taskId/:userId` | Admin | Assign a task to a member |
| `POST` | `/task/update_status/:taskId` | Both | Update task status |
| `DELETE` | `/task/delete/:id` | Admin | Delete a task |

---

## Role-Based Access

```
Admin                          Member
  │                              │
  ├─ Create / delete projects    ├─ View assigned projects
  ├─ Add / remove members        ├─ View assigned tasks
  ├─ Create tasks                └─ Update own task status
  ├─ Assign / reassign tasks
  ├─ Delete tasks
  └─ View all workspace stats
```

Roles are enforced at two layers:

1. **Backend** — `validateToken` reads the JWT cookie on every request; role-specific routes check `user.role` before proceeding and return `400 Access Denied` otherwise.
2. **Frontend** — The sidebar, dashboard, and `ProjectDetails` page all fetch `/user/me` on mount and conditionally render admin-only controls (create task, assign, delete, member management) based on the returned role.

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd client
npm install
```

### 4. Configure environment variables

Create a `.env` file in `/server` (see [Environment Variables](#environment-variables)).

### 5. Run the development servers

```bash
# Terminal 1 — backend
cd server
npm run dev       # uses nodemon

# Terminal 2 — frontend
cd client
npm run dev       # Vite or CRA
```

Backend runs on `http://localhost:8000`, frontend on `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file inside the `/server` directory:

```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow
JWT_SECRET=your_super_secret_key
```

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens |

> Never commit `.env` to version control. Add it to `.gitignore`.

---

## Deployment

### Backend — Railway

1. Push the `/server` folder to a GitHub repository.
2. Create a new Railway project → **Deploy from GitHub repo**.
3. Set the environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`) under **Variables**.
4. Railway auto-detects Node.js and runs `npm start`.

### Frontend — Railway / Render

1. Push the `/client` folder to GitHub.
2. On Railway / Render, create a **Static Site** service.
3. Set the build command to `npm run build` and publish directory to `dist` (Vite) or `build` (CRA).
4. Update the Axios base URL in the frontend to point to your live backend URL.

---

## Screenshots

> _Add screenshots of Login, Admin Dashboard, Project Details, and Members page here._

| Page | Description |
|---|---|
| Login / Register | Dark-themed auth pages with validation |
| Admin Dashboard | Stats, quick-action shortcuts, recent projects grid |
| All Projects | Searchable project cards with member avatars |
| Members Page | Member list with slide-in detail panel |
| Project Details | Role-aware task board (admin actions vs member view) |

---

## Author

Built as a full-stack assignment demonstrating MERN development, JWT auth, role-based access control, and REST API design.

---

## License

This project is licensed under the [MIT License](LICENSE).
