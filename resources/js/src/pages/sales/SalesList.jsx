import React, { useEffect, useState } from 'react';
import { BarChart3, Banknote, Building2, Download, Eye, Smartphone, TrendingUp, CreditCard, Search } from 'lucide-react';
import { useSaleStore } from '../../store/saleStore';
import { useBranchStore } from '../../store/branchStore';
import SaleDetail from './SaleDetail';

const SalesList = () => {
    const { sales, stats, pagination, loading, fetchSales, fetchSale, currentSale } = useSaleStore();
    const { branches, fetchBranches } = useBranchStore();
    const [filters, setFilters] = useState({
        search: '',
        branch_id: '',
        date_from: '',
        date_to: '',
        payment_method: '',
    });
    const [openDetail, setOpenDetail] = useState(false);

    useEffect(() => {
        fetchBranches().catch(() => {});
    }, [fetchBranches]);

    useEffect(() => {
        fetchSales(filters).catch(() => {});
    }, [fetchSales, filters]);

    const money = (v) => Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });

    const paymentBadge = (method) => {
        const map = {
            cash: { cls: 'bg-emerald-50 text-emerald-700', Icon: Banknote },
            gcash: { cls: 'bg-blue-50 text-blue-700', Icon: Smartphone },
            card: { cls: 'bg-purple-50 text-purple-700', Icon: CreditCard },
        };
        const conf = map[method] || map.cash;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${conf.cls}`}>
                <conf.Icon className="w-3 h-3" /> {method || 'cash'}
            </span>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Sales History</h2>
                    <p className="text-sm text-slate-500">Track all transactions across branches</p>
                </div>
                <button type="button" className="h-10 px-4 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border p-4"><p className="text-xs text-slate-500">Today's Sales</p><p className="text-lg font-bold text-slate-900">{stats.todayCount}</p><p className="text-sm text-emerald-600">₱ {money(stats.todayTotal)}</p></div>
                <div className="bg-white rounded-xl border p-4"><p className="text-xs text-slate-500">This Week</p><p className="text-lg font-bold text-blue-700">₱ {money(stats.weekTotal)}</p><TrendingUp className="w-4 h-4 text-blue-500 mt-1" /></div>
                <div className="bg-white rounded-xl border p-4"><p className="text-xs text-slate-500">This Month</p><p className="text-lg font-bold text-indigo-700">₱ {money(stats.monthTotal)}</p><TrendingUp className="w-4 h-4 text-indigo-500 mt-1" /></div>
                <div className="bg-white rounded-xl border p-4"><p className="text-xs text-slate-500">Avg per Sale</p><p className="text-lg font-bold text-amber-700">₱ {money(stats.avgSale)}</p><BarChart3 className="w-4 h-4 text-amber-500 mt-1" /></div>
            </div>

            <div className="bg-white rounded-xl border p-4 mb-4 flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input className="h-10 w-full pl-9 border border-slate-200 rounded-lg text-sm" placeholder="Search sale ID or cashier..." value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
                </div>
                <select className="h-10 border border-slate-200 rounded-lg px-3 text-sm" value={filters.branch_id} onChange={(e) => setFilters((p) => ({ ...p, branch_id: e.target.value }))}>
                    <option value="">All Branches</option>
                    {branches.map((b) => <option key={b.branch_id} value={b.branch_id}>{b.name}</option>)}
                </select>
                <input type="date" className="h-10 border border-slate-200 rounded-lg px-3 text-sm" value={filters.date_from} onChange={(e) => setFilters((p) => ({ ...p, date_from: e.target.value }))} />
                <input type="date" className="h-10 border border-slate-200 rounded-lg px-3 text-sm" value={filters.date_to} onChange={(e) => setFilters((p) => ({ ...p, date_to: e.target.value }))} />
                <select className="h-10 border border-slate-200 rounded-lg px-3 text-sm" value={filters.payment_method} onChange={(e) => setFilters((p) => ({ ...p, payment_method: e.target.value }))}>
                    <option value="">All Payments</option>
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="card">Card</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Sale ID</th>
                                <th className="px-4 py-3 text-left">Cashier</th>
                                <th className="px-4 py-3 text-left">Branch</th>
                                <th className="px-4 py-3 text-left">Date & Time</th>
                                <th className="px-4 py-3 text-left">Items</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Payment</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? <tr><td className="p-6 text-sm text-slate-500" colSpan="8">Loading...</td></tr> : null}
                            {!loading && sales.length === 0 ? <tr><td className="p-6 text-sm text-slate-500" colSpan="8">No sales found.</td></tr> : null}
                            {sales.map((sale) => (
                                <tr key={sale.sale_id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3"><span className="font-mono text-xs bg-slate-50 px-2 py-1 rounded border">S-{sale.sale_id}</span></td>
                                    <td className="px-4 py-3 text-sm">{sale.employee?.user?.name || '-'}</td>
                                    <td className="px-4 py-3 text-sm"><span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3 text-slate-400" />{sale.branch?.name || '-'}</span></td>
                                    <td className="px-4 py-3 text-sm">{new Date(sale.sale_date).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                                    <td className="px-4 py-3 text-sm">{sale.items_count || 0} items</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">₱ {money(sale.sale_amount)}</td>
                                    <td className="px-4 py-3">{paymentBadge(sale.payment_method)}</td>
                                    <td className="px-4 py-3">
                                        <button type="button" className="p-1.5 rounded hover:bg-indigo-50 text-slate-500 hover:text-indigo-600" onClick={async () => { await fetchSale(sale.sale_id); setOpenDetail(true); }}>
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Page {pagination.currentPage} of {pagination.lastPage}</p>

            <SaleDetail open={openDetail} sale={currentSale} onClose={() => setOpenDetail(false)} />
        </div>
    );
};

export default SalesList;

