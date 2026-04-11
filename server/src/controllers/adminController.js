const bcrypt = require('bcryptjs'); // Using bcryptjs as seen in your screenshot
const crypto = require('crypto');
const pool = require('../config/db');
// Assuming you exported transporter from your new utils folder!
const transporter = require('../utils/sendEmail');


const getdashboard = async (req, res) => {
    try {
        
        const userId = req.user.id;
        
        

        // 1. Stats Query
        const statsQuery = `
            SELECT
                (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') AS students,
                (SELECT COUNT(*) FROM users WHERE role = 'TEACHER') AS faculty,
                (SELECT COUNT(*) FROM classes) AS classes
        `;

        // 2. Notices Query
        const noticesQuery = `
            SELECT n.id, n.title, n.content, n.target_audience, n.created_at, u.name as author_name 
            FROM notices n
            LEFT JOIN users u ON n.posted_by = u.id
            ORDER BY n.created_at DESC
            LIMIT 5
        `;

        // 3. User Biodata Query
        const userQuery = `
            SELECT id, name, email, institutional_id, role, is_active 
            FROM users 
            WHERE id = $1
        `;

        // 🚀 Execute all 3 queries concurrently for maximum speed
        const [statsResult, noticesResult, userResult] = await Promise.all([
            pool.query(statsQuery),
            pool.query(noticesQuery),
            pool.query(userQuery, [userId])
        ]);

        // Send everything back in one clean package
        res.status(200).json({
            stats: statsResult.rows[0],
            notices: noticesResult.rows,
            user: userResult.rows[0] // Here is your biodata!
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
const CreateUser = async (req, res) => {
    const { name, email, role } = req.body;
    
    // 1. Get a dedicated client from the pool for a Transaction
    const client = await pool.connect();

    try {
        // Start Database Transaction
        await client.query('BEGIN');

        // Check if user exists
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Set prefix based on role
        let prefix = '';
        if (role === 'TEACHER') prefix = 'fc_';
        else if (role === 'ADMIN') prefix = 'A_';

        const currentYear = new Date().getFullYear().toString().slice(-2);
        const searchPattern = `${prefix}${currentYear}%`;

        // Get last ID
        const lastUserResult = await client.query(
            `SELECT institutional_id FROM users 
             WHERE institutional_id LIKE $1 
             ORDER BY institutional_id DESC LIMIT 1`,
            [searchPattern]
        );

        let nextSequence = 1;

        if (lastUserResult.rows.length > 0) {
            const lastId = lastUserResult.rows[0].institutional_id;
            const prefixAndYearLength = prefix.length + 2;
            const lastSequenceStr = lastId.slice(prefixAndYearLength);
            nextSequence = parseInt(lastSequenceStr, 10) + 1;
        }

        const paddedSequence = String(nextSequence).padStart(3, '0');
        const institutionalId = `${prefix}${currentYear}${paddedSequence}`;

        // Generate temporary password
        const tempPassword = crypto.randomBytes(4).toString('hex');
        console.log("tempPass generated for:", email);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        // Insert the user
        const newUser = await client.query(
            `INSERT INTO users (name, email, password_hash, role, is_first_login, institutional_id) 
             VALUES ($1, $2, $3, $4, true, $5) RETURNING id, name, email, institutional_id, role`,
            [name, email, passwordHash, role, institutionalId]
        );

        // COMMIT the transaction (Saves everything permanently)
        await client.query('COMMIT');

        // Send Success Response IMMEDIATELY (Don't wait for the email to send)
        res.status(201).json({
            message: 'User created successfully. Email is being sent.',
            user: newUser.rows[0]
        });

        // ==========================================
        // FIRE AND FORGET EMAIL LOGIC (VIA RESEND)
        // ==========================================
        
        const mailOptions = {
            from: `"Golden Valley School ERP" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your ERP Account Details",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
                    <h2 style="color: #2c3e50;">Welcome to the ERP System</h2>
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>Your account has been successfully created.</p>
                    <div style="background: #f4f6f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Institutional ID:</strong> ${institutionalId}</p>
                        <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                    </div>
                    <p style="color: #e74c3c;"><strong>Note:</strong> Please change your password after your first login.</p>
                </div>
            `
        };

        // Notice there is NO 'await' here. We handle errors with .catch() so it doesn't crash the server.
        transporter.sendMail(mailOptions).catch(emailError => {
            console.error(`Background Email Failed for ${email}:`, emailError.message);
        });

    } catch (err) {
        // If anything fails in the try block, undo any database changes
        await client.query('ROLLBACK');
        console.error('Error creating user:', err.message);

        // Ensure we only send a response if one hasn't been sent yet
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server Error during user creation' });
        }
    } finally {
        // ALWAYS release the client back to the pool, whether it succeeded or failed
        client.release();
    }
};



const getStudents = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.institutional_id, 
                u.role, 
                u.is_first_login, 
                u.is_active,
                STRING_AGG(c.name, ', ') AS enrolled_classes
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.student_id
            LEFT JOIN classes c ON e.class_id = c.id
            WHERE u.role = 'STUDENT'
            GROUP BY u.id
            ORDER BY u.institutional_id ASC
        `;

        const result = await pool.query(query);
        res.status(200).json({ Students: result.rows });

    } catch (err) {
        console.error('Error fetching students with classes:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getFaculty = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, institutional_id, role, is_first_login, is_active FROM users WHERE role = 'TEACHER' ORDER BY institutional_id ASC"
        );
        res.status(200).json({ faculty: result.rows });

    } catch (err) {
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


// --- ENROLLMENT MANAGEMENT ---

const getClassRoster = async (req, res) => {
    const { class_id } = req.params;
    try {
        const result = await pool.query(`
            SELECT users.id, users.name, users.institutional_id, users.email 
            FROM users 
            JOIN enrollments ON users.id = enrollments.student_id 
            WHERE enrollments.class_id = $1
            ORDER BY users.name ASC
        `, [class_id]);

        res.status(200).json({ roster: result.rows });
    } catch (err) {
        console.error('Error fetching roster:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

const enrollStudent = async (req, res) => {
    const { student_id, class_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO enrollments (student_id, class_id) VALUES ($1, $2)',
            [student_id, class_id]
        );
        res.status(201).json({ message: 'Student successfully enrolled!' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Student is already enrolled in this class.' });
        }
        console.error('Error enrolling student:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


// --- TIMETABLE MANAGEMENT ---

// 1. Get all time slots
const getAllPeriods = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM periods ORDER BY start_time ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Fetch formatted timetable for a specific class
const getClassTimetable = async (req, res) => {
    const { classId } = req.params;
    try {
        const query = `
            SELECT t.id, t.day_of_week, t.period_id, 
                   s.name as subject_name, u.name as teacher_name, 
                   p.start_time, p.end_time
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            JOIN users u ON t.teacher_id = u.id
            JOIN periods p ON t.period_id = p.id
            WHERE t.class_id = $1
        `;
        const result = await pool.query(query, [classId]);

        // Format data for O(1) frontend lookup
        const scheduleMap = {};
        result.rows.forEach(row => {
            if (!scheduleMap[row.day_of_week]) scheduleMap[row.day_of_week] = {};
            scheduleMap[row.day_of_week][row.period_id] = {
                subject: row.subject_name,
                teacher: row.teacher_name
            };
        });

        res.status(200).json({ success: true, data: scheduleMap });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. Assign or update a slot
const assignTimetableSlot = async (req, res) => {
    const { day, periodId, classId, subjectId, teacherId } = req.body;
    try {
        const query = `
            INSERT INTO timetable (day_of_week, period_id, class_id, subject_id, teacher_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (class_id, day_of_week, period_id) 
            DO UPDATE SET subject_id = EXCLUDED.subject_id, teacher_id = EXCLUDED.teacher_id;
        `;
        await pool.query(query, [day, periodId, classId, subjectId, teacherId]);
        res.status(201).json({ success: true, message: "Slot updated" });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: "Conflict: Teacher already busy!" });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- SUBJECTS MANAGEMENT ---

const getSubjectsByClass = async (req, res) => {
    const { classId } = req.params;
    try {
        const query = `
            SELECT id, name, code, teacher_id 
            FROM subjects 
            WHERE class_id = $1
            ORDER BY name ASC;
        `;
        const result = await pool.query(query, [classId]);

        // Return in the standard wrapper format
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error fetching subjects for class:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export {
    CreateUser, getStudents, getFaculty, toggleUserStatus,
    createClass, getClasses, getClassRoster, enrollStudent, getAllPeriods, getdashboard, getClassTimetable,
     assignTimetableSlot, getSubjectsByClass
};