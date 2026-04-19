import React, { useContext, useEffect, useState } from 'react';
import TodayClassesWidget from './TodaysClassesWidget';
import AttendanceSummaryWidget from './AttendanceSummaryWidget';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const StudentDashboard = () => {

    // fetch student data from /api/student/data api 
    const [studentData, setStudentData] = useState({
        name: "",
        email: "",
        institutional_id: "",
        mobile_number: ""
    });
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const user = await API.get('/student/data');


                if (user.data.success) {

                    setStudentData(user.data.data);
                }

            } catch (error) {
                console.error("Error fetching student data:", error);
            }
        };
        fetchStudentData();
    }, []);
    useEffect(() => {
        console.log(studentData)
    }, [studentData])




    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">

            {/* --- Welcome Banner --- */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                {/* Subtle side accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>

                <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* Profile Avatar */}
                    <div className="shrink-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-full flex items-center justify-center text-4xl font-black text-blue-600 shadow-sm">
                        {studentData.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 w-full">

                        {/* Header Row: Name & Status */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h1 className="text-3xl font-black text-gray-800 tracking-tight">

                            </h1>

                            {/* Live Status Badge */}
                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Active Profile
                            </div>
                        </div>

                        {/* Metadata Grid (ID, Class, Email, Mobile) */}
                        <div className="flex flex-wrap gap-y-3 gap-x-4 mt-5">

                            {/* Institutional ID */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                                <span>ID: <strong className="text-gray-900">   {studentData.institutional_id}       </strong></span>
                            </div>

                            {/* Class */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                <span>class: <strong className="text-gray-900">{studentData.class_name}</strong></span>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                <span className="font-medium text-gray-800"> {studentData.email}</span>
                            </div>

                            {/* Mobile Number */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                <span className="font-medium text-gray-800">{studentData.mobile_number ? studentData.mobile_number : "N/A"}</span>
                            </div>

                        </div>

                        {/* Institution Mission Card */}
                        <div className="mt-6 bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 flex items-start gap-3">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Institution Mission</h4>
                                <p className="text-sm text-blue-900/80 font-medium leading-relaxed">
                                    To provide an effective environment for teaching-learning and innovation.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- Main Widget Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Wider for the Timetable) */}
                <div className="lg:col-span-2 space-y-6">
                    <TodayClassesWidget />
                </div>

                {/* Right Column (For smaller widgets) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[340px]">
                        <AttendanceSummaryWidget />
                    </div>

                    {/* Placeholder for Upcoming Deadlines */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-48 flex items-center justify-center text-gray-400">
                        Upcoming Assignments Widget (Coming Soon)
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;