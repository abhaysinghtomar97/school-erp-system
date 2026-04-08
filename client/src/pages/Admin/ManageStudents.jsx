import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    //  Empty array prevents infinite loops!
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
       


        try {
            const response = await API.get('/admin/students');


            const actualArrayOfStudents = response.data.Students;


            if (Array.isArray(actualArrayOfStudents)) {
                setStudents(actualArrayOfStudents);
            } else {
                setStudents([]);
            }

            setLoading(false);

        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Failed to fetch students. Please try again later.');
            setLoading(false);
        }
    };;

     const handleToggleStatus = async (userId, currentStatus) => {
            try {
                // Tell the backend to flip the status (if true, make it false)
                await API.put(`/admin/users/${userId}/status`, {
                    is_active: !currentStatus
                });

                // Instantly update the React UI without refreshing the page!
                setStudents(students.map(student =>
                    student.id === userId ? { ...student, is_active: !currentStatus } : student
                ));
            } catch (err) {
                console.error(err);
                alert("Failed to update status.");
            }
        };

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans">
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Students</h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1 rounded-full">
                    Total Students: {students.length}
                </span>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            )}

            {error && (
                <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                    <table className="min-w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Institutional ID</th>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Email</th>

                                <th className="px-6 py-4 font-semibold">Account Status</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                                {/* 2. FIXED: Header matches the 3 columns below */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                        No students found in the database.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                            {student.institutional_id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.email}
                                        </td>


                                        {/* New Status Badge Column */}
                                        <td className="px-6 py-4">
                                            {student.is_active ? (
                                                <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">Active</span>
                                            ) : (
                                                <span className="text-xs font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full">Deactivated</span>
                                            )}
                                        </td>

                                        {/* New Actions Column */}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(student.id, student.is_active)}
                                                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${student.is_active
                                                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                                                    }`}
                                            >
                                                {student.is_active ? 'Deactivate' : 'Reactivate'}
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;