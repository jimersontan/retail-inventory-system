import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import useAuthStore from '../../store/authStore';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { fetchMe } = useAuthStore();

    useEffect(() => {
        // Silently sync user data from backend so permissions/status are up to date
        fetchMe().catch(() => {});
    }, [fetchMe]);

    // Generate title from route path for the TopBar
    const getTitleFromPath = (path) => {
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 0) return 'Dashboard';
        
        let title = parts[0].replace(/-/g, ' ');
        return title.charAt(0).toUpperCase() + title.slice(1);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <TopBar title={getTitleFromPath(location.pathname)} setSidebarOpen={setIsSidebarOpen} />
            
            <main className="md:ml-60 pt-[60px] min-h-screen transition-all duration-300">
                <div className="p-8 h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
