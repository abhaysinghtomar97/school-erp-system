const bcrypt = require('bcryptjs'); // Using bcryptjs as seen in your screenshot
const crypto = require('crypto');
const pool = require('../config/db');
// Assuming you exported transporter from your new utils folder!
const transporter  = require('../utils/sendEmail'); 

const CreateUser = async (req, res) => {
    // Notice we do NOT ask for institutional_id from the req.body, we generate it!
    const { name, email, role } = req.body;

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // ==========================================
        // 🚀 NEW CUSTOM ID GENERATION LOGIC 
        // ==========================================
        
        // 1. Set prefix based on role (Students get nothing!)
        let prefix = '';
        if (role === 'TEACHER') prefix = 'fc_';
        else if (role === 'ADMIN') prefix = 'A_'; 

        // 2. Get the 2-digit year (e.g., "26")
        const currentYear = new Date().getFullYear().toString().slice(-2);
        
        // 3. Search database for the highest ID with this exact prefix and year
        const searchPattern = `${prefix}${currentYear}%`;
        const lastUserResult = await pool.query(
            `SELECT institutional_id FROM users 
             WHERE institutional_id LIKE $1 
             ORDER BY institutional_id DESC LIMIT 1`,
            [searchPattern]
        );

        let nextSequence = 1;

        // 4. If a user exists, extract their number and add 1
        if (lastUserResult.rows.length > 0) {
            const lastId = lastUserResult.rows[0].institutional_id;
            
            // This math dynamically handles BOTH "fc_" (length 3) and "" (length 0)
            const prefixAndYearLength = prefix.length + 2; 
            const lastSequenceStr = lastId.slice(prefixAndYearLength);
            
            nextSequence = parseInt(lastSequenceStr, 10) + 1;
        }

        // 5. Force the sequence to be 3 digits (1 becomes "001")
        const paddedSequence = String(nextSequence).padStart(3, '0');

        // 6. Combine them! (e.g., "" + "26" + "001" = "26001")
        const institutionalId = `${prefix}${currentYear}${paddedSequence}`;
        
        // ==========================================

        // Generate temporary password
        const tempPassword = crypto.randomBytes(4).toString('hex');
        console.log("tempPass:",tempPassword)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        // Insert the user into the database (MAKE SURE TO INCLUDE institutional_id)
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, is_first_login, institutional_id) 
             VALUES ($1, $2, $3, $4, true, $5) RETURNING id, name, email, institutional_id, role`,
            [name, email, passwordHash, role, institutionalId]
        );

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to the School ERP - Your Account Details',
            text: `Hello ${name},\n\nYour account has been created.\n\nInstitutional ID: ${institutionalId}\nTemporary Password: ${tempPassword}\n\nYou can log in using either your email or your Institutional ID.`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ 
            message: 'User created successfully', 
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};



const getStudents = async (req, res) => {
    try {
        // Ask Postgres for all users with the TEACHER role
      const result = await pool.query(
    "SELECT id, name, email, institutional_id, role, is_first_login, is_active FROM users WHERE role = 'STUDENT' ORDER BY institutional_id ASC"
);
        
        // Send it back cleanly wrapped in a "faculty" object
        res.status(200).json({ Students: result.rows });
        
        
    } catch (err) {
        console.error('Error fetching faculty:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
const getFaculty = async (req, res) => {
    try {
        // Updated to include the new is_active column!
        const result = await pool.query(
            "SELECT id, name, email, institutional_id, role, is_first_login, is_active FROM users WHERE role = 'TEACHER' ORDER BY institutional_id ASC"
        );
        
        res.status(200).json({ faculty: result.rows });
        
    } catch (err) {
        // This prints the exact reason it crashed to your terminal!
        console.error('Error fetching faculty:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

const toggleUserStatus = async (req, res) => {
    const { id } = req.params; 
    const { is_active } = req.body; 

    try {
        const result = await pool.query(
            'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, is_active',
            [is_active, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User status updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error updating status:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};



// --- CLASS MANAGEMENT ---

const createClass = async (req, res) => {
    const { name, room_number, homeroom_teacher_id } = req.body;

    try {
        // If they didn't select a teacher, we must send NULL to PostgreSQL, not an empty string
        const teacherId = homeroom_teacher_id ? homeroom_teacher_id : null;

        const result = await pool.query(
            'INSERT INTO classes (name, room_number, homeroom_teacher_id) VALUES ($1, $2, $3) RETURNING *',
            [name, room_number, teacherId]
        );

        res.status(201).json({ message: 'Class created successfully', newClass: result.rows[0] });
    } catch (err) {
        console.error('Error creating class:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getClasses = async (req, res) => {
    try {
        // The Magic JOIN: Fetch the class, AND go grab the Teacher's name from the users table!
        const result = await pool.query(`
            SELECT 
                classes.id, 
                classes.name, 
                classes.room_number, 
                users.name AS teacher_name 
            FROM classes 
            LEFT JOIN users ON classes.homeroom_teacher_id = users.id 
            ORDER BY classes.created_at DESC
        `);
        
        res.status(200).json({ classes: result.rows });
    } catch (err) {
        console.error('Error fetching classes:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update your exports!
module.exports = { 
    CreateUser, getStudents, getFaculty, toggleUserStatus, 
    createClass, getClasses 
};