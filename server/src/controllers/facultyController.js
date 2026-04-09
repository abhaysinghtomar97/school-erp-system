const pool = require('../config/db'); // Update this path if your db connection is somewhere else!


const getMyClasses = async (req, res) => {
    try {
        // MAGIC: We get the ID directly from the token, NOT from the URL!
        const teacherId = req.user.id; 

        // Ask Postgres ONLY for classes assigned to this specific teacher
        const result = await pool.query(
            'SELECT id, name, room_number FROM classes WHERE homeroom_teacher_id = $1 ORDER BY created_at DESC',
            [teacherId]
        );

        res.status(200).json({ classes: result.rows });
    } catch (err) {
        console.error('Error fetching teacher classes:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};



module.exports = { getMyClasses};