import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const StudentTimetable = () => {
    const [schedule, setSchedule] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Get current day string (e.g., "Tuesday") to highlight the row
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    // Standard periods based on your screenshot
    const periods = [
        { label: '1st', time: '09.25-10.15' },
        { label: '2nd', time: '10.15-11.05' },
        { label: '3rd', time: '11.15-12.05' },
        { label: '4th', time: '12.05-12.55' },
        { label: '5th', time: '01.45-02.30' },
        { label: '6th', time: '02.30-03.15' },
        { label: '7th', time: '03.25-04.10' },
        { label: '8th', time: '04.10-04.55' }
    ];

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const response = await API.get('/student/timetable');
                if (response.data.success) {
                    setSchedule(response.data.schedule);
                }
            } catch (error) {
                console.error("Error fetching timetable:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Timetable...</div>;

    return (
        <div className="max-w-7xl mx-auto font-sans text-gray-800 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">My TimeTable</h2>
                <p className="text-gray-500 text-sm mt-1">Weekly academic schedule</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm text-center border-collapse">
                    <thead>
                        <tr className="bg-teal-600 text-white">
                            <th className="p-3 border border-teal-700 w-32">Day/ Lecture</th>
                            {periods.map((p, idx) => (
                                <th key={idx} className="p-2 border border-teal-700 min-w-35 bg-teal-50 text-teal-900">
                                    <div className="font-bold">{p.label}</div>
                                    <div className="text-xs font-normal opacity-80">{p.time}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {daysOfWeek.map(day => {
                            const isToday = day === today;
                            const dayClasses = schedule[day] || [];

                            return (
                                <tr 
                                    key={day} 
                                    className={`transition-colors ${
                                        isToday 
                                        ? 'bg-red-500 text-white hover:bg-red-600' // Matches your screenshot's red highlight
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <td className={`p-3 font-bold border ${isToday ? 'border-red-600' : 'border-gray-200 bg-gray-50'}`}>
                                        {day}
                                    </td>
                                    
                                    {/* Map through the 8 periods and find matching classes */}
                                    {periods.map((_, index) => {
                                        // Assuming your backend sorts them by time, we map them by index for now.
                                        // If your backend returns specific period_ids, match by ID instead.
                                        const lecture = dayClasses[index]; 

                                        return (
                                            <td key={index} className={`p-2 border ${isToday ? 'border-red-400' : 'border-gray-200'}`}>
                                                {lecture ? (
                                                    <div className="flex flex-col items-center justify-center space-y-0.5 leading-tight">
                                                        <span className="font-semibold">[ {lecture.teacher_name} ]</span>
                                                        <span className="text-xs">[ {lecture.subject_name} ]</span>
                                                        {/* If you add room numbers to DB later, put them here */}
                                                        <span className="text-xs opacity-90">[ J-14 ]</span> 
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentTimetable;