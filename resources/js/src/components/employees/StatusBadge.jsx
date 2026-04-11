import React from 'react';

const StatusBadge = ({ status }) => {
    let containerClass = 'bg-slate-50 text-slate-700 border-slate-200';
    let dotClass = 'bg-slate-400';
    let label = 'Unknown';

    if (status === 'active') {
        containerClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        dotClass = 'bg-emerald-500';
        label = 'Active';
    } else if (status === 'inactive') {
        containerClass = 'bg-red-50 text-red-700 border-red-200';
        dotClass = 'bg-red-400';
        label = 'Inactive';
    } else if (status === 'on_leave') {
        containerClass = 'bg-amber-50 text-amber-700 border-amber-200';
        dotClass = 'bg-amber-400';
        label = 'On Leave';
    }

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${containerClass}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            {label}
        </div>
    );
};

export default StatusBadge;
