import React from 'react';
import { TrendingUp, TrendingDown, SlidersHorizontal, Package } from 'lucide-react';
import { useReportStore } from '../../../store/reportStore';
import ReportSummaryCard from '../../../components/reports/ReportSummaryCard';
import TrendLineChart from '../../../components/charts/TrendLineChart';

const MovementReport = () => {
    const { loading, movementData } = useReportStore();

    if (loading) {
        return <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />;
    }

    const {
        summary = {},
        over_time = [],
        by_type = [],
        full_list = {}
    } = movementData;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReportSummaryCard
                    label="Total Movements"
                    value={summary.total_movements || 0}
                    icon={Package}
                    iconBg="bg-indigo-100 text-indigo-600"
                    colored
                />
                <ReportSummaryCard
                    label="Stock In"
                    value={summary.total_in || 0}
                    icon={TrendingUp}
                    iconBg="bg-emerald-100 text-emerald-600"
                />
                <ReportSummaryCard
                    label="Stock Out"
                    value={summary.total_out || 0}
                    icon={TrendingDown}
                    iconBg="bg-red-100 text-red-600"
                />
                <ReportSummaryCard
                    label="Adjustments"
                    value={summary.adjustments || 0}
                    icon={SlidersHorizontal}
                    iconBg="bg-amber-100 text-amber-600"
                />
            </div>

            {/* Trend Chart */}
            <TrendLineChart data={over_time} title="Stock Movement Over Time" />

            {/* Movement Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Movement by Type */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden">
                    <h3 className="text-base font-semibold text-slate-900 mb-6">By Type</h3>
                    <div className="space-y-4">
                        {by_type.map((row, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase">{row.type}</p>
                                    <p className="text-[10px] text-slate-500">{row.count} movements</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">{row.total_qty}</p>
                                    <p className="text-[10px] text-slate-500">units</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Detailed Movements */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden">
                    <h3 className="text-base font-semibold text-slate-900 mb-6">Recent Details</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Product</th>
                                    <th className="text-left py-3 px-3 font-semibold text-slate-700 text-center">Qty</th>
                                    <th className="text-left py-3 px-3 font-semibold text-slate-700 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {full_list?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6 text-slate-500">No data</td>
                                    </tr>
                                ) : (
                                    full_list?.data?.slice(0, 10).map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-50">
                                            <td className="py-2 px-3">
                                                <p className="font-medium text-slate-900">{row.product_name}</p>
                                                <p className="text-[10px] text-slate-500">{row.type.toUpperCase()}</p>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                <span className={`font-bold ${row.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-right text-slate-500 text-xs">
                                                {new Date(row.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovementReport;
