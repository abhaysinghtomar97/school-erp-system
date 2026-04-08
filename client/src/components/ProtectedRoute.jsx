import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext);

    // 1. If they aren't logged in at all, kick them to the login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. If they are logged in, but don't have the right role, kick them out
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect them to their own dashboard based on their actual role
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'TEACHER') return <Navigate to="/faculty" replace />;
        if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
    }

    // 3. If they pass all checks, let them in!
    return children;
};

export default ProtectedRoute;