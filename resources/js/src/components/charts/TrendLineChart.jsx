import React from 'react';

const TrendLineChart = ({ data = [], title = "Stock Trend" }) => {
    const chartWidth = 400;
    const chartHeight = 250;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const contentWidth = chartWidth - paddingLeft - paddingRight;

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
    const maxValue = Math.max(maxIn, maxOut, 1);

    const pointsIn = data
        .map((d, i) => {
            const x = paddingLeft + (i / (data.length - 1 || 1)) * contentWidth;
            const y = chartHeight - ((d.stock_in || 0) / maxValue) * (chartHeight - paddingTop);
            return `${x},${y}`;
        })
        .join(' ');

    const pointsOut = data
        .map((d, i) => {
            const x = paddingLeft + (i / (data.length - 1 || 1)) * contentWidth;
            const y = chartHeight - ((d.stock_out || 0) / maxValue) * (chartHeight - paddingTop);
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6">{title}</h3>

            <div className="relative overflow-hidden" style={{ height: `${chartHeight + 60}px` }}>
                <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} preserveAspectRatio="xMidYMid meet">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((percent) => {
                        const yPos = chartHeight - (percent / 100) * (chartHeight - paddingTop);
                        return (
                            <g key={`grid-${percent}`}>
                                <line
                                    x1={paddingLeft}
                                    y1={yPos}
                                    x2={chartWidth - paddingRight}
                                    y2={yPos}
                                    stroke="#f1f5f9"
                                    strokeWidth="1"
                                />
                                <text
                                    x={paddingLeft - 10}
                                    y={yPos + 4}
                                    fontSize="10"
                                    fill="#94a3b8"
                                    textAnchor="end"
                                >
                                    {((percent / 100) * maxValue).toFixed(0)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Axis */}
                    <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={chartHeight} stroke="#cbd5e1" strokeWidth="1" />
                    <line x1={paddingLeft} y1={chartHeight} x2={chartWidth - paddingRight} y2={chartHeight} stroke="#cbd5e1" strokeWidth="1" />

                    {/* Stock Out line (red) */}
                    <polyline
                        points={pointsOut}
                        stroke="#EF4444"
                        strokeWidth="2"
                        fill="none"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />

                    {/* Stock In line (green) */}
                    <polyline
                        points={pointsIn}
                        stroke="#10B981"
                        strokeWidth="2"
                        fill="none"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />

                    {/* Data points */}
                    {data.map((d, i) => {
                        const x = paddingLeft + (i / (data.length - 1 || 1)) * contentWidth;
                        const yIn = chartHeight - ((d.stock_in || 0) / maxValue) * (chartHeight - paddingTop);
                        const yOut = chartHeight - ((d.stock_out || 0) / maxValue) * (chartHeight - paddingTop);
                        return (
                            <g key={`points-${i}`}>
                                <circle cx={x} cy={yIn} r="3" fill="#10B981" stroke="white" strokeWidth="1.5" />
                                <circle cx={x} cy={yOut} r="3" fill="#EF4444" stroke="white" strokeWidth="1.5" />
                                <text x={x} y={chartHeight + 20} fontSize="10" fill="#64748b" textAnchor="middle">
                                    {d.date}
                                </text>
                            </g>
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
