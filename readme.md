# Full-Stack School ERP System
# folder structure...

school-erp-system/
├── client/                     # React Frontend Environment
│   ├── public/                 # Static assets (favicon, etc.)
│   ├── src/
│   │   ├── assets/             # Images, icons, and global stylesheets
│   │   ├── components/         # Reusable UI components (Buttons, Modals, Navbar)
│   │   ├── context/            # React Context (AuthContext for user state)
│   │   ├── hooks/              # Custom React hooks (useAuth, useFetch)
│   │   ├── layouts/            # Page layouts (DashboardLayout, AuthLayout)
│   │   ├── pages/              # Route components (Login, AdminDashboard, ChangePassword)
│   │   ├── routes/             # React Router setup (ProtectedRoute.jsx)
│   │   ├── services/           # API calls (axios instance, auth endpoints)
│   │   ├── utils/              # Helper functions (date formatters, validators)
│   │   ├── App.jsx             # Main application component
│   │   └── main.jsx            # React entry point
│   ├── .env                    # Frontend environment variables (API URLs)
│   ├── package.json
│   └── vite.config.js          # Vite configuration (recommended over CRA)
│
├── server/                     # Node.js/Express Backend Environment
│   ├── src/
│   │   ├── config/             # Configuration files (db.js, nodemailer.js)
│   │   ├── controllers/        # Route logic (authController.js, adminController.js)
│   │   ├── middlewares/        # Custom middleware (authMiddleware.js, errorHandler.js)
│   │   ├── models/             # Database queries or ORM models
│   │   ├── routes/             # API route definitions (authRoutes.js, userRoutes.js)
│   │   ├── services/           # Complex business logic (emailService.js)
│   │   ├── utils/              # Backend helpers (jwtGenerator.js, hashPassword.js)
│   │   ├── app.js              # Express app setup and middleware configuration
│   │   └── server.js           # Server entry point (app.listen)
│   ├── .env                    # Backend environment variables (DB secrets, JWT secret)
│   └── package.json
│
├── .gitignore                  # Global gitignore (node_modules, .env)
└── README.md                   # Project documentation

A secure, role-based Enterprise Resource Planning (ERP) system designed for educational institutions. It features an Admin dashboard for account provisioning, secure JWT-based authentication, and a forced password-reset flow for new users.

## 🛠 Tech Stack
* **Frontend:** React.js (Vite), React Router v6
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (Hosted on Neon.tech / Supabase)
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **Email Service:** Nodemailer (Gmail integration)

## 📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* Git
* A free PostgreSQL database (via [Neon.tech](https://neon.tech/) or local Docker container)
* A Google Account with an "App Password" generated for Nodemailer.

## 🚀 Installation & Setup

Follow these steps to get your development environment set up.

### 1. Clone the Repository
\`\`\`bash
git clone <your-repository-url>
cd school-erp-system
\`\`\`

### 2. Backend Setup
Navigate to the server directory and install dependencies:
\`\`\`bash
cd server
npm install
\`\`\`

**Required Backend Dependencies:**
\`\`\`bash
npm install express pg bcryptjs jsonwebtoken nodemailer cors dotenv
npm install --save-dev nodemon
\`\`\`

**Environment Variables (Server):**
Create a `.env` file in the `server/` directory and add the following:
\`\`\`env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_APP_PASSWORD=your_16_digit_gmail_app_password
\`\`\`

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
\`\`\`bash
cd client
npm install
\`\`\`

**Required Frontend Dependencies:**
\`\`\`bash
npm install react-router-dom axios jwt-decode
\`\`\`

**Environment Variables (Client):**
Create a `.env` file in the `client/` directory:
\`\`\`env
VITE_API_BASE_URL=http://localhost:5000/api
\`\`\`

### 4. Database Initialization
Connect to your PostgreSQL database using a tool like pgAdmin, DBeaver, or the Neon SQL Editor, and execute the initial schema:

\`\`\`sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    is_first_login BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`
*Note: You will need to manually insert your first ADMIN user directly into the database to bootstrap the system.*

## 💻 Running the Application

**Start the Backend Server:**
\`\`\`bash
cd server
npm run dev # Assuming you set up a nodemon script in package.json
\`\`\`
*The server will start on `http://localhost:5000`*

**Start the React Frontend:**
\`\`\`bash
cd client
npm run dev
\`\`\`
*The frontend will start on `http://localhost:5173` (default Vite port)*

## 🔐 Security Features
* **Admin-Only Provisioning:** Open registration is disabled. Only Admin roles can create Student/Teacher accounts.
* **First-Login Intercept:** New users receive a temporary password via email and are forced to update it before accessing any protected routes.
* **Stateless Authentication:** Sessions are managed securely via JWTs.