const express = require('express');
const cors = require('cors'); //
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // ONLY allow your React app to connect
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP actions
    credentials: true // Required if you ever use cookies or secure sessions
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

