import { create } from 'zustand';
import axios from '../api/axios';

const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

const getToday = () => new Date().toISOString().split('T')[0];

export const useDashboardStore = create((set, get) => ({
    // Raw API response data
    rawData: null,

    // Decomposed state
    kpis: {},
    salesTrend: [],
    categoryRevenue: [],
    topProducts: [],
    lowStock: [],
    recentActivity: [],
    recentSales: [],
    paymentMethods: [],
    myOrders: [],
    reviewableProducts: [],
    role: null,
    loading: false,
    error: null,

    dateRange: {
        from: getStartOfMonth(),
        to: getToday(),
    },

    setDateRange: (from, to) => {
        set({ dateRange: { from, to } });
        get().fetchDashboard(from, to);
    },

    fetchDashboard: async (from, to) => {
        const range = from && to ? { from, to } : get().dateRange;
        set({ loading: true, error: null });
        try {
            const response = await axios.get('/dashboard', {
                params: range,
            });

            if (response.data.status === 'success') {
                const d = response.data.data;
                set({
                    rawData: d,
                    role: d.role,
                    kpis: d.kpis || {},
                    salesTrend: d.sales_trend || [],
                    categoryRevenue: d.category_revenue || [],
                    topProducts: d.top_products || [],
                    lowStock: d.low_stock_items || [],
                    recentActivity: d.recent_activity || [],
                    recentSales: d.recent_sales || [],
                    paymentMethods: d.payment_methods || [],
                    myOrders: d.my_orders || [],
                    reviewableProducts: d.reviewable_products || [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
            set({
                error: error.message,
                rawData: null,
                kpis: {},
                salesTrend: [],
                categoryRevenue: [],
                topProducts: [],
                lowStock: [],
                recentActivity: [],
                recentSales: [],
                paymentMethods: [],
                myOrders: [],
                reviewableProducts: [],
            });
        } finally {
            set({ loading: false });
        }
    },

    initializeDashboard: async () => {
        const { dateRange } = get();
        await get().fetchDashboard(dateRange.from, dateRange.to);
    },
}));
