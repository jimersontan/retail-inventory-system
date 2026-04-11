import { create } from 'zustand';
import api from '../api/axios';

export const useCustomerStore = create((set, get) => ({
    customers: [],
    currentCustomer: null,
    loading: false,
    pagination: { currentPage: 1, lastPage: 1, total: 0, perPage: 15 },

    // Fetch customers with filtering
    fetchCustomers: async (params = {}) => {
        set({ loading: true });
        try {
            const response = await api.get('/customers', { params });
            const data = response.data;
            set({
                customers: data.data || [],
                pagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 15,
                },
                loading: false,
            });
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            set({ loading: false });
            throw error;
        }
    },

    // Fetch single customer
    fetchCustomer: async (id) => {
        set({ loading: true });
        try {
            const response = await api.get(`/customers/${id}`);
            set({ currentCustomer: response.data.data, loading: false });
        } catch (error) {
            console.error('Failed to fetch customer:', error);
            set({ loading: false });
            throw error;
        }
    },

    // Create new customer (registration)
    createCustomer: async (data) => {
        try {
            const response = await api.post('/customers', data);
            const newCustomer = response.data.data;
            set({ currentCustomer: newCustomer });
            return newCustomer;
        } catch (error) {
            console.error('Failed to create customer:', error);
            throw error;
        }
    },

    // Update customer profile
    updateCustomer: async (id, data) => {
        try {
            const response = await api.put(`/customers/${id}`, data);
            set({ currentCustomer: response.data.data });
            // Update in customers list
            set(state => ({
                customers: state.customers.map(c => c.customer_id === id ? response.data.data : c)
            }));
            return response.data.data;
        } catch (error) {
            console.error('Failed to update customer:', error);
            throw error;
        }
    },

    // Verify customer (admin only)
    verifyCustomer: async (id) => {
        try {
            const response = await api.patch(`/customers/${id}/verify`);
            set({ currentCustomer: response.data.data });
            set(state => ({
                customers: state.customers.map(c => c.customer_id === id ? response.data.data : c)
            }));
            return response.data.data;
        } catch (error) {
            console.error('Failed to verify customer:', error);
            throw error;
        }
    },

    // Toggle customer status (admin only)
    toggleCustomerStatus: async (id) => {
        try {
            const response = await api.patch(`/customers/${id}/toggle-status`);
            set({ currentCustomer: response.data.data });
            set(state => ({
                customers: state.customers.map(c => c.customer_id === id ? response.data.data : c)
            }));
            return response.data.data;
        } catch (error) {
            console.error('Failed to toggle customer status:', error);
            throw error;
        }
    },

    clearCurrentCustomer: () => set({ currentCustomer: null }),
}));
