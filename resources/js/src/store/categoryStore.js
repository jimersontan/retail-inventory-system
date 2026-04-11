import { create } from 'zustand';
import api from '../api/axios';

export const useCategoryStore = create((set) => ({
    categories: [],
    loading: false,
    error: null,

    fetchCategories: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await api.get(`/categories?${queryParams}`);
            set({ categories: response.data.data || response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createCategory: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/categories', data);
            const newCategory = response.data.data || response.data;
            set((state) => ({
                categories: [...state.categories, newCategory],
                loading: false
            }));
            return newCategory;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateCategory: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/categories/${id}`, data);
            const updatedCategory = response.data.data || response.data;
            set((state) => ({
                categories: state.categories.map(c => c.category_id === id ? updatedCategory : c),
                loading: false
            }));
            return updatedCategory;
        } catch (error) {
            set({ error: error.response?.data?.message || error.message, loading: false });
            throw error;
        }
    },

    toggleCategoryStatus: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.patch(`/categories/${id}/toggle`);
            const updatedCategory = response.data.category || response.data.data;
            set((state) => ({
                categories: state.categories.map(c => c.category_id === id ? updatedCategory : c),
                loading: false
            }));
            return updatedCategory;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to toggle status', loading: false });
            throw error;
        }
    }
}));
