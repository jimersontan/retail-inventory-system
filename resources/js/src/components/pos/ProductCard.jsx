import React from 'react';
import { Package } from 'lucide-react';

const ProductCard = ({ product, inCartQty = 0, onAdd }) => {
    const qty = Number(product.quantity ?? product.total_stock ?? 0);
    const out = qty <= 0;

    return (
        <button
            type="button"
            disabled={out}
            onClick={() => onAdd(product)}
            className="relative text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-400 hover:shadow-md transition-all duration-150 disabled:opacity-70"
        >
            <div className="h-32 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <Package className="text-slate-200 w-8 h-8" />
                )}
                {out ? (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="bg-red-500 px-2 py-1 rounded text-white text-xs font-semibold">Out of Stock</span>
                    </div>
                ) : null}
                {inCartQty > 0 ? (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {inCartQty}
                    </span>
                ) : null}
            </div>
            <div className="p-3">
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                <p className="text-xs text-slate-400">{product.category?.category_name || 'Uncategorized'}</p>
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-indigo-700">₱ {Number(product.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    {qty > 10 ? (
                        <span className="text-xs text-slate-400">{qty} left</span>
                    ) : qty > 0 ? (
                        <span className="text-xs text-amber-600 font-medium">{qty} left</span>
                    ) : (
                        <span className="text-xs text-red-500 font-medium">Out of stock</span>
                    )}
                </div>
            </div>
        </button>
    );
};

export default ProductCard;

