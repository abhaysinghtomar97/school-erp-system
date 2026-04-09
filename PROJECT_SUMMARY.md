# Project Summary

## 1. Project Overview

- This is a full-stack School ERP (Enterprise Resource Planning) system with an admin-managed user and class enrollment workflow.
- The application provides role-based access for Admin, Faculty, and Student users.
- Target users appear to be educational institution administrators, teachers, and students.
- The backend is responsible for authentication, user provisioning, class creation, enrollment, and faculty class retrieval.
- The frontend is a React/Vite application that supports login, forced first-login password change, admin dashboards, faculty dashboard, and a placeholder student dashboard.

## 2. Tech Stack

- Languages:
  - JavaScript (frontend and backend)
- Frameworks / Libraries:
  - Frontend: React, React Router DOM
  - Backend: Node.js, Express
  - Authentication: JSON Web Tokens (JWT), bcryptjs
  - HTTP client: axios
- Tools / Services:
  - Database: PostgreSQL (configured through `pg`, `NEON_DATABASE_URL` in code)
  - Email: Nodemailer with Gmail service
  - Build / Dev: Vite, ESLint, Tailwind CSS plugin for Vite

## 3. Project Structure

- `/client`
  - `package.json` - frontend dependencies and scripts
  - `vite.config.js` - Vite config for React app
  - `src/App.jsx` - main route definitions and protected routing
  - `src/main.jsx` - React entry point
  - `src/context/AuthContext.jsx` - authentication state and JWT storage
  - `src/components/ProtectedRoute.jsx` - route guard handling login and role checks
  - `src/services/api.js` - axios instance with token interceptor
  - `src/pages/` - all page components for login, dashboards, and admin management
  - `src/utils/deocdeRole.js` - empty helper file, currently unused
- `/server`
  - `package.json` - backend dependencies and scripts
  - `src/app.js` - Express app setup, CORS, middleware, route mounting
  - `src/server.js` - server startup and database connectivity test
  - `src/config/db.js` - PostgreSQL client pool configuration
  - `src/routes/` - API route definitions for auth, admin, and faculty
  - `src/controllers/` - request handling logic for auth, admin features, and faculty features
  - `src/middlewares/authMiddleware.js` - JWT verification middleware
  - `src/utils/sendEmail.js` - Nodemailer transporter configuration

## 4. Features (Implemented)

- User authentication using email or institutional ID plus password.
- JWT creation after successful login, with payload including user id, role, name, and first-login flag.
- Forced password reset for first-login users via `/change-password`.
- Admin user creation with temporary password and generated institutional IDs.
- Email notification to newly created users with temporary password and ID.
- Admin routes to list students and faculty.
- Admin route to toggle user active status.
- Admin class creation and class listing.
- Admin class roster retrieval for a specific class.
- Admin student enrollment into classes.
- Faculty route to fetch classes assigned to the logged-in faculty member.
- Frontend protected routing by role: Admin, Teacher, Student.
- Frontend dashboards for admin and faculty.

## 5. Routes / APIs

### Backend routes

- `GET /api/health`
  - Health check endpoint returning API running status.

- `POST /api/auth/login`
  - Authenticates user using `identifier` (email or institutional_id) and `password`.
  - Returns JWT token and user payload.

- `POST /api/auth/change-password`
  - Updates password for a user based on `userId` and `newPassword`.
  - Marks `is_first_login` as false.
  - Note: this route is currently not protected by JWT middleware.

- `POST /api/admin/create-user`
  - Creates a new user with `name`, `email`, and `role`.
  - Generates an institutional ID and temporary password.
  - Sends account details via email.

- `GET /api/admin/students`
  - Returns Student users with selected profile and status fields.

- `GET /api/admin/faculty`
  - Returns Teacher users with selected profile and status fields.

- `PUT /api/admin/users/:id/status`
  - Toggles a user’s `is_active` status.

- `POST /api/admin/classes`
  - Creates a new class with `name`, `room_number`, and optional `homeroom_teacher_id`.

- `GET /api/admin/classes`
  - Lists all classes with optional homeroom teacher name.

- `GET /api/admin/classes/:class_id/roster`
  - Retrieves enrolled students for a specific class.

- `POST /api/admin/enrollments`
  - Enrolls a student into a class using `student_id` and `class_id`.

- `GET /api/faculty/my-classes`
  - Protected route returning classes assigned to the logged-in faculty member.

### Frontend routes

