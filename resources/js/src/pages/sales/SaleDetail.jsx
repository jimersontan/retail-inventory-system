import React from 'react';
import { X } from 'lucide-react';

const SaleDetail = ({ open, sale, onClose }) => {
    if (!open || !sale) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/30 z-50 flex justify-end">
            <div className="w-full max-w-xl bg-white h-full border-l border-slate-200 flex flex-col">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div>
                        <p className="font-mono text-sm text-slate-400">S-{sale.sale_id}</p>
                        <h3 className="text-lg font-semibold text-slate-900">Sale Detail</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="text-sm text-slate-600">
                        <p>Cashier: {sale.employee?.user?.name || '-'}</p>
                        <p>Branch: {sale.branch?.name || '-'}</p>
                        <p>Date: {new Date(sale.sale_date).toLocaleString('en-PH')}</p>
                    </div>
                    <div className="border rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="text-left px-4 py-2">Product</th>
                                    <th className="text-left px-4 py-2">Qty</th>
                                    <th className="text-left px-4 py-2">Unit</th>
                                    <th className="text-left px-4 py-2">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {(sale.details || []).map((item) => (
                                    <tr key={item.sale_detail_id}>
                                        <td className="px-4 py-2 text-sm">{item.product?.name || '-'}</td>
                                        <td className="px-4 py-2 text-sm">{item.quantity}</td>
                                        <td className="px-4 py-2 text-sm">₱ {Number(item.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-2 text-sm font-semibold">₱ {Number(item.subtotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t">
                    <div className="flex items-center justify-between text-base font-semibold">
                        <span>Total</span>
                        <span className="text-indigo-700">₱ {Number(sale.sale_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <button type="button" onClick={() => window.print()} className="mt-4 w-full h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold">
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleDetail;

