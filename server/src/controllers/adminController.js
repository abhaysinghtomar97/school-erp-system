const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { newUserCredentialsTemplate } = require('../template/emailTemplates');
const { getCurrentAcademicYear } = require('../utils/helper')

const MailService = require('../services/MailService');
const validator = require('validator')

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
        const presentToday = `
         SELECT 
            (SELECT COUNT(*) 
            FROM attendance 
            WHERE date = CURRENT_DATE AND status IN ('Present', 'Late')) AS students,
            
            (SELECT COUNT(*) 
            FROM faculty_attendance 
            WHERE date = CURRENT_DATE AND status IN ('Present', 'Late')) AS faculty;
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


        // 4. Execute Queries in Parallel
        const [statsResult, noticesResult, userResult, presentTodayResult] = await Promise.all([
            pool.query(statsQuery),
            pool.query(noticesQuery),
            pool.query(userQuery, [userId]),
            pool.query(presentToday)
        ]);

        // final data object
        const dashboardData = {
            presentToday: presentTodayResult.rows[0],
            stats: statsResult.rows[0],
            notices: noticesResult.rows,
            user: userResult.rows[0],
        };


        // 5. Send the response
        res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const CreateUser = async (req, res) => {
    const { name, email, role } = req.body;
    const client = await pool.connect();

    try {
        // 1. Input Validation
        const cleanEmail = email?.trim().toLowerCase();

        if (!cleanEmail || !validator.isEmail(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        if (!name || !email || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 2. Start Transaction
        await client.query('BEGIN');

        const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        let prefix = '';
        if (role === 'TEACHER') prefix = 'fc_';
        else if (role === 'ADMIN') prefix = 'A_';

        const currentYear = new Date().getFullYear().toString().slice(-2);
        const searchPattern = `${prefix}${currentYear}%`;

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
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        let newUser;

        try {
            newUser = await client.query(
                `INSERT INTO users 
                (name, email, password_hash, role, is_first_login, institutional_id) 
                VALUES ($1, $2, $3, $4, true, $5) 
                RETURNING id, name, email, institutional_id, role`,
                [name, email, passwordHash, role, institutionalId]
            );
        } catch (err) {
            if (err.code === '23505') {
                await client.query('ROLLBACK');
                return res.status(409).json({ message: 'ID conflict, please retry' });
            }
            throw err; // Pass to outer catch block for standard rollback
        }

        // 3. Dispatch Email (Crucial step before committing)
        const emailHtml = newUserCredentialsTemplate(name, role, institutionalId, tempPassword);

        const emailResult = await MailService.sendEmail({
            to: email,
            subject: 'Welcome to Golden Valley ERP - Your Login Credentials',
            html: emailHtml
        });

        // 4. Validate Email Success
        if (!emailResult.success) {
            throw new Error(`Email delivery failed: ${emailResult.error}`);
        }

        // 5. Commit Transaction
        await client.query('COMMIT');

        return res.status(201).json({
            message: 'User created successfully. Credentials have been emailed.',
            user: newUser.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating user:', err.message);

        if (!res.headersSent) {
            res.status(500).json({
                message: 'Failed to create user. If email was unreachable, creation is aborted.'
            });
        }
    } finally {
        client.release();
    }
};



const getStudents = async (req, res) => {
    try {

        // 2. Execute PostgreSQL Query (Cache Miss)
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.institutional_id, 
                u.role, 
                u.is_first_login, 
                u.is_active,
                c.name AS current_class
            FROM users u
            LEFT JOIN enrolments e ON u.id = e.student_id AND e.is_active = true
            LEFT JOIN classes c ON e.class_id = c.id
            WHERE u.role = 'STUDENT'
            ORDER BY u.institutional_id ASC
        `;

        const result = await pool.query(query);


        // 4. Send the response
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


// --- enrolment MANAGEMENT ---

