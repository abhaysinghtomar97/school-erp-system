// DashboardLayout.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';


// Accept navLinks as a prop
const DashboardLayout = ({ navLinks }) => {
    const { logout } = useContext(AuthContext); 
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);

    const contentWidth = isDesktopSidebarExpanded ? 'md:ml-[20%]' : 'md:ml-[5rem]';

    return (
        <div className="min-h-screen bg-[#f8f5ee] font-sans">
            {/* Header (Same as before) */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex items-center justify-between px-6 z-40 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Hamburger */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="md:hidden p-2 rounded hover:bg-gray-100"
                        aria-label="Open sidebar"
                    >
                        ☰
                    </button>

                    {/* Desktop Toggle */}
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

                {/* logout */}
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
            {/* Mobile Overlay */}
            {isMobileSidebarOpen && <div className="..." onClick={() => setIsMobileSidebarOpen(false)} />}

            {/* Sidebar Component - Now receives navLinks */}
            <Sidebar 
                isMobileSidebarOpen={isMobileSidebarOpen} 
                setIsMobileSidebarOpen={setIsMobileSidebarOpen} 
                isDesktopSidebarExpanded={isDesktopSidebarExpanded} 
                navLinks={navLinks} 
            />

            {/* Main Content */}
            <main className={`pt-16 transition-all duration-300 ${contentWidth}`}>
                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;