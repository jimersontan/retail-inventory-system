import { create } from 'zustand';
import api from '../api/axios';
import toast from 'react-hot-toast';

/**
 * POS Store — manages cart state for cashier POS.
 * NOT persisted (cart clears on page refresh).
 */
const usePosStore = create((set, get) => ({
    cart: [],
    paymentMethod: 'cash',
    loading: false,
    lastSale: null,

    addToCart: (product) => {
        const { cart } = get();
        const existing = cart.find((item) => item.product_id === product.product_id);
        const currentQty = existing ? existing.qty : 0;
        const available = product.quantity ?? 0;

        if (currentQty + 1 > available) {
            toast.error(`Insufficient stock for ${product.name}. Available: ${available}`);
            return { ok: false, message: 'No more stock' };
        }

        if (existing) {
            set({
                cart: cart.map((item) =>
                    item.product_id === product.product_id
                        ? { ...item, qty: item.qty + 1 }
                        : item
                ),
            });
        } else {
            set({
                cart: [
                    ...cart,
                    {
                        product_id: product.product_id,
                        name: product.name,
                        price: parseFloat(product.price),
                        qty: 1,
                        maxQty: available,
                        sku: product.unique_sku,
                    },
                ],
            });
        }
        return { ok: true };
    },

    removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.product_id !== productId) });
    },

    updateQty: (productId, qty) => {
        const { cart } = get();
        const item = cart.find((i) => i.product_id === productId);
        if (qty < 1) return;
        if (item && qty > item.maxQty) {
            toast.error(`Only ${item.maxQty} units available.`);
            return;
        }
        set({
            cart: cart.map((i) =>
                i.product_id === productId ? { ...i, qty } : i
            ),
        });
    },

    clearCart: () => set({ cart: [], paymentMethod: 'cash' }),

    setPaymentMethod: (method) => set({ paymentMethod: method }),

    checkout: async () => {
        const { cart, paymentMethod } = get();

        if (cart.length === 0) {
            toast.error('Cart is empty');
            return null;
        }

        set({ loading: true });
        try {
            const res = await api.post('/sales', {
                items: cart.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.qty,
                    unit_price: item.price,
                })),
                payment_method: paymentMethod,
            });

            const sale = res.data.sale || res.data.data;
            set({ lastSale: sale, cart: [], paymentMethod: 'cash' });
            toast.success('Sale completed successfully!');
            return sale;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Sale failed');
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    getTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    },
}));

export default usePosStore;
