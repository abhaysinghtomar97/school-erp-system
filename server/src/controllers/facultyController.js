const pool = require('../config/db');

// --- 1. Get Teacher's Schedule ---
// Fetches the timetable specifically for the logged-in teacher
const getMySchedule = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const query = `
            SELECT
                t.id AS timetable_id,
                t.day_of_week,
                p.start_time,
                p.end_time,
                c.id AS class_id,
                c.name AS class_name,
                s.name AS subject_name
            FROM timetable t
            JOIN classes c ON t.class_id = c.id
            JOIN subjects s ON t.subject_id = s.id
            JOIN periods p ON t.period_id = p.id
            WHERE t.teacher_id = $1
            ORDER BY
                CASE t.day_of_week
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                    WHEN 'Saturday' THEN 6
                    ELSE 7
                END,
                p.start_time;
        `;

        const { rows } = await pool.query(query, [teacherId]);

        const scheduleByDay = rows.reduce((acc, curr) => {
            if (!acc[curr.day_of_week]) acc[curr.day_of_week] = [];
            acc[curr.day_of_week].push(curr);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            schedule: scheduleByDay,
            raw_schedule: rows
        });
    } catch (error) {
        console.error('Error fetching faculty schedule:', error);
        res.status(500).json({ success: false, message: 'Server error fetching schedule' });
    }
};

// --- 2. Get Class Roster ---
const getClassRoster = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacherId = req.user.id;

        const authQuery = `
            SELECT id FROM timetable
            WHERE teacher_id = $1 AND class_id = $2
            LIMIT 1;
        `;
        const authResult = await pool.query(authQuery, [teacherId, classId]);

        if (authResult.rowCount === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You do not teach this class.' });
        }

        const rosterQuery = `
            SELECT
                u.id AS student_id,
                u.institutional_id,
                u.name,
                u.email
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            WHERE e.class_id = $1 AND u.role = 'STUDENT'
            ORDER BY u.name ASC;
        `;

        const { rows } = await pool.query(rosterQuery, [classId]);

        res.status(200).json({
            success: true,
            class_id: classId,
            total_students: rows.length,
            students: rows
        });
    } catch (error) {
        console.error('Error fetching class roster:', error);
        res.status(500).json({ success: false, message: 'Server error fetching roster' });
    }
};

// --- 3. Get Attendance for a Specific Date ---
const getAttendance = async (req, res) => {
    const { classId, date } = req.params;
    try {
        const query = `
            SELECT
                u.id AS student_id,
                u.name,
                u.institutional_id,
                COALESCE(a.status, 'Not Marked') AS status
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            LEFT JOIN attendance a ON u.id = a.student_id AND a.class_id = $1 AND a.date = $2
            WHERE e.class_id = $1 AND u.role = 'STUDENT'
            ORDER BY u.name ASC;
        `;
        const { rows } = await pool.query(query, [classId, date]);

        res.status(200).json({ success: true, attendance: rows });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- 4. Submit/Update Attendance ---
const markAttendance = async (req, res) => {
    const { classId, date, attendanceData } = req.body;
    const teacherId = req.user.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (let record of attendanceData) {
            const query = `
                INSERT INTO attendance (class_id, student_id, date, status, marked_by)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (class_id, student_id, date)
                DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by;
            `;
            await client.query(query, [classId, record.student_id, date, record.status, teacherId]);
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Attendance saved successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving attendance:', error);
        res.status(500).json({ success: false, message: 'Server error saving attendance' });
    } finally {
        client.release();
    }
};

// --- 5. Get Unique Classes for this Teacher ---
const getMyClasses = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const query = `
            SELECT DISTINCT c.id, c.name
            FROM timetable t
            JOIN classes c ON t.class_id = c.id
            WHERE t.teacher_id = $1
            ORDER BY c.name ASC;
        `;
        const { rows } = await pool.query(query, [teacherId]);

        res.status(200).json({ success: true, classes: rows });
    } catch (error) {
        console.error('Error fetching teacher classes:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getMySchedule,
    getClassRoster,
    getAttendance,
    markAttendance,
    getMyClasses
};
