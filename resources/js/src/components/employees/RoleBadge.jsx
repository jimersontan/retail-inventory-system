import React from 'react';

const RoleBadge = ({ roleType }) => {
    const type = String(roleType).toLowerCase();
    
    let colorClass = 'bg-slate-50 text-slate-700 border-slate-200'; // default fallback
    
    if (type === 'admin') {
        colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (type === 'manager') {
        colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (type === 'cashier') {
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${colorClass}`}>
            {type}
        </span>
    );
};

export default RoleBadge;
