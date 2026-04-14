import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageAttendance = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState('STUDENTS'); // 'STUDENTS' or 'FACULTY'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Student Tab State
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [studentLogs, setStudentLogs] = useState([]);
    
    // Faculty Tab State
    const [facultyLogs, setFacultyLogs] = useState([]);
    
    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- 1. Fetch Classes on Mount ---
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // Using your existing admin route for getting classes
                const response = await API.get('/admin/classes');
                if (response.data.classes) {
                    setClasses(response.data.classes);
                }
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };
        fetchClasses();
    }, []);

    // --- 2. Fetch Data when Tab, Date, or Class Changes ---
    useEffect(() => {
        if (activeTab === 'STUDENTS') {
            fetchStudentLogs();
        } else {
            fetchFacultyLogs();
        }
    }, [activeTab, selectedDate, selectedClass]);

    const fetchStudentLogs = async () => {
        setIsLoading(true);
        try {
            const response = await API.get('/admin/attendance/students', {
                params: { date: selectedDate, classId: selectedClass || undefined }
            });
            if (response.data.success) {
                setStudentLogs(response.data.logs);
            }
        } catch (error) {
            console.error("Error fetching student logs:", error);
            setStudentLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFacultyLogs = async () => {
        setIsLoading(true);
        try {
            const response = await API.get('/admin/attendance/faculty', {
                params: { date: selectedDate }
            });
            if (response.data.success) {
                setFacultyLogs(response.data.attendance);
            }
        } catch (error) {
            console.error("Error fetching faculty logs:", error);
            setFacultyLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 3. Faculty Attendance Logic ---
    const updateFacultyStatus = (teacherId, status) => {
        setFacultyLogs(prevLogs => 
            prevLogs.map(teacher => 
                teacher.teacher_id === teacherId ? { ...teacher, status } : teacher
            )
        );
    };

    const saveFacultyAttendance = async () => {
        setIsSaving(true);
        const payloadToSave = facultyLogs.filter(t => t.status !== 'Not Marked');

        if (payloadToSave.length === 0) {
            alert("Please mark at least one staff member before saving.");
            setIsSaving(false);
            return;
        }

        try {
            const response = await API.post('/admin/attendance/faculty', {
                date: selectedDate,
                attendanceData: payloadToSave
            });

            if (response.data.success) {
                alert("Faculty attendance saved successfully!");
                fetchFacultyLogs(); // Refresh
            }
        } catch (error) {
            console.error("Error saving faculty attendance:", error);
            alert("Failed to save faculty attendance.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto font-sans text-gray-800 space-y-6">
            
            {/* Header & Tabs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Master Attendance</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitor student logs and manage faculty attendance.</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('STUDENTS')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'STUDENTS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Student Logs
                    </button>
                    <button 
                        onClick={() => setActiveTab('FACULTY')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'FACULTY' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Faculty Attendance
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                
                {/* Filters Toolbar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Select Date</label>
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {activeTab === 'STUDENTS' && (
                        <div className="flex flex-col gap-1 w-48">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Filter by Class</label>
                            <select 
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">All Classes</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64 text-gray-400 font-medium">Loading records...</div>
                    ) : activeTab === 'STUDENTS' ? (
                        /* --- STUDENT LOGS TABLE --- */
                        studentLogs.length === 0 ? (
                            <div className="flex justify-center items-center h-64 text-gray-400 bg-gray-50 m-4 rounded border border-dashed">No student attendance recorded for this date.</div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-white border-b sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4">Student Name</th>
                                        <th className="px-6 py-4">Class</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Marked By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentLogs.map(log => (
                                        <tr key={log.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{log.student_name}</div>
                                                <div className="font-mono text-xs text-gray-500">{log.institutional_id}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{log.class_name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    log.status === 'Present' ? 'bg-green-100 text-green-700' : 
                                                    log.status === 'Late' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs font-medium">{log.marked_by_name || 'System'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    ) : (
                        /* --- FACULTY ATTENDANCE TABLE --- */
                        facultyLogs.length === 0 ? (
                            <div className="flex justify-center items-center h-64 text-gray-400 bg-gray-50 m-4 rounded border border-dashed">No faculty members found.</div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-white border-b sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4">Faculty Member</th>
                                        <th className="px-6 py-4 text-center">Daily Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facultyLogs.map(faculty => (
                                        <tr key={faculty.teacher_id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">{faculty.name}</div>
                                                <div className="font-mono text-xs text-gray-500 mt-1">{faculty.institutional_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => updateFacultyStatus(faculty.teacher_id, 'Present')}
                                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                                            faculty.status === 'Present' ? 'bg-green-100 text-green-700 border-green-300 ring-2 ring-green-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button 
                                                        onClick={() => updateFacultyStatus(faculty.teacher_id, 'Absent')}
                                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                                            faculty.status === 'Absent' ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        Absent
                                                    </button>
                                                    <button 
                                                        onClick={() => updateFacultyStatus(faculty.teacher_id, 'Leave')}
                                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                                            faculty.status === 'Leave' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 ring-2 ring-yellow-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        Leave
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>

                {/* Footer Save Button (Only for Faculty) */}
                {activeTab === 'FACULTY' && facultyLogs.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                        <button 
                            onClick={saveFacultyAttendance}
                            disabled={isSaving}
                            className={`px-6 py-2.5 rounded-lg font-bold text-white transition shadow-sm ${
                                isSaving ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-md hover:-translate-y-0.5'
                            }`}
                        >
                            {isSaving ? 'Saving Updates...' : 'Save Faculty Records'}
                        </button>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default ManageAttendance;