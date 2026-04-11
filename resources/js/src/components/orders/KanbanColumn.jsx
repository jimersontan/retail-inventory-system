import React from 'react';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ status, orders, onStatusChange, title, color }) => {
    return (
        <div className={`w-72 flex-shrink-0 flex flex-col rounded-xl border`}
            style={{
                borderColor: color === 'slate' ? '#e2e8f0' : color === 'blue' ? '#bfdbfe' : color === 'amber' ? '#fcd34d' : color === 'emerald' ? '#a7f3d0' : '#e0e7ff'
            }}>
            {/* Column Header */}
            <div className={`rounded-t-xl p-4 border-b`}
                style={{
                    backgroundColor: color === 'slate' ? '#f3f4f6' : color === 'blue' ? '#eff6ff' : color === 'amber' ? '#fffbeb' : color === 'emerald' ? '#f0fdf4' : '#eef2ff',
                    borderColor: color === 'slate' ? '#e5e7eb' : color === 'blue' ? '#93c5fd' : color === 'amber' ? '#fde68a' : color === 'emerald' ? '#86efac' : '#c7d2fe'
                }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
                        <span className="bg-indigo-100 text-indigo-700 rounded-full px-1.5 text-xs font-medium">
                            {orders.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Column Body */}
            <div className="p-3 space-y-3 min-h-96 flex-1 overflow-y-auto">
                {orders.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-slate-400 text-sm">No orders</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <KanbanCard
                            key={order.order_id}
                            order={order}
                            onStatusChange={onStatusChange}
                            currentStatus={status}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
