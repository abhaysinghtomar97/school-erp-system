import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';

const ChangePassword = () => {
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. Frontend Safety Check
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setError("Passwords do not match!");
        }
        if (passwords.newPassword.length < 6) {
            return setError("Password must be at least 6 characters long.");
        }

        try {
            // 2. Grab the token and silently extract the User ID
            const token = localStorage.getItem('token');
            if (!token) {
                return setError("You are not logged in. Please go back to the login page.");
            }
            
            const decodedToken = jwtDecode(token);
            // Note: Make sure your Node.js login route puts the user's ID inside the token!
            // It is usually stored as decodedToken.id or decodedToken.userId
            const userId = decodedToken.id || decodedToken.userId; 

            // 3. Send the exact JSON package Node.js is expecting
            const response = await API.post('/auth/change-password', {
                userId: userId,
                newPassword: passwords.newPassword
            });

            // 4. Show success and redirect!
            setSuccess("Password updated successfully! Redirecting to your dashboard...");

            // Wait 2 seconds so they can read the success message, then route them
            setTimeout(() => {
                if (decodedToken.role === 'ADMIN') navigate('/admin');
                else if (decodedToken.role === 'TEACHER') navigate('/faculty');
                else if (decodedToken.role === 'STUDENT') navigate('/student');
                else navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>Set Your Permanent Password</h2>
            <p style={{ color: 'gray', fontSize: '14px' }}>
                Since this is your first time logging in, you must change your temporary password to continue.
            </p>

            {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px' }}>{error}</p>}
            {success && <p style={{ color: 'green', background: '#e6ffe6', padding: '10px' }}>{success}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input 
                    type="password" 
                    name="newPassword" 
                    placeholder="New Password" 
                    value={passwords.newPassword}
                    onChange={handleChange}
                    required
                    style={{ padding: '10px' }}
                />
                <input 
                    type="password" 
                    name="confirmPassword" 
                    placeholder="Confirm New Password" 
                    value={passwords.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ padding: '10px' }}
                />
                <button 
                    type="submit" 
                    style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;