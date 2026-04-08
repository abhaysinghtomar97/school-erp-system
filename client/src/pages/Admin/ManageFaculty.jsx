import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageFaculty = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFaculty();
    }, []); 

    const fetchFaculty = async () => {
        try {
            const response = await API.get('/admin/faculty'); 
            
            // Extract the array exactly like we did for students
            const facultyArray = response.data.faculty;
            
            setFaculty(Array.isArray(facultyArray) ? facultyArray : []);
            setLoading(false);
            
        } catch (err) {
            console.error('Error fetching faculty:', err);
            setError('Failed to fetch faculty. Please try again later.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans">
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Faculty</h2>
                {/* Notice the color change to purple to distinguish from students! */}
                <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-1 rounded-full">
                    Total Faculty: {faculty.length}
                </span>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
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
                                <th className="px-6 py-4 font-semibold">Faculty ID</th>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {faculty.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                        No faculty members found in the database.
                                    </td>
                                </tr>
                            ) : (
                                faculty.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-purple-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                            {teacher.institutional_id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {teacher.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {teacher.email}
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

export default ManageFaculty;