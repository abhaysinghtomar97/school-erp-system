import React, { useState } from 'react';
import API from '../../services/api';

const AdminDashboard = () => {
    // Note: We removed AuthContext, sidebar, and header from here!
    
    const [formData, setFormData] = useState({ name: '', email: '', role: 'STUDENT' });
    const [loading, setLoading] = useState(false);
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
        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 max-w-5xl mx-auto">
            <div className="border-b border-gray-100 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create New User</h2>
                <p className="text-gray-500 text-sm mt-1">Provision a new student, faculty, or admin account.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
                    {/* Form */}
                    <div className="flex-1">
                    {error && <div className="mb-4 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded">{error}</div>}
                    <form onSubmit={handleCreateUser} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="STUDENT">Student</option>
                                <option value="TEACHER">Faculty / Teacher</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className={`w-full p-3 font-semibold text-white rounded transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {loading ? 'Processing...' : 'Create User'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="flex-1">
                    {createdUser ? (
                        <div className="h-full p-6 border border-green-200 bg-green-50 rounded flex flex-col justify-center">
                            <h4 className="text-xl font-bold text-green-700 mb-4">🎉 Success!</h4>
                            <div className="space-y-2 text-gray-800">
                                <p><strong className="text-gray-600">Name:</strong> {createdUser.name}</p>
                                <p><strong className="text-gray-600">Email:</strong> {createdUser.email}</p>
                                <p><strong className="text-gray-600">Role:</strong> {createdUser.role}</p>
                                <div className="mt-6">
                                    <p className="text-sm text-gray-500 mb-1">Generated Institutional ID:</p>
                                    <p className="font-mono text-lg font-bold bg-white inline-block px-4 py-2 border border-green-200 rounded shadow-sm text-green-800">
                                        {createdUser.institutional_id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-75 flex items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                            <p className="text-center font-medium">Fill out the form to provision an account and generate an ID.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;