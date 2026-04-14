import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const TodayClassesWidget = () => {
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    useEffect(() => {
        const fetchTodayTimetable = async () => {
            try {
                const response = await API.get('/student/timetable');
                if (response.data.success) {
                    // Extract ONLY today's classes from the full schedule payload
                    setTodaySchedule(response.data.schedule[today] || []);
                }
            } catch (error) {
                console.error("Error fetching today's timetable:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTodayTimetable();
    }, [today]);

    // Same period headers as the main table
    const periodLabels = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">Today's Class <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">NEW!</span></h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                            <th className="p-3 border-r border-gray-200 w-32 font-semibold">Day/ Lecture</th>
                            {periodLabels.map((label, idx) => (
                                <th key={idx} className="p-3 border-r border-gray-200 font-semibold min-w-30">{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-3 font-bold border-r border-gray-200 text-gray-700 bg-gray-50">
                                {today}
                            </td>
                            {periodLabels.map((_, index) => {
                                const lecture = todaySchedule[index];

                                return (
                                    <td key={index} className="p-3 border-r border-gray-200 align-top">
                                        {lecture ? (
                                            <div className="flex flex-col items-start text-left space-y-0.5">
                                                <span className="font-bold text-gray-800 text-xs">{lecture.teacher_name}</span>
                                                <span className="text-xs text-gray-600">{lecture.subject_name}</span>
                                                <span className="text-xs text-gray-500">J-14</span> {/* Room Placeholder */}
                                            </div>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
                
                {isLoading && (
                    <div className="p-6 text-center text-gray-400">Loading today's schedule...</div>
                )}
                {!isLoading && todaySchedule.length === 0 && (
                    <div className="p-6 text-center text-gray-500 italic">No classes scheduled for today. Enjoy your day off!</div>
                )}
            </div>
        </div> 
    );
};

export default TodayClassesWidget;