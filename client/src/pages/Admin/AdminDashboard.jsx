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
            const response = await API.post('/notices', newNotice);
          
            setNotices([response.data.notice, ...notices]);
            setNewNotice({ title: '', content: '', target_audience: 'ALL' });
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
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl">👥</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Faculty</p>
                        <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.faculty}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-xl">👨‍🏫</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Active Classes</p>
                        <h3 className="text-3xl font-bold text-teal-600 mt-1">{stats.classes}</h3>
                    </div>
                    <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center text-xl">🏫</div>
                </div>
            </div>

            {/* 3. NOTICE BOARD & ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Create Notice */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📢</span> Post Notice
                    </h3>
                    <form onSubmit={handlePostNotice} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Notice Title" 
                            value={newNotice.title}
                            onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                            required
                            className="w-full p-2.5 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <textarea 
                            placeholder="Type your announcement here..." 
                            rows="4"
                            value={newNotice.content}
                            onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                            required
                            className="w-full p-2.5 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        ></textarea>
                        <div className="flex flex-col gap-1 text-sm text-gray-700">
                            <label className="font-medium">Visibility:</label>
                            <select 
                                value={newNotice.target_audience}
                                onChange={(e) => setNewNotice({...newNotice, target_audience: e.target.value})}
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
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${
                                            notice.target_audience === 'ALL' ? 'bg-blue-100 text-blue-700' : 
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