- `/login` - public login screen.
- `/change-password` - protected route for first-time password update.
- `/admin` - admin dashboard and user creation.
- `/admin/students` - admin student management.
- `/admin/faculty` - admin faculty listing.
- `/admin/classes` - admin class management.
- `/admin/enrollments` - admin enrollment management.
- `/faculty` - teacher dashboard.
- `/student` - student dashboard placeholder.

## 6. Database / Models

No explicit ORM models or schema files are included. The database schema is inferred from SQL queries.

### Inferred tables

- `users`
  - `id`
  - `name`
  - `email`
  - `password_hash`
  - `role` (`ADMIN`, `TEACHER`, `STUDENT`)
  - `is_first_login`
  - `institutional_id`
  - `is_active`
  - `created_at`

- `classes`
  - `id`
  - `name`
  - `room_number`
  - `homeroom_teacher_id` (foreign key to `users.id`)
  - `created_at`

- `enrollments`
  - `student_id` (foreign key to `users.id`)
  - `class_id` (foreign key to `classes.id`)

### Relationships

- A class may have one homeroom teacher (`classes.homeroom_teacher_id -> users.id`).
- Students are enrolled in classes through the `enrollments` join table.
- There is no explicit student-specific relationship route; student data is inferred from the `users` table.

## 7. Authentication & Authorization

- Login uses JWTs signed with `process.env.JWT_SECRET`.
- JWT payload includes:
  - `id`
  - `role`
  - `is_first_login`
  - `name`
- Frontend stores token in `localStorage` and reads it via `AuthContext`.
- `ProtectedRoute` guards access and enforces allowed roles.
- Role-based access:
  - `ADMIN` → admin routes and dashboards
  - `TEACHER` → faculty dashboard
  - `STUDENT` → student dashboard
- Only `/api/faculty/my-classes` is currently protected by middleware in backend.
- Comment in code indicates `/api/auth/change-password` should be protected but is not.

## 8. Current Status

### Completed

- Backend authentication and user creation flows.
- Admin management pages for users, faculty, classes, and enrollments.
- Faculty class retrieval route and dashboard.
- JWT-based route protection on frontend.
- Email notification via Gmail/Nodemailer for new accounts.

### Partially implemented

- Student dashboard is only a placeholder and has no backend integration.
- Password-change flow works but lacks server-side token protection.
- Some frontend helper files and structure implied by root README are missing or unused.

## 9. Missing / TODO Features (Inferred)

- Real student dashboard with data and backend routes.
- Password-change route protection using JWT middleware.
- Admin user editing or deletion.
- Class editing and deletion.
- Enrollment removal / student un-enrollment.
- Better error handling and consistency in frontend API response parsing.
- Explicit database schema migration or model definitions.
- A bootstrap admin user creation flow or seed data script.
- A complete `/client/.env` example matching the actual code key `VITE_API_URL`.

## 10. Setup Instructions

### Backend

1. Install dependencies:
   - `cd server`
   - `npm install`
2. Required environment variables (based on source files):
   - `NEON_DATABASE_URL` (PostgreSQL connection string)
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_APP_PASSWORD`
   - `PORT` (optional, but server currently listens on hardcoded `5000`)
3. Start server:
   - `npm run start`
   - or `npm run dev` if using nodemon

### Frontend

1. Install dependencies:
   - `cd client`
   - `npm install`
2. Required environment variable:
   - `VITE_API_URL` (backend base URL, e.g. `http://localhost:5000/api`)
3. Start frontend:
   - `npm run dev`

## 11. Issues / Improvements

- `server/src/server.js` uses `process.env.PORT` but still calls `app.listen(5000, ...)`, ignoring the environment port variable.
- `client/src/utils/deocdeRole.js` is empty and not used anywhere.
- `client/src/context/AuthContext.jsx` imports `jwtDecode` as a named import; the package typically exports a default function, which may cause runtime issues.
- `server/src/routes/authRoutes.js` leaves `change-password` unprotected, but the frontend relies on JWT for user identity.
- Root `readme.md` includes folder references (`hooks/`, `layouts/`, `routes/`) that are not present in the actual codebase.
- `ManageEnrollments` assumes inconsistent response shape from `/admin/students` and contains defensive parsing for multiple property names.
- There is no central model/schema directory or migration scripts; database structure must be inferred from SQL queries.
- Admin route `create-user` uses a temporary password, but there is no explicit policy for password reset expiration.
- Student role lacks backend-specific features and routes.

---

This summary is based on the actual code present in the repository as of the current analysis.
