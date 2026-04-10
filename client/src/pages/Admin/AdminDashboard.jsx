import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);


    // --- State ---
    const [stats, setStats] = useState({ students: 0, faculty: 0, classes: 0 });
    const [notices, setNotices] = useState([]);
    const [newNotice, setNewNotice] = useState({ title: '', content: '', target_audience: 'ALL' });
    const [posting, setPosting] = useState(false);
    const [adminData, setAdminData] = useState(null);

    // --- Fetch Initial Data ---
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Make ONE call to your new, efficient endpoint
            const response = await API.get('/admin');


            // PostgreSQL COUNT() returns strings, so we parse them into numbers
            setStats({
                students: parseInt(response.data.stats.students) || 0,
                faculty: parseInt(response.data.stats.faculty) || 0,
                classes: parseInt(response.data.stats.classes) || 0
            });

            setNotices(response.data.notices || []);


            setAdminData(response.data.user);

        } catch (error) {
            console.error("Error loading dashboard data", error);
        }
    };

    // --- Post Notice Handler ---
    const handlePostNotice = async (e) => {
        e.preventDefault();
        setPosting(true);
        try {
            const response = await API.post('/notice', newNotice);
            

            setNotices([response.data.notice, ...notices]);
            setNewNotice({ title: '', content: '', target_audience: 'Everyone' });
        } catch (error) {
            console.error("Error posting notice:", error);
            // alert("Failed to post notice.");
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto font-sans text-gray-800 space-y-6">

            {/* 1. WELCOME & BIODATA CARD */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>

                <div className="w-24 h-24 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-white text-4xl font-bold shadow-md">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h2>
                    <p className="text-gray-500">System Administrator</p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex flex-col bg-gray-50 p-3 rounded border border-gray-100">
                            <span className="text-gray-400 text-xs mb-1">Institutional ID</span>
                            <span className="font-semibold font-mono text-gray-700">{adminData?.institutional_id}</span>
                        </div>
                        <div className="flex flex-col bg-gray-50 p-3 rounded border border-gray-100">
                            <span className="text-gray-400 text-xs mb-1">Email Address</span>
                            <span className="font-semibold truncate text-gray-700">{adminData?.email}</span>
                        </div>
                        <div className="flex flex-col bg-gray-50 p-3 rounded border border-gray-100">
                            <span className="text-gray-400 text-xs mb-1">Role Level</span>
                            <span className="font-semibold text-blue-600">{user?.role}</span>
                        </div>
                        <div className="flex flex-col bg-gray-50 p-3 rounded border border-gray-100">

                        </div>
                    </div>
                </div>
            </div>

            {/* 2. QUICK STATS WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Students</p>
                        <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.students}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
                        <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                    </svg>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Faculty</p>
                        <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.faculty}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
</svg>

                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Active Classes</p>
                        <h3 className="text-3xl font-bold text-teal-600 mt-1">{stats.classes}</h3>
                    </div>
                    <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center text-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path fillRule="evenodd" d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
</svg>

                    </div>
                </div>
            </div>

            {/* 3. NOTICE BOARD & ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Create Notice */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
  <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
</svg>
</span> Post Notice
                    </h3>
                    <form onSubmit={handlePostNotice} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Notice Title"
                            value={newNotice.title}
                            onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                            required
                            className="w-full p-2.5 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <textarea
                            placeholder="Type your announcement here..."
                            rows="4"
                            value={newNotice.content}
                            onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                            required
                            className="w-full p-2.5 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        ></textarea>
                        <div className="flex flex-col gap-1 text-sm text-gray-700">
                            <label className="font-medium">Visibility:</label>
                            <select
                                value={newNotice.target_audience}
                                onChange={(e) => setNewNotice({ ...newNotice, target_audience: e.target.value })}
                                className="w-full border border-gray-300 rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="ALL">Everyone</option>
                                <option value="STUDENT">Students Only</option>
                                <option value="TEACHER">Faculty Only</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={posting}
                            className={`w-full p-3 text-white rounded font-medium transition ${posting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {posting ? 'Posting...' : 'Publish Notice'}
                        </button>
                    </form>
                </div>

                {/* Notice Board Feed */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-112.5">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                        <h3 className="text-lg font-bold text-gray-800">Recent Announcements</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium tracking-wide uppercase">Live Feed</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {notices.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                <span className="text-4xl">📭</span>
                                <p>No notices have been posted yet.</p>
                            </div>
                        ) : (
                            notices.map(notice => (
                                <div key={notice.id} className="p-4 bg-gray-50 border border-gray-100 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-800 text-md">{notice.title}</h4>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${notice.target_audience === 'ALL' ? 'bg-blue-100 text-blue-700' :
                                                notice.target_audience === 'STUDENT' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            To: {notice.target_audience}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                                    <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between font-medium">
                                        <span>Posted by: {notice.author_name}</span>
                                        <span>{new Date(notice.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;