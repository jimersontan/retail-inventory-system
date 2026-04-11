import React from 'react';

const statusStyles = {
    draft: 'bg-slate-50 text-slate-600 border-slate-200',
    sent: 'bg-blue-50 text-blue-700 border-blue-200',
    partially_received: 'bg-amber-50 text-amber-700 border-amber-200',
    received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const statusLabel = {
    draft: 'Draft',
    sent: 'Sent',
    partially_received: 'Partially Received',
    received: 'Received',
    cancelled: 'Cancelled',
};

const POStatusBadge = ({ status, large = false }) => {
    const sizeClass = large ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';
    return (
        <span
            className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${
                statusStyles[status] || statusStyles.draft
            }`}
        >
            {statusLabel[status] || 'Draft'}
        </span>
    );
};

export default POStatusBadge;
