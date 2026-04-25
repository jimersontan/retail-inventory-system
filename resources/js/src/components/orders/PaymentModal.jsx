import React, { useState } from 'react';
import { CreditCard, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, order, onConfirm, loading }) => {
    const [method, setMethod] = useState('cash');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [confirming, setConfirming] = useState(false);

    if (!isOpen || !order) return null;

    const handleConfirm = async () => {
        if (method === 'gcash' && !referenceNumber.trim()) {
            toast.error('GCash reference number is required');
            return;
        }

        setConfirming(true);
        try {
            await onConfirm({
                method,
                reference_number: method === 'gcash' ? referenceNumber : '',
            });
            setReferenceNumber('');
            setMethod('cash');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm payment');
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <CreditCard className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">Complete Payment</p>
                            <p className="text-xs text-slate-500">Choose your payment method</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Amount Due */}
                <div className="px-6 py-5">
                    <div className="bg-indigo-50 rounded-xl p-5 text-center">
                        <span className="text-xs text-indigo-400 uppercase tracking-wide font-medium">Amount Due</span>
                        <p className="text-3xl font-bold text-indigo-700 mt-1">
                            ₱ {parseFloat(order.total_amount).toLocaleString('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </p>
                        <p className="text-xs text-indigo-400 mt-0.5">
                            Order #{String(order.order_id).padStart(6, '0')}
                        </p>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="px-6 py-5 space-y-3">
                    {/* Cash */}
                    <button
                        onClick={() => setMethod('cash')}
                        className={`w-full text-left rounded-xl p-4 transition-all border-2 ${
                            method === 'cash'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <p className={`font-medium text-sm ${method === 'cash' ? 'text-indigo-900' : 'text-slate-700'}`}>
                            💵 Cash
                        </p>
                        <p className={`text-xs mt-1 ${method === 'cash' ? 'text-indigo-500' : 'text-slate-400'}`}>
                            Cash on Delivery
                        </p>
                    </button>

                    {/* GCash */}
                    <button
                        onClick={() => setMethod('gcash')}
                        className={`w-full text-left rounded-xl p-4 transition-all border-2 ${
                            method === 'gcash'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <p className={`font-medium text-sm ${method === 'gcash' ? 'text-indigo-900' : 'text-slate-700'}`}>
                            📱 GCash
                        </p>
                        <p className={`text-xs mt-1 ${method === 'gcash' ? 'text-indigo-500' : 'text-slate-400'}`}>
                            Mobile payment
                        </p>
                    </button>

                    {/* GCash Reference Input */}
                    {method === 'gcash' && (
                        <div className="mt-4 animate-in slide-in-from-top fade-in">
                            <label className="text-sm font-medium text-slate-700 block mb-2">
                                GCash Reference Number
                            </label>
                            <input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="e.g. 1234567890"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 border-t border-slate-100 pt-5">
                    <button
                        onClick={handleConfirm}
                        disabled={confirming || (method === 'gcash' && !referenceNumber.trim())}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium h-12 rounded-lg transition-colors"
                    >
                        {confirming ? 'Processing...' : 'Confirm Payment'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full mt-2 text-slate-600 hover:text-slate-900 font-medium text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
