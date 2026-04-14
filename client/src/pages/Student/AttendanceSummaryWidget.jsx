import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // Adjust path if needed

const AttendanceSummaryWidget = () => {
    const [summary, setSummary] = useState({ total: 0, Present: 0, Absent: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                // Reusing the exact same endpoint from the detailed page!
                const response = await API.get('/student/attendance');
                if (response.data.success) {
                    setSummary(prev => ({ ...prev, ...response.data.summary }));
                }
            } catch (error) {
                console.error("Error fetching attendance summary:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    // Calculate percentage safely
    const percentage = summary.total > 0 
        ? Math.round((summary.Present / summary.total) * 100) 
        : 0;

    // Determine color based on health
    const healthColor = percentage >= 85 ? 'text-green-500' : percentage >= 75 ? 'text-orange-500' : 'text-red-500';
    const bgColor = percentage >= 85 ? 'bg-green-500' : percentage >= 75 ? 'bg-orange-500' : 'bg-red-500';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 text-lg">Attendance Health</h3>
                <span className="text-xs text-gray-400 font-medium">Current Session</span>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-6">Loading data...</div>
            ) : (
                <div className="p-6 flex flex-col items-center justify-center flex-1">
                    
                    {/* Visual Percentage Display */}
                    <div className="relative flex items-center justify-center mb-4">
                        {/* Background Circle */}
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                            {/* Foreground Circle (Progress) */}
                            <circle 
                                cx="48" 
                                cy="48" 
                                r="40" 
                                stroke="currentColor" 
                                strokeWidth="8" 
                                fill="transparent" 
                                strokeDasharray={251.2} 
                                strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                                className={`${healthColor} transition-all duration-1000 ease-out`} 
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className={`text-2xl font-black ${healthColor}`}>{percentage}%</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full mt-2">
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="text-xs font-bold text-green-700 uppercase mb-1">Present</div>
                            <div className="text-xl font-black text-green-700">{summary.Present || 0}</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="text-xs font-bold text-red-700 uppercase mb-1">Absent</div>
                            <div className="text-xl font-black text-red-700">{summary.Absent || 0}</div>
                        </div>
                    </div>
                    
                    <div className="w-full text-center mt-4">
                         <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Total Working Days: {summary.total}
                        </span>
                    </div>

                </div>
            )}
        </div>
    );
};

export default AttendanceSummaryWidget;