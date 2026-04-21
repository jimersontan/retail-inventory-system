import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import usePermissions from './hooks/usePermissions';

// Layout & Auth
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Dashboards — role-specific
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import CashierDashboard from './pages/dashboard/CashierDashboard';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';

// CRUD Pages
import BranchList from './pages/branches/BranchList';
import BranchDetail from './pages/branches/BranchDetail';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import CategoryList from './pages/categories/CategoryList';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import InventoryList from './pages/inventory/InventoryList';
import POList from './pages/purchaseOrders/POList';
import POForm from './pages/purchaseOrders/POForm';
import PODetail from './pages/purchaseOrders/PODetail';
import POSPage from './pages/pos/POSPage';
import SalesList from './pages/sales/SalesList';

// Order & Payment Pages
import CustomerOrderList from './pages/orders/CustomerOrderList';
import CustomerOrderDetail from './pages/orders/CustomerOrderDetail';
import OrderManagement from './pages/orders/OrderManagement';

// Customer Management Pages
import CustomerList from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import CustomerProfile from './pages/customers/CustomerProfile';

// Review & Reports
import ReviewManagement from './pages/reviews/ReviewManagement';
import ReportsPage from './pages/reports/ReportsPage';
import ShopPage from './pages/shop/ShopPage';
import AdjustmentList from './pages/adjustments/AdjustmentList';

// Admin-only Pages
import UserAccounts from './pages/users/UserAccounts';
import RolesPage from './pages/users/RolesPage';

/**
 * RoleBasedDashboard — renders the correct dashboard based on user_type.
 * This is the core role-gating component for the /dashboard route.
 */
const RoleBasedDashboard = () => {
    const { role } = usePermissions();
    if (role === 'admin') return <AdminDashboard />;
    if (role === 'manager') return <ManagerDashboard />;
    if (role === 'cashier') return <CashierDashboard />;
    if (role === 'customer') return <CustomerDashboard />;
    return <Navigate to="/login" />;
};

const App = () => {
    return (
        <>
            <Toaster position="top-right" toastOptions={{
                duration: 3000,
                style: { fontSize: '14px', borderRadius: '12px' },
            }} />

            <Routes>
                {/* Public */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Authenticated Shell */}
                <Route element={<MainLayout />}>

                    {/* Shared routes for ALL Authenticated Users */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<RoleBasedDashboard />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                    </Route>

                    {/* Admin + Manager + Cashier - Product Discovery */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']} />}>
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/categories" element={<CategoryList />} />
                        <Route path="/pos" element={<POSPage />} />
                        <Route path="/orders/manage" element={<OrderManagement />} />
                    </Route>

                    {/* Admin + Manager only - Management & Operations */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                        <Route path="/employees" element={<EmployeeList />} />
                        <Route path="/employees/:id" element={<EmployeeDetail />} />
                        <Route path="/inventory" element={<InventoryList />} />
                        <Route path="/inventory/adjustments" element={<AdjustmentList />} />
                        <Route path="/purchase-orders" element={<POList />} />
                        <Route path="/purchase-orders/create" element={<POForm />} />
                        <Route path="/purchase-orders/:id/edit" element={<POForm />} />
                        <Route path="/purchase-orders/:id" element={<PODetail />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/sales" element={<SalesList />} />
                        <Route path="/reviews" element={<ReviewManagement />} />
                        <Route path="/customers" element={<CustomerList />} />
                        <Route path="/customers/:id" element={<CustomerDetail />} />
                    </Route>

                    {/* Admin only */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/branches" element={<BranchList />} />
                        <Route path="/branches/:id" element={<BranchDetail />} />
                        <Route path="/users" element={<UserAccounts />} />
                        <Route path="/roles" element={<RolesPage />} />
                    </Route>
                    {/* Customer only */}
                    <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/my-orders" element={<CustomerOrderList />} />
                        <Route path="/my-orders/:id" element={<CustomerOrderDetail />} />
                        <Route path="/my-reviews" element={<ReviewManagement />} />
                        <Route path="/profile" element={<CustomerProfile />} />
                    </Route>

                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </>
    );
};

export default App;
