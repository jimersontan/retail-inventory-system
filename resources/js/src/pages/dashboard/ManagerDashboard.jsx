import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingCart, AlertTriangle, ClipboardList, Warehouse, BarChart3, CreditCard, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDashboardStore } from '../../store/dashboardStore';
import KPICard from '../../components/dashboard/KPICard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import SalesAreaChart from '../../components/charts/SalesAreaChart';
import RevenuePieChart from '../../components/charts/RevenuePieChart';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import api from '../../api/axios';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const { kpis, salesTrend, categoryRevenue, topProducts, lowStock, recentActivity, recentSales, loading, error, dateRange, setDateRange, initializeDashboard, fetchDashboard } = useDashboardStore();
    const [fromDate, setFromDate] = useState(dateRange.from);
    const [toDate, setToDate] = useState(dateRange.to);
    const [period, setPeriod] = useState('30D');
    const [activeModal, setActiveModal] = useState(null);

    // Stock adjust form
    const [adjustForm, setAdjustForm] = useState({ inventory_id: '', quantity: '', reason: 'count_correction', notes: '' });
    const [adjustLoading, setAdjustLoading] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);

    useEffect(() => { initializeDashboard(); }, []);
    useEffect(() => {
        if (activeModal === 'adjust_stock') {
            api.get('/inventory').then(r => setInventoryItems(r.data.data || r.data)).catch(() => {});
        }
    }, [activeModal]);

    const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
    const fmt = (v) => (v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleDateChange = () => { if (fromDate && toDate) { if (new Date(fromDate) > new Date(toDate)) { toast.error('Invalid date range'); return; } setDateRange(fromDate, toDate); toast.success('Dashboard refreshed'); }};
    const handlePeriod = (p) => { setPeriod(p); const to = new Date().toISOString().split('T')[0]; const days = p === '7D' ? 7 : p === '30D' ? 30 : 90; const from = new Date(Date.now() - days*86400000).toISOString().split('T')[0]; setFromDate(from); setToDate(to); setDateRange(from, to); };

    const handleAdjust = async () => {
        setAdjustLoading(true);
        try {
            await api.post('/adjustments', adjustForm);
            toast.success('Stock adjusted successfully!');
            setActiveModal(null);
            setAdjustForm({ inventory_id: '', quantity: '', reason: 'count_correction', notes: '' });
            fetchDashboard(dateRange.from, dateRange.to);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Adjustment failed');
        } finally { setAdjustLoading(false); }
    };

    if (error && !loading) {
        return (<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" /><h3 className="text-lg font-semibold text-red-700">Failed to load dashboard</h3><button onClick={() => fetchDashboard(dateRange.from, dateRange.to)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Retry</button></div>);
    }

    return (
        <div>
            {/* Header — branch-scoped greeting */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, Store Manager!</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Here's what's happening at Main Headquarters.</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <span className="text-slate-400">—</span>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button onClick={handleDateChange} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><RefreshCw className="w-4 h-4 text-slate-500" /></button>
                </div>
            </div>

            {/* KPI Cards — branch-scoped */}
            {loading ? <LoadingSkeleton type="card" count={4} /> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <KPICard label="Branch Revenue" value={`₱ ${fmt(kpis.branch_revenue)}`} icon={DollarSign} iconBg="bg-indigo-50" iconColor="text-indigo-600" onClick={() => setActiveModal('revenue_detail')} />
                    <KPICard label="Branch Sales" value={kpis.branch_sales || 0} icon={ShoppingCart} iconBg="bg-emerald-50" iconColor="text-emerald-600" onClick={() => setActiveModal('sales_detail')} />
                    <KPICard label="Low Stock" value={`${kpis.low_stock || 0} items`} icon={AlertTriangle} iconBg={kpis.low_stock > 0 ? 'bg-amber-50' : 'bg-slate-50'} iconColor={kpis.low_stock > 0 ? 'text-amber-500' : 'text-slate-400'} onClick={() => setActiveModal('low_stock_detail')} />
                    <KPICard label="Pending POs" value={kpis.pending_pos || 0} icon={ClipboardList} iconBg="bg-purple-50" iconColor="text-purple-600" onClick={() => setActiveModal('po_detail')} />
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-slate-900">Branch Sales</h3>
                            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                                {['7D','30D','90D'].map(p => (<button key={p} onClick={() => handlePeriod(p)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{p}</button>))}
                            </div>
                        </div>
                        <SalesAreaChart data={salesTrend} color="#4F46E5" loading={loading} />
                    </div>
                </div>
                <RevenuePieChart data={categoryRevenue} loading={loading} title="Branch Category Breakdown" />
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Recent Branch Sales */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Recent Branch Sales</h3>
                    <div className="space-y-2">
                        {(!recentSales || recentSales.length === 0) ? <p className="text-center py-6 text-slate-400 text-sm">No recent sales</p> :
                            recentSales.map(s => (
                                <div key={s.sale_id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => navigate('/pos')}>
                                    <div><p className="text-sm font-medium">Sale #{s.sale_id}</p><p className="text-xs text-slate-400">{s.cashier} · {s.date}</p></div>
                                    <span className="text-sm font-semibold text-indigo-600">₱ {fmt(s.amount)}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
                {/* Low Stock */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><h3 className="text-base font-semibold text-slate-900">Low Stock</h3></div>
                        <button onClick={() => setActiveModal('adjust_stock')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Adjust Stock →</button>
                    </div>
                    <div className="space-y-2">
                        {(!lowStock || lowStock.length === 0) ? <p className="text-center py-6 text-slate-400 text-sm">All stocked</p> :
                            lowStock.map(item => (
                                <div key={item.inventory_id} className={`p-3 rounded-xl border flex justify-between ${item.quantity <= 5 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <span className={`text-sm font-bold ${item.quantity <= 5 ? 'text-red-600' : 'text-amber-600'}`}>{item.quantity} left</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            <ActivityFeed activities={recentActivity} />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <button onClick={() => setActiveModal('adjust_stock')} className="bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl p-4 text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2"><Warehouse className="w-4 h-4" /> Adjust Stock</button>
                <button onClick={() => navigate('/purchase-orders/create')} className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Create PO</button>
                <button onClick={() => navigate('/reports')} className="bg-amber-50 text-amber-700 border border-amber-200 rounded-xl p-4 text-sm font-semibold hover:bg-amber-100 transition-colors flex items-center gap-2"><BarChart3 className="w-4 h-4" /> View Reports</button>
                <button onClick={() => navigate('/pos')} className="bg-purple-50 text-purple-700 border border-purple-200 rounded-xl p-4 text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center gap-2"><CreditCard className="w-4 h-4" /> Process Sale</button>
            </div>

            {/* Revenue Detail Modal */}
            <Modal isOpen={activeModal === 'revenue_detail'} onClose={() => setActiveModal(null)} title="Branch Revenue" icon={DollarSign} iconBg="bg-indigo-50" maxWidth="md" footer={<button onClick={() => { setActiveModal(null); navigate('/reports'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">View Full Report →</button>}>
                <div className="px-6 py-4 space-y-3">
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Branch Revenue (Period)</span><span className="text-sm font-semibold">₱ {fmt(kpis.branch_revenue)}</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Branch Sales Count</span><span className="text-sm font-semibold">{kpis.branch_sales || 0}</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Low Stock Items</span><span className="text-sm font-semibold text-amber-600">{kpis.low_stock || 0}</span></div>
                </div>
            </Modal>

            {/* Sales Detail Modal */}
            <Modal isOpen={activeModal === 'sales_detail'} onClose={() => setActiveModal(null)} title="Branch Sales" icon={ShoppingCart} iconBg="bg-emerald-50" maxWidth="md" footer={<button onClick={() => { setActiveModal(null); navigate('/pos'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">View Sales →</button>}>
                <div className="px-6 py-4">{recentSales?.map(s => (<div key={s.sale_id} className="flex justify-between p-2 border-b border-slate-100"><div><p className="text-sm font-medium">Sale #{s.sale_id}</p><p className="text-xs text-slate-400">{s.date}</p></div><span className="text-sm font-semibold text-indigo-600">₱ {fmt(s.amount)}</span></div>))}</div>
            </Modal>

            {/* Low Stock Detail Modal */}
            <Modal isOpen={activeModal === 'low_stock_detail'} onClose={() => setActiveModal(null)} title="Low Stock" icon={AlertTriangle} iconBg="bg-amber-50" maxWidth="md" footer={<button onClick={() => { setActiveModal(null); setActiveModal('adjust_stock'); }} className="px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700">Adjust Stock →</button>}>
                <div className="px-6 py-4">{lowStock?.map(item => (<div key={item.inventory_id} className="flex justify-between p-3 border-b border-slate-100"><span className="text-sm font-medium">{item.name}</span><span className={`text-sm font-bold ${item.quantity<=5?'text-red-600':'text-amber-600'}`}>{item.quantity}/{item.max_stock}</span></div>))}</div>
            </Modal>

            {/* PO Detail Modal */}
            <Modal isOpen={activeModal === 'po_detail'} onClose={() => setActiveModal(null)} title="Pending Purchase Orders" icon={ClipboardList} iconBg="bg-purple-50" maxWidth="md" footer={<button onClick={() => { setActiveModal(null); navigate('/purchase-orders'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">View All POs →</button>}>
                <div className="px-6 py-4"><p className="text-sm text-slate-500">{kpis.pending_pos || 0} pending purchase orders</p><button onClick={() => { setActiveModal(null); navigate('/purchase-orders'); }} className="mt-3 w-full py-2 text-center text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg">Manage POs →</button></div>
            </Modal>

            {/* Adjust Stock Modal */}
            <Modal isOpen={activeModal === 'adjust_stock'} onClose={() => setActiveModal(null)} title="Adjust Stock" icon={Warehouse} iconBg="bg-indigo-50" maxWidth="md" footer={<button onClick={handleAdjust} disabled={adjustLoading} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70">{adjustLoading && <Loader2 className="w-4 h-4 animate-spin" />} Apply Adjustment</button>}>
                <div className="px-6 py-4 space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Product</label><select value={adjustForm.inventory_id} onChange={e=>setAdjustForm({...adjustForm, inventory_id:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Select product</option>{(Array.isArray(inventoryItems) ? inventoryItems : []).map(i=>(<option key={i.inventory_id} value={i.inventory_id}>{i.product?.name || `Product #${i.product_id}`} (Qty: {i.quantity})</option>))}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Quantity (+/-)</label><input type="number" value={adjustForm.quantity} onChange={e=>setAdjustForm({...adjustForm, quantity:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter positive or negative number" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Reason</label><select value={adjustForm.reason} onChange={e=>setAdjustForm({...adjustForm, reason:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="count_correction">Count Correction</option><option value="damaged">Damaged</option><option value="theft">Theft</option><option value="expired">Expired</option><option value="transfer">Transfer</option></select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label><textarea value={adjustForm.notes} onChange={e=>setAdjustForm({...adjustForm, notes:e.target.value})} rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                </div>
            </Modal>
        </div>
    );
};

export default ManagerDashboard;
