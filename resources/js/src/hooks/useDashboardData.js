import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

/**
 * useDashboardData — convenience hook that fetches dashboard data on mount
 * and exposes date range controls + refetch.
 */
const useDashboardData = () => {
    const {
        kpis, salesTrend, categoryRevenue, topProducts, lowStock,
        recentActivity, loading, dateRange, setDateRange, fetchDashboard,
        initializeDashboard,
    } = useDashboardStore();

    // Retrieve the full raw data object for role-specific fields
    const data = useDashboardStore((s) => s.rawData);

    useEffect(() => {
        initializeDashboard();
    }, []);

    return {
        data,
        kpis,
        salesTrend,
        categoryRevenue,
        topProducts,
        lowStock,
        recentActivity,
        loading,
        dateRange,
        setDateRange,
        refetch: () => fetchDashboard(dateRange.from, dateRange.to),
    };
};

export default useDashboardData;
