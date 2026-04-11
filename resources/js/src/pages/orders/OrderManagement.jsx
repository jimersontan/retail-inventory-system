import React, { useEffect, useState } from 'react';
import { LayoutGrid, LayoutList, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrderStore } from '../../store/orderStore';
import KanbanColumn from '../../components/orders/KanbanColumn';

const statusColors = {
    pending: 'slate',
    confirmed: 'blue',
    processing: 'amber',
    ready: 'emerald',
    completed: 'indigo',
};

const nextStatusLabels = {
    pending: 'Confirm Order',
    confirmed: 'Start Processing',
    processing: 'Mark as Ready',
    ready: 'Complete Order',
};

const OrderManagement = () => {
    const { orders, loading, kanbanView, setKanbanView, fetchOrders, updateStatus } = useOrderStore();
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [branchFilter, setBranchFilter] = useState('');
    const [view, setView] = useState(kanbanView ? 'kanban' : 'list');

    useEffect(() => {
        const params = {};
        if (dateRange.from) params.date_from = dateRange.from;
        if (dateRange.to) params.date_to = dateRange.to;
        if (branchFilter) params.branch_id = branchFilter;

        fetchOrders(params).catch(err => {
            toast.error(err.response?.data?.message || 'Failed to load orders');
        });
    }, [dateRange, branchFilter, fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateStatus(orderId, newStatus);
            toast.success(`Order moved to ${newStatus}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order');
        }
    };

    const statuses = ['pending', 'confirmed', 'processing', 'ready', 'completed'];

    // Group orders by status for Kanban
    const ordersByStatus = {};
    statuses.forEach(status => {
        ordersByStatus[status] = orders.filter(o => o.status === status);
    });

    if (view === 'kanban') {
        return (
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Manage and track all orders</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setView('list')}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <LayoutList className="w-4 h-4" />
                            List View
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-6">
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="From date"
                    />
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="To date"
                    />
                    {(dateRange.from || dateRange.to) && (
                        <button
                            onClick={() => setDateRange({ from: '', to: '' })}
                            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Kanban Board */}
                {loading ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-72 h-96 bg-slate-200 rounded-xl animate-pulse flex-shrink-0" />
                        ))}
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {statuses.map(status => (
                            <KanbanColumn
                                key={status}
                                status={status}
                                orders={ordersByStatus[status]}
                                onStatusChange={handleStatusChange}
                                title={status.charAt(0).toUpperCase() + status.slice(1)}
                                color={statusColors[status]}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // List View
    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and track all orders</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('kanban')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Kanban View
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-300 border-t-indigo-600 rounded-full" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500">No orders found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Order</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {orders.map(order => (
                                <tr key={order.order_id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900">
                                        #{String(order.order_id).padStart(6, '0')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">{order.user?.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{order.items?.length} items</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                        ₱ {parseFloat(order.total_amount).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            order.payment_status === 'paid'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            order.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                                            order.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                                            order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {order.status !== 'completed' && (
                                            <button
                                                onClick={() => {
                                                    const nextStatus = {
                                                        pending: 'confirmed',
                                                        confirmed: 'processing',
                                                        processing: 'ready',
                                                        ready: 'completed',
                                                    }[order.status];
                                                    if (nextStatus) handleStatusChange(order.order_id, nextStatus);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg font-bold text-xs transition-all active:scale-95"
                                            >
                                                <span>{nextStatusLabels[order.status]}</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrderManagement;
