# Team Task Manager

Team Task Manager is a full-stack web application for creating projects, adding team members, assigning tasks, and tracking progress with Admin and Member access levels.

## Tech Stack

- Backend: Node.js, Express.js
- Database: PostgreSQL with Prisma ORM
- Frontend: React.js, Vite, Tailwind CSS
- Authentication: JWT with bcrypt password hashing
- Deployment: Railway

## Features

- Signup and login with JWT authentication
- Role-based access control for Admin and Member users
- Project creation and project member management
- Task creation, assignment, status updates, priorities, and due dates
- Dashboard with total tasks, status counts, overdue tasks, and recent activity
- API validation with Zod and relational database constraints with Prisma

## Roles

- ADMIN: Can create, update, and delete projects; manage members; create, assign, update, and delete tasks.
- MEMBER: Can view assigned project work and update task status.

## Local Setup

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:migrate
npm run dev
```

Set these backend environment variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="a-long-random-secret"
CORS_ORIGIN="http://localhost:5173"
PORT=5000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Set this frontend environment variable:

```env
VITE_API_URL="http://localhost:5000/api"
```

## API Summary

- `POST /api/auth/signup` - create an account
- `POST /api/auth/login` - login
- `GET /api/projects` - list visible projects
- `POST /api/projects` - create project, Admin only
- `GET /api/projects/:id` - project details with members and tasks
- `POST /api/projects/:id/members` - add member, Admin only
- `POST /api/projects/:id/tasks` - create task, Admin only
- `PUT /api/tasks/:id` - update task; Members can update status only
- `DELETE /api/tasks/:id` - delete task, Admin only
- `GET /api/dashboard` - dashboard metrics
- `GET /api/health` - backend health check

## Railway Deployment

Deploy this repository as two Railway services from the same GitHub repo:

1. Add a PostgreSQL database in Railway.
2. Create the backend service with root directory `/backend`.
3. Set backend variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CORS_ORIGIN=https://your-frontend-url.up.railway.app`
   - `NODE_ENV=production`
4. Use config file path `/backend/railway.json` if Railway does not auto-detect it.
5. Create the frontend service with root directory `/frontend`.
6. Set frontend variable:
   - `VITE_API_URL=https://your-backend-url.up.railway.app/api`
7. Use config file path `/frontend/railway.json` if Railway does not auto-detect it.

## Submission

- Live Application URL: https://backend-production-33a2.up.railway.app
- GitHub Repository Link: https://github.com/khushibishnoi2707-blip/Task_Flow
- README file: upload `README.txt`
