import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';


const ChangePassword = () => {
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // 1. Consume the user object directly from your AuthContext
    const { user } = useContext(AuthContext); 

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 2. Frontend Safety Checks
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setError("Passwords do not match!");
        }
        if (passwords.newPassword.length < 6) {
            return setError("Password must be at least 6 characters long.");
        }

        // 3. Ensure AuthContext has successfully loaded the user
        if (!user) {
            return setError("You are not logged in. Please log in again.");
        }

        try {
            // Extract the ID from the context user object
            const userId = user.id || user.userId; 
            console.log(userId)

            // 4. Send the exact JSON package Node.js is expecting
            await API.post('/auth/change-password', {
                userId: userId,
                newPassword: passwords.newPassword
            });

            // 5. Show success and redirect using context role!
            setSuccess("Password updated successfully! Redirecting to your dashboard...");

            setTimeout(() => {
                if (user.role === 'ADMIN') navigate('/admin');
                else if (user.role === 'TEACHER') navigate('/faculty');
                else if (user.role === 'STUDENT') navigate('/student');
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