import { createContext, useState, useEffect } from 'react';
import API from '../services/api'; // Make sure your Axios instance is imported here

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // When the app loads, ask the backend if a valid cookie exists
    useEffect(() => {
        const verifySession = async () => {
            try {
                // We will create this quick route on the backend in the next step
                const response = await API.get('/auth/me'); 
              
                setUser(response.data.user);
            } catch (err) {
                // If it fails (no cookie, or expired), they are not logged in
                setUser(null); 
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = (userData) => {
        setUser(userData); // Just update state, no localStorage needed
    };

    const logout = async () => {
        try {
            // Tell the backend to destroy the secure cookie
            await API.post('/auth/logout');
        } catch (err) {
            console.error("Logout failed", err);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};