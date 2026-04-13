const pool = require('../config/db'); // Adjust this to match your DB connection file

// --- 1. Get Teacher's Schedule ---
// Fetches the timetable specifically for the logged-in teacher
// --- 1. Get Teacher's Schedule ---
const getMySchedule = async (req, res) => {
    try {
        const teacherId = req.user.id; 

        // Corrected SQL: Uses p.start_time and joins the periods table
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
        console.error("Error fetching faculty schedule:", error);
        res.status(500).json({ success: false, message: "Server error fetching schedule" });
    }
};

// --- 2. Get Class Roster ---
// Fetches all students enrolled in a specific class assigned to this teacher
const getClassRoster = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacherId = req.user.id;

        // Security Check: Verify this teacher actually teaches this class
        const authQuery = `
            SELECT id FROM timetable 
            WHERE teacher_id = $1 AND class_id = $2 
            LIMIT 1;
        `;
        const authResult = await pool.query(authQuery, [teacherId, classId]);
        
        if (authResult.rowCount === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized: You do not teach this class." });
        }

        // Fetch the students
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
        console.error("Error fetching class roster:", error);
        res.status(500).json({ success: false, message: "Server error fetching roster" });
    }
};

module.exports = {
    getMySchedule,
    getClassRoster
};