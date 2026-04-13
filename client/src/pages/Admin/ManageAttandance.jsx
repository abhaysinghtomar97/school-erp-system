import React, { useState } from 'react';

const ManageAttendance = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState('STUDENTS'); // 'STUDENTS' or 'FACULTY'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState('');

    // Dummy data for visual scaffolding
    const dummyStudentData = [
        { id: '1', name: 'Aarav Patel', status: 'Present', markedBy: 'Aman (English)' },
        { id: '2', name: 'Priya Sharma', status: 'Absent', markedBy: 'Aman (English)' },
    ];

    const dummyFacultyData = [
        { id: '1', name: 'Aman', subject: 'English Literature', status: 'Present' },
        { id: '2', name: 'Sarah Khan', subject: 'Physics', status: 'Not Marked' },
    ];

    return (
        <div className="max-w-6xl mx-auto font-sans text-gray-800 space-y-6">
            
            {/* 1. Header & Tabs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Master Attendance</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitor student logs and manage faculty attendance.</p>
                </div>

                {/* Tab Toggles */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('STUDENTS')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'STUDENTS' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Student Logs
                    </button>
                    <button 
                        onClick={() => setActiveTab('FACULTY')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'FACULTY' 
                            ? 'bg-white text-purple-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Faculty Attendance
                    </button>
                </div>
            </div>

            {/* 2. Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                
                {/* --- FILTERS TOOLBAR --- */}
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
                                <option value="">Select Class...</option>
                                <option value="9th">Class 9th</option>
                                <option value="10th">Class 10th</option>
                            </select>
                        </div>
                    )}

                    <div className="ml-auto">
                        <button className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm ${activeTab === 'STUDENTS' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
                            Fetch Records
                        </button>
                    </div>
                </div>

                {/* --- TAB CONTENT: STUDENTS --- */}
                {activeTab === 'STUDENTS' && (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-white border-b">
                            <tr>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Submitted By</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyStudentData.map(student => (
                                <tr key={student.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">{student.markedBy}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* --- TAB CONTENT: FACULTY --- */}
                {activeTab === 'FACULTY' && (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-white border-b">
                            <tr>
                                <th className="px-6 py-4">Faculty Member</th>
                                <th className="px-6 py-4">Department / Subj</th>
                                <th className="px-6 py-4">Mark Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyFacultyData.map(faculty => (
                                <tr key={faculty.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-800">{faculty.name}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{faculty.subject}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 rounded text-xs font-bold bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 border border-gray-200 transition-colors">
                                                Present
                                            </button>
                                            <button className="px-3 py-1 rounded text-xs font-bold bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-600 border border-gray-200 transition-colors">
                                                Absent
                                            </button>
                                            <button className="px-3 py-1 rounded text-xs font-bold bg-gray-100 hover:bg-yellow-100 hover:text-yellow-700 text-gray-600 border border-gray-200 transition-colors">
                                                Leave
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
        </div>
    );
};

export default ManageAttendance;