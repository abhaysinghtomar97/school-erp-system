const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); //
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const studentRoutes = require('./routes/studentRoutes')

const app = express();

app.use(cookieParser()); 

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // allow localhost
    if (origin.includes("localhost")) {
      return callback(null, true);
    }

    // allow all vercel deployments
    if (origin.includes("vercel.app")) {
      return callback(null, true);
    }

    // allow custom production domain
    if (
      origin === "https://erp-gvs.in" ||
      origin === "https://www.erp-gvs.in"
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json())




// --- Health Check Route ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'School ERP API is running natively.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api', noticeRoutes);
app.use('/api/student', studentRoutes);



module.exports = app;

