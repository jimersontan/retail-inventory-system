import React from 'react';

const BranchBarChart = ({ data = [], title = "Sales by Branch" }) => {
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

    const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
    const barSpacing = contentWidth / data.length;
    const barWidth = Math.min(barSpacing * 0.6, 40);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6">{title}</h3>

            <div className="relative overflow-hidden" style={{ height: `${chartHeight + 60}px` }}>
                <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} preserveAspectRatio="xMidYMid meet">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((percent) => {
                        const value = (percent / 100) * maxRevenue;
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
                                    ₱{(value / 1000).toFixed(1)}k
                                </text>
                            </g>
                        );
                    })}

                    {/* Axis */}
                    <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={chartHeight} stroke="#cbd5e1" strokeWidth="1" />
                    <line x1={paddingLeft} y1={chartHeight} x2={chartWidth - paddingRight} y2={chartHeight} stroke="#cbd5e1" strokeWidth="1" />

                    {/* Bars */}
                    {data.map((item, idx) => {
                        const barHeight = (item.revenue / maxRevenue) * (chartHeight - paddingTop);
                        const xPos = paddingLeft + (idx * barSpacing) + (barSpacing / 2);
                        const barX = xPos - (barWidth / 2);

                        return (
                            <g key={`bar-${idx}`}>
                                <rect
                                    x={barX}
                                    y={chartHeight - barHeight}
                                    width={barWidth}
                                    height={barHeight}
                                    fill="#4F46E5"
                                    rx="4"
                                />
                                <text
                                    x={xPos}
                                    y={chartHeight + 20}
                                    fontSize="10"
                                    fill="#64748b"
                                    textAnchor="middle"
                                >
                                    {item.branch.substring(0, 12)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-6 border-t border-slate-50 pt-4">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">{item.branch}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm text-slate-900 font-bold">
                                    ₱ {item.revenue.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    {item.count} txns
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BranchBarChart;
