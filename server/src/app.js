const express = require('express');
const cors = require('cors'); //
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://school-erp-system-gun1asjse-abhay-singh-tomars-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
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

