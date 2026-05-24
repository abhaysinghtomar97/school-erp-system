import React, { useState, useEffect } from 'react';
import API from '../../services/api';

// Helper function to calculate the dynamic academic year on the frontend
const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    if (currentMonth >= 4) {
        return `${currentYear}-${currentYear + 1}`;
    } else {
        return `${currentYear - 1}-${currentYear}`;
    }
};

const ManageEnrollments = () => {
    const [classes, setClasses] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');

    const [roster, setRoster] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');

    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [processingAction, setProcessingAction] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // 1. Fetch Classes and Students when page loads
    const fetchInitialData = async () => {
        try {
            const [classesRes, studentsRes] = await Promise.all([
                API.get('/admin/classes'),
                API.get('/admin/students')
            ]);
            setClasses(Array.isArray(classesRes.data.classes) ? classesRes.data.classes : []);

            const studentArray = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.Students || studentsRes.data.students || [];
            setAllStudents(studentArray);

            setLoading(false);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load initial data.' });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // 2. Fetch the roster whenever the Manager selects a different class
    useEffect(() => {
        if (!selectedClass) {
            setRoster([]);
            return;
        }
        fetchRoster(selectedClass);
    }, [selectedClass]);

    const fetchRoster = async (classId) => {
        try {
            const response = await API.get(`/admin/classes/${classId}/roster`);
            setRoster(response.data.roster || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load class roster.' });
        }
    };

    // 3. Handle the actual enrollment submission
    const handleEnroll = async (e) => {
        e.preventDefault();
        if (!selectedClass || !selectedStudent) return;

        setEnrolling(true);
        setMessage({ type: '', text: '' });

        try {
            await API.post('/admin/enrollments', {
                class_id: selectedClass,
                student_id: selectedStudent
            });
            setMessage({ type: 'success', text: 'Student added successfully!' });
            setSelectedStudent(''); 
            fetchRoster(selectedClass);
            fetchInitialData(); // Refresh students to update the dropdown filter
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to enroll student.' });
        } finally {
            setEnrolling(false);
        }
    };

    // 4. Handle Individual Student Archiving (Promotion/Transfer)
    const handleArchiveStudent = async (studentId) => {
        if (!window.confirm("Are you sure you want to archive this student's enrollment?")) return;
        
        setProcessingAction(true);
        setMessage({ type: '', text: '' });
        
        try {
            const academic_year = getCurrentAcademicYear();
            // Ensure this PUT route matches your Express backend router for archiveStudentEnrollment
            await API.put('/admin/enrollments/archive', { 
                student_id: studentId, 
                academic_year 
            });
            setMessage({ type: 'success', text: 'Student archived successfully.' });
            fetchRoster(selectedClass);
            fetchInitialData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to archive student.' });
        } finally {
            setProcessingAction(false);
        }
    };

    // 5. Handle Bulk Class Archiving (End of Year)
    const handleBulkArchive = async () => {
        if (!window.confirm("WARNING: This will archive all active enrollments for this class. Proceed with End of Year promotion?")) return;
        
        setProcessingAction(true);
        setMessage({ type: '', text: '' });

        try {
            const academic_year = getCurrentAcademicYear();
            // Ensure this PUT route matches your Express backend router for bulkArchiveClass
            await API.put('/admin/enrollments/classes/archive', { 
                class_id: selectedClass, 
                academic_year 
            });
            setMessage({ type: 'success', text: 'Class archived successfully! All students removed from active roster.' });
            fetchRoster(selectedClass);
            fetchInitialData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to archive class.' });
        } finally {
            setProcessingAction(false);
        }
    };

    const availableStudents = allStudents.filter(student => !student.is_enrolled);

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans">
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-4 mb-6">
                Manage Class Enrollments
            </h2>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT SIDE: Selection & Enrollment Form */}
                    <div className="lg:w-1/3 flex flex-col gap-6">

                        {/* Step 1: Pick a Class */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">1. Select a Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => { setSelectedClass(e.target.value); setMessage({ type: '', text: '' }); }}
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                            >
                                <option value="">-- Choose Class --</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Step 2: Add Student */}
                        {selectedClass && (
                            <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100">
                                <h3 className="text-lg font-semibold text-indigo-900 mb-4">2. Add Student to Class</h3>

                                {message.text && (
                                    <div className={`p-3 mb-4 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleEnroll} className="flex flex-col gap-4">
                                    <select
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="">-- Select Student --</option>
                                        {availableStudents.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.name} ({student.institutional_id})
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="submit"
                                        disabled={enrolling || !selectedStudent || processingAction}
                                        className="w-full p-3 text-white font-semibold rounded transition bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                                    >
                                        {enrolling ? 'Enrolling...' : 'Enroll Student'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: The Live Roster Table */}
                    <div className="lg:w-2/3">
                        {!selectedClass ? (
                            <div className="h-full min-h-75 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
                                Select a class on the left to view its roster.
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                                    <h3 className="text-white font-bold text-lg">Current Roster</h3>
                                    <div className="flex gap-4 items-center">
                                        <span className="bg-white text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                                            {roster.length} Enrolled
                                        </span>
                                        {roster.length > 0 && (
                                            <button 
                                                onClick={handleBulkArchive}
                                                disabled={processingAction}
                                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded transition disabled:opacity-50"
                                            >
                                                Archive Entire Class
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm text-gray-600">
                                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">Student ID</th>
                                                <th className="px-6 py-4 font-semibold">Name</th>
                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {roster.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">
                                                        No students are enrolled in this class yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                roster.map((student) => (
                                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">{student.institutional_id}</td>
                                                        <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button 
                                                                onClick={() => handleArchiveStudent(student.id)}
                                                                disabled={processingAction}
                                                                className="text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                                                            >
                                                                Archive
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default ManageEnrollments;