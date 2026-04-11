import React from 'react';
import { Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const TopBar = ({ title }) => {
    const { user } = useAuthStore();
    
    // Derived state for notifications
    const hasNotifications = true; // Hardcoded for template design

    const getInitials = (name) => {
        if (!name) return '??';
        return name.substring(0, 2).toUpperCase();
    };

    const getRoleColor = (r) => {
        switch(r) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'manager': return 'bg-blue-100 text-blue-700';
            case 'cashier': return 'bg-emerald-100 text-emerald-700';
            case 'customer': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const role = user?.user_type || 'customer';

    return (
        <header className="fixed top-0 left-60 right-0 h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-8 z-40">
            {/* Page Title */}
            <div>
                <h1 className="text-lg font-semibold text-slate-900">
                    {title || 'Dashboard'}
                </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none">
                    <Bell size={20} />
                    {hasNotifications && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                </button>
                
                <div className="w-px h-5 bg-slate-200"></div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${getRoleColor(role)} cursor-pointer`}>
                    {getInitials(user?.name)}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
