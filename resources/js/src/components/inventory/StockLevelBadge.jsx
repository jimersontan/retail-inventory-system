import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

const StockLevelBadge = ({ level }) => {
    let containerClass = 'bg-slate-50 text-slate-700 border-slate-200';
    let label = 'Unknown';
    let Icon = null;

    if (level === 'in_stock') {
        containerClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'In Stock';
    } else if (level === 'low_stock') {
        containerClass = 'bg-amber-50 text-amber-700 border-amber-200';
        label = 'Low Stock';
        Icon = AlertTriangle;
    } else if (level === 'out_of_stock') {
        containerClass = 'bg-red-50 text-red-700 border-red-200';
        label = 'Out of Stock';
        Icon = XCircle;
    }

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center w-fit ${containerClass}`}>
            {Icon && <Icon className="w-3 h-3 mr-1" />}
            {label}
        </span>
    );
};

export default StockLevelBadge;
