import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

/**
 * RevenuePieChart — donut pie chart for category/payment revenue.
 * Props: data (array of {category|name, revenue|value, color?}), loading, title
 */
const RevenuePieChart = ({ data = [], loading, title = 'Revenue by Category' }) => {
    if (loading) {
        return (
            <div className="w-full h-[220px] animate-pulse flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-slate-50" />
            </div>
        );
    }

    // Normalize data shape
    const chartData = data.map((item, idx) => ({
        name: item.status || item.category || item.name || item.method || `Item ${idx + 1}`,
        value: parseFloat(item.revenue || item.value || item.count || 0),
        color: item.color || COLORS[idx % COLORS.length],
    }));

    const total = chartData.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="w-full">
            {chartData.length === 0 ? (
                <div className="flex items-center justify-center text-slate-400 text-sm h-[220px] uppercase tracking-widest font-bold opacity-50">
                    No data available
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
                    {/* Donut Chart */}
                    <div className="w-[180px] h-[180px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {chartData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 w-full space-y-3">
                        {chartData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-slate-600 font-medium truncate text-xs group-hover:text-slate-900 transition-colors uppercase tracking-tight">{item.name}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-slate-900 text-xs font-bold leading-none">
                                        {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">₱{item.value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenuePieChart;
