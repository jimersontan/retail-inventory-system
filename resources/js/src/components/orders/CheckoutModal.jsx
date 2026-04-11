import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, MapPin, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft, Loader2, CreditCard, Wallet, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrderStore } from '../../store/orderStore';

const CheckoutModal = ({ isOpen, onClose, product }) => {
    const { placeOrder } = useOrderStore();
    
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);

    // Reset state on open/close
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setQuantity(1);
            setOrderSuccess(null);
            setPin(['', '', '', '', '', '']);
            // Default to first branch with stock if available
            if (product?.inventory?.length > 0) {
                const firstWithStock = product.inventory.find(inv => inv.quantity > 0);
                if (firstWithStock) setSelectedBranch(firstWithStock);
            }
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const subtotal = product.price * quantity;

    const handlePinChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);

        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handlePinKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePlaceOrder = async () => {
        if (pin.join('').length < 6) {
            toast.error('Please enter your 6-digit security PIN');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                branch_id: selectedBranch.branch_id,
                payment_method: paymentMethod,
                items: [
                    {
                        product_id: product.product_id,
                        quantity: quantity,
                        unit_price: product.price
                    }
                ]
            };

            const result = await placeOrder(orderData);
            setOrderSuccess(result);
            setStep(5); // Success step
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (p) => Number(p || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });

    const renderStep = () => {
        switch (step) {
            case 1: // Selection
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex gap-4">
                            <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="w-10 h-10 text-slate-300" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 line-clamp-2">{product.name}</h4>
                                <p className="text-indigo-600 font-bold text-xl mt-1">₱ {formatPrice(product.price)}</p>
                                <p className="text-xs text-slate-400 mt-1">SKU: {product.unique_sku}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Quantity</p>
                                <p className="text-xs text-slate-400">Total units to order</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
                                >
                                    -
                                </button>
                                <span className="font-bold text-slate-900 w-8 text-center">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 font-bold hover:bg-slate-50 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-slate-500 text-sm">Subtotal:</span>
                            <span className="text-xl font-extrabold text-slate-900">₱ {formatPrice(subtotal)}</span>
                        </div>
                    </div>
                );

            case 2: // Logistics
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            <h4 className="font-bold text-slate-900 text-sm">Select Pickup Branch</h4>
                        </div>
                        
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {product.inventory?.map(inv => {
                                const isSelected = selectedBranch?.branch_id === inv.branch_id;
                                const hasStock = inv.quantity >= quantity;
                                
                                return (
                                    <button
                                        key={inv.branch_id}
                                        disabled={!hasStock}
                                        onClick={() => setSelectedBranch(inv)}
                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative ${
                                            isSelected 
                                                ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                                                : hasStock 
                                                    ? 'border-slate-100 hover:border-slate-300 bg-white' 
                                                    : 'border-slate-50 bg-slate-50 opacity-60 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>{inv.branch?.name}</p>
                                                <p className="text-xs text-slate-500 mt-1">{inv.branch?.address || 'Main Branch Location'}</p>
                                            </div>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {inv.quantity} in stock
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 3: // Security PIN
                return (
                    <div className="space-y-8 py-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-amber-500" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-lg">Security Verification</h4>
                            <p className="text-sm text-slate-500 mt-1 px-8">To protect your account, please enter your 6-digit transaction PIN.</p>
                        </div>

                        <div className="flex justify-center gap-2">
                            {pin.map((p, i) => (
                                <input
                                    key={i}
                                    id={`pin-${i}`}
                                    type="password"
                                    maxLength={1}
                                    value={p}
                                    onChange={(e) => handlePinChange(i, e.target.value)}
                                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                                    className="w-10 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-xl font-bold focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                />
                            ))}
                        </div>

                        <button className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest mt-4">
                            Forgot Transaction PIN?
                        </button>
                    </div>
                );

            case 4: // Confirmation
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Order Summary</h5>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600">{product.name} (x{quantity})</span>
                                <span className="text-sm font-bold text-slate-900">₱ {formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
                                <span className="text-sm text-slate-600">Pickup Location</span>
                                <span className="text-sm font-bold text-slate-900">{selectedBranch?.branch?.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-900">Total Payment</span>
                                <span className="text-2xl font-black text-indigo-600">₱ {formatPrice(subtotal)}</span>
                            </div>
                        </div>

                        <div>
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Payment Method</h5>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white'}`}
                                >
                                    <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span className="text-[10px] font-bold">Cash</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('gcash')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'gcash' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white'}`}
                                >
                                    <Wallet className={`w-5 h-5 ${paymentMethod === 'gcash' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span className="text-[10px] font-bold">GCash</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('card')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white'}`}
                                >
                                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span className="text-[10px] font-bold">Card</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 5: // Success
                return (
                    <div className="text-center py-6 animate-in scale-95 fade-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900">Order Placed!</h4>
                        <p className="text-slate-500 mt-2 px-6">Your order #{orderSuccess?.order_id?.toString().padStart(6, '0')} has been successfully created.</p>
                        
                        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Status</span>
                                <span className="text-indigo-600 font-bold uppercase tracking-wider">Payment Pending</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                Please visit the **{selectedBranch?.branch?.name}** with your payment to complete the purchase. You can track this in "My Orders".
                            </p>
                        </div>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-[440px] rounded-[32px] shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <ShoppingBag className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Checkout</h3>
                            {step < 5 && <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} className={`h-1 rounded-full transition-all ${s === step ? 'w-4 bg-indigo-600' : s < step ? 'w-1 bg-indigo-300' : 'w-1 bg-slate-100'}`} />
                                ))}
                            </div>}
                        </div>
                    </div>
                    {step < 5 && <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {renderStep()}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/50">
                    {step === 5 ? (
                        <button 
                            onClick={onClose}
                            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                        >
                            Back to Catalog
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button 
                                    onClick={() => setStep(step - 1)}
                                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all active:scale-95"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            )}
                            
                            {step < 4 ? (
                                <button 
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 2 && !selectedBranch}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group active:scale-95"
                                >
                                    Continue
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button 
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Place Order
                                            <ShieldCheck className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
