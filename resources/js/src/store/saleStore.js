import { create } from 'zustand';
import api from '../api/axios';

export const useSaleStore = create((set) => ({
    sales: [],
    currentSale: null,
    stats: {
        todayCount: 0,
        todayTotal: 0,
        weekTotal: 0,
        monthTotal: 0,
        avgSale: 0,
    },
    loading: false,
    pagination: { currentPage: 1, lastPage: 1, total: 0, perPage: 20 },
    error: null,

    fetchSales: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/sales', { params });
            const data = response.data;
            const sales = data.data || [];

            const now = new Date();
            const today = now.toDateString();
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);

            const todaySales = sales.filter((s) => new Date(s.sale_date).toDateString() === today);
            const weekSales = sales.filter((s) => new Date(s.sale_date) >= weekAgo);
            const monthSales = sales.filter((s) => new Date(s.sale_date) >= monthAgo);
            const totalAmount = sales.reduce((sum, s) => sum + Number(s.sale_amount || 0), 0);

            set({
                sales,
                stats: {
                    todayCount: todaySales.length,
                    todayTotal: todaySales.reduce((sum, s) => sum + Number(s.sale_amount || 0), 0),
                    weekTotal: weekSales.reduce((sum, s) => sum + Number(s.sale_amount || 0), 0),
                    monthTotal: monthSales.reduce((sum, s) => sum + Number(s.sale_amount || 0), 0),
                    avgSale: sales.length ? totalAmount / sales.length : 0,
                },
                pagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 20,
                },
                loading: false,
            });
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to fetch sales.' });
            throw error;
        }
    },

    fetchSale: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/sales/${id}`);
            const sale = response.data.data || response.data;
            set({ currentSale: sale, loading: false });
            return sale;
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to fetch sale detail.' });
            throw error;
        }
    },
}));

