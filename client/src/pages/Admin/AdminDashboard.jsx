import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    
    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', role: 'STUDENT' });
    const [loading, setLoading] = useState(false);
    
    // Result State
    const [createdUser, setCreatedUser] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setCreatedUser(null);

        try {
            const response = await API.post('/admin/create-user', formData);
            setCreatedUser(response.data.user);
            setFormData({ name: '', email: '', role: 'STUDENT' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 font-sans">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                <div className="mt-4 sm:mt-0 flex items-center gap-4">
                    {/* Displaying the NAME instead of the ID! */}
                    <span className="text-gray-600">
                        Logged in as: <strong className="text-gray-900">{user?.name || 'Admin'}</strong>
                    </span>
                    <button 
                        onClick={logout} 
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="mt-8 flex flex-col md:flex-row gap-8">
                
                {/* Left Side: Create User Form */}
                <div className="flex-1 p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Register New User</h3>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Full Name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email Address" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange} 
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                        >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Faculty / Teacher</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full p-3 mt-2 text-white font-semibold rounded transition duration-200 ${
                                loading 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {loading ? 'Processing...' : 'Create User'}
                        </button>
                    </form>
                </div>

                {/* Right Side: Success Results */}
                <div className="flex-1">
                    {createdUser ? (
                        <div className="p-8 border-2 border-green-500 bg-green-50 rounded-xl shadow-sm text-center transform transition-all duration-300">
                            <h3 className="text-2xl font-bold text-green-600 mb-4">🎉 User Created!</h3>
                            <div className="text-left bg-white p-4 rounded border border-green-200 mb-6">
                                <p className="text-gray-700 mb-2"><strong>Name:</strong> {createdUser.name}</p>
                                <p className="text-gray-700 mb-2"><strong>Email:</strong> {createdUser.email}</p>
                                <p className="text-gray-700"><strong>Role:</strong> {createdUser.role}</p>
                            </div>
                            
                            <h2 className="text-3xl font-mono font-bold tracking-widest text-gray-800 bg-white inline-block px-6 py-2 rounded shadow-inner border border-gray-200">
                                {createdUser.institutional_id}
                            </h2>
                            <p className="text-sm text-gray-500 mt-4 italic">
                                An email has been sent to the user with their temporary password.
                            </p>
                        </div>
                    ) : (
                        <div className="h-full min-h-75 flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400">
                            <p className="text-center font-medium">Fill out the form to generate a new Institutional ID.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;