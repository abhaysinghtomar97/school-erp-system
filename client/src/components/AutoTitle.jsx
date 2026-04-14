import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AutoTitle = () => {
    const location = useLocation();

    useEffect(() => {
        // 1. Get the last part of the URL
        const currentPath = location.pathname.split('/').pop();

        // 2. Format it beautifully
        const formatPathName = (path) => {
            if (!path || path === 'admin' || path === 'faculty' || path === 'student') {
                return 'Dashboard';
            }
            
            return path
                .split('-') 
                .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
                .join(' '); 
        };

        const pageName = formatPathName(currentPath);

        // 3. Force the browser to update the tab title directly
        document.title = `${pageName} | Golden Valley ERP`;

    }, [location.pathname]); // This tells React: "Run this code EVERY time the URL changes"

    // This component silently works in the background, so it renders nothing to the screen
    return null; 
};

export default AutoTitle;