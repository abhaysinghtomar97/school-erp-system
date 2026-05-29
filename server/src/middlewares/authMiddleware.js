
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Grab the token from the cookie
    const token = req.cookies?.token; 

    if (!token) {
        // We use 'success: false' here so your frontend Axios interceptors can catch it easily
        return res.status(401).json({ success: false, message: "Access Denied: No token provided in cookies!" });
    }

    try {
        // 2. Decode the token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. THE CRUCIAL HANDOFF: Attach the decoded payload to the request
        // This is what checkRole is looking for!
        req.user = verified; 
        
        // 4. THE GREEN LIGHT: Tell Express to move to the next middleware (checkRole)
        next(); 
        
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(403).json({ success: false, message: "Invalid or expired session." });
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