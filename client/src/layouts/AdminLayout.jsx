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
        {
            name: 'Dashboard Home', path: '/admin', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z" clipRule="evenodd" />
            </svg>
        },
        {
            name: 'Create User', path: '/admin/create-user', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
            </svg>
        },
        {
            name: 'Manage Students', path: '/admin/students', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
            </svg>
        },
        {
            name: 'Manage Faculty', path: '/admin/faculty', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
        },
        {
            name: 'Manage Classes', path: '/admin/classes', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
            </svg>
        },
        {
            name: 'Enrollments', path: '/admin/enrollments', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.877.75.75 0 0 1-.351-.92ZM15 8.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15ZM14.25 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15Z" clipRule="evenodd" />
            </svg>
        },
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
                    className="px-4 py-2 flex flex-row gap-1 bg-red-50 text-red-600 rounded hover:bg-red-200 transition text-sm font-semibold border border-red-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6Zm-5.03 4.72a.75.75 0 0 0 0 1.06l1.72 1.72H2.25a.75.75 0 0 0 0 1.5h10.94l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" />
                    </svg>
                    Logout
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