const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');


// POST /api/auth/login
async function login(req, res){
    const { identifier, password } = req.body;
       
    try {


        /// Check BOTH columns in PostgreSQL
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR institutional_id = $1', 
            [identifier]
        );

        
        const user = userResult.rows[0];
        
        

        // 2. Validate password
        const validPassword = await bcrypt.compare(password, user.password_hash);
    
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        // 3. Generate JWT Payload
        const payload = {
            id: user.id,
            role: user.role,
            is_first_login: user.is_first_login,
            name: user.name
        };
        

        // 4. Sign Token (Ensure JWT_SECRET is in your .env)
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

          // 2. Set the cookie
    res.cookie('token', token, {
        httpOnly: true,    // Prevents JavaScript access (highly recommended for security)
        secure: true,      // Cookie only sent over HTTPS (use false for local development)
        maxAge: 3600000,   // Expiry in milliseconds (1 hour)
        sameSite: 'strict' // Helps prevent CSRF attacks
    });
        return  res.json({ token, user: payload , message: "Logged in"});
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


 async function changePassword(req, res){
    const { userId, newPassword } = req.body; // Later, userId will come from the JWT token
 
    try {
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update password AND remove the first login flag
        const result = await pool.query(
            `UPDATE users SET password_hash = $1, is_first_login = false WHERE id = $2`,
            [newPasswordHash, userId]
        );

        if(result.rowCount ===0){
            return res.status(404).json({
                message: 'Update faild: User not found'
            })        
        }

        res.json({ message: 'Password updated successfully. You can now access your dashboard.' });
    } catch (err) {
        console.error('Change password error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    login,
    changePassword
};
