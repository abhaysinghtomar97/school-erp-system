import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
    const {login} = useContext(AuthContext);
    const [loading, setloading] = useState(false);
    const [formData, setFormData] = useState({ identifier: '', password: '' });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setloading(true)

        try {
            // Hit your Node.js backend
            const response = await API.post('/auth/login', formData);
            const { token, user } = response.data;
           
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
        } finally{
            setloading(false);
        }
    };

    return (
  <div className="min-h-screen bg-[url('/bg1.png')]  bg-cover bg-center flex items-center justify-center">

    {/* Overlay (optional but makes UI pop) */}
    <div className="backdrop-blur-sm absolute inset-0 bg-black/50"></div>

    {/* Login Card */}
    <div className="relative z-10 w-100 bg-transparent  p-8 rounded-2xl shadow-xl">
      
      <h2 className="text-5xl text-amber-100 font-bold text-center mb-6">
        <span className=' text-blue-300'>Golden Valley School </span>ERP
      </h2>

      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        
        <input
          type="text"
          name="identifier"
          placeholder="Email or Institutional ID"
          value={formData.identifier}
          onChange={handleChange}
          required
          className="px-4 bg-amber-50 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="px-4 py-3 bg-amber-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
  type="submit"
  disabled={loading}
  className={`flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition duration-200 
  ${loading 
    ? 'bg-blue-400 cursor-not-allowed' 
    : 'bg-blue-600 hover:bg-blue-700 text-white'
  }`}
>
  {loading && (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  )}
  
  {loading ? 'Logging in...' : 'Login'}
</button>

      </form>
    </div>
  </div>
);
};

export default Login;