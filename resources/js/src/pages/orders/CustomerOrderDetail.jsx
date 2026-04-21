import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, Clock, MapPin, Building2, CreditCard, ShoppingBag, Package, Loader2, Star, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import StarRating from '../../components/products/StarRating';
import { useOrderStore } from '../../store/orderStore';
import OrderProgressTracker from '../../components/orders/OrderProgressTracker';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import PaymentModal from '../../components/orders/PaymentModal';

const CustomerOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentOrder, loading, fetchOrder, cancelOrder, confirmPayment } = useOrderStore();
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    
    // Review State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewingProduct, setReviewingProduct] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOrder(id).catch(err => {
                toast.error('Order not found or access denied');
                navigate('/my-orders');
            });
        }
    }, [id]); // Simplified dependencies to avoid infinite loops if store identity changes

    const handleCancel = async () => {
        if (!currentOrder?.is_cancellable) {
            toast.error('This order can no longer be cancelled.');
            return;
        }

        if (confirm('Are you sure you want to cancel this order?')) {
            setCancelling(true);
            try {
                await cancelOrder(id);
                toast.success('Order cancelled successfully');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to cancel order');
            } finally {
                setCancelling(false);
            }
        }
    };

    const handleConfirmPayment = async (data) => {
        try {
            await confirmPayment(id, data);
            toast.success('Payment submitted for verification');
            setPaymentModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit payment');
            throw error;
        }
    };

    const handleOpenReview = (product) => {
        setReviewingProduct(product);
        setReviewRating(0);
        setReviewComment('');
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async () => {
        if (reviewRating === 0) {
            toast.error('Please select a star rating');
            return;
        }
        setIsSubmittingReview(true);
        try {
            await api.post(`/products/${reviewingProduct.product_id}/reviews`, {
                product_id: reviewingProduct.product_id,
                rating: reviewRating,
                comment: reviewComment
            });
            toast.success('Review submitted successfully!');
            setIsReviewModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading && !currentOrder) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-200 rounded w-1/4" />
                    <div className="h-40 bg-slate-200 rounded-2xl" />
                    <div className="h-64 bg-slate-200 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!currentOrder) return null;

    const formatPrice = (p) => Number(p || 0).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });

    const isCancelled = currentOrder.status === 'cancelled';
    
    // Status-specific banner colors/icons
    const getStatusTheme = (s) => {
        if (isCancelled) return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', label: 'Order Cancelled', desc: 'Your order has been cancelled. If you already paid, refunds are being processed.' };
        
        switch (s) {
            case 'completed':
                return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', label: 'Order Completed', desc: 'Thank you for shopping! We hope to see you again.' };
            case 'ready':
                return { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', label: 'Ready for Pick-up', desc: 'Your order is ready! Please visit the selected branch with your payment.' };
            case 'processing':
                return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', label: 'Preparing Items', desc: 'We are currently preparing your items for pick-up.' };
            case 'confirmed':
                return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', label: 'Order Confirmed', desc: 'Your order has been verified and will be processed shortly.' };
            default:
                return { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', label: 'Order Pending', desc: 'We have received your order and are waiting for verification.' };
        }
    };

    const theme = getStatusTheme(currentOrder.status);
    
    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
            {/* Header / Back */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/my-orders')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 group transition-colors"
                >
                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-50">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Orders</span>
                </button>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
                    <p className="text-sm font-mono font-bold text-slate-900">#ORD-{String(currentOrder.order_id).padStart(6, '0')}</p>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`${theme.bg} ${theme.border} border rounded-[2rem] p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-sm`}>
                <div className="relative z-10 text-center md:text-left">
                    <h2 className={`text-2xl font-black ${theme.text} leading-tight`}>{theme.label}</h2>
                    <p className={`text-sm ${theme.text} opacity-70 mt-1`}>
                        {theme.desc}
                    </p>
                </div>
                
                {!isCancelled && (
                    <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-3xl shadow-sm border border-white/50 z-10">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Current Phase</p>
                        <OrderStatusBadge status={currentOrder.status} />
                    </div>
                )}
            </div>

            {/* Tracking Tracker */}
            {!isCancelled && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 mb-8 shadow-sm">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            Tracking Progress
                        </h3>
                    </div>
                    <OrderProgressTracker
                        currentStatus={currentOrder.status}
                        isDone={isCancelled}
                    />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Logistics */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        Logistics Info
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pickup Location</p>
                                <p className="text-sm font-bold text-slate-900 mt-0.5">{currentOrder.branch?.name}</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{currentOrder.branch?.address || 'Main Branch Warehouse'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Detail */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-500" />
                        Payment Detail
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                            <span className="text-xs text-slate-500">Method</span>
                            <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">{currentOrder.payment?.method || 'CASH ON PICKUP'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                            <span className="text-xs text-slate-500">Status</span>
                            <OrderStatusBadge status={currentOrder.payment?.status} />
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-xs text-slate-500">Total Amount</span>
                            <span className="text-xl font-black text-indigo-600">₱ {formatPrice(currentOrder.total_amount)}</span>
                        </div>

                        {currentOrder.payment?.status === 'pending' && !isCancelled && (
                            <button
                                onClick={() => setPaymentModalOpen(true)}
                                className="w-full mt-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold h-12 rounded-2xl transition-all shadow-lg shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2"
                            >
                                Submit Payment Proof
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 mb-8 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2 uppercase tracking-tight text-sm">
                    <ShoppingBag className="w-4 h-4 text-indigo-500" />
                    Product Ordered
                </h3>
                
                <div className="space-y-6">
                    {currentOrder.items?.map(item => (
                        <div key={item.item_id} className="flex gap-4 items-center group">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-indigo-50 transition-colors overflow-hidden relative">
                                {item.product?.image_url ? (
                                    <img 
                                        src={item.product.image_url} 
                                        alt={item.product.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                                    />
                                ) : null}
                                <Package 
                                    className={`w-8 h-8 text-slate-200 group-hover:text-indigo-200 transition-colors ${item.product?.image_url ? 'hidden' : ''}`} 
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{item.product?.name || 'Unknown Product'}</h4>
                                <p className="text-xs text-slate-400 mt-1">
                                    ₱ {formatPrice(item.unit_price)} × {item.quantity} units
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {currentOrder.status === 'completed' && (
                                    <button
                                        onClick={() => handleOpenReview(item.product)}
                                        className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <Star className="w-3 h-3 fill-indigo-600" />
                                        Review
                                    </button>
                                )}
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900">₱ {formatPrice(item.subtotal)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-end">
                    <div className="flex items-center gap-10">
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Grand Total</span>
                        <span className="text-3xl font-black text-slate-900">₱ {formatPrice(currentOrder.total_amount)}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {currentOrder.is_cancellable && (
                <div className="bg-white rounded-[2rem] border border-red-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="font-bold text-slate-900">Need to cancel your order?</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Orders can be cancelled before they reach the "Processing" stage.
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="w-full md:w-auto px-10 h-14 bg-white hover:bg-red-50 text-red-600 border-2 border-red-100 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Order'}
                    </button>
                </div>
            )}

            {/* Payment Modal */}
            {paymentModalOpen && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    order={currentOrder}
                    onConfirm={handleConfirmPayment}
                    loading={false}
                />
            )}

            {/* Review Modal */}
            {isReviewModalOpen && reviewingProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-4 flex justify-between items-center bg-slate-50 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Rate Product</h3>
                                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">How was your purchase?</p>
                            </div>
                            <button onClick={() => setIsReviewModalOpen(false)} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all active:scale-90">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-8">
                            {/* Product Info */}
                            <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-indigo-100 shrink-0">
                                    <Package className="w-8 h-8 text-indigo-300" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">{reviewingProduct.name}</h4>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">{reviewingProduct.unique_sku}</p>
                                </div>
                            </div>

                            {/* Stars */}
                            <div className="flex flex-col items-center gap-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tap stars to rate</p>
                                <StarRating rating={reviewRating} onChange={setReviewRating} interactive={true} size="lg" />
                                {reviewRating > 0 && (
                                    <p className="text-sm font-bold text-indigo-600 animate-in slide-in-from-top-2">
                                        {reviewRating === 5 ? 'Excellent! 😍' : 
                                         reviewRating === 4 ? 'Very Good! 😊' : 
                                         reviewRating === 3 ? 'Good! 🙂' : 
                                         reviewRating === 2 ? 'Fair! 😐' : 'Poor! ☹️'}
                                    </p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Your Review
                                </label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Write something about the product..."
                                    className="w-full h-32 bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-3xl p-5 text-sm text-slate-900 resize-none outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview}
                                className="w-full h-16 bg-slate-900 hover:bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isSubmittingReview ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerOrderDetail;
