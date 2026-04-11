import React from 'react';

const StockBar = ({ qty, max }) => {
    const qtyNum = Number(qty) || 0;
    const maxNum = Number(max) || 100;

    let fillPct = (qtyNum / maxNum) * 100;
    if (fillPct > 100) fillPct = 100;
    
    let barColor = 'bg-emerald-400';
    let textColor = 'text-emerald-700';

    if (qtyNum === 0) {
        barColor = 'bg-red-400';
        textColor = 'text-red-700';
    } else if (qtyNum <= 10) {
        barColor = 'bg-amber-400';
        textColor = 'text-amber-700';
    } else if (fillPct <= 50) {
        barColor = 'bg-emerald-400';
        textColor = 'text-emerald-700';
    }

    return (
        <div className="w-full">
            <p className={`text-sm font-bold ${textColor}`}>{qtyNum}</p>
            <div className="w-24 h-2 rounded-full bg-slate-100 mt-1.5 overflow-hidden flex">
                <div 
                    className={`h-full rounded-full transition-all ${barColor}`} 
                    style={{ width: `${fillPct}%` }} 
                />
            </div>
        </div>
    );
};

export default StockBar;
