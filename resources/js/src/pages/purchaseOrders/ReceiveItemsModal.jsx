import React, { useMemo, useState } from 'react';
import { PackageCheck } from 'lucide-react';

const ReceiveItemsModal = ({ open, order, onClose, onConfirm, loading }) => {
    const [notes, setNotes] = useState('');
    const [rows, setRows] = useState({});

    const details = order?.details || [];

    const onChange = (detail, value) => {
        const max = Math.max(0, Number(detail.quantity_ordered) - Number(detail.quantity_received));
        const safe = Math.max(0, Math.min(max, Number(value || 0)));
        setRows((prev) => ({ ...prev, [detail.po_detail_id]: safe }));
    };

    const receiveAll = () => {
        const next = {};
        details.forEach((detail) => {
            next[detail.po_detail_id] = Math.max(0, Number(detail.quantity_ordered) - Number(detail.quantity_received));
        });
        setRows(next);
    };

    const payload = useMemo(
        () => ({
            items: details.map((detail) => ({
                po_detail_id: detail.po_detail_id,
                quantity_received: Number(rows[detail.po_detail_id] || 0),
            })),
            notes,
        }),
        [details, rows, notes]
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl border">
                <div className="px-6 py-4 border-b">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <PackageCheck className="w-5 h-5 text-emerald-600" /> Receive Items
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Enter quantities received for each item</p>
                </div>
                <div className="p-6">
                    <div className="flex justify-end">
                        <button type="button" onClick={receiveAll} className="text-indigo-600 text-sm hover:underline">
                            Receive All
                        </button>
                    </div>
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-sm">
                            <thead className="text-slate-500">
                                <tr>
                                    <th className="text-left py-2">Product</th>
                                    <th className="text-left py-2">Ordered</th>
                                    <th className="text-left py-2">Already Received</th>
                                    <th className="text-left py-2">Receive Now</th>
                                    <th className="text-left py-2">New Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {details.map((detail) => {
                                    const max = Math.max(0, Number(detail.quantity_ordered) - Number(detail.quantity_received));
                                    const receiveNow = Number(rows[detail.po_detail_id] || 0);
                                    return (
                                        <tr key={detail.po_detail_id}>
                                            <td className="py-2">{detail.product?.name || '-'}</td>
                                            <td className="py-2">{detail.quantity_ordered}</td>
                                            <td className="py-2">{detail.quantity_received}</td>
                                            <td className="py-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={max}
                                                    value={receiveNow}
                                                    onChange={(e) => onChange(detail, e.target.value)}
                                                    className="h-10 w-24 text-center border border-slate-200 rounded-lg focus:border-emerald-200 focus:bg-emerald-50"
                                                />
                                            </td>
                                            <td className="py-2 text-emerald-700 font-bold">{Number(detail.quantity_received) + receiveNow}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <label className="block mt-4 text-sm text-slate-600">
                        Notes (optional)
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full border rounded-lg p-2 min-h-[90px]" />
                    </label>
                </div>
                <div className="px-6 py-4 border-t flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">
                        Cancel
                    </button>
                    <button type="button" disabled={loading} onClick={() => onConfirm(payload)} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                        Confirm Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiveItemsModal;
