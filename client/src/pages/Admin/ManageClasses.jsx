import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageClasses = () => {
    // State for data
    const [classes, setClasses] = useState([]);
    const [faculty, setFaculty] = useState([]);
    
    // State for UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for Form
    const [formData, setFormData] = useState({ name: '', room_number: '', homeroom_teacher_id: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        // Fetch both datasets when the page loads
        fetchData();
    }, []); 

    const fetchData = async () => {
        try {
            // Run both API calls at the same time for better performance
            const [classesRes, facultyRes] = await Promise.all([
                API.get('/admin/classes'),
                API.get('/admin/faculty')
            ]);
            
            setClasses(Array.isArray(classesRes.data.classes) ? classesRes.data.classes : []);
            setFaculty(Array.isArray(facultyRes.data.faculty) ? facultyRes.data.faculty : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await API.post('/admin/classes', formData);
            // Clear form and refresh the table!
            setFormData({ name: '', room_number: '', homeroom_teacher_id: '' });
            fetchData(); 
        } catch (err) {
            alert('Failed to create class.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans">
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Classes</h2>
                <span className="bg-teal-100 text-teal-800 text-sm font-semibold px-4 py-1 rounded-full">
                    Total Classes: {classes.length}
                </span>
            </div>

            {error && <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">{error}</div>}

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* LEFT SIDE: Create Class Form */}
                <div className="lg:w-1/3 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Class</h3>
                    <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Class Name (e.g., 10th Grade Sci)" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input 
                            type="text" 
                            name="room_number" 
                            placeholder="Room Number (Optional)" 
                            value={formData.room_number} 
                            onChange={handleChange} 
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        
                        {/* The Magic Dropdown connected to the users table! */}
                        <select 
                            name="homeroom_teacher_id" 
                            value={formData.homeroom_teacher_id} 
                            onChange={handleChange} 
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                        >
                            <option value="">-- Assign Homeroom Teacher --</option>
                            {faculty.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} ({teacher.institutional_id})
                                </option>
                            ))}
                        </select>
                        
                        <button 
                            type="submit" 
                            disabled={creating}
                            className="w-full p-3 mt-2 text-white font-semibold rounded bg-teal-600 hover:bg-teal-700 transition"
                        >
                            {creating ? 'Creating...' : 'Create Class'}
                        </button>
                    </form>
                </div>

                {/* RIGHT SIDE: The Data Table */}
                <div className="lg:w-2/3">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                            <table className="min-w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Class Name</th>
                                        <th className="px-6 py-4 font-semibold">Room</th>
                                        <th className="px-6 py-4 font-semibold">Homeroom Teacher</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {classes.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                No classes found. Create one to the left!
                                            </td>
                                        </tr>
                                    ) : (
                                        classes.map((cls) => (
                                            <tr key={cls.id} className="hover:bg-teal-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-800">{cls.name}</td>
                                                <td className="px-6 py-4">{cls.room_number || '-'}</td>
                                                <td className="px-6 py-4">
                                                    {cls.teacher_name ? (
                                                        <span className="font-medium text-teal-700">{cls.teacher_name}</span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Unassigned</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default ManageClasses;