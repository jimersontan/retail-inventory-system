import React from 'react';

const StockBar = ({ qty, max }) => {
    const qtyNum = Number(qty) || 0;
    const maxNum = Number(max) || 100;
    
    let pct = (qtyNum / maxNum) * 100;
    if (pct > 100) pct = 100;

    let barColor = 'bg-emerald-400';
    let textColor = 'text-emerald-700';
    
    if (pct <= 50 && pct > 10) {
        barColor = 'bg-amber-400';
        textColor = 'text-amber-700';
    } else if (pct <= 10) {
        barColor = 'bg-red-400';
        textColor = 'text-red-700';
    }

    return (
        <div className="w-full">
            <p className={`font-medium text-sm ${textColor}`}>{qtyNum}</p>
            <div className="w-16 h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden flex">
                <div 
                    className={`h-full rounded-full transition-all ${barColor}`} 
                    style={{ width: `${pct}%` }} 
                />
            </div>
        </div>
    );
};

export default StockBar;
