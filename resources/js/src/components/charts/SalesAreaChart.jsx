import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/**
 * SalesAreaChart — gradient area chart for sales trend.
 * Props: data (array of {date, revenue, count}), color, loading, height
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
            <p className="font-medium text-slate-900 mb-1">{label}</p>
            <p className="text-indigo-600">₱ {(payload[0]?.value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
            {payload[0]?.payload?.count !== undefined && (
                <p className="text-slate-500 text-xs mt-0.5">{payload[0].payload.count} transactions</p>
            )}
        </div>
    );
};

const SalesAreaChart = ({ data = [], color = '#4F46E5', loading, height = 300 }) => {
    if (loading) {
        return (
            <div className="w-full animate-pulse" style={{ height }}>
                <div className="w-full h-full bg-slate-50 rounded-xl" />
            </div>
        );
    }

    const formatYAxis = (v) => {
        if (v >= 1000) return `₱${(v / 1000).toFixed(1)}k`;
        if (v === 0) return '₱0';
        return `₱${v}`;
    };

    return (
        <div className="w-full" style={{ height }}>
            {data.length === 0 ? (
                <div className="flex items-center justify-center text-slate-400 text-sm h-full uppercase tracking-widest font-bold opacity-50">
                    No sales data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke={color}
                            strokeWidth={3}
                            fill="url(#colorRevenue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default SalesAreaChart;
