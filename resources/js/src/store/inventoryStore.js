import { create } from 'zustand';
import api from '../api/axios';

export const useInventoryStore = create((set) => ({
    inventory: [],
    selectedItem: null,
    movements: [],
    pagination: { currentPage: 1, lastPage: 1, total: 0, perPage: 20 },
    movementsPagination: { currentPage: 1, lastPage: 1, total: 0, perPage: 15 },
    loading: false,
    movementsLoading: false,
    error: null,

    fetchInventory: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await api.get(`/inventory?${queryParams}`);
            const data = response.data;
            set({ 
                inventory: data.data || [],
                pagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 20
                },
                loading: false 
            });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchInventoryItem: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/inventory/${id}`);
            const item = response.data.data || response.data;
            set({ selectedItem: item, loading: false });
            return item;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    adjustStock: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/inventory/adjust', data);
            const updatedItem = response.data.data || response.data;
            set(state => ({
                inventory: state.inventory.map(i => i.inventory_id === updatedItem.inventory_id ? updatedItem : i),
                selectedItem: state.selectedItem?.inventory_id === updatedItem.inventory_id ? updatedItem : state.selectedItem,
                loading: false
            }));
            return updatedItem;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to adjust stock', loading: false });
            throw error;
        }
    },

    fetchMovements: async (params = {}) => {
        set({ movementsLoading: true, error: null });
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await api.get(`/stock-movements?${queryParams}`);
            const data = response.data;
            set({ 
                movements: data.data || [],
                movementsPagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 15
                },
                movementsLoading: false 
            });
        } catch (error) {
            set({ error: error.message, movementsLoading: false });
        }
    }
}));
