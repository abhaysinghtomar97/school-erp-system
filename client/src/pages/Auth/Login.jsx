import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
    const {login} = useContext(AuthContext);
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    console.log("form data: ", formData)
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Hit your Node.js backend
            const response = await API.post('/auth/login', formData);
            const { token, user } = response.data;
            // console.log(token,user)

            // Save the token to local storage
            login(token)

            // Decode the token to find out who just logged in
            const decodedToken = jwtDecode(token);

            // Role-Based Routing (The Traffic Cop!)
            if (user.is_first_login) {
                navigate('/change-password'); // Force them to change password
            } else if (decodedToken.role === 'ADMIN') {
                navigate('/admin');
            } else if (decodedToken.role === 'TEACHER') {
                console.log("navigating")
                navigate('/faculty');
            } else if (decodedToken.role === 'STUDENT') {
                navigate('/student');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>School ERP Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    name="identifier"
                    placeholder="Email or Institutional ID"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                    style={{ padding: '10px' }}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', background: 'blue', color: 'white' }}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;