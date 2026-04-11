import React from 'react';
import { CheckCircle } from 'lucide-react';

const SaleSuccessModal = ({ open, sale, onNewSale, onPrint }) => {
    if (!open || !sale) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl border">
                <div className="text-center p-6 pb-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-4">Sale Complete!</h3>
                    <p className="text-sm text-slate-500 mt-1">Transaction recorded successfully</p>
                </div>

                <div className="bg-slate-50 rounded-xl mx-6 p-4 space-y-2">
                    <p className="font-mono text-xs text-slate-400 text-center mb-3">Sale #{sale.sale_id}</p>
                    {(sale.details || []).map((item) => (
                        <div key={item.sale_detail_id} className="flex justify-between text-sm">
                            <span className="text-slate-600">
                                {item.quantity}x {item.product?.name}
                            </span>
                            <span className="text-slate-700">₱ {Number(item.subtotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                        </div>
                    ))}
                    <div className="border-t pt-2 mt-2 space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-tight">Payment Method</span>
                            <span className="text-xs text-slate-700 font-bold">{(sale.payment_method || 'cash').toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-semibold text-slate-900 border-b pb-2 mb-2">
                            <span>Total Amount</span>
                            <span className="text-indigo-700 text-lg font-black">₱ {Number(sale.sale_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {sale.payment_method === 'cash' && (
                            <>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Amount Received</span>
                                    <span className="text-slate-900 font-medium font-mono">₱ {Number(sale.received_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-xs pb-2">
                                    <span className="text-emerald-500 font-bold">Change Due</span>
                                    <span className="text-emerald-600 font-black font-mono">₱ {Number(sale.change_due || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-4 flex gap-3">
                    <button type="button" onClick={onNewSale} className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                        New Sale
                    </button>
                    <button type="button" onClick={onPrint} className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold">
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleSuccessModal;

