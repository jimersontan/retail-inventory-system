import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Building2,
    Calendar,
    Eye,
    FileEdit,
    PackageCheck,
    PackageOpen,
    Pencil,
    Search,
    Send,
    ShoppingCart,
    Truck,
    X,
    XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePOStore } from '../../store/poStore';
import { useBranchStore } from '../../store/branchStore';
import useAuthStore from '../../store/authStore';
import POStatusBadge from '../../components/purchaseOrders/POStatusBadge';

const POList = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { orders, loading, stats, pagination, fetchOrders, updateStatus, cancelOrder } = usePOStore();
    const { branches, fetchBranches } = useBranchStore();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [branchId, setBranchId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const isAdmin = user?.user_type === 'admin';

    useEffect(() => {
        fetchBranches().catch(() => {});
    }, [fetchBranches]);

    useEffect(() => {
        fetchOrders({ search, status, branch_id: branchId, date_from: dateFrom, date_to: dateTo }).catch(() => {});
    }, [fetchOrders, search, status, branchId, dateFrom, dateTo]);

    const statCards = [
        { key: 'draft', label: 'Draft', Icon: FileEdit, colors: 'bg-slate-50 text-slate-600 border-slate-200' },
        { key: 'sent', label: 'Sent', Icon: Send, colors: 'bg-blue-50 text-blue-700 border-blue-200' },
        { key: 'partially_received', label: 'Partial', Icon: PackageOpen, colors: 'bg-amber-50 text-amber-700 border-amber-200' },
        { key: 'received', label: 'Received', Icon: PackageCheck, colors: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { key: 'cancelled', label: 'Cancelled', Icon: XCircle, colors: 'bg-red-50 text-red-600 border-red-200' },
    ];

    const filteredCount = useMemo(() => orders.length, [orders]);

    const dateFmt = (d) => (d ? new Date(d).toLocaleDateString('en-PH') : '-');
    const money = (n) => Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const onSend = async (id) => {
        try {
            await updateStatus(id, 'sent');
            toast.success('Purchase order marked as sent.');
            fetchOrders({ search, status, branch_id: branchId, date_from: dateFrom, date_to: dateTo });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status.');
        }
    };

    const onCancel = async (id) => {
        try {
            await cancelOrder(id);
            toast.success('Purchase order cancelled.');
            fetchOrders({ search, status, branch_id: branchId, date_from: dateFrom, date_to: dateTo });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order.');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Purchase Orders</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage supplier orders and stock replenishment</p>
                </div>
                <button
                    onClick={() => navigate('/purchase-orders/create')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                    <ShoppingCart className="w-4 h-4" /> + Create PO
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {statCards.map((card) => (
                    <button
                        key={card.key}
                        onClick={() => setStatus(card.key)}
                        className={`bg-white rounded-xl border p-4 text-left ${status === card.key ? 'ring-2 ring-indigo-200' : ''}`}
                    >
                        <div className="flex justify-between items-center">
                            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${card.colors}`}>
                                <card.Icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{stats[card.key] || 0}</p>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border p-4 mb-4 flex gap-3 flex-wrap items-center">
                <div className="relative flex-1 min-w-[14rem]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search PO number or supplier..."
                        className="pl-9 h-10 w-full border border-slate-200 rounded-lg text-sm"
                    />
                </div>

                <select className="w-44 h-10 border border-slate-200 rounded-lg px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="partially_received">Partially Received</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {isAdmin ? (
                    <select className="w-36 h-10 border border-slate-200 rounded-lg px-3 text-sm" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                        <option value="">All Branches</option>
                        {branches.map((branch) => (
                            <option key={branch.branch_id} value={branch.branch_id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                ) : null}

                <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="pl-9 h-10 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="pl-9 h-10 border border-slate-200 rounded-lg text-sm" />
                </div>

                <div className="ml-auto text-sm text-slate-500">{filteredCount} results</div>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                            <tr className="text-xs uppercase text-slate-500">
                                <th className="px-4 py-3 text-left">PO #</th>
                                <th className="px-4 py-3 text-left">Supplier</th>
                                <th className="px-4 py-3 text-left">Branch</th>
                                <th className="px-4 py-3 text-left">Order Date</th>
                                <th className="px-4 py-3 text-left">Expected</th>
                                <th className="px-4 py-3 text-left">Items</th>
                                <th className="px-4 py-3 text-left">Total Amount</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {!loading && orders.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-16 text-center">
                                        <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto" />
                                        <p className="text-slate-500 font-medium mt-3">No purchase orders yet</p>
                                    </td>
                                </tr>
                            ) : null}
                            {orders.map((po) => (
                                <tr key={po.po_id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-sm font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border">PO-{po.po_id}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700">
                                        <div className="flex items-center gap-1.5">
                                            <Truck className="w-3 h-3 text-slate-400" />
                                            <span>{po.supplier?.store_name || po.supplier?.user?.name || 'Unknown supplier'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700">
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="w-3 h-3 text-slate-400" />
                                            <span>{po.branch?.name || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{dateFmt(po.order_date)}</td>
                                    <td className="px-4 py-3">
                                        {po.is_overdue ? (
                                            <div className="text-red-600 font-medium text-sm flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {dateFmt(po.expected_date)}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-600">{dateFmt(po.expected_date)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-600">{po.items_count || 0} items</p>
                                        {(po.received_qty_total || 0) > 0 ? (
                                            <div className="w-16 h-1.5 rounded-full bg-slate-100 mt-1">
                                                <div
                                                    className="h-1.5 rounded-full bg-emerald-500"
                                                    style={{
                                                        width: `${Math.min(100, Number(po.received_percentage || 0))}%`,
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">₱ {money(po.total_amount)}</td>
                                    <td className="px-4 py-3">
                                        <POStatusBadge status={po.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button className="p-1.5 rounded hover:bg-indigo-50 text-slate-500 hover:text-indigo-600" onClick={() => navigate(`/purchase-orders/${po.po_id}`)}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {po.status === 'draft' ? (
                                                <button className="p-1.5 rounded hover:bg-amber-50 text-slate-500 hover:text-amber-600" onClick={() => navigate(`/purchase-orders/${po.po_id}/edit`)}>
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            ) : null}
                                            {po.status === 'draft' ? (
                                                <button className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-600" onClick={() => onSend(po.po_id)}>
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            ) : null}
                                            {['sent', 'partially_received'].includes(po.status) ? (
                                                <button className="p-1.5 rounded hover:bg-emerald-50 text-slate-500 hover:text-emerald-600" onClick={() => navigate(`/purchase-orders/${po.po_id}`)}>
                                                    <PackageCheck className="w-4 h-4" />
                                                </button>
                                            ) : null}
                                            {['draft', 'sent'].includes(po.status) ? (
                                                <button className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600" onClick={() => onCancel(po.po_id)}>
                                                    <X className="w-4 h-4" />
                                                </button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
                Page {pagination.currentPage} of {pagination.lastPage}
            </p>
        </div>
    );
};

export default POList;
