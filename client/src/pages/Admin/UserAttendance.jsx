import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const UserAttendance = ({ userId }) => {
    // Default state matches the summary object we expect from the backend
    const [summary, setSummary] = useState({ Present: 0, Absent: 0, Late: 0, Leave: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttendanceSummary = async () => {
            try {
                // Fetching from the newly optimized backend route
                const response = await API.get(`/users/${userId}/attendance`);
                
                if (response.data.summary) {
                    setSummary(response.data.summary);
                }
            } catch (error) {
                console.error("Failed to fetch attendance summary", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceSummary();
    }, [userId]);

    if (isLoading) return <div className="text-gray-500 animate-pulse">Loading attendance summary...</div>;

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Overall Attendance Summary</h3>
            
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Present Card */}
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center shadow-sm">
                    <div className="text-3xl font-black text-green-700">{summary.Present}</div>
                    <div className="text-sm font-bold text-green-600 uppercase tracking-wide mt-1">Present</div>
                </div>

                {/* Absent Card */}
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center shadow-sm">
                    <div className="text-3xl font-black text-red-700">{summary.Absent}</div>
                    <div className="text-sm font-bold text-red-600 uppercase tracking-wide mt-1">Absent</div>
                </div>

                {/* Late Card */}
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center shadow-sm">
                    <div className="text-3xl font-black text-yellow-700">{summary.Late}</div>
                    <div className="text-sm font-bold text-yellow-600 uppercase tracking-wide mt-1">Late</div>
                </div>

               
            </div>
        </div>
    );
};

export default UserAttendance;