const pool = require('../config/db'); // Adjust this to match your DB connection file

// --- 1. Get Teacher's Schedule ---
// Fetches the timetable specifically for the logged-in teacher
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

// --- 3. Get Attendance for a Specific Date ---
const getAttendance = async (req, res) => {
    const { classId, date } = req.params;
    
    try {
        const query = `
            SELECT 
                u.id AS student_id, 
                u.name, 
                u.institutional_id,
                COALESCE(a.status, 'Not Marked') as status
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            LEFT JOIN attendance a ON u.id = a.student_id AND a.class_id = $1 AND a.date = $2
            WHERE e.class_id = $1 AND u.role = 'STUDENT'
            ORDER BY u.name ASC;
        `;
        const { rows } = await pool.query(query, [classId, date]);
        
        res.status(200).json({ success: true, attendance: rows });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- 4. Submit/Update Attendance ---
const markAttendance = async (req, res) => {
    const { classId, date, attendanceData } = req.body; 
    const teacherId = req.user.id;

    // Use a transaction to prevent partial attendance saves
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
        console.error("Error saving attendance:", error);
        res.status(500).json({ success: false, message: "Server error saving attendance" });
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
        console.error("Error fetching teacher classes:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- 6. Create a New Assignment ---
const createAssignment = async (req, res) => {
    const { classId, subjectId, title, description, dueDate, maxScore } = req.body;
    const teacherId = req.user.id;

    try {
        const query = `
            INSERT INTO assignments (class_id, subject_id, teacher_id, title, description, due_date, max_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [classId, subjectId, teacherId, title, description, dueDate, maxScore];
        
        const { rows } = await pool.query(query, values);
        res.status(201).json({ success: true, message: 'Assignment created successfully', assignment: rows[0] });
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ success: false, message: "Server error creating assignment" });
    }
};

// --- 7. Get Assignments for a Class ---
const getAssignments = async (req, res) => {
    const { classId } = req.params;
    const teacherId = req.user.id;

    try {
        const query = `
            SELECT a.*, s.name as subject_name
            FROM assignments a
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.class_id = $1 AND a.teacher_id = $2
            ORDER BY a.due_date DESC, a.created_at DESC;
        `;
        const { rows } = await pool.query(query, [classId, teacherId]);
        res.status(200).json({ success: true, assignments: rows });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ success: false, message: "Server error fetching assignments" });
    }
};

// --- 8. Submit or Update Grades ---
const submitGrades = async (req, res) => {
    const { assignmentId, gradesData } = req.body; 
    // gradesData expects: [{ student_id: 'uuid', score: 95, feedback: 'Great job!' }]
    const teacherId = req.user.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (let record of gradesData) {
            // Only insert/update if a score was actually provided
            if (record.score !== null && record.score !== '') {
                const query = `
                    INSERT INTO grades (assignment_id, student_id, score, feedback, graded_by)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (assignment_id, student_id)
                    DO UPDATE SET 
                        score = EXCLUDED.score, 
                        feedback = EXCLUDED.feedback, 
                        graded_by = EXCLUDED.graded_by,
                        graded_at = CURRENT_TIMESTAMP;
                `;
                await client.query(query, [assignmentId, record.student_id, record.score, record.feedback, teacherId]);
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Grades saved successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error saving grades:", error);
        res.status(500).json({ success: false, message: "Server error saving grades" });
    } finally {
        client.release();
    }
};

// --- 9. Get Teacher's Subjects for a Class ---
const getClassSubjects = async (req, res) => {
    const { classId } = req.params;
    const teacherId = req.user.id;

    try {
        const query = `
            SELECT id, name, code 
            FROM subjects 
            WHERE class_id = $1 AND teacher_id = $2
            ORDER BY name ASC;
        `;
        const { rows } = await pool.query(query, [classId, teacherId]);
        res.status(200).json({ success: true, subjects: rows });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ success: false, message: "Server error fetching subjects" });
    }
};

// Don't forget to add getClassSubjects to your module.exports at the bottom!
module.exports = {
    getMySchedule,
    getClassRoster,
    getAttendance,
    markAttendance,
    getMyClasses,
    createAssignment,
    getAssignments,
    submitGrades,
    getClassSubjects
};