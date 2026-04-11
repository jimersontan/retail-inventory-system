import React from 'react';

/**
 * StatusBadge — colored pill badge for status display.
 * Props: status (string), size ('sm' | 'md')
 */
const StatusBadge = ({ status, size = 'sm' }) => {
    const statusStyles = {
        // General
        active:      'bg-emerald-50 text-emerald-700 border-emerald-200',
        inactive:    'bg-slate-50 text-slate-600 border-slate-200',
        available:   'bg-emerald-50 text-emerald-700 border-emerald-200',
        unavailable: 'bg-red-50 text-red-700 border-red-200',

        // Orders
        pending:     'bg-amber-50 text-amber-700 border-amber-200',
        processing:  'bg-blue-50 text-blue-700 border-blue-200',
        shipped:     'bg-indigo-50 text-indigo-700 border-indigo-200',
        delivered:   'bg-emerald-50 text-emerald-700 border-emerald-200',
        completed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
        cancelled:   'bg-red-50 text-red-700 border-red-200',
        confirmed:   'bg-blue-50 text-blue-700 border-blue-200',
        ready:       'bg-teal-50 text-teal-700 border-teal-200',

        // PO
        draft:       'bg-slate-50 text-slate-600 border-slate-200',
        sent:        'bg-blue-50 text-blue-700 border-blue-200',
        received:    'bg-emerald-50 text-emerald-700 border-emerald-200',
        partial:     'bg-amber-50 text-amber-700 border-amber-200',

        // Payments
        paid:        'bg-emerald-50 text-emerald-700 border-emerald-200',
        unpaid:      'bg-red-50 text-red-700 border-red-200',
        refunded:    'bg-purple-50 text-purple-700 border-purple-200',

        // Stock
        low:          'bg-amber-50 text-amber-700 border-amber-200',
        critical:     'bg-orange-50 text-orange-700 border-orange-200',
        out_of_stock: 'bg-red-50 text-red-700 border-red-200',
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    const style = statusStyles[status?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-200';

    return (
        <span className={`inline-flex items-center font-medium rounded-full border capitalize ${style} ${sizeStyles[size]}`}>
            {status?.replace(/_/g, ' ') || 'unknown'}
        </span>
    );
};

export default StatusBadge;
