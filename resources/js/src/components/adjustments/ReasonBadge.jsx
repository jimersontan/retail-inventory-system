import React from 'react';
import {
    Hammer,
    ShieldAlert,
    ClipboardCheck,
    ArrowLeftRight,
    Clock,
    MoreHorizontal,
} from 'lucide-react';

const ReasonBadge = ({ reason }) => {
    const reasonConfig = {
        damaged: {
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            border: 'border-orange-200',
            icon: Hammer,
            label: 'Damaged',
        },
        theft: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            icon: ShieldAlert,
            label: 'Theft',
        },
        count_correction: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-700',
            border: 'border-indigo-200',
            icon: ClipboardCheck,
            label: 'Count Correction',
        },
        transfer: {
            bg: 'bg-sky-50',
            text: 'text-sky-700',
            border: 'border-sky-200',
            icon: ArrowLeftRight,
            label: 'Transfer',
        },
        expired: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: Clock,
            label: 'Expired',
        },
        other: {
            bg: 'bg-slate-50',
            text: 'text-slate-600',
            border: 'border-slate-200',
            icon: MoreHorizontal,
            label: 'Other',
        },
    };

    const config = reasonConfig[reason] || reasonConfig.other;
    const IconComponent = config.icon;

    return (
        <div
            className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs 
                font-medium border ${config.bg} ${config.text} ${config.border}
            `}
        >
            <IconComponent className="size-3" />
            <span>{config.label}</span>
        </div>
    );
};

export default ReasonBadge;
