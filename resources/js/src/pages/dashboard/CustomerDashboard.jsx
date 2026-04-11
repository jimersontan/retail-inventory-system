import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, DollarSign, Star, Package, Clock, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useDashboardStore } from '../../store/dashboardStore';
import KPICard from '../../components/dashboard/KPICard';
import RevenuePieChart from '../../components/charts/RevenuePieChart';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../api/axios';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { kpis, salesTrend, categoryRevenue, myOrders, reviewableProducts, loading, error, dateRange, initializeDashboard, fetchDashboard } = useDashboardStore();
    const [activeModal, setActiveModal] = useState(null);

    // Review form state
    const [reviewForm, setReviewForm] = useState({ product_id: '', rating: 0, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [editReviewId, setEditReviewId] = useState(null);

    // Listing form state
    const [listingForm, setListingForm] = useState({ product_id: '', stock_offset: '0', stock_qty: '1', is_available: true });
    const [listingLoading, setListingLoading] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => { initializeDashboard(); }, []);
    useEffect(() => {
        if (activeModal === 'add_listing') {
            api.get('/products?status=available').then(r => setProducts(r.data.data || r.data)).catch(() => {});
        }
    }, [activeModal]);

    const fmt = (v) => (v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Review submit
    const handleReviewSubmit = async () => {
        if (!reviewForm.product_id || reviewForm.rating === 0) { toast.error('Please select a product and rating'); return; }
        setReviewLoading(true);
        try {
            if (editReviewId) {
                await api.put(`/reviews/${editReviewId}`, { rating: reviewForm.rating, comment: reviewForm.comment });
                toast.success('Review updated!');
            } else {
                await api.post(`/products/${reviewForm.product_id}/reviews`, { rating: reviewForm.rating, comment: reviewForm.comment });
                toast.success('Review submitted!');
            }
            setActiveModal(null);
            setReviewForm({ product_id: '', rating: 0, comment: '' });
            setEditReviewId(null);
            fetchDashboard(dateRange.from, dateRange.to);
        } catch (err) {
            if (err.response?.status === 422) toast.error(err.response?.data?.message || 'You have already reviewed this product.');
            else toast.error('Failed to submit review');
        } finally { setReviewLoading(false); }
    };

    // Listing submit
    const handleListingSubmit = async () => {
        setListingLoading(true);
        try {
            await api.post('/listings', listingForm);
            toast.success('Product listed successfully!');
            setActiveModal(null);
            setListingForm({ product_id: '', stock_offset: '0', stock_qty: '1', is_available: true });
            fetchDashboard(dateRange.from, dateRange.to);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create listing');
        } finally { setListingLoading(false); }
    };

    // Open edit review
    const openEditReview = (product) => {
        setReviewForm({ product_id: product.product_id, rating: product.review?.rating || 0, comment: product.review?.comment || '' });
        setEditReviewId(product.review?.review_id);
        setActiveModal('write_review');
    };

    // Open write review
    const openWriteReview = (product) => {
        setReviewForm({ product_id: product.product_id, rating: 0, comment: '' });
        setEditReviewId(null);
        setActiveModal('write_review');
    };

    if (error && !loading) {
        return (<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" /><h3 className="text-lg font-semibold text-red-700">Failed to load dashboard</h3><button onClick={() => fetchDashboard(dateRange.from, dateRange.to)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Retry</button></div>);
    }

    const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, {kpis ? 'Juan' : 'Customer'}!</h1>
                <p className="text-sm text-slate-500 mt-0.5">Track your orders, reviews, and listings.</p>
            </div>

            {/* Verification Banner (example - shown if customer not verified) */}

            {/* KPI Cards */}
            {loading ? <LoadingSkeleton type="card" count={4} /> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <KPICard label="My Orders" value={kpis.my_orders || 0} icon={ClipboardList} iconBg="bg-indigo-50" iconColor="text-indigo-600" onClick={() => navigate('/my-orders')} />
                    <KPICard label="Total Spent" value={`₱ ${fmt(kpis.total_spent)}`} icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" onClick={() => setActiveModal('spending_detail')} />
                    <KPICard label="My Reviews" value={kpis.my_reviews || 0} icon={Star} iconBg="bg-amber-50" iconColor="text-amber-600" onClick={() => navigate('/my-reviews')} />
                    <KPICard label="My Listings" value={kpis.my_listings || 0} icon={Package} iconBg="bg-purple-50" iconColor="text-purple-600" onClick={() => setActiveModal('listings_detail')} />
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">My Purchase History</h3>
                    {salesTrend.length === 0 ? (
                        <div className="flex items-center justify-center text-slate-400 text-sm h-[220px]">No purchase history yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v) => [`₱ ${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 'Amount']} />
                                <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <RevenuePieChart data={categoryRevenue} loading={loading} title="Purchases by Category" />
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* My Recent Orders */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">My Recent Orders</h3>
                    <div className="space-y-2">
                        {(!myOrders || myOrders.length === 0) ? (
                            <div className="text-center py-6"><p className="text-slate-400 text-sm mb-3">No orders yet</p><button onClick={() => navigate('/shop')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">Shop Now</button></div>
                        ) : myOrders.map(o => (
                            <div key={o.order_id} onClick={() => navigate(`/my-orders/${o.order_id}`)} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                                <div><p className="text-sm font-medium">Order #{o.order_id}</p><p className="text-xs text-slate-400">{o.order_date}</p></div>
                                <div className="flex items-center gap-2"><StatusBadge status={o.status} /><span className="text-sm font-semibold">₱ {fmt(o.total_amount)}</span></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Products I Can Review */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Products I Can Review</h3>
                    <div className="space-y-2">
                        {(!reviewableProducts || reviewableProducts.length === 0) ? (
                            <p className="text-center py-6 text-slate-400 text-sm">No products to review</p>
                        ) : reviewableProducts.map((p, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <div><p className="text-sm font-medium text-slate-900">{p.name}</p><p className="text-xs text-slate-400">{p.category}</p></div>
                                {p.reviewed ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex">{[1,2,3,4,5].map(s => (<Star key={s} className={`w-3 h-3 ${s <= p.review?.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />))}</div>
                                        <button onClick={() => openEditReview(p)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Edit</button>
                                    </div>
                                ) : (
                                    <button onClick={() => openWriteReview(p)} className="text-xs text-amber-600 hover:text-amber-700 font-semibold px-3 py-1 bg-amber-50 rounded-lg border border-amber-200">Write Review</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shop Now Banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 flex items-center justify-between">
                <div>
                    <p className="text-lg font-bold text-slate-900">Discover our latest products</p>
                    <p className="text-slate-500 text-sm mt-1">Browse hundreds of items from all categories</p>
                </div>
                <button onClick={() => navigate('/shop')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">Shop Now</button>
            </div>

            {/* ═══ MODALS ═══ */}

            {/* Spending Detail */}
            <Modal isOpen={activeModal === 'spending_detail'} onClose={() => setActiveModal(null)} title="Purchase Summary" icon={DollarSign} iconBg="bg-emerald-50" maxWidth="md" footer={<button onClick={() => { setActiveModal(null); navigate('/my-orders'); }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">View All Orders →</button>}>
                <div className="px-6 py-4 space-y-3">
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Total Spent</span><span className="text-sm font-semibold">₱ {fmt(kpis.total_spent)}</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Total Orders</span><span className="text-sm font-semibold">{kpis.my_orders || 0}</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">My Reviews</span><span className="text-sm font-semibold">{kpis.my_reviews || 0}</span></div>
                </div>
            </Modal>

            {/* Listings Detail */}
            <Modal isOpen={activeModal === 'listings_detail'} onClose={() => setActiveModal(null)} title="My Reseller Listings" icon={Package} iconBg="bg-purple-50" maxWidth="md" footer={<button onClick={() => setActiveModal('add_listing')} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">+ List a Product</button>}>
                <div className="px-6 py-4">
                    <p className="text-sm text-slate-500">{kpis.my_listings || 0} active listings</p>
                    <p className="text-xs text-slate-400 mt-2">Manage your listings from the products page.</p>
                </div>
            </Modal>

            {/* Write/Edit Review Modal */}
            <Modal isOpen={activeModal === 'write_review'} onClose={() => { setActiveModal(null); setEditReviewId(null); }} title={editReviewId ? 'Edit Review' : 'Write a Review'} icon={Star} iconBg="bg-amber-50" maxWidth="md" footer={<button onClick={handleReviewSubmit} disabled={reviewLoading} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70">{reviewLoading && <Loader2 className="w-4 h-4 animate-spin" />} {editReviewId ? 'Update Review' : 'Submit Review'}</button>}>
                <div className="px-6 py-4 space-y-4">
                    {!editReviewId && (
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                            <select value={reviewForm.product_id} onChange={e => setReviewForm({...reviewForm, product_id: e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select product</option>
                                {reviewableProducts?.filter(p => !p.reviewed).map(p => (<option key={p.product_id} value={p.product_id}>{p.name}</option>))}
                            </select>
                        </div>
                    )}
                    {editReviewId && <p className="text-sm text-slate-500">Product: {reviewableProducts?.find(p => p.product_id == reviewForm.product_id)?.name || 'Selected Product'}</p>}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                        <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                                <button key={s} type="button" onClick={() => setReviewForm({...reviewForm, rating: s})} className="p-1 transition-colors">
                                    <Star className={`w-8 h-8 ${s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-300'}`} />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-slate-500">{starLabels[reviewForm.rating] || ''}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Comment (optional)</label>
                        <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value.slice(0, 1000)})} rows={4} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Share your experience..." />
                        <p className="text-xs text-slate-400 text-right mt-1">{reviewForm.comment.length}/1000</p>
                    </div>
                </div>
            </Modal>

            {/* Add Listing Modal */}
            <Modal isOpen={activeModal === 'add_listing'} onClose={() => setActiveModal(null)} title="List a Product" icon={Package} iconBg="bg-purple-50" maxWidth="md" footer={<button onClick={handleListingSubmit} disabled={listingLoading} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70">{listingLoading && <Loader2 className="w-4 h-4 animate-spin" />} Create Listing</button>}>
                <div className="px-6 py-4 space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Product</label><select value={listingForm.product_id} onChange={e => setListingForm({...listingForm, product_id: e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Select product</option>{(Array.isArray(products) ? products : []).map(p => (<option key={p.product_id} value={p.product_id}>{p.name} — ₱{p.price}</option>))}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Price Offset (₱)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">+₱</span><input type="number" min="0" value={listingForm.stock_offset} onChange={e => setListingForm({...listingForm, stock_offset: e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label><input type="number" min="0" value={listingForm.stock_qty} onChange={e => setListingForm({...listingForm, stock_qty: e.target.value})} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div className="flex items-center gap-3"><label className="text-sm font-medium text-slate-700">Available</label><button type="button" onClick={() => setListingForm({...listingForm, is_available: !listingForm.is_available})} className={`w-12 h-6 rounded-full transition-colors ${listingForm.is_available ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${listingForm.is_available ? 'translate-x-6' : 'translate-x-0.5'}`} /></button></div>
                </div>
            </Modal>
        </div>
    );
};

export default CustomerDashboard;
