import React from 'react';

const BranchBarChart = ({ data = [], title = "Sales by Branch" }) => {
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

    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const barWidth = 100 / (data.length * 1.5);
    const chartHeight = 250;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6">{title}</h3>

            <div className="relative" style={{ height: `${chartHeight + 60}px` }}>
                <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((percent) => {
                        const value = (percent / 100) * maxRevenue;
                        const yPos = chartHeight - (percent / 100) * (chartHeight - 20);
                        return (
                            <g key={`grid-${percent}`}>
                                <line
                                    x1="60"
                                    y1={yPos}
                                    x2="100%"
                                    y2={yPos}
                                    stroke="#f1f5f9"
                                    strokeWidth="1"
                                />
                                <text
                                    x="50"
                                    y={yPos + 4}
                                    fontSize="10"
                                    fill="#94a3b8"
                                    textAnchor="end"
                                >
                                    ₱{(value / 1000).toFixed(0)}k
                                </text>
                            </g>
                        );
                    })}

                    {/* Y-axis */}
                    <line x1="60" y1="10" x2="60" y2={chartHeight} stroke="#cbd5e1" strokeWidth="1" />

                    {/* X-axis */}
                    <line x1="60" y1={chartHeight} x2="100%" y2={chartHeight} stroke="#cbd5e1" strokeWidth="1" />

                    {/* Bars */}
                    {data.map((item, idx) => {
                        const barHeight = (item.revenue / maxRevenue) * (chartHeight - 40);
                        const xPos = 80 + (idx / data.length) * 85;
                        const barX = xPos - barWidth / 2;

                        return (
                            <g key={`bar-${idx}`}>
                                <rect
                                    x={`${barX}%`}
                                    y={chartHeight - barHeight}
                                    width={`${barWidth}%`}
                                    height={barHeight}
                                    fill="#4F46E5"
                                    rx="4"
                                />
                                <text
                                    x={`${xPos}%`}
                                    y={chartHeight + 20}
                                    fontSize="12"
                                    fill="#64748b"
                                    textAnchor="middle"
                                >
                                    {item.branch.substring(0, 10)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4">
                {data.map((item, idx) => (
                    <div key={idx} className="text-xs">
                        <p className="text-slate-700 font-semibold">{item.branch}</p>
                        <p className="text-indigo-600 font-bold">
                            ₱ {item.revenue.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-slate-400">{item.count} transactions</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BranchBarChart;
