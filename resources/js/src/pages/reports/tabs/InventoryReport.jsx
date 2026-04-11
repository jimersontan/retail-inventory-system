import React from 'react';
import { Package, AlertTriangle, BoxIcon, TrendingDown } from 'lucide-react';
import { useReportStore } from '../../../store/reportStore';
import ReportSummaryCard from '../../../components/reports/ReportSummaryCard';
import BranchBarChart from '../../../components/charts/BranchBarChart';

const InventoryReport = () => {
    const { loading, inventoryData } = useReportStore();

    if (loading) {
        return <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />;
    }

    const {
        summary = {},
        by_category = [],
        full_list = {}
    } = inventoryData;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReportSummaryCard
                    label="Total SKUs"
                    value={summary.total_skus || 0}
                    icon={Package}
                    iconBg="bg-indigo-100 text-indigo-600"
                    colored
                />
                <ReportSummaryCard
                    label="Total Units"
                    value={summary.total_units || 0}
                    icon={BoxIcon}
                    iconBg="bg-emerald-100 text-emerald-600"
                />
                <ReportSummaryCard
                    label="Low Stock"
                    value={summary.low_stock || 0}
                    icon={AlertTriangle}
                    iconBg="bg-amber-100 text-amber-600"
                />
                <ReportSummaryCard
                    label="Out of Stock"
                    value={summary.out_of_stock || 0}
                    icon={TrendingDown}
                    iconBg="bg-red-100 text-red-600"
                />
            </div>

            {/* By Category */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-6">Inventory by Category</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Category</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">In Stock</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Low Stock</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Out of Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {by_category.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-slate-500">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                by_category.map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-3 text-slate-700 font-medium">{row.category}</td>
                                        <td className="py-3 px-3 text-emerald-600">{row.in_stock}</td>
                                        <td className="py-3 px-3 text-amber-600">{row.low_stock}</td>
                                        <td className="py-3 px-3 text-red-600">{row.out_of_stock}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Full Inventory List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden">
                <h3 className="text-base font-semibold text-slate-900 mb-6">Full Inventory</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Product</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">SKU</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Category</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Branch</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Qty</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Max</th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {full_list?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-6 text-slate-500">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                full_list?.data?.map((row, idx) => {
                                    const statusColor = row.status === 'out_of_stock'
                                        ? 'text-red-600 bg-red-50'
                                        : row.status === 'low_stock'
                                        ? 'text-amber-600 bg-amber-50'
                                        : 'text-emerald-600 bg-emerald-50';

                                    return (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-3 text-slate-700 font-medium">{row.name}</td>
                                            <td className="py-3 px-3 text-slate-500 text-xs">{row.unique_sku}</td>
                                            <td className="py-3 px-3 text-slate-700">{row.category_name}</td>
                                            <td className="py-3 px-3 text-slate-700">{row.branch}</td>
                                            <td className="py-3 px-3 text-slate-900 font-semibold">{row.quantity}</td>
                                            <td className="py-3 px-3 text-slate-700">{row.max_stock}</td>
                                            <td className="py-3 px-3">
                                                <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-full ${statusColor}`}>
                                                    {row.status === 'out_of_stock' ? 'Out of Stock' : row.status === 'low_stock' ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {full_list?.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-slate-200">
                        <button className="px-3 py-1 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">
                            ← Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-slate-600">
                            Page {full_list?.current_page} of {full_list?.last_page}
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

export default InventoryReport;
