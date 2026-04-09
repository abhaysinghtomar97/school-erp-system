const express = require('express');
const cors = require('cors'); //
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // allow localhost
    if (origin.includes("localhost")) {
      return callback(null, true);
    }

    // allow ALL vercel deployments
    if (origin.includes("vercel.app")) {
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



module.exports = app;

