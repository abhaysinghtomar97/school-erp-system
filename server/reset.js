require('dotenv').config(); // <--- ADD THIS LINE TO THE TOP
const bcrypt = require('bcryptjs'); 
const pool = require('./src/config/db'); 

const forceResetPassword = async () => {
    try {
        const studentEmail = 'abhaysinghtomar97@gmail.com'; 
        const newPassword = 'password123';
        
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        const query = `UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, name`;
        const { rows } = await pool.query(query, [newHash, studentEmail]);

        if (rows.length > 0) {
            console.log(`✅ Success! Password for ${rows[0].name} has been reset to: ${newPassword}`);
        } else {
            console.log(`❌ Error: No user found with email ${studentEmail}`);
        }
    } catch (error) {
        console.error("Crash during reset:", error);
    } finally {
        process.exit(); 
    }
};

forceResetPassword();