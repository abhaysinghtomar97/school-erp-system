import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', teacher_id: '', class_id: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [classRes, teachRes, subRes] = await Promise.all([
                API.get('/admin/classes'), // Make sure this returns { classes: [...] }
                API.get('/admin/faculty'),// Make sure this returns { faculty: [...] }
                API.get('/admin/subjects')
            ]);

            // SUCCESS: Check the keys in your console logs!
            // If your backend returns { success: true, users: [...] }, use teachRes.data.users

            setSubjects(subRes.data.subjects);
            
           
setClasses(classRes.data.classes );
setTeachers(teachRes.data.faculty);

            // To see the updated state, you'd need a separate useEffect watching [classes]
            // But for the UI, it will re-render automatically!
        } catch (err) {
            console.error("Error loading data:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/subjects', formData);
            setShowModal(false);
            setFormData({ name: '', code: '', teacher_id: '', class_id: '' });
            fetchData();
        } catch (err) { alert("Error saving subject"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this subject?")) {
            await API.delete(`/admin/subjects/${id}`);
            fetchData();
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Subjects</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm"
                >
                    + Add Subject
                </button>
            </div>

            {/* Subjects Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Subject Name</th>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Assigned Teacher</th>
                            <th className="px-6 py-4">Class</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {subjects.map(sub => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-800">{sub.name}</td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{sub.code || 'N/A'}</td>
                                <td className="px-6 py-4 text-gray-600">{sub.teacher_name}</td>
                                <td className="px-6 py-4 text-gray-600">{sub.class_name}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleDelete(sub.id)} className="text-red-500 hover:text-red-700 font-bold">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal for Adding Subject */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Add New Subject</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                required placeholder="Subject Name (e.g. Physics)"
                                className="w-full p-2 border rounded"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                placeholder="Code (Optional)"
                                className="w-full p-2 border rounded"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                            <select 
    required 
    className="w-full p-2 border rounded"
    // Make sure you are accessing e.target.value
    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
>
    <option value="">Select Teacher</option>
    {teachers.map(t => (
        <option key={t.id} value={t.id}> {/* value MUST be t.id (the UUID) */}
            {t.name}
        </option>
    ))}
</select>
                            <select 
    required 
    className="w-full p-2 border rounded text-gray-800"
    value={formData.class_id}
    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
>
    <option value="" disabled>-- Choose a Class --</option>
    {classes && classes.map((c) => (
        <option key={c.id} value={c.id}>
            {c.class_name || c.name} {/* Check if your DB column is class_name or name */}
        </option>
    ))}
</select>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Save Subject</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSubjects;