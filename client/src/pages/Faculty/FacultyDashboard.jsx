import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

const FacultyDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [myClasses, setMyClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyClasses = async () => {
            try {
                // Fetch the classes from our new secure route
                const response = await API.get('/faculty/my-classes');
                setMyClasses(Array.isArray(response.data.classes) ? response.data.classes : []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load your classes.');
                setLoading(false);
            }
        };

        fetchMyClasses();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-gray-200 pb-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Faculty Workspace</h2>
                    <p className="text-gray-500 mt-1">Welcome back, Professor {user?.name}</p>
                </div>
                <button 
                    onClick={logout} 
                    className="mt-4 sm:mt-0 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>

            {/* Content Area */}
            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">My Assigned Classes</h3>
                
                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                    </div>
                )}

                {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

                {!loading && !error && myClasses.length === 0 ? (
                    <div className="p-10 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                        <p className="text-gray-500 text-lg">You have not been assigned to any classes yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Contact your Administrator for assignments.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myClasses.map((cls) => (
                            <div key={cls.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-t-4 border-t-green-500">
                                <h4 className="text-xl font-bold text-gray-800 mb-2">{cls.name}</h4>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    <span>Room: {cls.room_number || 'TBA'}</span>
                                </div>
                                <button className="w-full py-2 bg-green-50 text-green-700 font-medium rounded border border-green-200 hover:bg-green-100 transition">
                                    View Students
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;