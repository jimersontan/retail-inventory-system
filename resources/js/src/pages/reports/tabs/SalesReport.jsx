import React from 'react';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { useReportStore } from '../../../store/reportStore';
import ReportSummaryCard from '../../../components/reports/ReportSummaryCard';
import BranchBarChart from '../../../components/charts/BranchBarChart';
import RevenuePieChart from '../../../components/charts/RevenuePieChart';

const SalesReport = () => {
    const { loading, salesData } = useReportStore();

    if (loading) {
        return <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />;
    }

    const {
        summary = {},
        by_branch = [],
        by_day = {},
        by_payment = []
    } = salesData;

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReportSummaryCard
                    label="Total Revenue"
                    value={`₱ ${formatCurrency(summary.total_revenue)}`}
                    icon={DollarSign}
                    iconBg="bg-indigo-100 text-indigo-600"
                    colored
                />
                <ReportSummaryCard
                    label="Total Transactions"
                    value={summary.total_transactions || 0}
                    icon={Users}
                    iconBg="bg-emerald-100 text-emerald-600"
                />
                <ReportSummaryCard
                    label="Avg Sale Value"
                    value={`₱ ${formatCurrency(summary.avg_sale)}`}
                    icon={TrendingUp}
                    iconBg="bg-amber-100 text-amber-600"
                />
                <ReportSummaryCard
                    label="Total Items Sold"
                    value={summary.total_items_sold || 0}
                    icon={Users}
                    iconBg="bg-purple-100 text-purple-600"
                />
            </div>

            {/* Sales by Branch */}
            <BranchBarChart data={by_branch} title="Sales by Branch" />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Breakdown Table */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden">
                    <h3 className="text-base font-semibold text-slate-900 mb-6">Daily Breakdown</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Date</th>
                                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Transactions</th>
                                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {by_day?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6 text-slate-500">
                                            No data available
                                        </td>
                                    </tr>
                                ) : (
                                    by_day?.data?.map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-3 text-slate-700">{row.date}</td>
                                            <td className="py-3 px-3 text-slate-700">{row.transactions}</td>
                                            <td className="py-3 px-3 text-slate-900 font-semibold">
                                                ₱ {formatCurrency(row.revenue)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {by_day?.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-slate-200">
                            <button className="px-3 py-1 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">
                                ← Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-slate-600">
                                Page {by_day?.current_page} of {by_day?.last_page}
                            </span>
                            <button className="px-3 py-1 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">
                                Next →
                            </button>
                        </div>
                    )}
                </div>

                {/* Payment Methods */}
                <RevenuePieChart data={by_payment} />
            </div>
        </div>
    );
};

export default SalesReport;
