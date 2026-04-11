import React from 'react';
import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const UnauthorizedPage = () => {
    const { user } = useAuthStore();
    const role = (user?.user_type || 'unknown').toLowerCase();

    const getRoleColor = (r) => {
        switch(r) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'manager': return 'bg-blue-100 text-blue-700';
            case 'cashier': return 'bg-emerald-100 text-emerald-700';
            case 'employee': return 'bg-slate-100 text-slate-700';
            case 'customer': return 'bg-amber-100 text-amber-700';
            case 'supplier': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
            <ShieldX className="text-indigo-200 size-20 mb-6" />
            <h1 className="text-3xl font-bold text-slate-800 text-center">403 — Unauthorized</h1>
            <p className="text-slate-500 mt-2 text-center max-w-sm">
                You don't have permission to view this page based on your current role.
            </p>
            
            <div className="mt-8 flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Current Role:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getRoleColor(role)}`}>
                    {role}
                </span>
            </div>

            <Link 
                to="/dashboard" 
                className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
                Go to Dashboard
            </Link>
        </div>
    );
};

export default UnauthorizedPage;
