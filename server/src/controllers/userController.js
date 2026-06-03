const pool = require('../config/db.js');


const getUserProfile = async (req, res) => {
    // Safely grab the ID from the URL params, or fallback to the authenticated user's ID
    const targetId = req.params.id || req.user?.id;
    if (!targetId) {
        return res.status(400).json({ error: 'User ID is required to fetch a profile.' });
    }

    try {
        // STEP 1: Fetch the core user to determine their role
        const baseUserQuery = `
            SELECT id AS user_id, institutional_id, name, email, role, is_active 
            FROM users 
            WHERE id = $1;
        `;
        const { rows: baseRows } = await pool.query(baseUserQuery, [targetId]);
      
        if (baseRows.length === 0) {
            return res.status(404).json({ error: 'User not found in the system.' });
        }

        let userProfile = { ...baseRows[0] };
        

        // STEP 2: Fetch specific data based on the role
        if (userProfile.role === 'STUDENT') {
            
            const studentQuery = `
                SELECT 
                    sp.date_of_birth, sp.blood_group, sp.parent_name, 
                    sp.parent_phone, sp.emergency_contact, sp.address,
                    e.class_id, c.name as c_name, e.academic_year 
                FROM student_profiles sp
                -- Use LEFT JOIN so the query succeeds even if they aren't assigned a class yet
                LEFT JOIN enrolments e ON sp.user_id = e.student_id AND e.is_active = true
                LEFT JOIN classes c ON e.class_id = c.id
                WHERE sp.user_id = $1;
            `;
            const { rows: studentRows } = await pool.query(studentQuery, [targetId]);
            
            if (studentRows.length > 0) {
                userProfile = { ...userProfile, ...studentRows[0] };
            }
            

        } else if (userProfile.role === 'TEACHER' || userProfile.role === 'FACULTY') {
            const facultyQuery = `
                SELECT department, designation, qualification, hire_date
                FROM faculty_profiles
                WHERE user_id = $1;
            `;
            const { rows: facultyRows } = await pool.query(facultyQuery, [targetId]);
            
            if (facultyRows.length > 0) {
                userProfile = { ...userProfile, ...facultyRows[0] };
            }
        }
    
        
        // STEP 3: Return the clean, combined object
        return res.status(200).json({
            success: true,
            profile: userProfile
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({error: 'Server error while fetching profile data.' });
    }
};


const updateProfileField = async (req, res) => {
    const targetId = req.params.id;
    const { field, value } = req.body;

    // Notice how these now exactly match your database screenshots!
    const usersTableFields = ['name', 'mobile_number']; // Changed to mobile_number
    const studentTableFields = ['date_of_birth', 'blood_group', 'parent_name', 'parent_phone', 'emergency_contact', 'address'];
    const facultyTableFields = ['department', 'designation', 'qualification', 'hire_date', 'address']; // Added address here

    try {
        let query = '';
        let queryValues = [value, targetId];
        
        if (usersTableFields.includes(field)) {
            query = `UPDATE users SET ${field} = $1 WHERE id = $2 RETURNING *`;
            await pool.query(query, queryValues);
        } 
        else if (studentTableFields.includes(field)) {
            query = `
                INSERT INTO student_profiles (user_id, ${field}) 
                VALUES ($2, $1) 
                ON CONFLICT (user_id) DO UPDATE SET ${field} = EXCLUDED.${field}
                RETURNING *
            `;
            await pool.query(query, queryValues);
        } 
        else if (facultyTableFields.includes(field)) {
            query = `
                INSERT INTO faculty_profiles (user_id, ${field}) 
                VALUES ($2, $1) 
                ON CONFLICT (user_id) DO UPDATE SET ${field} = EXCLUDED.${field}
                RETURNING *
            `;
            await pool.query(query, queryValues);
        } 
        else {
            return res.status(400).json({ error: `Invalid field: ${field} is not allowed.` });
        }

        return res.status(200).json({ success: true, message: `${field} updated successfully.` });

    } catch (error) {
        console.error('Error updating profile field:', error);
        return res.status(500).json({ error: 'Server error while updating profile.' });
    }
};





// controllers/userController.js

const getUserAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Get user role
        const userQuery = `SELECT role FROM users WHERE id = $1`;
        const userResult = await pool.query(userQuery, [id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const role = userResult.rows[0].role;
        let summary = { Present: 0, Absent: 0, Late: 0};

        // 2. Ask the DB to group and count the statuses (Lightning Fast)
        let countQuery = "";
        if (role === 'STUDENT') {
            countQuery = `
                SELECT status, COUNT(*) as count 
                FROM attendance 
                WHERE student_id = $1 
                GROUP BY status
            `;
        } else if (role === 'TEACHER') {
            countQuery = `
                SELECT status, COUNT(*) as count 
                FROM faculty_attendance 
                WHERE teacher_id = $1 
                GROUP BY status
            `;
        }

        if (countQuery) {
            const result = await pool.query(countQuery, [id]);
            
            
            result.rows.forEach(row => {
                // Ensure we map the status exactly as it comes from the DB
                if (summary[row.status] !== undefined) {
                    summary[row.status] = parseInt(row.count, 10);
                }
            });
        }

        // 3. Send ONLY the tiny summary object to React
        return res.status(200).json({ summary });

    } catch (error) {
        console.error("Attendance fetch error:", error);
        return res.status(500).json({ message: "Failed to fetch attendance summary" });
    }
};
module.exports = {
    getUserProfile,
    updateProfileField,
    getUserAttendance
};