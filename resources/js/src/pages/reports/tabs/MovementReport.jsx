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
        by_type = []
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

            {/* Movement by Type */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden">
                <h3 className="text-base font-semibold text-slate-900 mb-6">Movement by Type</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Type</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Count</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Total Quantity</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Products Affected</th>
                            </tr>
                        </thead>
                        <tbody>
                            {by_type.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-slate-500">
                                        No movement data available
                                    </td>
                                </tr>
                            ) : (
                                by_type.map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-3 text-slate-900 font-medium">{row.type}</td>
                                        <td className="py-3 px-3 text-slate-700">{row.count}</td>
                                        <td className="py-3 px-3 text-slate-900 font-semibold">{row.total_qty}</td>
                                        <td className="py-3 px-3 text-slate-700">{row.products_affected}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MovementReport;
