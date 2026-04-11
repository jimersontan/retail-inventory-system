import React, { useEffect, useState } from 'react';
import { ShoppingBag, Package, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useOrderStore } from '../../store/orderStore';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';

const CustomerOrderList = () => {
    const navigate = useNavigate();
    const { orders, loading, fetchOrders, statusCounts } = useOrderStore();
    const [activeStatus, setActiveStatus] = useState('all');

    useEffect(() => {
        const params = activeStatus === 'all' ? {} : { status: activeStatus };
        fetchOrders(params).catch(err => {
            toast.error(err.response?.data?.message || 'Failed to load orders');
        });
    }, [activeStatus, fetchOrders]);

    const statuses = ['all', 'pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'];

    const filteredOrders = activeStatus === 'all' ? orders : orders;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
                <p className="text-sm text-slate-500 mt-0.5">Track your orders and purchase history</p>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-0 overflow-x-auto">
                {statuses.map(status => {
                    const count = statusCounts[status] || 0;
                    const isActive = activeStatus === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setActiveStatus(status)}
                            className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                                isActive
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {count > 0 && status !== 'all' && (
                                <span className="inline-flex items-center ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium">
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-slate-900 font-semibold mt-3">No orders yet</p>
                        <p className="text-slate-400 text-sm mt-1">Your order history will appear here</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.order_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Card Top */}
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-semibold text-slate-900">
                                        Order #{String(order.order_id).padStart(6, '0')}
                                    </span>
                                    <span className="text-sm text-slate-400 ml-2">
                                        · {new Date(order.order_date).toLocaleDateString('en-PH', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    order.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    order.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                                    order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>

                            {/* Card Items Preview */}
                            <div className="px-6 py-4 flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {order.items?.slice(0, 3).map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="w-10 h-10 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center"
                                        >
                                            <Package className="w-4 h-4 text-slate-300" />
                                        </div>
                                    ))}
                                </div>
                                {order.items && order.items.length > 3 && (
                                    <span className="text-xs font-medium text-slate-600">
                                        +{order.items.length - 3}
                                    </span>
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">
                                        {order.items?.length || 0} items
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                                        {order.items?.map(i => i.product?.name).join(', ')}
                                    </p>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <OrderStatusBadge status={order.payment_status} method={order.payment?.method} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-base font-bold text-slate-900">
                                        ₱ {parseFloat(order.total_amount).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </span>
                                    <button
                                        onClick={() => navigate(`/my-orders/${order.order_id}`)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CustomerOrderList;
