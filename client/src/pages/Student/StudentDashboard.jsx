import React from 'react';
import TodayClassesWidget from './TodaysClassesWidget'; // The widget we built!
import AttendanceSummaryWidget from './AttendanceSummaryWidget';

const StudentDashboard = () => {
    // We can pull the student's name from context or local storage if you have it!
    const studentName = "Abhay Singh Tomar"; 

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Welcome Banner */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back, {studentName}!</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Mission: To provide an effective environment for teaching-learning and innovation...
                    </p>
                </div>
            </div>

            {/* Main Widget Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Wider for the Timetable) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* The Widget from our previous step! */}
                    <TodayClassesWidget />
                </div>

                {/* Right Column (For future smaller widgets) */}
                <div className="space-y-6">
                    {/* Placeholder for an upcoming Attendance Summary Widget */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100  flex items-center justify-center text-gray-400">
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