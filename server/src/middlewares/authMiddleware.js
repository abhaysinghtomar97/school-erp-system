const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Grab the token from the React request headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extracts the token after "Bearer"

    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided!' });

    try {
        // 2. Open the token using your secret key
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the user's data (id, role, name) to the request!
        req.user = verified; 
        
        // 4. Send them to the controller
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or Expired Token' });
    }
};

module.exports = verifyToken;