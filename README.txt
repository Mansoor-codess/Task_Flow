Team Task Manager

Project description
Team Task Manager is a full-stack web application for creating projects, adding project members, assigning tasks, and tracking progress with Admin and Member access levels. Admins can manage projects, members, and tasks. Members can view assigned project work and update task status.

Tech stack
- Backend: Node.js, Express.js
- Database: PostgreSQL with Prisma ORM
- Frontend: React.js, Vite, Tailwind CSS
- Authentication: JWT with bcrypt password hashing
- Deployment target: Railway

Features
- Signup and login with JWT stored in localStorage
- Role-based access control for Admin and Member users
- Project CRUD for Admin users
- Project member management
- Task creation, editing, deletion, assignment, and status tracking
- Member-only status updates
- Task priorities: LOW, MEDIUM, HIGH
- Task statuses: TODO, IN_PROGRESS, DONE, OVERDUE
- Due date validation on creation
- Automatic overdue marking on dashboard, project, and task fetches
- Dashboard with total tasks, status counts, overdue tasks, and recent activity
- React protected routes and Admin-only frontend sections

Role explanation
- ADMIN: Can create, update, and delete projects; manage project members; create, update, assign, and delete tasks; view all projects.
- MEMBER: Can view projects where they are a member and update task status only.

Local setup
1. Clone the repository.
2. Install backend dependencies:
   cd backend
   npm install
3. Create backend environment file:
   Copy backend/.env.example to backend/.env and set:
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   JWT_SECRET="a-long-random-secret"
   CORS_ORIGIN="http://localhost:5173"
   PORT=5000
4. Create the database and run Prisma migration:
   npm run prisma:migrate
5. Start the backend:
   npm run dev
6. Install frontend dependencies in a second terminal:
   cd frontend
   npm install
7. Create frontend environment file:
   Copy frontend/.env.example to frontend/.env and set:
   VITE_API_URL="http://localhost:5000/api"
8. Start the frontend:
   npm run dev

API documentation summary

Auth
- POST /api/auth/signup
  Body: name, email, password, role
  Returns: token, user
- POST /api/auth/login
  Body: email, password
  Returns: token, user

Projects
- GET /api/projects
  Lists projects visible to the authenticated user.
- POST /api/projects
  Admin only. Body: name, description.
- GET /api/projects/:id
  Returns project details, members, and tasks.
- PUT /api/projects/:id
  Admin only. Body: name, description.
- DELETE /api/projects/:id
  Admin only.
- POST /api/projects/:id/members
  Admin only. Body: email, role.
- DELETE /api/projects/:id/members/:userId
  Admin only.

Tasks
- GET /api/projects/:id/tasks
  Lists project tasks.
- POST /api/projects/:id/tasks
  Admin only. Body: title, description, status, priority, assigneeId, dueDate.
- PUT /api/tasks/:id
  Admins can update task details. Members can update status only.
- DELETE /api/tasks/:id
  Admin only.
- PATCH /api/tasks/:id/assign
  Admin only. Body: assigneeId.

Dashboard
- GET /api/dashboard
  Returns totalTasks, tasksByStatus, overdueTasks, and recentActivity.

Railway deployment
Deploy this repository as two Railway services from the same GitHub repo.

Backend service:
1. Create a Railway project.
2. Add a PostgreSQL database.
3. Deploy the backend folder as a Node.js service.
4. Set the service root directory to /backend.
5. Use config file path /backend/railway.json if Railway does not auto-detect it.
6. Set environment variables:
   DATABASE_URL
   JWT_SECRET
   CORS_ORIGIN=https://your-frontend-service.up.railway.app
   NODE_ENV=production
7. The backend Railway config runs:
   Pre-deploy command: npm run prisma:deploy
   Start command: npm start
   Health check: /api/health

Frontend service:
1. Deploy the frontend folder as a second Railway service.
2. Set the service root directory to /frontend.
3. Use config file path /frontend/railway.json if Railway does not auto-detect it.
4. Set:
   VITE_API_URL="https://your-backend-service.up.railway.app/api"
5. The frontend Railway config runs:
   Build command:
   npm run build
   Start command:
   npm start

- Project demo video:  https://drive.google.com/file/d/1r9f5W3DUO2pYBBfRFyYT6Jtyqy5JG-yV/view?usp=sharing

Live URL
- Application: https://backend-production-33a2.up.railway.app
- Backend/API health: https://backend-production-33a2.up.railway.app/api/health

GitHub repo link
- https://github.com/Mansoor-codess/Task_Flow.git
