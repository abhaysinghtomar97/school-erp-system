import React, { useState } from 'react';
import API from '../../services/api';

const CreateUser = () => {
    const [formData, setFormData] = useState({ name: '', email: '', role: 'STUDENT' });
    const [loading, setLoading] = useState(false);
    const [createdUser, setCreatedUser] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setCreatedUser(null);
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
        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Create New User</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full p-2.5 border rounded outline-none focus:border-blue-500" />
                        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full p-2.5 border rounded outline-none focus:border-blue-500" />
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2.5 border rounded bg-white outline-none focus:border-blue-500">
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Faculty / Teacher</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <button type="submit" disabled={loading} className="w-full p-3 text-white rounded bg-blue-600 hover:bg-blue-700 transition">
                            {loading ? 'Processing...' : 'Create User Account'}
                        </button>
                    </form>
                </div>

                <div className="flex-1">
                    {createdUser ? (
                        <div className="h-full p-6 bg-green-50 rounded border border-green-200 flex flex-col justify-center">
                            <h4 className="font-bold text-green-700 mb-2">🎉 Success! User Created</h4>
                            <p><strong>Name:</strong> {createdUser.name}</p>
                            <p><strong>Role:</strong> {createdUser.role}</p>
                            <p className="mt-4 text-sm text-gray-600">Generated ID:</p>
                            <p className="font-mono text-lg font-bold bg-white inline-block px-3 py-1 border rounded">{createdUser.institutional_id}</p>
                        </div>
                    ) : (
                        <div className="h-full min-h-62 flex items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded text-gray-400">
                            Fill out the form to generate credentials.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateUser;