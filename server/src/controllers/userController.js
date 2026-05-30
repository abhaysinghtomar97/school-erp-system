const pool = require('../config/db.js');

const getUserProfile = async (req, res) => {
    const { id } = req.params;

    try {
        // STEP 1: Fetch the core user to determine their role
        const baseUserQuery = `
            SELECT id AS user_id, institutional_id, name, email, role, is_active 
            FROM users 
            WHERE id = $1;
        `;
        const { rows: baseRows } = await pool.query(baseUserQuery, [id]);
            
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
                    e.id, c.name, e.academic_year
                FROM student_profiles sp
                -- We use LEFT JOIN for enrolments just in case they haven't been assigned a class yet
                LEFT JOIN enrolments e ON sp.user_id = e.id AND e.is_active = true
                LEFT JOIN classes c ON e.class_id = c.id
                WHERE sp.user_id = $1;
            `;
            const { rows: studentRows } = await pool.query(studentQuery, [id]);
            
            // Merge the student specific data into the main profile object
            if (studentRows.length > 0) {
                userProfile = { ...userProfile, ...studentRows[0] };
            }

        } else if (userProfile.role === 'TEACHER') {
            const teacherQuery = `
                SELECT department, designation, qualification, hire_date
                FROM faculty_profiles
                WHERE user_id = $1;
            `;
            const { rows: teacherRows } = await pool.query(teacherQuery, [id]);
            
            if (teacherRows.length > 0) {
                userProfile = { ...userProfile, ...teacherRows[0] };
            }
        }

        // STEP 3: Send the clean, combined object to React
        return res.status(200).json({
            success: true,
            profile: userProfile
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'Server error while fetching profile data.' });
    }
};

module.exports = {
    getUserProfile
};