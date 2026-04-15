import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // Adjust path if needed

const StudentAttendance = () => {
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [summary, setSummary] = useState({ total: 0, Present: 0, Absent: 0, Leave: 0, Late: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                // Fetching from the endpoint we created in the last step
                const response = await API.get('/student/attendance'); 
                if (response.data.success) {
                    setAttendanceHistory(response.data.history);
                    
                    // The backend sends a summary object, let's merge it with our defaults
                    setSummary(prev => ({ ...prev, ...response.data.summary }));
                }
            } catch (error) {
                console.error("Error fetching attendance details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    // Safely calculate the percentage
    const attendancePercentage = summary.total > 0 
        ? ((summary.Present / summary.total) * 100).toFixed(2) 
        : '0.00';

    // Simple search filter for dates or status
    const filteredHistory = attendanceHistory.filter(record => 
        new Date(record.date).toLocaleDateString().includes(searchTerm) || 
        record.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 font-medium">Loading Attendance Records...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto font-sans text-gray-800 space-y-6">
            
            {/* Page Header */}
            <div className="flex justify-between items-center pb-2">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">My Attendance Detail</h2>
                    <p className="text-gray-500 text-sm mt-1">Daily attendance logs and overall summary.</p>
                </div>
            </div>

            {/* Summary Banner (Inspired by your screenshot's orange theme) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Orange Top Bar */}
                <div className="bg-orange-500 text-white font-bold px-6 py-3 text-sm flex justify-between">
                    <span>Attendance Summary</span>
                    <span className="opacity-90 font-normal">Formula: (Total Present / Total Working Days) * 100</span>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-orange-50">
                    <div className="text-center border-r border-orange-200 last:border-0">
                        <div className="text-xs font-bold text-orange-600 uppercase mb-1">Total Working Days</div>
                        <div className="text-2xl font-black text-gray-800">{summary.total}</div>
                    </div>
                    <div className="text-center border-r border-orange-200 last:border-0">
                        <div className="text-xs font-bold text-orange-600 uppercase mb-1">Total Present</div>
                        <div className="text-2xl font-black text-green-600">{summary.Present || 0}</div>
                    </div>
                    <div className="text-center border-r border-orange-200 last:border-0">
                        <div className="text-xs font-bold text-orange-600 uppercase mb-1">Total Absent</div>
                        <div className="text-2xl font-black text-red-600">{summary.Absent || 0}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs font-bold text-orange-600 uppercase mb-1">Overall Percentage</div>
                        <div className="text-2xl font-black text-blue-600">{attendancePercentage}%</div>
                    </div>
                </div>
            </div>

            {/* Attendance Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
                    <div className="flex gap-2">
                        {/* Dummy buttons for UI completeness matching the screenshot */}
                        <button className="px-3 py-1.5 text-xs font-bold bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition">Copy</button>
                        <button className="px-3 py-1.5 text-xs font-bold bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition">CSV</button>
                        <button className="px-3 py-1.5 text-xs font-bold bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition">Excel</button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-600">Search:</label>
                        <input 
                            type="text" 
                            placeholder="Date or Status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none w-48"
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 w-24 text-center">S.No.</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Day</th>
                                <th className="px-6 py-4">Daily Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((record, index) => {
                                    const dateObj = new Date(record.date);
                                    return (
                                        <tr key={index} className="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
                                            <td className="px-6 py-4 text-center text-gray-500 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                {dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                                                    record.status === 'Present' ? 'bg-green-100 text-green-700' : 
                                                    record.status === 'Absent' ? 'bg-red-100 text-red-700' : 
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer Pagination Info */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                    <span>Showing {filteredHistory.length} of {attendanceHistory.length} entries</span>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendance;