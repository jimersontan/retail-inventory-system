import React, { useState } from 'react';
import { ChevronRight, Clock } from 'lucide-react';

const statusColors = {
    pending: { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' },
    confirmed: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    processing: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    ready: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
    completed: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
};

const nextStatusLabels = {
    pending: 'Confirm Order',
    confirmed: 'Start Processing',
    processing: 'Mark as Ready',
    ready: 'Complete Order',
};

const nextStatusMap = {
    pending: 'confirmed',
    confirmed: 'processing',
    processing: 'ready',
    ready: 'completed',
};

const KanbanCard = ({ order, onStatusChange, currentStatus }) => {
    const [loading, setLoading] = useState(false);
    const nextStatus = nextStatusMap[currentStatus];
    const nextLabel = nextStatusLabels[currentStatus];
    const statusConfig = statusColors[currentStatus];

    const handleMove = async () => {
        if (!nextStatus || loading) return;
        setLoading(true);
        try {
            await onStatusChange(order.order_id, nextStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        const createdDate = new Date(date);
        const now = new Date();
        const diff = now - createdDate;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'just now';
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <p className="font-mono text-xs text-slate-400">#{String(order.order_id).padStart(6, '0')}</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
                {order.user?.name || 'Unknown Customer'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
                {order.items?.length || 0} items · ₱ {parseFloat(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>

            {/* Payment Status */}
            <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium`}
                    style={{ backgroundColor: statusConfig.bg, color: statusConfig.text }}>
                    {order.payment_status === 'paid' ? '✓ Paid' : '⏱ Payment pending'}
                </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                <Clock className="w-3 h-3" />
                {formatTime(order.created_at)}
            </div>

            {/* Action Button */}
            {nextStatus && (
                <button
                    onClick={handleMove}
                    disabled={loading}
                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>{nextLabel}</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default KanbanCard;
