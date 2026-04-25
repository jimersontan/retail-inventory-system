import { create } from 'zustand';
import axios from '../api/axios';

// Simple date utilities to avoid external dependency
const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

export const useReportStore = create((set, get) => ({
    // State
    activeTab: 'sales',
    
    salesData: {},
    inventoryData: {},
    purchaseData: {},
    movementData: {},
    
    loading: false,
    
    dateRange: {
        from: getStartOfMonth(),
        to: getToday(),
    },

    // Actions
    setActiveTab: (tab) => {
        set({ activeTab: tab });
        const { dateRange } = get();
        if (tab === 'sales') get().fetchSalesReport(dateRange.from, dateRange.to);
        if (tab === 'inventory') get().fetchInventoryReport(dateRange.from, dateRange.to);
        if (tab === 'purchases') get().fetchPurchaseReport(dateRange.from, dateRange.to);
        if (tab === 'movements') get().fetchMovementReport(dateRange.from, dateRange.to);
    },

    setDateRange: (from, to) => {
        set({ dateRange: { from, to } });
        // Refetch active tab data
        const { activeTab } = get();
        if (activeTab === 'sales') get().fetchSalesReport(from, to);
        if (activeTab === 'inventory') get().fetchInventoryReport(from, to);
        if (activeTab === 'purchases') get().fetchPurchaseReport(from, to);
        if (activeTab === 'movements') get().fetchMovementReport(from, to);
    },

    fetchSalesReport: async (from, to) => {
        set({ loading: true });
        try {
            const response = await axios.get('/reports/sales', {
                params: { from, to }
            });
            
            if (response.data.status === 'success') {
                set({ salesData: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch sales report:', error);
            set({ salesData: {} });
        } finally {
            set({ loading: false });
        }
    },

    fetchInventoryReport: async (from, to) => {
        set({ loading: true });
        try {
            const response = await axios.get('/reports/inventory', {
                params: { from, to }
            });
            
            if (response.data.status === 'success') {
                set({ inventoryData: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch inventory report:', error);
            set({ inventoryData: {} });
        } finally {
            set({ loading: false });
        }
    },

    fetchPurchaseReport: async (from, to) => {
        set({ loading: true });
        try {
            const response = await axios.get('/reports/purchases', {
                params: { from, to }
            });
            
            if (response.data.status === 'success') {
                set({ purchaseData: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch purchase report:', error);
            set({ purchaseData: {} });
        } finally {
            set({ loading: false });
        }
    },

    fetchMovementReport: async (from, to) => {
        set({ loading: true });
        try {
            const response = await axios.get('/reports/movements', {
                params: { from, to }
            });
            
            if (response.data.status === 'success') {
                set({ movementData: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch movement report:', error);
            set({ movementData: {} });
        } finally {
            set({ loading: false });
        }
    },

    exportReport: async (type, from, to) => {
        try {
            const response = await axios.get('/reports/export', {
                params: { type, from, to },
                responseType: 'blob'
            });

            // Create blob and trigger download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ris_${type}_report.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export report:', error);
        }
    },

    // Initialize reports
    initializeReports: async () => {
        const { dateRange } = get();
        await get().fetchSalesReport(dateRange.from, dateRange.to);
    },
}));
