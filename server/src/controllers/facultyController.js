const pool = require('../config/db'); // Adjust this to match your DB connection file

// --- 1. Get Teacher's Schedule ---
// Fetches the timetable specifically for the logged-in teacher
const getMySchedule = async (req, res) => {
    try {
        // req.user should be populated by your authentication middleware
        const teacherId = req.user.id; 

        // Join timetable with classes and subjects to get human-readable data
        const query = `
            SELECT 
                t.id AS timetable_id,
                t.day_of_week,
                t.start_time,
                t.end_time,
                c.id AS class_id,
                c.class_name,
                s.subject_name
            FROM timetable t
            JOIN classes c ON t.class_id = c.id
            JOIN subjects s ON t.subject_id = s.id
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
                t.start_time;
        `;

        const { rows } = await pool.query(query, [teacherId]);

        // Optional: Group the results by day of the week for easier frontend rendering
        const scheduleByDay = rows.reduce((acc, curr) => {
            if (!acc[curr.day_of_week]) acc[curr.day_of_week] = [];
            acc[curr.day_of_week].push(curr);
            return acc;
        }, {});

        res.status(200).json({ 
            success: true, 
            schedule: scheduleByDay,
            raw_schedule: rows // Sending raw rows as well just in case you need a flat list
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