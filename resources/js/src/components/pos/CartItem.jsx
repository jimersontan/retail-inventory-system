import React from 'react';
import { Minus, Package, Plus, X } from 'lucide-react';

const CartItem = ({ item, onMinus, onPlus, onRemove }) => {
    return (
        <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                    <Package className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-slate-400">₱ {Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onMinus}
                                disabled={item.qty <= 1}
                                className="w-7 h-7 bg-white border rounded-lg text-slate-600 hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                            >
                                <Minus className="w-4 h-4 mx-auto" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-slate-900">{item.qty}</span>
                            <button
                                type="button"
                                onClick={onPlus}
                                disabled={item.qty >= item.stock}
                                className="w-7 h-7 bg-white border rounded-lg text-slate-600 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4 mx-auto" />
                            </button>
                        </div>
                        <span className="text-sm font-bold text-indigo-700">
                            ₱ {(item.qty * item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
                <button type="button" onClick={onRemove} className="text-slate-300 hover:text-red-500">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CartItem;

