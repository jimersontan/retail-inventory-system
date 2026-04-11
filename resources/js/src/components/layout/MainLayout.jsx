import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = () => {
    const location = useLocation();

    // Generate title from route path for the TopBar
    const getTitleFromPath = (path) => {
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 0) return 'Dashboard';
        
        let title = parts[0].replace(/-/g, ' ');
        return title.charAt(0).toUpperCase() + title.slice(1);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <TopBar title={getTitleFromPath(location.pathname)} />
            
            <main className="ml-60 pt-[60px] min-h-screen">
                <div className="p-8 h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
