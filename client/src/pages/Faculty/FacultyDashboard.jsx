import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api'; 

const FacultyDashboard = () => {
    const { user } = useContext(AuthContext);

    // --- State ---
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Roster Modal State
    const [roster, setRoster] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null); // Now stores an object: { id, name }
    const [isRosterLoading, setIsRosterLoading] = useState(false);
    const [showRosterModal, setShowRosterModal] = useState(false);

    // --- NEW: Attendance Modal State ---
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]); // Defaults to YYYY-MM-DD
    const [isSavingAttendance, setIsSavingAttendance] = useState(false);

    // --- Fetch Data ---
    useEffect(() => {
        fetchMySchedule();
    }, []);

    const fetchMySchedule = async () => {
        try {
            const response = await API.get('/faculty/schedule');
            if (response.data.success) {
                setSchedule(response.data.schedule);
            }
        } catch (error) {
            console.error("Error loading schedule", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Roster Logic ---
    const handleViewRoster = async (classId, className) => {
        setSelectedClass({ id: classId, name: className });
        setShowRosterModal(true);
        setIsRosterLoading(true);
        try {
            const response = await API.get(`/faculty/class/${classId}/roster`);
            if (response.data.success) {
                setRoster(response.data.students);
            }
        } catch (error) {
            console.error("Error fetching roster", error);
            setRoster([]);
        } finally {
            setIsRosterLoading(false);
        }
    };

    // --- NEW: Attendance Logic ---
    const handleOpenAttendance = (classId, className) => {
        setSelectedClass({ id: classId, name: className });
        setShowAttendanceModal(true);
        fetchAttendanceForDate(classId, attendanceDate);
    };

    const fetchAttendanceForDate = async (classId, date) => {
        setIsRosterLoading(true);
        try {
            const response = await API.get(`/faculty/class/${classId}/attendance/${date}`);
            if (response.data.success) {
                // We set the fetched attendance data into state
                setAttendanceData(response.data.attendance);
            }
        } catch (error) {
            console.error("Error fetching attendance", error);
        } finally {
            setIsRosterLoading(false);
        }
    };

    // Re-fetch if the teacher changes the date in the modal
    useEffect(() => {
        if (showAttendanceModal && selectedClass?.id) {
            fetchAttendanceForDate(selectedClass.id, attendanceDate);
        }
    }, [attendanceDate]);

    // Update a specific student's status in local state before saving
    const updateStudentStatus = (studentId, status) => {
        setAttendanceData(prevData => 
            prevData.map(student => 
                student.student_id === studentId ? { ...student, status } : student
            )
        );
    };

    const saveAttendance = async () => {
        setIsSavingAttendance(true);
        
        // Filter out students who haven't been marked yet
        const payloadToSave = attendanceData.filter(s => s.status !== 'Not Marked');

        if (payloadToSave.length === 0) {
            alert("Please mark at least one student before saving.");
            setIsSavingAttendance(false);
            return;
        }

        try {
            const response = await API.post('/faculty/attendance', {
                classId: selectedClass.id,
                date: attendanceDate,
                attendanceData: payloadToSave
            });

            if (response.data.success) {
                alert("Attendance saved successfully!");
                setShowAttendanceModal(false);
            }
        } catch (error) {
            console.error("Error saving attendance", error);
            alert("Failed to save attendance.");
        } finally {
            setIsSavingAttendance(false);
        }
    };

    // --- Format Helper ---
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5); 
    };

    return (
        <div className="max-w-6xl mx-auto font-sans text-gray-800 space-y-6">
            
            {/* 1. WELCOME BANNER (unchanged) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10"></div>
                <div className="w-20 h-20 rounded-full bg-purple-600 shrink-0 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h2>
                    <p className="text-gray-500">Faculty Portal</p>
                </div>
            </div>

            {/* 2. MY SCHEDULE SECTION */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-600">
                            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                        </svg>
                        Weekly Timetable
                    </h3>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading your schedule...</div>
                ) : Object.keys(schedule).length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                        No classes assigned to you yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(schedule).map(([day, classes]) => (
                            <div key={day} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-gray-700">
                                    {day}
                                </div>
                                <div className="p-4 space-y-3">
                                    {classes.map((cls) => (
                                        <div key={cls.timetable_id} className="bg-white p-4 rounded shadow-sm border border-gray-100 flex flex-col gap-3 relative border-l-4 border-l-purple-500">
                                            <div className="flex justify-between items-start">
                                                <span className="font-semibold text-gray-800 text-lg">{cls.subject_name}</span>
                                                <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                                    {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Class: <span className="font-medium text-gray-800">{cls.class_name}</span>
                                            </div>
                                            
                                            {/* ACTION BUTTONS */}
                                            <div className="flex gap-2 mt-1 pt-3 border-t border-gray-100">
                                                <button 
                                                    onClick={() => handleViewRoster(cls.class_id, cls.class_name)}
                                                    className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded transition font-medium text-center"
                                                >
                                                    View Roster
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenAttendance(cls.class_id, cls.class_name)}
                                                    className="flex-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 rounded transition font-medium text-center"
                                                >
                                                    Take Attendance
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. ROSTER MODAL (Simplified for brevity, exactly the same as your previous one just renamed the state to showRosterModal) */}
            {showRosterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    {/* ... Your exact existing Roster Modal code goes here ... */}
                    {/* Just remember to change setShowModal(false) to setShowRosterModal(false) on your close buttons */}
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                Class Roster: <span className="text-purple-600">{selectedClass?.name}</span>
                            </h3>
                            <button onClick={() => setShowRosterModal(false)} className="text-gray-400 hover:text-red-500 transition text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {isRosterLoading ? (
                                <div className="text-center py-8 text-gray-500">Fetching students...</div>
                            ) : roster.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed">No students enrolled.</div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                        <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th></tr>
                                    </thead>
                                    <tbody>
                                        {roster.map((student) => (
                                            <tr key={student.student_id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-mono text-gray-600">{student.institutional_id}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{student.name}</td>
                                                <td className="px-4 py-3 text-gray-500">{student.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                            <button onClick={() => setShowRosterModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition font-medium">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. NEW: ATTENDANCE MODAL */}
            {showAttendanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
                        
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    Attendance: <span className="text-purple-600">{selectedClass?.name}</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Mark students for the selected date.</p>
                            </div>
                            
                            {/* Date Picker */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Date:</label>
                                <input 
                                    type="date" 
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        
                        {/* Body - Student List with Toggles */}
                        <div className="p-0 overflow-y-auto flex-1 bg-white">
                            {isRosterLoading ? (
                                <div className="text-center py-12 text-gray-500">Loading attendance data...</div>
                            ) : attendanceData.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No students enrolled in this class.</div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceData.map((student) => (
                                            <tr key={student.student_id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800">{student.name}</div>
                                                    <div className="font-mono text-xs text-gray-500 mt-0.5">{student.institutional_id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {/* Custom Radio Button Toggles */}
                                                    <div className="flex justify-center gap-1 sm:gap-2">
                                                        <button 
                                                            onClick={() => updateStudentStatus(student.student_id, 'Present')}
                                                            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                                                student.status === 'Present' 
                                                                ? 'bg-green-100 text-green-700 border-green-300 shadow-sm' 
                                                                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            Present
                                                        </button>
                                                        <button 
                                                            onClick={() => updateStudentStatus(student.student_id, 'Late')}
                                                            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                                                student.status === 'Late' 
                                                                ? 'bg-yellow-100 text-yellow-700 border-yellow-300 shadow-sm' 
                                                                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            Late
                                                        </button>
                                                        <button 
                                                            onClick={() => updateStudentStatus(student.student_id, 'Absent')}
                                                            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                                                student.status === 'Absent' 
                                                                ? 'bg-red-100 text-red-700 border-red-300 shadow-sm' 
                                                                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            Absent
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        
                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-medium">
                                {attendanceData.filter(s => s.status !== 'Not Marked').length} / {attendanceData.length} Marked
                            </span>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowAttendanceModal(false)}
                                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={saveAttendance}
                                    disabled={isSavingAttendance || attendanceData.length === 0}
                                    className={`px-6 py-2 rounded font-medium text-white transition shadow-sm ${
                                        isSavingAttendance 
                                        ? 'bg-purple-400 cursor-not-allowed' 
                                        : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                                >
                                    {isSavingAttendance ? 'Saving...' : 'Save Attendance'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
            
        </div>
    );
};

export default FacultyDashboard;