import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, DollarSign, TrendingUp, Package, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useDashboardStore } from '../../store/dashboardStore';
import KPICard from '../../components/dashboard/KPICard';
import RevenuePieChart from '../../components/charts/RevenuePieChart';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';

const CashierDashboard = () => {
    const navigate = useNavigate();
    const { kpis, salesTrend, recentSales, paymentMethods, loading, error, dateRange, setDateRange, initializeDashboard, fetchDashboard } = useDashboardStore();
    const [activeModal, setActiveModal] = useState(null);

    useEffect(() => { initializeDashboard(); }, []);

    const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
    const fmt = (v) => (v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (error && !loading) {
        return (<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" /><h3 className="text-lg font-semibold text-red-700">Failed to load dashboard</h3><button onClick={() => fetchDashboard(dateRange.from, dateRange.to)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Retry</button></div>);
    }

    // Payment methods for pie chart
    const pmData = (paymentMethods || []).map((pm, idx) => {
        const colors = { cash: '#10B981', gcash: '#3B82F6', card: '#8B5CF6' };
        return { name: pm.method || 'cash', value: pm.count || 0, color: colors[pm.method] || '#94a3b8' };
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, POS Cashier!</h1>
                <p className="text-sm text-slate-500 mt-0.5">Ready to process sales at Main Headquarters.</p>
            </div>

            {/* KPI Cards */}
            {loading ? <LoadingSkeleton type="card" count={4} /> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <KPICard label="My Sales Today" value={kpis.my_sales_today || 0} icon={ShoppingCart} iconBg="bg-emerald-50" iconColor="text-emerald-600" onClick={() => setActiveModal('my_sales_today')} />
                    <KPICard label="Revenue Today" value={`₱ ${fmt(kpis.my_revenue_today)}`} icon={DollarSign} iconBg="bg-indigo-50" iconColor="text-indigo-600" onClick={() => setActiveModal('revenue_today')} />
                    <KPICard label="Avg Sale Value" value={`₱ ${fmt(kpis.avg_sale_value)}`} icon={TrendingUp} iconBg="bg-teal-50" iconColor="text-teal-600" onClick={() => setActiveModal('payment_methods')} />
                    <KPICard label="Products Available" value={kpis.products_available || 0} icon={Package} iconBg="bg-slate-50" iconColor="text-slate-600" onClick={() => navigate('/products')} />
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">My Daily Sales</h3>
                    {salesTrend.length === 0 ? (
                        <div className="flex items-center justify-center text-slate-400 text-sm h-[220px]">No sales data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v) => [`₱ ${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 'Revenue']} />
                                <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <RevenuePieChart data={pmData} loading={loading} title="Payment Methods" />
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Recent Transactions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">My Recent Transactions</h3>
                    <div className="space-y-2">
                        {(!recentSales || recentSales.length === 0) ? <p className="text-center py-6 text-slate-400 text-sm">No transactions yet</p> :
                            recentSales.map(s => (
                                <div key={s.sale_id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-mono font-medium text-slate-700">#{String(s.sale_id).padStart(5, '0')}</p>
                                        <p className="text-xs text-slate-400">{s.date}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={s.payment_method} size="sm" />
                                        <span className="text-sm font-semibold text-indigo-600">₱ {fmt(s.amount)}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Quick Product Lookup */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Quick Product Lookup</h3>
                    <p className="text-sm text-slate-500 mb-4">Search and browse available products</p>
                    <button onClick={() => navigate('/products')} className="w-full py-3 text-center text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors">
                        Browse Products →
                    </button>
                </div>
            </div>

            {/* BIG Start New Sale Button */}
            <div onClick={() => navigate('/pos')} className="bg-indigo-600 text-white rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:bg-indigo-700 transition-colors mb-6">
                <div className="flex items-center gap-4">
                    <ShoppingCart className="w-8 h-8" />
                    <div>
                        <p className="text-xl font-bold">Start New Sale</p>
                        <p className="text-indigo-200 text-sm">Process transactions at POS</p>
                    </div>
                </div>
                <ArrowRight className="w-6 h-6" />
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-3 gap-4">
                <button onClick={() => navigate('/pos')} className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm font-semibold hover:bg-emerald-100 transition-colors">View My Sales</button>
                <button onClick={() => navigate('/products')} className="bg-blue-50 text-blue-700 border border-blue-200 rounded-xl p-4 text-sm font-semibold hover:bg-blue-100 transition-colors">Search Products</button>
                <button onClick={() => setActiveModal('last_receipt')} className="bg-purple-50 text-purple-700 border border-purple-200 rounded-xl p-4 text-sm font-semibold hover:bg-purple-100 transition-colors">Transaction Receipt</button>
            </div>

            {/* My Sales Today Modal */}
            <Modal isOpen={activeModal === 'my_sales_today'} onClose={() => setActiveModal(null)} title="My Transactions Today" icon={ShoppingCart} iconBg="bg-emerald-50" maxWidth="md" footer={<button onClick={() => { setActiveModal(null); navigate('/pos'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">Go to POS →</button>}>
                <div className="px-6 py-4">
                    {recentSales?.map(s => (
                        <div key={s.sale_id} className="flex justify-between items-center p-2 border-b border-slate-100 last:border-0">
                            <div><p className="text-sm font-mono">#{String(s.sale_id).padStart(5,'0')}</p><p className="text-xs text-slate-400">{s.date}</p></div>
                            <div className="flex items-center gap-2"><StatusBadge status={s.payment_method} /><span className="text-sm font-semibold">₱ {fmt(s.amount)}</span></div>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Revenue Today Modal */}
            <Modal isOpen={activeModal === 'revenue_today'} onClose={() => setActiveModal(null)} title="Today's Revenue" icon={DollarSign} iconBg="bg-indigo-50" maxWidth="md" footer={<button onClick={() => { setActiveModal(null); navigate('/pos'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">Process Sale →</button>}>
                <div className="px-6 py-4 space-y-3">
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Total Revenue</span><span className="text-sm font-semibold">₱ {fmt(kpis.my_revenue_today)}</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Transactions</span><span className="text-sm font-semibold">{kpis.my_sales_today || 0}</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Avg per Sale</span><span className="text-sm font-semibold">₱ {fmt(kpis.avg_sale_value)}</span></div>
                </div>
            </Modal>

            {/* Payment Methods Modal */}
            <Modal isOpen={activeModal === 'payment_methods'} onClose={() => setActiveModal(null)} title="Payment Method Summary" icon={DollarSign} iconBg="bg-teal-50" maxWidth="md" footer={<button onClick={() => { setActiveModal(null); navigate('/pos'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">View All →</button>}>
                <div className="px-6 py-4">
                    {pmData.length === 0 ? <p className="text-center py-6 text-slate-400">No payment data</p> : pmData.map((pm, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: pm.color}} /><span className="text-sm capitalize">{pm.name}</span></div>
                            <span className="text-sm font-semibold">{pm.value} sales</span>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Last Receipt Modal */}
            <Modal isOpen={activeModal === 'last_receipt'} onClose={() => setActiveModal(null)} title="Last Transaction Receipt" maxWidth="sm" footer={<><button onClick={() => { setActiveModal(null); navigate('/pos'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">New Sale →</button><button onClick={() => window.print()} className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Print</button></>}>
                <div className="px-6 py-4">
                    {recentSales?.[0] ? (
                        <div className="text-center">
                            <p className="font-bold text-slate-900">RIS - Main Headquarters</p>
                            <p className="text-xs text-slate-400 mt-1">Sale #{recentSales[0].sale_id} · {recentSales[0].date}</p>
                            <p className="text-xs text-slate-400">Cashier: {recentSales[0].cashier}</p>
                            <div className="border-t border-dashed border-slate-300 my-4" />
                            <div className="flex justify-between px-4"><span className="text-sm text-slate-600">Total</span><span className="text-xl font-bold text-slate-900">₱ {fmt(recentSales[0].amount)}</span></div>
                            <div className="mt-2"><StatusBadge status={recentSales[0].payment_method} size="md" /></div>
                        </div>
                    ) : <p className="text-center py-6 text-slate-400 text-sm">No transactions yet</p>}
                </div>
            </Modal>
        </div>
    );
};

export default CashierDashboard;
