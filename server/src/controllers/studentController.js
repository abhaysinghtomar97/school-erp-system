const pool = require('../config/db');




// --- Get Student's Timetable ---
const getMyTimetable = async (req, res) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT 
                t.day_of_week,
                p.start_time,
                p.end_time,
                s.name AS subject_name,
                u.name AS teacher_name
            FROM timetable t
            JOIN periods p ON t.period_id = p.id
            JOIN subjects s ON t.subject_id = s.id
            JOIN users u ON t.teacher_id = u.id
            JOIN enrollments e ON t.class_id = e.class_id
            WHERE e.student_id = $1
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

        const { rows } = await pool.query(query, [studentId]);

        // Group by day of the week for easier frontend rendering
        const scheduleByDay = rows.reduce((acc, curr) => {
            if (!acc[curr.day_of_week]) acc[curr.day_of_week] = [];
            acc[curr.day_of_week].push(curr);
            return acc;
        }, {});

        res.status(200).json({ success: true, schedule: scheduleByDay });
    } catch (error) {
        console.error("Error fetching student timetable:", error);
        res.status(500).json({ success: false, message: "Server error fetching timetable" });
    }
};

// --- Get Student's Attendance Record ---
const getMyAttendance = async (req, res) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT date, status
            FROM attendance
            WHERE student_id = $1
            ORDER BY date DESC;
        `;

        const { rows } = await pool.query(query, [studentId]);
        
        // Calculate a quick summary for the dashboard
        const summary = rows.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            acc.total++;
            return acc;
        }, { total: 0 });

        res.status(200).json({ success: true, summary, history: rows });
    } catch (error) {
        console.error("Error fetching student attendance:", error);
        res.status(500).json({ success: false, message: "Server error fetching attendance" });
    }
};

// ---  Get Student's Assignments and Grades ---
const getMyAssignmentsAndGrades = async (req, res) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT 
                a.id AS assignment_id, 
                a.title, 
                a.description, 
                a.due_date, 
                a.max_score,
                s.name AS subject_name,
                u.name AS teacher_name,
                g.score, 
                g.feedback, 
                g.graded_at
            FROM assignments a
            JOIN enrollments e ON a.class_id = e.class_id
            JOIN subjects s ON a.subject_id = s.id
            JOIN users u ON a.teacher_id = u.id
            LEFT JOIN grades g ON a.id = g.assignment_id AND g.student_id = $1
            WHERE e.student_id = $1
            ORDER BY a.due_date DESC;
        `;

        const { rows } = await pool.query(query, [studentId]);
        res.status(200).json({ success: true, assignments: rows });
    } catch (error) {
        console.error("Error fetching student assignments:", error);
        res.status(500).json({ success: false, message: "Server error fetching assignments" });
    }
};

const getData = async(req, res)=>{
    try {
        const studentId = req.user.id;
        
        // write a query for fetching student - name, id , email and  mobile number , also fetch class_name
        const query = `
            SELECT

                u.name,
                u.institutional_id,
                u.email,
                u.mobile_number,
                c.name AS class_name
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            JOIN classes c ON e.class_id = c.id
            WHERE u.id = $1;
        `;

       
        const { rows } = await pool.query(query, [studentId]);
        
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error fetching student data:", error);
        res.status(500).json({ success: false, message: "Server error fetching student data" });

    }


}

module.exports = {
    getMyTimetable,
    getMyAttendance,
    getMyAssignmentsAndGrades,
    getData
 
};