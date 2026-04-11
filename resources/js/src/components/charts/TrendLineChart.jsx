import React from 'react';

const TrendLineChart = ({ data = [], title = "Stock Trend" }) => {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-6">{title}</h3>
                <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
                    <p className="text-slate-500">No data available</p>
                </div>
            </div>
        );
    }

    const maxIn = Math.max(...data.map(d => d.stock_in || 0));
    const maxOut = Math.max(...data.map(d => d.stock_out || 0));
    const maxValue = Math.max(maxIn, maxOut) || 1;
    const chartHeight = 250;

    const pointsIn = data
        .map((d, i) => {
            const x = 60 + (i / (data.length - 1 || 1)) * 90;
            const y = chartHeight - ((d.stock_in || 0) / maxValue) * (chartHeight - 40);
            return `${x},${y}`;
        })
        .join(' ');

    const pointsOut = data
        .map((d, i) => {
            const x = 60 + (i / (data.length - 1 || 1)) * 90;
            const y = chartHeight - ((d.stock_out || 0) / maxValue) * (chartHeight - 40);
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6">{title}</h3>

            <div className="relative" style={{ height: `${chartHeight + 60}px` }}>
                <svg className="w-full h-full" style={{ overflow: 'visible' }} viewBox={`0 0 100 ${chartHeight}`}>
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((percent) => (
                        <line
                            key={`grid-${percent}`}
                            x1="60"
                            y1={chartHeight - (percent / 100) * (chartHeight - 40)}
                            x2="150"
                            y2={chartHeight - (percent / 100) * (chartHeight - 40)}
                            stroke="#f1f5f9"
                            strokeWidth="0.2"
                        />
                    ))}

                    {/* Y-axis */}
                    <line x1="60" y1="10" x2="60" y2={chartHeight} stroke="#cbd5e1" strokeWidth="0.5" />

                    {/* X-axis */}
                    <line x1="60" y1={chartHeight} x2="150" y2={chartHeight} stroke="#cbd5e1" strokeWidth="0.5" />

                    {/* Stock Out line (red) */}
                    <polyline
                        points={pointsOut}
                        stroke="#EF4444"
                        strokeWidth="1"
                        fill="none"
                    />

                    {/* Stock In line (green) */}
                    <polyline
                        points={pointsIn}
                        stroke="#10B981"
                        strokeWidth="1"
                        fill="none"
                    />

                    {/* Data points for Stock In */}
                    {data.map((d, i) => {
                        const x = 60 + (i / (data.length - 1 || 1)) * 90;
                        const y = chartHeight - ((d.stock_in || 0) / maxValue) * (chartHeight - 40);
                        return (
                            <circle
                                key={`in-${i}`}
                                cx={x}
                                cy={y}
                                r="0.8"
                                fill="#10B981"
                                stroke="white"
                                strokeWidth="0.2"
                            />
                        );
                    })}

                    {/* Data points for Stock Out */}
                    {data.map((d, i) => {
                        const x = 60 + (i / (data.length - 1 || 1)) * 90;
                        const y = chartHeight - ((d.stock_out || 0) / maxValue) * (chartHeight - 40);
                        return (
                            <circle
                                key={`out-${i}`}
                                cx={x}
                                cy={y}
                                r="0.8"
                                fill="#EF4444"
                                stroke="white"
                                strokeWidth="0.2"
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-sm text-slate-700">Stock In</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <span className="text-sm text-slate-700">Stock Out</span>
                </div>
            </div>
        </div>
    );
};

export default TrendLineChart;