const getClassRoster = async (req, res) => {
    const { class_id } = req.params;
    try {
        const result = await pool.query(`
            SELECT users.id, users.name, users.institutional_id, users.email 
            FROM users 
            JOIN Enrolments e ON users.id = e.student_id 
            WHERE e.class_id = $1 AND e.is_active = true
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
    const dynamicAcademicYear = getCurrentAcademicYear();

    try {
        await pool.query(
            `INSERT INTO Enrolments (student_id, class_id, academic_year, is_active) 
             VALUES ($1, $2, $3, true)`,
            [student_id, class_id, dynamicAcademicYear]
        );
        res.status(201).json({ message: 'Student successfully enrolled!' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: `Student already has an active enrolment for the ${dynamicAcademicYear} session.` });
        }
        console.error('Error enrolling student:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
// 2. ARCHIVE A SINGLE STUDENT (Individual Promotion/Transfer)
const archiveStudentenrolment = async (req, res) => {
    const { student_id, academic_year } = req.body;
    const admin_id = req.user?.id;


    if (!admin_id) {
        return res.status(401).json({ message: 'Unauthorized: Admin context missing.' });
    }

    try {
        const result = await pool.query(
            `UPDATE Enrolments 
             SET is_active = false 
             WHERE student_id = $1 AND academic_year = $2 AND is_active = true
             RETURNING *`,
            [student_id, academic_year]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No active enrolment found for this student in the specified year.' });
        }

        res.status(200).json({
            message: 'Student enrolment successfully archived.',
            archivedRecord: result.rows[0]
        });

    } catch (err) {
        console.error('Error archiving enrolment:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// 3. ARCHIVE AN ENTIRE CLASS (End of Year Bulk Action)
// ==========================================
const bulkArchiveClass = async (req, res) => {
    const { class_id, academic_year } = req.body;
    const admin_id = req.user?.id;
    if (!admin_id) {
        return res.status(401).json({ message: 'Unauthorized: Admin context missing.' });
    }

    try {
        const result = await pool.query(
            `UPDATE Enrolments 
             SET is_active = false 
             WHERE class_id = $1 AND academic_year = $2 AND is_active = true`,
            [class_id, academic_year]
        );

        res.status(200).json({
            message: `Successfully archived ${result.rowCount} student Enrolments for the class.`
        });

    } catch (err) {
        console.error('Error archiving class:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


// --- TIMETABLE MANAGEMENT ---

const getAllPeriods = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM periods ORDER BY start_time ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

//  SUBJECTS MANAGEMENT

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

// ATTENDANCE MANAGEMENT 

const getStudentAttendanceLogs = async (req, res) => {
    const { date, classId } = req.query; // Using query params for filters

    try {
        let query = `
            SELECT 
                a.id, 
                u.name AS student_name, 
                u.institutional_id, 
                c.name AS class_name, 
                a.status, 
                m.name AS marked_by_name
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            JOIN classes c ON a.class_id = c.id
            LEFT JOIN users m ON a.marked_by = m.id
            WHERE a.date = $1
        `;

        let params = [date];

        // If admin selected a specific class, add it to the filter
        if (classId) {
            query += ` AND a.class_id = $2`;
            params.push(classId);
        }

        query += ` ORDER BY c.name ASC, u.name ASC`;

        const { rows } = await pool.query(query, params);
        res.status(200).json({ success: true, logs: rows });
    } catch (error) {
        console.error("Error fetching student logs:", error);
        res.status(500).json({ success: false, message: "Server error fetching logs" });
    }
};
const getFacultyAttendance = async (req, res) => {
    const { date } = req.query;

    try {
        const query = `
            SELECT 
                u.id AS teacher_id, 
                u.name, 
                u.institutional_id,
                COALESCE(fa.status, 'Not Marked') as status
            FROM users u
            LEFT JOIN faculty_attendance fa ON u.id = fa.teacher_id AND fa.date = $1
            WHERE u.role = 'TEACHER'
            ORDER BY u.name ASC;
        `;
        const { rows } = await pool.query(query, [date]);
        res.status(200).json({ success: true, attendance: rows });
    } catch (error) {
        console.error("Error fetching faculty attendance:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
const markFacultyAttendance = async (req, res) => {
    const { date, attendanceData } = req.body;
    const adminId = req.user.id; // The logged-in admin

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (let record of attendanceData) {
            const query = `
                INSERT INTO faculty_attendance (teacher_id, date, status, marked_by)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (teacher_id, date) 
                DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by;
            `;
            await client.query(query, [record.teacher_id, date, record.status, adminId]);
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Faculty attendance saved successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error saving faculty attendance:", error);
        res.status(500).json({ success: false, message: "Server error saving faculty attendance" });
    } finally {
        client.release();
    }
};

// SUBJECTS MANAGEMENT



const getSubjects = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.id, 
                s.name, 
                s.code, 
                u.name as teacher_name, 
                c.name as class_name 
            FROM subjects s
            LEFT JOIN users u ON s.teacher_id = u.id
            LEFT JOIN classes c ON s.class_id = c.id
            ORDER BY s.created_at DESC;
        `;
        const { rows } = await pool.query(query);
        res.json({ success: true, subjects: rows });
    } catch (err) {
        console.error("DB Query Error:", err.message); // This will show in your terminal
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

const createSubject = async (req, res) => {
    const { name, code, teacher_id, class_id } = req.body;

    try {
        const query = `
            INSERT INTO subjects (name, code, teacher_id, class_id) 
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        // If teacher_id or class_id are empty strings "", Postgres will crash because "" is not a UUID
        const { rows } = await pool.query(query, [
            name,
            code || null,
            teacher_id || null,
            class_id || null
        ]);
        res.status(201).json({ success: true, subject: rows[0] });
    } catch (err) {
        console.error("DATABASE CRASH:", err.message); // This will tell you exactly what column failed
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteSubject = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM subjects WHERE id = $1', [id]);
        res.json({ success: true, message: 'Subject deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//FEE MANAGEMENT

module.exports = {
    CreateUser,
    getStudents,
    getFaculty,
    toggleUserStatus,
    createClass,
    getClasses,
    getClassRoster,
    enrollStudent,
    archiveStudentenrolment,
    bulkArchiveClass,
    getAllPeriods,
    getdashboard,
    getClassTimetable,
    assignTimetableSlot,
    getSubjectsByClass,
    getStudentAttendanceLogs,
    getFacultyAttendance,
    markFacultyAttendance,
    getSubjects,
    createSubject,
    deleteSubject

};