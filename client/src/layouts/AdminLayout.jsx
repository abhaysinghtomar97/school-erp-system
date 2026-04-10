import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation, Outlet } from 'react-router-dom';
import AdminDashboard from '../pages/Admin/AdminDashboard';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);

    // ✅ Fluid 20% width (no hardcoding)
    const sidebarWidth = isDesktopSidebarExpanded ? 'md:w-[20%]' : 'md:w-[5rem]';
    const contentWidth = isDesktopSidebarExpanded ? 'md:ml-[20%]' : 'md:ml-[5rem]';
    const hideText = isDesktopSidebarExpanded ? '' : 'md:hidden';

    const navLinks = [
        { name: 'Dashboard Home', path: '/admin', icon: '■' },
        { name: 'Create User', path: '/admin/create-user', icon: '➕' },
        { name: 'Manage Students', path: '/admin/students', icon: '👥' },
        { name: 'Manage Faculty', path: '/admin/faculty', icon: '👨‍🏫' },
        { name: 'Manage Classes', path: '/admin/classes', icon: '🏫' },
        { name: 'Enrollments', path: '/admin/enrollments', icon: '📝' },
    ];

    return (
        <div className="min-h-screen bg-[#f8f5ee] font-sans">

            {/* ================= HEADER ================= */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex items-center justify-between px-6 z-40 border-b border-gray-200">

                <div className="flex items-center gap-3">

                    {/* Mobile Menu */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="md:hidden p-2 rounded hover:bg-gray-100"
                        aria-label="Open sidebar"
                    >
                        ☰
                    </button>

                    {/* Desktop Toggle (FIXED POSITION → no shift) */}
                    <button
                        onClick={() => setIsDesktopSidebarExpanded(prev => !prev)}
                        className="hidden md:flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100 transition"
                        aria-label="Toggle sidebar"
                    >
                        {isDesktopSidebarExpanded ? '⟨⟨' : '⟩⟩'}
                    </button>

                    <h1 className="text-lg font-semibold text-gray-800 whitespace-nowrap">
                        Golden Valley ERP
                    </h1>
                </div>

                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-semibold border border-red-200"
                >
                    🚪 Logout
                </button>
            </header>

            {/* ================= MOBILE OVERLAY ================= */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0  backdrop-blur-xs mt-16 z-40 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* ================= SIDEBAR ================= */}
            <aside className={`
                fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 shadow-sm flex flex-col
                transition-all duration-300 ease-in-out z-50
                
                w-[50%] ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                
                md:translate-x-0 ${sidebarWidth}
            `}>

                {/* Profile */}
                <div className={`p-5 flex flex-col items-center border-b bg-blue-50 ${!isDesktopSidebarExpanded ? 'md:p-3' : ''}`}>

                    <div className={`
                        rounded-full bg-blue-600 text-white flex items-center justify-center font-bold
                        ${isDesktopSidebarExpanded ? 'w-16 h-16 text-2xl mb-3' : 'w-10 h-10 text-lg'}
                    `}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>

                    <div className={`text-center ${hideText}`}>
                        <h3 className="text-blue-800 font-semibold text-sm">
                            {user?.name || 'Admin User'}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {user?.institutional_id || 'Admin'}
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-3">
                    <ul className="space-y-1">
                        {navLinks.map((link, i) => {
                            const isActive = link.path === '/admin'
                                ? location.pathname === '/admin'
                                : location.pathname.startsWith(link.path);

                            return (
                                <li key={i}>
                                    <Link
                                        to={link.path}
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                        className={`
                                            flex items-center px-4 py-3 transition-all border-l-4
                                            ${isActive
                                                ? 'bg-blue-50 text-blue-600 border-blue-600'
                                                : 'border-transparent hover:bg-gray-50'}
                                        `}
                                    >
                                        <span className={`
                                            ${isDesktopSidebarExpanded ? 'mr-3' : 'mx-auto'}
                                        `}>
                                            {link.icon}
                                        </span>

                                        <span className={`${hideText}`}>
                                            {link.name}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            {/* ================= MAIN ================= */}
            <main className={`
                pt-16 transition-all duration-300
                ${contentWidth}
            `}>
                <div className="p-4 md:p-6">
                    <Outlet />

                </div>
            </main>
        </div>
    );
};

export default AdminLayout;