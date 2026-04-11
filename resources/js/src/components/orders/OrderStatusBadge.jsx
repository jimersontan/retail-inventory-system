import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Package } from 'lucide-react';

const statusConfig = {
    // Payment Statuses
    paid: { icon: CheckCircle2, color: 'emerald', label: 'Paid' },
    pending: { icon: Clock, color: 'amber', label: 'Pending' },
    failed: { icon: AlertCircle, color: 'red', label: 'Failed' },
    refunded: { icon: CheckCircle2, color: 'blue', label: 'Refunded' },
    // Order Statuses
    confirmed: { icon: CheckCircle2, color: 'blue', label: 'Confirmed' },
    processing: { icon: Clock, color: 'amber', label: 'Processing' },
    ready: { icon: Package, color: 'indigo', label: 'Ready for Pick-up' },
    completed: { icon: CheckCircle2, color: 'emerald', label: 'Completed' },
    cancelled: { icon: AlertCircle, color: 'red', label: 'Cancelled' },
};

const OrderStatusBadge = ({ status, method = null }) => {
    if (!status || !statusConfig[status]) return null;

    const config = statusConfig[status];
    const Icon = config.icon;
    const colorClasses = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${colorClasses[config.color]}`}>
            <Icon className="w-3 h-3" />
            <span>
                {method ? `${config.label} via ${method}` : config.label}
            </span>
        </div>
    );
};

export default OrderStatusBadge;
