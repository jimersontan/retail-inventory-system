import { create } from 'zustand';
import api from '../api/axios';

export const usePOStore = create((set) => ({
    orders: [],
    currentOrder: null,
    stats: {
        draft: 0,
        sent: 0,
        partially_received: 0,
        received: 0,
        cancelled: 0,
    },
    loading: false,
    pagination: { currentPage: 1, lastPage: 1, total: 0, perPage: 15 },
    error: null,

    fetchOrders: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/purchase-orders', { params });
            const data = response.data;
            const orders = data.data || [];

            const stats = orders.reduce(
                (acc, order) => {
                    if (acc[order.status] !== undefined) {
                        acc[order.status] += 1;
                    }
                    return acc;
                },
                { draft: 0, sent: 0, partially_received: 0, received: 0, cancelled: 0 }
            );

            set({
                orders,
                stats,
                pagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 15,
                },
                loading: false,
            });
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to fetch purchase orders.' });
            throw error;
        }
    },

    fetchOrder: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/purchase-orders/${id}`);
            const currentOrder = response.data.data || response.data;
            set({ currentOrder, loading: false });
            return currentOrder;
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to fetch purchase order.' });
            throw error;
        }
    },

    createOrder: async (payload) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/purchase-orders', payload);
            const created = response.data.data || response.data;
            set((state) => ({ orders: [created, ...state.orders], loading: false }));
            return created;
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to create purchase order.' });
            throw error;
        }
    },

    updateOrder: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/purchase-orders/${id}`, payload);
            const updated = response.data.data || response.data;
            set((state) => ({
                orders: state.orders.map((order) => (order.po_id === id ? updated : order)),
                currentOrder: state.currentOrder?.po_id === id ? updated : state.currentOrder,
                loading: false,
            }));
            return updated;
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to update purchase order.' });
            throw error;
        }
    },

    receiveItems: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post(`/purchase-orders/${id}/receive`, payload);
            const updated = response.data.order?.data || response.data.order || response.data.data || response.data;
            set((state) => ({
                orders: state.orders.map((order) => (order.po_id === id ? updated : order)),
                currentOrder: updated,
                loading: false,
            }));
            return updated;
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to receive items.' });
            throw error;
        }
    },

    updateStatus: async (id, status) => {
        set({ loading: true, error: null });
        try {
            const response = await api.patch(`/purchase-orders/${id}/status`, { status });
            const updated = response.data.order?.data || response.data.order || response.data.data || response.data;
            set((state) => ({
                orders: state.orders.map((order) => (order.po_id === id ? updated : order)),
                currentOrder: state.currentOrder?.po_id === id ? updated : state.currentOrder,
                loading: false,
            }));
            return updated;
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to update order status.' });
            throw error;
        }
    },

    cancelOrder: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.patch(`/purchase-orders/${id}/cancel`);
            const updated = response.data.order?.data || response.data.order || response.data.data || response.data;
            set((state) => ({
                orders: state.orders.map((order) => (order.po_id === id ? updated : order)),
                currentOrder: state.currentOrder?.po_id === id ? updated : state.currentOrder,
                loading: false,
            }));
            return updated;
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to cancel order.' });
            throw error;
        }
    },
}));
