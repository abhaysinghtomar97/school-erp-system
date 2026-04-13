import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Notice 'navLinks' is now included in the destructured props
const Sidebar = ({ 
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen, 
    isDesktopSidebarExpanded,
    navLinks 
}) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const sidebarWidth = isDesktopSidebarExpanded ? 'md:w-[20%]' : 'md:w-[5rem]';
    const hideText = isDesktopSidebarExpanded ? '' : 'md:hidden';

    return (
        <aside className={`
            fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 shadow-sm flex flex-col
            transition-all duration-300 ease-in-out z-50
            w-[50%] ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 ${sidebarWidth}
        `}>
            
            {/* Profile Section */}
            <div className={`p-5 flex flex-col items-center border-b bg-blue-50 ${!isDesktopSidebarExpanded ? 'md:p-3' : ''}`}>
                <div className={`
                    rounded-full bg-blue-600 text-white flex items-center justify-center font-bold
                    ${isDesktopSidebarExpanded ? 'w-16 h-16 text-2xl mb-3' : 'w-10 h-10 text-lg'}
                `}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>

                <div className={`text-center ${hideText}`}>
                    <h3 className="text-blue-800 font-semibold text-sm">
                        {user?.name || 'User'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {user?.institutional_id || 'ID Number'}
                    </p>
                </div>
            </div>
            
            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3">
                <ul className="space-y-1">
                    {/* Added a fallback (navLinks || []) just in case it loads before links are passed */}
                    {(navLinks || []).map((link, i) => {
                        // More robust active checking
                        const isActive = link.path === location.pathname || 
                                         (link.path !== '/' && location.pathname.startsWith(link.path) && link.path.split('/').length > 1);

                        return (
                            <li key={i}>
                                <Link
                                    to={link.path}
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    className={`flex items-center px-4 py-3 transition-all border-l-4 ${isActive ? 'bg-blue-50 text-blue-600 border-blue-600' : 'border-transparent hover:bg-gray-50'}`}
                                >
                                    <span className={`${isDesktopSidebarExpanded ? 'mr-3' : 'mx-auto'}`}>
                                        {link.icon}
                                    </span>
                                    <span className={`${hideText}`}>{link.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;