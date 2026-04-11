import React from 'react';
import usePermissions from '../../hooks/usePermissions';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import CashierDashboard from './CashierDashboard';
import CustomerDashboard from './CustomerDashboard';
import { Navigate } from 'react-router-dom';

/**
 * DashboardPage — legacy wrapper that renders the correct role-specific dashboard.
 * Kept for backward compatibility.
 */
const DashboardPage = () => {
    const { role } = usePermissions();

    if (role === 'admin') return <AdminDashboard />;
    if (role === 'manager') return <ManagerDashboard />;
    if (role === 'cashier') return <CashierDashboard />;
    if (role === 'customer') return <CustomerDashboard />;
    return <Navigate to="/login" />;
};

export default DashboardPage;
