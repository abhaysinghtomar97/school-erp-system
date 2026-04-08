const nodemailer = require('nodemailer');


// Setup Nodemailer 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD 
    }
});


module.exports = transporter;