🎓 Full-Stack School ERP System

«A secure, role-based School ERP System built for educational institutions with JWT authentication, admin-controlled user provisioning, and first-login password reset enforcement.»

"Dashboard Screenshot" (./screenshots/dashboard.png)

---

✨ Features

🔐 Authentication & Security

- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes
- Role-based access control
- First-login password reset enforcement

👨‍💼 Admin Features

- Create Teacher accounts
- Create Student accounts
- Manage users
- Account provisioning system

📧 Email Integration

- Temporary password delivery
- Password reset emails
- Gmail SMTP via Nodemailer

🏫 ERP Modules

- User Management
- Student Management
- Teacher Management
- Authentication System
- Dashboard Analytics

---

📸 Screenshots

Login Page| Admin Dashboard
"Login" (./screenshots/login.png)| "Dashboard" (./screenshots/dashboard.png)

User Management| Change Password
"Users" (./screenshots/users.png)| "Password" (./screenshots/password.png)

---

## 🛠 Tech Stack

- **Frontend:** React.js (Vite)
- **Routing:** React Router v6
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT + bcryptjs
- **Email Service:** Nodemailer
- **API Client:** Axios
---

📂 Project Structure

```text
school-erp-system/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   └── package.json
│
├── screenshots/
│   ├── login.png
│   ├── dashboard.png
│   ├── users.png
│   └── password.png
│
├── .gitignore
└── README.md

⚙️ Prerequisites

- Node.js (v16+)
- Git
- PostgreSQL Database
- Gmail App Password
```
---

🚀 Installation

Clone Repository

git clone <your-repository-url>
cd school-erp-system

Backend Setup

cd server
npm install

Install dependencies:

npm install express pg bcryptjs jsonwebtoken nodemailer cors dotenv
npm install --save-dev nodemon

Create ".env"

PORT=5000

DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password

---

Frontend Setup

cd client
npm install

Install dependencies:

npm install react-router-dom axios jwt-decode

Create ".env"

VITE_API_BASE_URL=http://localhost:5000/api

---

🗄 Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM (
'ADMIN',
'TEACHER',
'STUDENT'
);

CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
role user_role NOT NULL,
is_first_login BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

▶️ Running The Project

Start Backend

cd server
npm run dev

Runs at:

http://localhost:5000

Start Frontend

cd client
npm run dev

Runs at:

http://localhost:5173

---

🔐 Security Features

- Admin-only account creation
- JWT authentication
- Password hashing
- Protected API routes
- First-login password reset flow
- Environment variable protection

---

📈 Future Improvements

- Attendance Management
- Fee Management
- Timetable Module
- Result Management
- Parent Portal
- Notifications System

---

👨‍💻 Author

Abhay

Built as a learning-focused full-stack project using modern web technologies.

---

⭐ Support

If you found this project helpful, consider giving it a star on GitHub.