import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * KPICard — dashboard metric card with trend indicator.
 * Props: label, value, trend, trendUp, icon, iconBg, iconColor, onClick, loading
 */
const KPICard = ({ label, value, trend, trendUp, icon: Icon, iconBg, iconColor, onClick, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                </div>
                <div className="w-20 h-3 bg-slate-200 rounded mb-2" />
                <div className="w-28 h-8 bg-slate-200 rounded" />
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl border border-slate-200 p-5 transition-all ${
                onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-sm' : ''
            }`}
        >
            <div className="flex items-center justify-between mb-3">
                {Icon && (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg || 'bg-indigo-50'}`}>
                        <Icon className={`w-6 h-6 ${iconColor || 'text-indigo-600'}`} />
                    </div>
                )}
                {trend !== undefined && trend !== null && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                        trendUp ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
    );
};

export default KPICard;
