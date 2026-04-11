import { create } from 'zustand';
import api from '../api/axios';

export const useBranchStore = create((set, get) => ({
    branches: [],
    loading: false,
    error: null,
    selectedBranch: null,

    fetchBranches: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/branches');
            set({ branches: response.data.data || response.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch branches', loading: false });
            throw error;
        }
    },

    fetchBranch: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/branches/${id}`);
            set({ selectedBranch: response.data.data || response.data, loading: false });
            return response.data.data || response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch branch', loading: false });
            throw error;
        }
    },

    createBranch: async (branchData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/branches', branchData);
            const newBranch = response.data.data || response.data;
            set((state) => ({ 
                branches: [...state.branches, newBranch],
                loading: false 
            }));
            return newBranch;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to create branch', loading: false });
            throw error;
        }
    },

    updateBranch: async (id, branchData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/branches/${id}`, branchData);
            const updatedBranch = response.data.data || response.data;
            set((state) => ({
                branches: state.branches.map(b => b.branch_id === id ? updatedBranch : b),
                selectedBranch: state.selectedBranch?.branch_id === id ? updatedBranch : state.selectedBranch,
                loading: false
            }));
            return updatedBranch;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to update branch', loading: false });
            throw error;
        }
    },

    toggleBranchStatus: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.patch(`/branches/${id}/toggle`);
            const updatedBranch = response.data.branch || response.data.data;
            set((state) => ({
                branches: state.branches.map(b => b.branch_id === id ? updatedBranch : b),
                selectedBranch: state.selectedBranch?.branch_id === id ? updatedBranch : state.selectedBranch,
                loading: false
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to toggle status', loading: false });
            throw error;
        }
    },

    clearSelectedBranch: () => set({ selectedBranch: null })
}));
