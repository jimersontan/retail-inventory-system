import React from 'react';

const EmployeeAvatar = ({ name, userType, size = 'md' }) => {
    // Determine initials (first two chars, uppercase)
    const initials = (name || '??').substring(0, 2).toUpperCase();

    // Determine colors based on role
    let colorClass = 'bg-slate-100 text-slate-700'; // fallback
    if (userType === 'admin') {
        colorClass = 'bg-purple-100 text-purple-700';
    } else if (userType === 'manager') {
        colorClass = 'bg-blue-100 text-blue-700';
    } else if (userType === 'cashier') {
        colorClass = 'bg-emerald-100 text-emerald-700';
    }

    // Determine size
    let sizeClass = 'w-9 h-9 text-xs'; // default list view
    if (size === 'lg') {
        sizeClass = 'w-20 h-20 text-2xl'; // detail view
    } else if (size === 'sm') {
        sizeClass = 'w-8 h-8 text-[10px]';
    }

    return (
        <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${colorClass}`}>
            {initials}
        </div>
    );
};

export default EmployeeAvatar;
