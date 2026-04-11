import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

const QtyChangeBadge = ({ type, quantity }) => {
    if (type === 'in') {
        return (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                <ArrowDownToLine className="size-3" />
                <span>+{quantity}</span>
            </div>
        );
    } else if (type === 'out') {
        return (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-700 border-red-200">
                <ArrowUpFromLine className="size-3" />
                <span>-{quantity}</span>
            </div>
        );
    }

    return null;
};

export default QtyChangeBadge;
