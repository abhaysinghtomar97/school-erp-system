import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const FacultyAttendance = () => {
    // --- State ---
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch the teacher's classes on load
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await API.get('/faculty/my-classes');
                if (response.data.success) {
                    setClasses(response.data.classes);
                    // Auto-select the first class if available
                    if (response.data.classes.length > 0) {
                        setSelectedClassId(response.data.classes[0].id);
                    }
                }
            } catch (error) {
                console.error("Error fetching classes", error);
            }
        };
        fetchClasses();
    }, []);

    // 2. Fetch attendance whenever the class or date changes
    useEffect(() => {
        if (selectedClassId && attendanceDate) {
            fetchAttendance();
        }
    }, [selectedClassId, attendanceDate]);

    const fetchAttendance = async () => {
        setIsLoading(true);
        try {
            const response = await API.get(`/faculty/class/${selectedClassId}/attendance/${attendanceDate}`);
            if (response.data.success) {
                setAttendanceData(response.data.attendance);
            }
        } catch (error) {
            console.error("Error fetching attendance records", error);
            setAttendanceData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Update local state when toggling
    const updateStudentStatus = (studentId, status) => {
        setAttendanceData(prevData => 
            prevData.map(student => 
                student.student_id === studentId ? { ...student, status } : student
            )
        );
    };

    // 4. Save to database
    const handleSave = async () => {
        setIsSaving(true);
        const payloadToSave = attendanceData.filter(s => s.status !== 'Not Marked');

        if (payloadToSave.length === 0) {
            alert("Please mark at least one student before saving.");
            setIsSaving(false);
            return;
        }

        try {
            const response = await API.post('/faculty/attendance', {
                classId: selectedClassId,
                date: attendanceDate,
                attendanceData: payloadToSave
            });

            if (response.data.success) {
                alert("Attendance records updated successfully!");
                fetchAttendance(); // Refresh to ensure sync
            }
        } catch (error) {
            console.error("Error saving attendance", error);
            alert("Failed to save attendance.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto font-sans text-gray-800 space-y-6">
            
            {/* Header Area */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Attendance Register</h2>
                    <p className="text-gray-500 text-sm mt-1">View and modify daily attendance records.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Select Class</label>
                        <select 
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50"
                        >
                            <option value="" disabled>Select a class...</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Select Date</label>
                        <input 
                            type="date" 
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50"
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Table Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                
                {/* Table Stats Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                        Total Students: <span className="font-bold text-gray-800">{attendanceData.length}</span>
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                        Marked: <span className="font-bold text-purple-600">{attendanceData.filter(s => s.status !== 'Not Marked').length}</span>
                    </span>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64 text-gray-400">Loading roster...</div>
                    ) : attendanceData.length === 0 ? (
                        <div className="flex justify-center items-center h-64 text-gray-400">
                            {selectedClassId ? "No students enrolled in this class." : "Please select a class."}
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-white border-b sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Student Name</th>
                                    <th className="px-6 py-4 font-semibold text-center">Attendance Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((student) => (
                                    <tr key={student.student_id} className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-800 text-base">{student.name}</div>
                                            <div className="font-mono text-xs text-gray-500 mt-1">{student.institutional_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => updateStudentStatus(student.student_id, 'Present')}
                                                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border ${
                                                        student.status === 'Present' 
                                                        ? 'bg-green-100 text-green-700 border-green-300 shadow-sm ring-2 ring-green-100' 
                                                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    Present
                                                </button>
                                                <button 
                                                    onClick={() => updateStudentStatus(student.student_id, 'Late')}
                                                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border ${
                                                        student.status === 'Late' 
                                                        ? 'bg-yellow-100 text-yellow-700 border-yellow-300 shadow-sm ring-2 ring-yellow-100' 
                                                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    Late
                                                </button>
                                                <button 
                                                    onClick={() => updateStudentStatus(student.student_id, 'Absent')}
                                                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border ${
                                                        student.status === 'Absent' 
                                                        ? 'bg-red-100 text-red-700 border-red-300 shadow-sm ring-2 ring-red-100' 
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

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-white flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || attendanceData.length === 0}
                        className={`px-8 py-3 rounded-lg font-bold text-white transition shadow-md ${
                            isSaving 
                            ? 'bg-purple-400 cursor-not-allowed' 
                            : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                    >
                        {isSaving ? 'Saving Updates...' : 'Save Attendance Records'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FacultyAttendance;