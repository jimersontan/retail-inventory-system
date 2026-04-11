import React from 'react';
import { Truck, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useReportStore } from '../../../store/reportStore';
import ReportSummaryCard from '../../../components/reports/ReportSummaryCard';
import RevenuePieChart from '../../../components/charts/RevenuePieChart';

const PurchaseReport = () => {
    const { loading, purchaseData } = useReportStore();

    if (loading) {
        return <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />;
    }

    const {
        summary = {},
        by_status = [],
        po_list = {}
    } = purchaseData;

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReportSummaryCard
                    label="Total POs"
                    value={summary.total_pos || 0}
                    icon={Truck}
                    iconBg="bg-indigo-100 text-indigo-600"
                    colored
                />
                <ReportSummaryCard
                    label="Total Amount"
                    value={`₱ ${formatCurrency(summary.total_amount)}`}
                    icon={DollarSign}
                    iconBg="bg-emerald-100 text-emerald-600"
                />
                <ReportSummaryCard
                    label="Completed"
                    value={summary.completed_pos || 0}
                    icon={CheckCircle}
                    iconBg="bg-green-100 text-green-600"
                />
                <ReportSummaryCard
                    label="Pending"
                    value={summary.pending_pos || 0}
                    icon={Clock}
                    iconBg="bg-amber-100 text-amber-600"
                />
            </div>

            {/* Status Breakdown */}
            <RevenuePieChart data={by_status} />

            {/* PO List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden">
                <h3 className="text-base font-semibold text-slate-900 mb-6">Purchase Orders</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">PO #</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Branch</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Date</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Items</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Amount</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {po_list?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-slate-500">
                                        No purchase orders found
                                    </td>
                                </tr>
                            ) : (
                                po_list?.data?.map((row, idx) => {
                                    const statusColor = row.status === 'completed'
                                        ? 'text-emerald-600 bg-emerald-50'
                                        : row.status === 'pending'
                                        ? 'text-amber-600 bg-amber-50'
                                        : 'text-red-600 bg-red-50';

                                    return (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-3 text-slate-900 font-semibold">PO-{row.po_id}</td>
                                            <td className="py-3 px-3 text-slate-700">{row.branch}</td>
                                            <td className="py-3 px-3 text-slate-700">{new Date(row.order_date).toLocaleDateString()}</td>
                                            <td className="py-3 px-3 text-slate-700">{row.item_count}</td>
                                            <td className="py-3 px-3 text-slate-900 font-semibold">
                                                ₱ {formatCurrency(row.total_amount)}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-full ${statusColor}`}>
                                                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {po_list?.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-slate-200">
                        <button className="px-3 py-1 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">
                            ← Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-slate-600">
                            Page {po_list?.current_page} of {po_list?.last_page}
                        </span>
                        <button className="px-3 py-1 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseReport;
