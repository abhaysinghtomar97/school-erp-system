import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation, Outlet } from 'react-router-dom';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    // Sidebar Navigation Links
    const navLinks = [
        { name: 'Dashboard Home', path: '/admin', icon: '■' },
        { name: 'Create User', path: '/admin/create-user', icon: '➕' },
        { name: 'Manage Students', path: '/admin/students', icon: '👥' },
        { name: 'Manage Faculty', path: '/admin/faculty', icon: '👨‍🏫' },
        { name: 'Manage Classes', path: '/admin/classes', icon: '🏫' },
        { name: 'Enrollments', path: '/admin/enrollments', icon: '📝' },
    ];

    return (
        <div className="flex h-screen bg-[#f8f5ee] font-sans overflow-hidden">
            
            {/* LEFT SIDEBAR (Persistent) */}
            <aside className="w-64 bg-white shadow-md flex flex-col z-10 border-r border-gray-200">
                <div className="p-6 bg-blue-50 flex flex-col items-center border-b border-blue-100">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-sm">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <h3 className="text-blue-800 font-bold text-lg text-center">
                        {user?.name || 'Admin User'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{user?.institutional_id || 'Admin'}</p>
                    <span className="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {user?.role || 'ADMIN'}
                    </span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="text-gray-600 space-y-1">
                        {navLinks.map((link, index) => {
                            // Match exact path for Home, otherwise match start of path
                            const isActive = link.path === '/admin' 
                                ? location.pathname === '/admin' 
                                : location.pathname.startsWith(link.path);
                            
                            return (
                                <li key={index}>
                                    <Link 
                                        to={link.path}
                                        className={`flex items-center px-6 py-3 border-l-4 transition-colors ${
                                            isActive 
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' 
                                            : 'border-transparent hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {link.icon}
                                        </span> 
                                        {link.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                
                {/* TOP HEADER (Persistent) */}
                <header className="bg-white shadow-sm flex items-center justify-between px-6 py-4 z-0">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-800">Golden Valley ERP</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={logout} className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 hover:text-red-700 transition text-sm font-semibold border border-red-200">
                           <span className="mr-2">🚪</span> Log Out
                        </button>
                    </div>
                </header>

                {/* SCROLLABLE DYNAMIC CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* The Outlet renders whatever child route is active! */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;