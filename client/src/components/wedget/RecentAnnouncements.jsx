import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const RecentAnnouncements = () => {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                // This hits the unified endpoint we set up for users
                const response = await API.get('/my-notices');
                if (response.data.success) {
                    setNotices(response.data.notices);
                }
            } catch (error) {
                console.error("Error fetching announcements:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotices();
    }, []);

    if (isLoading) {
        return <div className="p-4 text-center text-gray-400">Loading announcements...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 text-lg">Recent Announcements</h3>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">LIVE FEED</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {notices.length === 0 ? (
                    <div className="text-center text-gray-400 p-8 italic text-sm">No new announcements at this time.</div>
                ) : (
                    notices.map(notice => {
                        const dateObj = new Date(notice.created_at);
                        const isStudentNotice = notice.target_audience === 'STUDENT';

                        return (
                            <div key={notice.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-semibold text-gray-800 leading-tight">{notice.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${
                                        isStudentNotice ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        TO: {notice.target_audience === 'ALL' ? 'Everyone' : isStudentNotice ? 'Students' : 'Faculty'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{notice.content}</p>
                                <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-2">
                                    <span>Posted by: {notice.posted_by_name || 'System Admin'}</span>
                                    <span className="font-mono">{dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RecentAnnouncements;