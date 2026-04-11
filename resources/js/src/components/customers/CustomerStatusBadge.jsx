import React from 'react';
import { Circle } from 'lucide-react';

const CustomerStatusBadge = ({ status }) => {
    const config = {
        active: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            dot: 'bg-emerald-500',
            text: 'text-emerald-700',
            label: 'Active',
        },
        pending_verification: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            dot: 'bg-amber-500',
            text: 'text-amber-700',
            label: 'Pending',
        },
        inactive: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            dot: 'bg-red-500',
            text: 'text-red-700',
            label: 'Inactive',
        },
    };

    const style = config[status] || config.pending_verification;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${style.bg} ${style.border}`}>
            <Circle className={`size-2 ${style.dot}`} fill="currentColor" />
            <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
        </span>
    );
};

export default CustomerStatusBadge;
