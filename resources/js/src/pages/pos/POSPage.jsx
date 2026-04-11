import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Loader2, Package, Search, ShoppingCart, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInventoryStore } from '../../store/inventoryStore';
import { useCategoryStore } from '../../store/categoryStore';
import useAuthStore from '../../store/authStore';
import usePOSStore from '../../store/posStore';
import ProductCard from '../../components/pos/ProductCard';
import CartItem from '../../components/pos/CartItem';
import PaymentMethodSelector from '../../components/pos/PaymentMethodSelector';
import SaleSuccessModal from './SaleSuccessModal';

const POSPage = () => {
    const { user } = useAuthStore();
    const { inventory, fetchInventory, loading } = useInventoryStore();
    const { categories, fetchCategories } = useCategoryStore();
    const { cart, paymentMethod, loading: checkoutLoading, addToCart, updateQty, removeFromCart, clearCart, setPaymentMethod, checkout } = usePOSStore();

    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [receivedAmount, setReceivedAmount] = useState('');
    const [now, setNow] = useState(new Date());
    const [saleDone, setSaleDone] = useState(null);

    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    const total = subtotal;

    const changeDue = useMemo(() => {
        const received = parseFloat(receivedAmount) || 0;
        return received >= total ? received - total : 0;
    }, [receivedAmount, total]);

    const isAmountSufficient = useMemo(() => {
        if (paymentMethod !== 'cash') return true;
        return (parseFloat(receivedAmount) || 0) >= total;
    }, [paymentMethod, receivedAmount, total]);

    useEffect(() => {
        fetchCategories().catch(() => {});
    }, [fetchCategories]);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(search), 300);
        return () => clearTimeout(id);
    }, [search]);

    useEffect(() => {
        const params = {};
        if (debounced) params.search = debounced;
        if (activeCategory !== 'all') params.category_id = activeCategory;
        fetchInventory(params).catch(() => {});
    }, [fetchInventory, debounced, activeCategory]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Reset received amount when payment method changes
        setReceivedAmount('');
    }, [paymentMethod]);

    const products = useMemo(() => inventory.map((inv) => ({ ...inv.product, quantity: inv.quantity })), [inventory]);

    const handleAdd = (product) => {
        const result = addToCart(product);
        if (!result.ok) toast.error(result.message);
    };

    const handleDenomination = (val) => {
        const current = parseFloat(receivedAmount) || 0;
        setReceivedAmount((current + val).toString());
    };

    const doCheckout = async () => {
        try {
            const sale = await checkout();
            // Store payment details in the local sale object for the modal
            const saleWithDetails = { 
                ...sale, 
                received_amount: parseFloat(receivedAmount) || total,
                change_due: changeDue
            };
            setSaleDone(saleWithDetails);
            setReceivedAmount('');
            await fetchInventory({});
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Checkout failed');
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            <section className="flex-1 bg-white border-r border-slate-200 flex flex-col">
                <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        <p className="text-base font-semibold text-slate-900">RIS Point of Sale</p>
                    </div>
                    <div className="flex-1 max-w-sm mx-8 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or scan SKU..." className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 text-sm" />
                    </div>
                    <div className="text-right">
                        <p className="inline-flex items-center gap-1 text-sm text-slate-600"><User className="w-4 h-4" />{user?.name || 'Cashier'}</p>
                        <p className="inline-flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3" />{now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

                <div className="px-6 py-3 border-b border-slate-100">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <button type="button" onClick={() => setActiveCategory('all')} className={`rounded-full px-4 py-1.5 text-sm font-medium ${activeCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
                        {categories.map((category) => (
                            <button key={category.category_id} type="button" onClick={() => setActiveCategory(String(category.category_id))} className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${String(activeCategory) === String(category.category_id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                {category.category_name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-48 rounded-xl border border-slate-200 animate-pulse bg-slate-50" />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Package className="w-12 h-12 text-slate-200" />
                            <p className="text-slate-400 mt-3">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.product_id}
                                    product={product}
                                    inCartQty={cart.find((c) => c.product_id === product.product_id)?.qty || 0}
                                    onAdd={handleAdd}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-base font-semibold text-slate-900">Current Order</p>
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-indigo-600" />
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{cartCount}</span>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                        <ShoppingCart className="w-12 h-12 text-slate-200" />
                        <p className="text-slate-400 text-sm mt-3">Cart is empty</p>
                        <p className="text-slate-300 text-xs mt-1">Click products to add them</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                        {cart.map((item) => (
                            <CartItem
                                key={item.product_id}
                                item={item}
                                onMinus={() => updateQty(item.product_id, item.qty - 1)}
                                onPlus={() => {
                                    const result = updateQty(item.product_id, item.qty + 1);
                                    if (!result.ok) toast.error(result.message);
                                }}
                                onRemove={() => removeFromCart(item.product_id)}
                            />
                        ))}
                    </div>
                )}

                <div className="px-5 py-4 border-t border-slate-200 bg-white">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Items ({cartCount}):</span><span className="text-slate-700 font-medium">{cart.length}</span></div>
                        <div className="flex justify-between font-bold text-base mt-2"><span className="text-slate-900">Total Amount:</span><span className="text-indigo-700 font-black text-xl">₱ {total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
                    </div>
                </div>

                {/* Cash Desk Section */}
                {cart.length > 0 && paymentMethod === 'cash' && (
                    <div className="px-5 py-4 bg-slate-50 border-y border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Desk</span>
                            <div className="h-px bg-slate-200 flex-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Amount Received</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                    <input 
                                        type="number" 
                                        value={receivedAmount} 
                                        onChange={(e) => setReceivedAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full h-11 bg-white border border-slate-200 rounded-lg pl-7 pr-3 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Change Due</label>
                                <div className="h-11 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-lg font-black text-emerald-600 shadow-sm">
                                    ₱ {changeDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        {/* Quick Denominations */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {[100, 500, 1000].map(val => (
                                <button 
                                    key={val}
                                    onClick={() => handleDenomination(val)}
                                    className="h-8 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95"
                                >
                                    + {val}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-5 py-4">
                    <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                </div>

                <div className="px-5 pb-6">
                    <button 
                        type="button" 
                        disabled={!cart.length || !paymentMethod || checkoutLoading || !isAmountSufficient} 
                        onClick={doCheckout} 
                        className={`w-full h-16 rounded-xl text-lg font-black transition-all shadow-lg active:scale-[0.98] ${
                            !isAmountSufficient 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-dashed border-red-200' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                    >
                        {checkoutLoading ? (
                            <span className="inline-flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Processing...</span>
                        ) : (
                            !isAmountSufficient 
                                ? `Need ₱ ${(total - (parseFloat(receivedAmount) || 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 })} more`
                                : `Complete Order ₱ ${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                        )}
                    </button>
                    <button type="button" onClick={clearCart} className="w-full text-center mt-3 text-xs text-slate-400 hover:text-red-500 flex items-center justify-center gap-1 group">
                        <Trash2 className="w-3 h-3 transition-transform group-hover:scale-110" />Clear cart
                    </button>
                </div>
            </aside>

            <SaleSuccessModal
                open={!!saleDone}
                sale={saleDone}
                onNewSale={() => setSaleDone(null)}
                onPrint={() => window.print()}
            />
        </div>
    );
};

export default POSPage;

