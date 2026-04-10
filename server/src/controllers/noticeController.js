const pool = require('../config/db');

// API 1: Fetch Notices (/get-notices)
const getNotices = async (req, res) => {
    try {
        // We use a JOIN to grab the actual name of the user who posted it
        const query = `
            SELECT n.id, n.title, n.content, n.target_audience, n.created_at, u.name as author_name 
            FROM notices n
            LEFT JOIN users u ON n.posted_by = u.id
            ORDER BY n.created_at DESC
        `;
        const result = await pool.query(query);
        
        res.status(200).json({ notices: result.rows });
    } catch (err) {
        console.error('Error fetching notices:', err.message);
        res.status(500).json({ message: 'Server error fetching notices' });
    }
};

// API 2: Create a Notice (/create-notice)
const createNotice = async (req, res) => {
    const { title, content, target_audience } = req.body;
    
    // Grab the ID of the currently logged-in admin/teacher from the verified token
    const posted_by = req.user.id; 

    try {
        const result = await pool.query(
            'INSERT INTO notices (title, content, posted_by, target_audience) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, posted_by, target_audience || 'ALL']
        );
        
        // Return the newly created notice so the frontend can instantly add it to the feed
        res.status(201).json({ 
            message: 'Notice created successfully', 
            notice: result.rows[0] 
        });
    } catch (err) {
        console.error('Error creating notice:', err.message);
        res.status(500).json({ message: 'Server error creating notice' });
    }
};

module.exports = {
    getNotices,
    createNotice
};