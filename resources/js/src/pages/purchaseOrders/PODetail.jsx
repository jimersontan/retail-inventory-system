import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building2, Calendar, PackageCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePOStore } from '../../store/poStore';
import POStatusBadge from '../../components/purchaseOrders/POStatusBadge';
import POStatusFlow from '../../components/purchaseOrders/POStatusFlow';
import ReceiveItemsModal from './ReceiveItemsModal';

const PODetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentOrder, fetchOrder, updateStatus, cancelOrder, receiveItems, loading } = usePOStore();
    const [openReceive, setOpenReceive] = useState(false);

    useEffect(() => {
        fetchOrder(id).catch(() => toast.error('Failed to load purchase order.'));
    }, [id, fetchOrder]);

    const order = currentOrder;
    const money = (n) => Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const totals = useMemo(() => {
        const details = order?.details || [];
        return {
            ordered: details.reduce((sum, item) => sum + Number(item.quantity_ordered || 0), 0),
            received: details.reduce((sum, item) => sum + Number(item.quantity_received || 0), 0),
        };
    }, [order]);

    if (!order) return null;

    const onSend = async () => {
        try {
            await updateStatus(Number(order.po_id), 'sent');
            await fetchOrder(order.po_id);
            toast.success('Purchase order marked as sent.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status.');
        }
    };

    const onCancel = async () => {
        try {
            await cancelOrder(Number(order.po_id));
            await fetchOrder(order.po_id);
            toast.success('Purchase order cancelled.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order.');
        }
    };

    const onReceive = async (payload) => {
        try {
            await receiveItems(Number(order.po_id), payload);
            await fetchOrder(order.po_id);
            setOpenReceive(false);
            toast.success('Items received successfully.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to receive items.');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                    <Link to="/purchase-orders" className="hover:text-indigo-600">
                        Purchase Orders
                    </Link>{' '}
                    <span className="mx-2">/</span>
                    <span>PO-{order.po_id}</span>
                </div>
                <POStatusBadge status={order.status} />
            </div>

            <div className="bg-white rounded-2xl border p-6 mb-6">
                <div className="flex justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-2xl font-bold text-slate-900">PO-{order.po_id}</span>
                            <POStatusBadge status={order.status} large />
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            Created by {order.created_by_user?.name || '-'} on {order.created_at ? new Date(order.created_at).toLocaleDateString('en-PH') : '-'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {order.status === 'draft' ? (
                            <>
                                <button onClick={onSend} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
                                    Mark as Sent
                                </button>
                                <button onClick={() => navigate(`/purchase-orders/${order.po_id}/edit`)} className="px-4 py-2 rounded-lg border text-sm font-semibold">
                                    Edit
                                </button>
                                <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold">
                                    Cancel
                                </button>
                            </>
                        ) : null}
                        {order.status === 'sent' ? (
                            <>
                                <button onClick={() => setOpenReceive(true)} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">
                                    Receive Items
                                </button>
                                <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold">
                                    Cancel
                                </button>
                            </>
                        ) : null}
                        {order.status === 'partially_received' ? (
                            <button onClick={() => setOpenReceive(true)} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">
                                Continue Receiving
                            </button>
                        ) : null}
                        {order.status === 'received' ? <button className="px-4 py-2 rounded-lg border text-sm font-semibold">Download PO</button> : null}
                        {order.status === 'cancelled' ? <button className="px-4 py-2 rounded-lg border text-sm font-semibold">Duplicate PO</button> : null}
                    </div>
                </div>

                <div className="mt-4">
                    <POStatusFlow status={order.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="rounded-xl border p-4">
                        <p className="text-xs uppercase text-slate-500">Supplier</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-slate-400" />
                            {order.supplier?.store_name || order.supplier?.user?.name || '-'}
                        </p>
                    </div>
                    <div className="rounded-xl border p-4">
                        <p className="text-xs uppercase text-slate-500">Branch</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {order.branch?.name || '-'}
                        </p>
                    </div>
                    <div className="rounded-xl border p-4">
                        <p className="text-xs uppercase text-slate-500">Dates</p>
                        <p className="mt-2 text-sm text-slate-700 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" /> {order.order_date} &rarr; {order.expected_date}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border mb-6">
                <div className="px-6 py-4 border-b flex justify-between">
                    <h3 className="font-semibold text-slate-900">Order Items</h3>
                    <span className="bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 text-sm">
                        {totals.received} of {totals.ordered} items received
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                            <tr>
                                <th className="text-left px-6 py-3">Product</th>
                                <th className="text-left px-6 py-3">SKU</th>
                                <th className="text-left px-6 py-3">Unit Price</th>
                                <th className="text-left px-6 py-3">Qty Ordered</th>
                                <th className="text-left px-6 py-3">Qty Received</th>
                                <th className="text-left px-6 py-3">Remaining</th>
                                <th className="text-left px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {(order.details || []).map((detail) => {
                                const remaining = Number(detail.quantity_ordered) - Number(detail.quantity_received);
                                const status =
                                    Number(detail.quantity_received) >= Number(detail.quantity_ordered)
                                        ? 'received'
                                        : Number(detail.quantity_received) > 0
                                        ? 'partial'
                                        : 'pending';
                                return (
                                    <tr key={detail.po_detail_id}>
                                        <td className="px-6 py-3">
                                            <p className="text-sm font-medium text-slate-900">{detail.product?.name || '-'}</p>
                                            <p className="text-xs text-slate-500">{detail.product?.category?.category_name || 'No category'}</p>
                                        </td>
                                        <td className="px-6 py-3 text-sm">{detail.product?.unique_sku || '-'}</td>
                                        <td className="px-6 py-3 text-sm">₱ {money(detail.unit_price)}</td>
                                        <td className="px-6 py-3 text-sm font-semibold">{detail.quantity_ordered}</td>
                                        <td className="px-6 py-3 text-sm font-semibold">{detail.quantity_received}</td>
                                        <td className="px-6 py-3 text-sm font-semibold">{remaining}</td>
                                        <td className="px-6 py-3">
                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    status === 'received'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : status === 'partial'
                                                        ? 'bg-amber-50 text-amber-700'
                                                        : 'bg-slate-50 text-slate-500'
                                                }`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="border-t px-6 py-4 flex justify-end gap-8">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-xl font-bold text-slate-900">₱ {money(order.total_amount)}</span>
                </div>
            </div>

            <ReceiveItemsModal open={openReceive} order={order} loading={loading} onClose={() => setOpenReceive(false)} onConfirm={onReceive} />
        </div>
    );
};

export default PODetail;
