import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Pencil, Loader2, AlertTriangle, CheckCircle, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useProductStore } from '../../store/productStore';
import useBranchScope from '../../hooks/useBranchScope';
import ProductStatusBadge from '../../components/products/ProductStatusBadge';
import StarRating from '../../components/products/StarRating';
import ProductForm from './ProductForm';
import CheckoutModal from '../../components/orders/CheckoutModal';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isManager, isCustomer } = useBranchScope();
    const canEdit = isAdmin || isManager;

    const { fetchProduct, selectedProduct: product, loading } = useProductStore();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    
    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [ratingVal, setRatingVal] = useState(0);
    const [commentVal, setCommentVal] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false); // Quick local check
    const [canReview, setCanReview] = useState(false);
    const [canReviewMsg, setCanReviewMsg] = useState('');
    const [canReviewLoading, setCanReviewLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct(id).catch(() => navigate('/products', { replace: true }));
            fetchReviews();
            if (isCustomer) {
                checkCanReview();
            }
        }
    }, [id, isCustomer]);

    const checkCanReview = async () => {
        setCanReviewLoading(true);
        try {
            const res = await api.get(`/products/${id}/can-review`);
            setCanReview(res.data.can_review);
            setCanReviewMsg(res.data.message);
            // If already reviewed, set hasReviewed to true
            if (res.data.message.includes('already reviewed')) {
                setHasReviewed(true);
            }
        } catch (e) {
            console.error('Failed to check review eligibility');
        } finally {
            setCanReviewLoading(false);
        }
    };

    const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
            const res = await api.get(`/products/${id}/reviews`);
            // Assuming standard pagination structure
            setReviews(res.data.data || res.data);
            
            // If customer, check if they already reviewed based on returned list or endpoint logic
            // In a real app we'd fetch the user ID and check, or rely on API to tell us
        } catch (e) {
            console.error('Failed to load reviews');
        } finally {
            setReviewsLoading(false);
        }
    };

    const submitReview = async () => {
        if (ratingVal === 0) {
            toast.error('Please select a star rating');
            return;
        }
        setSubmittingReview(true);
        try {
            await api.post(`/products/${id}/reviews`, { 
                product_id: id, 
                rating: ratingVal, 
                comment: commentVal 
            });
            toast.success('Review submitted!');
            setHasReviewed(true);
            setRatingVal(0);
            setCommentVal('');
            fetchReviews(); // Refresh list
            fetchProduct(id); // Refresh product average
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
            if (err.response?.status === 422) setHasReviewed(true); // Assuming 422 here means duplicate
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading && !product) {
        return <div className="w-full h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;
    }

    if (!product) return null;

    const formatPrice = (p) => Number(p || 0).toLocaleString('en-PH', {minimumFractionDigits: 2});
    
    const pPrice = Number(product.price) || 0;
    const cPrice = Number(product.cost_price) || 0;
    const margin = pPrice - cPrice;
    const marginPct = cPrice > 0 ? ((margin / cPrice) * 100).toFixed(1) : 0;
    
    let marginColor = 'text-emerald-600 bg-emerald-50';
    if (cPrice > 0) {
        if (marginPct <= 10) marginColor = 'text-red-600 bg-red-50';
        else if (marginPct < 30) marginColor = 'text-amber-600 bg-amber-50';
    }

    // Review metrics
    const ratingCount = reviews.length || 0;
    const ratingDist = [1, 2, 3, 4, 5].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const pct = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
        return { star, count, pct };
    }).reverse();

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            <div className="flex items-center gap-2 text-sm mb-6">
                <button onClick={() => navigate('/products')} className="text-slate-500 hover:text-indigo-600 transition-colors">
                    Products
                </button>
                <ChevronRight className="text-slate-300 w-4 h-4" />
                <span className="text-slate-900 font-medium">{product.name}</span>
            </div>

            {/* Product Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-full md:w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="text-slate-300 w-12 h-12" />
                    </div>
                    
                    <div className="flex-1 w-full">
                        <h1 className="text-2xl font-bold text-slate-900 break-words line-clamp-2">{product.name}</h1>
                        <span className="font-mono text-sm bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 mt-2 inline-block">
                            {product.unique_sku}
                        </span>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                            <ProductStatusBadge status={product.status} />
                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md font-medium">{product.category?.category_name || 'Uncategorized'}</span>
                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md font-medium">unit: {product.unit}</span>
                            {product.flavor_option && (
                                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-medium italic">Flavor: {product.flavor_option}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-4 bg-slate-50 w-fit px-3 py-1.5 rounded-lg">
                            <StarRating rating={product.average_rating} />
                            <span className="font-semibold text-slate-900 text-sm ml-1">{product.average_rating}</span>
                            <span className="text-slate-400 text-xs">({product.reviews?.length || ratingCount} reviews)</span>
                        </div>
                    </div>

                    <div className="w-full md:w-auto md:min-w-[200px] bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-left md:text-right flex-shrink-0">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Selling Price</p>
                        <p className="text-3xl font-bold text-indigo-700 mt-1 pb-2">₱ {formatPrice(product.price)}</p>
                        
                        {canEdit && (
                            <div className="mt-3 pt-3 border-t border-indigo-200">
                                <p className="text-sm font-semibold text-slate-500 mb-1">Cost: <span className="text-slate-700">₱ {formatPrice(product.cost_price)}</span></p>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md inline-block ${marginColor}`}>
                                    {marginPct}% margin • ₱{margin.toFixed(2)}
                                </span>
                            </div>
                        )}

                        {canEdit && (
                            <div className="mt-4 pt-4 border-t border-indigo-200 flex flex-col gap-2">
                                <button onClick={() => setIsFormOpen(true)} className="w-full py-2 bg-white text-indigo-600 hover:bg-slate-50 border border-indigo-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                    <Pencil className="w-4 h-4" /> Edit Details
                                </button>
                            </div>
                        )}

                        {isCustomer && (
                            <div className="mt-4 pt-4 border-t border-indigo-200">
                                <button 
                                    onClick={() => setIsCheckoutOpen(true)}
                                    className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all transform active:scale-95 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag className="w-4 h-4" /> Buy Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Inventory By Branch */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                        <Package className="text-slate-400 w-4 h-4" />
                        <h3 className="text-base font-semibold text-slate-900">Stock by Branch</h3>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 text-sm rounded-full border border-indigo-100 shadow-sm">
                        {product.total_stock} total units
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Branch</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fill Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {product.inventory && product.inventory.length > 0 ? (
                                product.inventory.map(inv => {
                                    const q = Number(inv.quantity) || 0;
                                    const mx = Number(inv.max_stock) || 100;
                                    let fillPct = (q / mx) * 100;
                                    if (fillPct > 100) fillPct = 100;
                                    let barColor = fillPct <= 10 ? 'bg-red-400' : (fillPct <= 50 ? 'bg-amber-400' : 'bg-emerald-400');
                                    let rowBg = fillPct <= 10 ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50';

                                    return (
                                        <tr key={inv.inventory_id} className={`transition-colors ${rowBg}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {fillPct <= 10 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                                    <span className={`text-sm font-medium ${fillPct <= 10 ? 'text-red-900' : 'text-slate-700'}`}>
                                                        {inv.branch?.name || 'Local'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-base font-bold ${fillPct <= 10 ? 'text-red-700' : 'text-slate-900'}`}>{q}</span>
                                                <span className="text-xs text-slate-400 ml-1">/ {mx} max</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${fillPct}%` }} />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500 w-9 text-right">{fillPct.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                {new Date(inv.last_updated).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-sm text-slate-500 italic">
                                        No branch inventory records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StarRating rating={product.average_rating} />
                        <h3 className="text-base font-semibold text-slate-900 ml-2">Customer Reviews ({ratingCount})</h3>
                    </div>
                </div>

                <div className="px-6 py-5 border-b border-slate-100">
                    <div className="max-w-md w-full space-y-2">
                        {ratingDist.map(dist => (
                            <div key={dist.star} className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-500 w-5">{dist.star}★</span>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${dist.pct}%` }} />
                                </div>
                                <span className="text-xs text-slate-400 w-8">{dist.pct.toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {reviewsLoading ? (
                        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /></div>
                    ) : reviews.length === 0 ? (
                        <p className="text-sm text-slate-500 italic text-center py-4">No reviews yet for this product.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(r => (
                                <div key={r.review_id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                {(r.user?.name || 'U').substring(0, 2).toUpperCase()}
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">{r.user?.name || 'Customer'}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {new Date(r.review_time || r.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="mt-1 mb-2">
                                        <StarRating rating={r.rating} />
                                    </div>
                                    {r.comment && <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">{r.comment}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isCustomer && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        {hasReviewed ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                <CheckCircle className="text-emerald-500 w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">You reviewed this product</p>
                                    <p className="text-xs text-emerald-700 mt-0.5">Thank you for sharing your experience!</p>
                                </div>
                            </div>
                        ) : !canReview ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm flex items-start gap-3">
                                <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900">Review Restricted</h4>
                                    <p className="text-xs text-amber-700 mt-1">{canReviewMsg || 'You must purchase this product before you can leave a review.'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 rounded-xl p-5 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-900">Share your experience</h4>
                                <div className="mt-3">
                                    <StarRating rating={ratingVal} interactive={true} onChange={setRatingVal} size="lg" />
                                </div>
                                <textarea 
                                    rows={3}
                                    placeholder="Write your review... (optional)"
                                    value={commentVal}
                                    onChange={e => setCommentVal(e.target.value)}
                                    className="w-full mt-4 text-sm border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl p-3 resize-none outline-none shadow-sm"
                                />
                                <button 
                                    onClick={submitReview}
                                    disabled={submittingReview}
                                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Submit Review
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isFormOpen && (
                <ProductForm 
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    product={product}
                />
            )}
            {isCheckoutOpen && (
                <CheckoutModal 
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    product={product}
                />
            )}
        </div>
    );
};

export default ProductDetail;
