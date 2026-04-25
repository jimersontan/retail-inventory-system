import React from 'react';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';

const methods = [
    { id: 'cash', label: 'Cash', Icon: Banknote, icon: 'text-emerald-500' },
    { id: 'gcash', label: 'GCash', Icon: Smartphone, icon: 'text-blue-500' },
];

const PaymentMethodSelector = ({ value, onChange }) => {
    return (
        <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
                {methods.map((method) => (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => onChange(method.id)}
                        className={`rounded-xl p-3 text-center transition-all ${
                            value === method.id
                                ? 'border-2 border-indigo-500 bg-indigo-50'
                                : 'border border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                    >
                        <method.Icon className={`w-5 h-5 mx-auto ${method.icon}`} />
                        <p className={`text-xs font-medium mt-1 ${value === method.id ? 'text-indigo-700' : 'text-slate-600'}`}>
                            {method.label}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;

