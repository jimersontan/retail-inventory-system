import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const ListingCard = ({ listing, onEdit, onToggle, onDelete, editable = false }) => {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            {/* Product Info */}
            <div className="mb-3">
                <h4 className="text-sm font-semibold text-slate-900">{listing.product?.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">SKU: {listing.product?.unique_sku}</p>
            </div>

            {/* Price Info */}
            <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Base Price:</span>
                    <span className="text-slate-400">₱ {formatCurrency(listing.product?.price)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Your Price:</span>
                    <span className="text-slate-900 font-bold">₱ {formatCurrency(listing.listed_price)}</span>
                </div>
            </div>

            {/* Quantity & Status */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-xs text-slate-500">Qty:</p>
                    <p className="text-sm font-semibold text-slate-900">{listing.stock_qty} units</p>
                </div>
                <div>
                    {listing.is_available ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-xs font-medium text-emerald-700">Available</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 border border-red-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            <span className="text-xs font-medium text-red-700">Unavailable</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            {editable && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(listing)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-colors text-xs font-medium"
                    >
                        <Edit2 className="size-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(listing.seller_id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent text-red-600 hover:border-red-200 transition-colors text-xs font-medium"
                    >
                        <Trash2 className="size-3" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ListingCard;
