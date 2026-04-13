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
// The New Role Checker
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // req.user comes from your verifyToken middleware
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        // Check if the user's role is in the array of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access Denied. Required role: ${allowedRoles.join(' or ')}` 
            });
        }

        // If they pass the check, let them proceed to the controller
        next();
    };
};

module.exports = {
    verifyToken, // your existing token verifier
    checkRole    // export the new function
};