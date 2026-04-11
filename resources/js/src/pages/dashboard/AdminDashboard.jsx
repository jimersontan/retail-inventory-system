import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, ShoppingCart, AlertTriangle, ClipboardList,
    TrendingUp, Users, Package, BarChart3, ArrowRight,
    Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDashboardStore } from '../../store/dashboardStore';
import KPICard from '../../components/dashboard/KPICard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import SalesAreaChart from '../../components/charts/SalesAreaChart';
import RevenuePieChart from '../../components/charts/RevenuePieChart';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import api from '../../api/axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const {
        kpis, salesTrend, categoryRevenue, topProducts, lowStock,
        recentActivity, recentSales, loading, error, dateRange,
        setDateRange, initializeDashboard, fetchDashboard,
    } = useDashboardStore();

    const [fromDate, setFromDate] = useState(dateRange.from);
    const [toDate, setToDate] = useState(dateRange.to);
    const [period, setPeriod] = useState('30D');
    const [activeModal, setActiveModal] = useState(null);

    // Add Employee form state
    const [empForm, setEmpForm] = useState({ name:'', email:'', password:'', confirm_password:'', phone:'', address:'', user_type:'cashier', branch_id:'', role_id:'', position:'', hire_date:'', salary:'', date_of_birth:'', gender:'male', phone_no:'', zip:'' });
    const [empErrors, setEmpErrors] = useState({});
    const [empLoading, setEmpLoading] = useState(false);
    const [empStep, setEmpStep] = useState(1);
    const [branches, setBranches] = useState([]);
    const [roles, setRoles] = useState([]);

    // Add Product form state
    const [prodForm, setProdForm] = useState({ name:'', category_id:'', unit:'pcs', status:'available', flavor_option:'', price:'', cost_price:'' });
    const [prodErrors, setProdErrors] = useState({});
    const [prodLoading, setProdLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => { initializeDashboard(); }, []);

    // Fetch dependent data when employee modal opens
    useEffect(() => {
        if (activeModal === 'add_employee') {
            api.get('/branches').then(r => setBranches(r.data.data || r.data)).catch(() => {});
            api.get('/roles').then(r => setRoles(r.data.data || r.data)).catch(() => {});
        }
        if (activeModal === 'add_product') {
            api.get('/categories').then(r => setCategories(r.data.data || r.data)).catch(() => {});
        }
    }, [activeModal]);

    const getGreeting = () => {
        const h = new Date().getHours();
        return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    };

    const fmt = (v) => (v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleDateChange = () => {
        if (fromDate && toDate) {
            if (new Date(fromDate) > new Date(toDate)) { toast.error('From date cannot be after To date'); return; }
            setDateRange(fromDate, toDate);
            toast.success('Dashboard refreshed');
        }
    };

    const handlePeriod = (p) => {
        setPeriod(p);
        const to = new Date().toISOString().split('T')[0];
        const days = p === '7D' ? 7 : p === '30D' ? 30 : 90;
        const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
        setFromDate(from); setToDate(to);
        setDateRange(from, to);
    };

    // Employee submit
    const handleEmpSubmit = async () => {
        setEmpLoading(true); setEmpErrors({});
        try {
            await api.post('/employees', empForm);
            toast.success('Employee created successfully!');
            setActiveModal(null); setEmpStep(1);
            setEmpForm({ name:'', email:'', password:'', confirm_password:'', phone:'', address:'', user_type:'cashier', branch_id:'', role_id:'', position:'', hire_date:'', salary:'', date_of_birth:'', gender:'male', phone_no:'', zip:'' });
            fetchDashboard(dateRange.from, dateRange.to);
        } catch (err) {
            if (err.response?.status === 422) setEmpErrors(err.response.data.errors || {});
            else toast.error('Failed to create employee.');
        } finally { setEmpLoading(false); }
    };

    // Product submit
    const handleProdSubmit = async () => {
        setProdLoading(true); setProdErrors({});
        try {
            await api.post('/products', prodForm);
            toast.success('Product created successfully!');
            setActiveModal(null);
            setProdForm({ name:'', category_id:'', unit:'pcs', status:'available', flavor_option:'', price:'', cost_price:'' });
            fetchDashboard(dateRange.from, dateRange.to);
        } catch (err) {
            if (err.response?.status === 422) setProdErrors(err.response.data.errors || {});
            else toast.error('Failed to create product.');
        } finally { setProdLoading(false); }
    };

    // Error state
    if (error && !loading) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-red-700">Failed to load dashboard</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button onClick={() => fetchDashboard(dateRange.from, dateRange.to)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, System Administrator!</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Here's what's happening across all branches today.</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <span className="text-slate-400">—</span>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button onClick={handleDateChange} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors" title="Refresh">
                        <RefreshCw className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            {loading ? <LoadingSkeleton type="card" count={4} /> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <KPICard label="Today's Revenue" value={`₱ ${fmt(kpis.today_revenue)}`} icon={DollarSign} iconBg="bg-indigo-50" iconColor="text-indigo-600" trend={kpis.today_revenue_trend} trendUp={kpis.today_revenue_trend >= 0} onClick={() => setActiveModal('revenue_detail')} />
                    <KPICard label="Total Sales" value={kpis.total_sales || 0} icon={ShoppingCart} iconBg="bg-emerald-50" iconColor="text-emerald-600" trend={kpis.sales_trend} trendUp={kpis.sales_trend >= 0} onClick={() => setActiveModal('sales_detail')} />
                    <KPICard label="Low Stock Items" value={`${kpis.low_stock || 0} items`} icon={AlertTriangle} iconBg={kpis.low_stock > 0 ? 'bg-amber-50' : 'bg-slate-50'} iconColor={kpis.low_stock > 0 ? 'text-amber-500' : 'text-slate-400'} onClick={() => setActiveModal('low_stock_detail')} />
                    <KPICard label="Pending Orders" value={kpis.pending_orders || 0} icon={ClipboardList} iconBg="bg-purple-50" iconColor="text-purple-600" onClick={() => setActiveModal('orders_detail')} />
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-slate-900">Sales Overview</h3>
                            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                                {['7D', '30D', '90D'].map((p) => (
                                    <button key={p} onClick={() => handlePeriod(p)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <SalesAreaChart data={salesTrend} color="#4F46E5" loading={loading} />
                    </div>
                </div>
                <RevenuePieChart data={categoryRevenue} loading={loading} />
            </div>

            {/* Products & Stock Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Top Selling Products</h3>
                        <button onClick={() => navigate('/reports')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All →</button>
                    </div>
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-3 font-semibold text-slate-700">#</th>
                            <th className="text-left py-2 px-3 font-semibold text-slate-700">Product</th>
                            <th className="text-left py-2 px-3 font-semibold text-slate-700">Units</th>
                            <th className="text-left py-2 px-3 font-semibold text-slate-700">Revenue</th>
                        </tr></thead>
                        <tbody>
                            {(!topProducts || topProducts.length === 0) ? (
                                <tr><td colSpan="4" className="text-center py-6 text-slate-400">No sales data</td></tr>
                            ) : topProducts.map((p) => (
                                <tr key={p.product_id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/products/${p.product_id}`)}>
                                    <td className="py-3 px-3"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${p.rank === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{p.rank}</span></td>
                                    <td className="py-3 px-3"><p className="text-sm font-semibold text-slate-900">{p.name}</p><p className="text-xs text-slate-400 font-mono">{p.sku}</p></td>
                                    <td className="py-3 px-3 text-slate-700">{p.quantity} units</td>
                                    <td className="py-3 px-3 font-semibold text-indigo-700">₱ {fmt(p.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <h3 className="text-base font-semibold text-slate-900">Low Stock Alerts</h3>
                            <span className="bg-amber-100 text-amber-700 rounded-full px-2 text-xs font-bold">{lowStock?.length || 0}</span>
                        </div>
                        <button onClick={() => navigate('/inventory')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Adjust Stock →</button>
                    </div>
                    <div className="space-y-2">
                        {(!lowStock || lowStock.length === 0) ? (
                            <p className="text-center py-6 text-slate-400 text-sm">All items well-stocked</p>
                        ) : lowStock.map((item) => {
                            const sc = item.quantity === 0 ? { bg:'bg-red-50', border:'border-red-200', text:'text-red-700' } : item.quantity <= 5 ? { bg:'bg-orange-50', border:'border-orange-200', text:'text-orange-700' } : { bg:'bg-amber-50', border:'border-amber-200', text:'text-amber-700' };
                            return (
                                <div key={item.inventory_id} className={`p-3 rounded-xl border flex items-center justify-between ${sc.bg} ${sc.border}`}>
                                    <div><p className={`text-sm font-semibold ${sc.text}`}>{item.name}</p><p className="text-xs text-slate-500">{item.branch}</p></div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${sc.text}`}>{item.quantity} left</span>
                                        <button onClick={() => navigate('/purchase-orders/create')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Reorder</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed activities={recentActivity} />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <button onClick={() => setActiveModal('add_employee')} className="bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl p-4 text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2">
                    <Users className="w-4 h-4" /> + Add Employee
                </button>
                <button onClick={() => setActiveModal('add_product')} className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-2">
                    <Package className="w-4 h-4" /> + Add Product
                </button>
                <button onClick={() => navigate('/purchase-orders/create')} className="bg-amber-50 text-amber-700 border border-amber-200 rounded-xl p-4 text-sm font-semibold hover:bg-amber-100 transition-colors flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Create PO
                </button>
                <button onClick={() => navigate('/reports')} className="bg-purple-50 text-purple-700 border border-purple-200 rounded-xl p-4 text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> View Reports
                </button>
            </div>

            {/* ═══ MODALS ═══ */}

            {/* Revenue Detail Modal */}
            <Modal isOpen={activeModal === 'revenue_detail'} onClose={() => setActiveModal(null)} title="Revenue Details" icon={DollarSign} iconBg="bg-indigo-50" maxWidth="md"
                footer={<button onClick={() => { setActiveModal(null); navigate('/reports'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">View Full Report →</button>}>
                <div className="px-6 py-4 space-y-3">
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Today's Revenue</span><span className="text-sm font-semibold">₱ {fmt(kpis.today_revenue)}</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Revenue Trend</span><span className={`text-sm font-semibold ${kpis.today_revenue_trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{kpis.today_revenue_trend >= 0 ? '+' : ''}{kpis.today_revenue_trend}%</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Total Sales (Period)</span><span className="text-sm font-semibold">{kpis.total_sales || 0} sales</span></div>
                </div>
            </Modal>

            {/* Sales Detail Modal */}
            <Modal isOpen={activeModal === 'sales_detail'} onClose={() => setActiveModal(null)} title="Sales Breakdown" icon={ShoppingCart} iconBg="bg-emerald-50" maxWidth="md"
                footer={<button onClick={() => { setActiveModal(null); navigate('/pos'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">View All Sales →</button>}>
                <div className="px-6 py-4">
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg mb-2"><span className="text-sm text-slate-600">Total Sales</span><span className="text-sm font-semibold">{kpis.total_sales || 0}</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg mb-2"><span className="text-sm text-slate-600">Pending Orders</span><span className="text-sm font-semibold text-amber-600">{kpis.pending_orders || 0}</span></div>
                    <h4 className="text-sm font-semibold text-slate-700 mt-4 mb-2">Recent Sales</h4>
                    {recentSales?.map((s) => (
                        <div key={s.sale_id} className="flex justify-between items-center p-2 border-b border-slate-100 last:border-0">
                            <div><p className="text-sm font-medium">Sale #{s.sale_id}</p><p className="text-xs text-slate-400">{s.date}</p></div>
                            <span className="text-sm font-semibold text-indigo-600">₱ {fmt(s.amount)}</span>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Low Stock Detail Modal */}
            <Modal isOpen={activeModal === 'low_stock_detail'} onClose={() => setActiveModal(null)} title="Low Stock Items" icon={AlertTriangle} iconBg="bg-amber-50" maxWidth="lg"
                footer={<button onClick={() => { setActiveModal(null); navigate('/inventory'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">Manage Inventory →</button>}>
                <div className="px-6 py-4">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-200"><th className="text-left py-2 px-2">Product</th><th className="text-left py-2 px-2">Branch</th><th className="text-left py-2 px-2">Qty</th><th className="text-left py-2 px-2">Max</th><th className="py-2 px-2">Action</th></tr></thead>
                        <tbody>{lowStock?.map((item) => (
                            <tr key={item.inventory_id} className="border-b border-slate-100">
                                <td className="py-2 px-2 font-medium">{item.name}</td><td className="py-2 px-2 text-slate-500">{item.branch}</td>
                                <td className="py-2 px-2"><span className={`font-bold ${item.quantity <= 5 ? 'text-red-600' : 'text-amber-600'}`}>{item.quantity}</span></td>
                                <td className="py-2 px-2 text-slate-400">{item.max_stock}</td>
                                <td className="py-2 px-2"><button onClick={() => { setActiveModal(null); navigate(`/purchase-orders/create?product_id=${item.product_id}`); }} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Create PO</button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </Modal>

            {/* Pending Orders Modal */}
            <Modal isOpen={activeModal === 'orders_detail'} onClose={() => setActiveModal(null)} title="Pending Orders" icon={ClipboardList} iconBg="bg-purple-50" maxWidth="md"
                footer={<button onClick={() => { setActiveModal(null); navigate('/orders/manage'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">Manage Orders →</button>}>
                <div className="px-6 py-4">
                    <p className="text-sm text-slate-500 mb-3">{kpis.pending_orders || 0} orders awaiting action</p>
                    <button onClick={() => { setActiveModal(null); navigate('/orders/manage'); }} className="w-full py-2 text-center text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">View All Orders →</button>
                </div>
            </Modal>

            {/* Add Employee Modal — 3-step form */}
            <Modal isOpen={activeModal === 'add_employee'} onClose={() => { setActiveModal(null); setEmpStep(1); }} title="Add Employee" icon={Users} iconBg="bg-indigo-50" maxWidth="xl"
                footer={<>
                    {empStep > 1 && <button onClick={() => setEmpStep(empStep - 1)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50">Back</button>}
                    {empStep < 3 ? (
                        <button onClick={() => setEmpStep(empStep + 1)} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">Next</button>
                    ) : (
                        <button onClick={handleEmpSubmit} disabled={empLoading} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70">
                            {empLoading && <Loader2 className="w-4 h-4 animate-spin" />} Create Employee
                        </button>
                    )}
                </>}>
                <div className="px-6 py-4">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-6">
                        {[1,2,3].map((s) => (<div key={s} className={`flex-1 h-1 rounded-full ${empStep >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />))}
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Step {empStep} of 3 — {['Account','Employment','Profile'][empStep-1]}</p>

                    {empStep === 1 && (
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label><input value={empForm.name} onChange={e=>setEmpForm({...empForm, name:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" />{empErrors.name && <p className="text-xs text-red-500 mt-1">{empErrors.name[0]}</p>}</div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Email *</label><input type="email" value={empForm.email} onChange={e=>setEmpForm({...empForm, email:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="john@ris.com" />{empErrors.email && <p className="text-xs text-red-500 mt-1">{empErrors.email[0]}</p>}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Password *</label><input type="password" value={empForm.password} onChange={e=>setEmpForm({...empForm, password:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />{empErrors.password && <p className="text-xs text-red-500 mt-1">{empErrors.password[0]}</p>}</div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label><input type="password" value={empForm.confirm_password} onChange={e=>setEmpForm({...empForm, confirm_password:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input value={empForm.phone} onChange={e=>setEmpForm({...empForm, phone:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Role Type</label><select value={empForm.user_type} onChange={e=>setEmpForm({...empForm, user_type:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="manager">Manager</option><option value="cashier">Cashier</option></select></div>
                            </div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><input value={empForm.address} onChange={e=>setEmpForm({...empForm, address:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                        </div>
                    )}

                    {empStep === 2 && (
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Branch *</label><select value={empForm.branch_id} onChange={e=>setEmpForm({...empForm, branch_id:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Select branch</option>{branches.map(b=><option key={b.branch_id} value={b.branch_id}>{b.name}</option>)}</select>{empErrors.branch_id && <p className="text-xs text-red-500 mt-1">{empErrors.branch_id[0]}</p>}</div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Role *</label><select value={empForm.role_id} onChange={e=>setEmpForm({...empForm, role_id:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Select role</option>{roles.map(r=><option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}</select></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Position</label><input value={empForm.position} onChange={e=>setEmpForm({...empForm, position:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Hire Date</label><input type="date" value={empForm.hire_date} onChange={e=>setEmpForm({...empForm, hire_date:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Salary</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span><input type="number" value={empForm.salary} onChange={e=>setEmpForm({...empForm, salary:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div></div>
                        </div>
                    )}

                    {empStep === 3 && (
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label><input type="date" value={empForm.date_of_birth} onChange={e=>setEmpForm({...empForm, date_of_birth:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                <div className="grid grid-cols-3 gap-2">{['male','female','other'].map(g=>(
                                    <button key={g} type="button" onClick={()=>setEmpForm({...empForm, gender:g})} className={`py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${empForm.gender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{g}</button>
                                ))}</div>
                            </div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label><input value={empForm.phone_no} onChange={e=>setEmpForm({...empForm, phone_no:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label><input value={empForm.zip} onChange={e=>setEmpForm({...empForm, zip:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Add Product Modal */}
            <Modal isOpen={activeModal === 'add_product'} onClose={() => setActiveModal(null)} title="Add Product" icon={Package} iconBg="bg-emerald-50" maxWidth="xl"
                footer={<button onClick={handleProdSubmit} disabled={prodLoading} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70">{prodLoading && <Loader2 className="w-4 h-4 animate-spin" />} Create Product</button>}>
                <div className="px-6 py-4 space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label><input value={prodForm.name} onChange={e=>setProdForm({...prodForm, name:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />{prodErrors.name && <p className="text-xs text-red-500 mt-1">{prodErrors.name[0]}</p>}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Category *</label><select value={prodForm.category_id} onChange={e=>setProdForm({...prodForm, category_id:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Select</option>{categories.map(c=><option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}</select>{prodErrors.category_id && <p className="text-xs text-red-500 mt-1">{prodErrors.category_id[0]}</p>}</div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                            <div className="flex gap-1">{['pcs','kg','box','pack','bottle'].map(u=>(<button key={u} type="button" onClick={()=>setProdForm({...prodForm, unit:u})} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${prodForm.unit === u ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{u}</button>))}</div>
                        </div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Flavor / Option</label><input value={prodForm.flavor_option} onChange={e=>setProdForm({...prodForm, flavor_option:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Price (₱) *</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span><input type="number" step="0.01" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>{prodErrors.price && <p className="text-xs text-red-500 mt-1">{prodErrors.price[0]}</p>}</div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Cost Price (₱) *</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span><input type="number" step="0.01" value={prodForm.cost_price} onChange={e=>setProdForm({...prodForm, cost_price:e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div></div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">SKU will be auto-generated: <span className="font-mono">RIS-XXX-XXXXXXXX</span></div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
