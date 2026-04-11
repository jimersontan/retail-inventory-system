import React from 'react';

const SKUBadge = ({ sku, className = '' }) => {
    if (!sku) return null;
    return (
        <span className={`font-mono text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded ${className}`}>
            {sku}
        </span>
    );
};

export default SKUBadge;
