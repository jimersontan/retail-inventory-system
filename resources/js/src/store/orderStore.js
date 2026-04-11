import { create } from 'zustand';
import api from '../api/axios';

export const useOrderStore = create((set, get) => ({
    orders: [],
    currentOrder: null,
    loading: false,
    pagination: { currentPage: 1, lastPage: 1, total: 0, perPage: 10 },
    kanbanView: true,
    statusCounts: {},

    // Fetch orders with filtering
    fetchOrders: async (params = {}) => {
        set({ loading: true });
        try {
            const response = await api.get('/orders', { params });
            const data = response.data;
            set({
                orders: data.data || [],
                pagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 10,
                },
                loading: false,
            });

            // Calculate status counts
            const counts = {};
            data.data?.forEach(order => {
                counts[order.status] = (counts[order.status] || 0) + 1;
            });
            set({ statusCounts: counts });
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    // Fetch single order
    fetchOrder: async (id) => {
        set({ loading: true });
        try {
            const response = await api.get(`/orders/${id}`);
            const order = response.data.data || response.data;
            set({ currentOrder: order, loading: false });
            return order;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    // Place new order
    placeOrder: async (data) => {
        set({ loading: true });
        try {
            const response = await api.post('/orders', data);
            const order = response.data.data || response.data;
            set(state => ({
                orders: [order, ...state.orders],
                loading: false,
            }));
            return order;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    // Update order status
    updateStatus: async (id, status) => {
        set({ loading: true });
        try {
            const response = await api.patch(`/orders/${id}/status`, { status });
            const order = response.data.data || response.data;
            set(state => ({
                orders: state.orders.map(o => o.order_id === id ? order : o),
                currentOrder: state.currentOrder?.order_id === id ? order : state.currentOrder,
                loading: false,
            }));
            return order;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    // Cancel order
    cancelOrder: async (id) => {
        set({ loading: true });
        try {
            const response = await api.patch(`/orders/${id}/cancel`);
            const order = response.data.data || response.data;
            set(state => ({
                orders: state.orders.map(o => o.order_id === id ? order : o),
                currentOrder: state.currentOrder?.order_id === id ? order : state.currentOrder,
                loading: false,
            }));
            return order;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    // Confirm payment
    confirmPayment: async (id, data) => {
        set({ loading: true });
        try {
            const response = await api.post(`/orders/${id}/confirm-payment`, data);
            const order = response.data.data || response.data;
            set(state => ({
                orders: state.orders.map(o => o.order_id === id ? order : o),
                currentOrder: state.currentOrder?.order_id === id ? order : state.currentOrder,
                loading: false,
            }));
            return order;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    // Toggle view mode
    setKanbanView: (value) => set({ kanbanView: value }),

    // Clear current order
    clearCurrentOrder: () => set({ currentOrder: null }),
}));
