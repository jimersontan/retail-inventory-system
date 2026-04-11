import useAuthStore from '../store/authStore';

/**
 * usePermissions — centralized role-checking hook.
 * Used in every component to gate features by user role.
 */
const usePermissions = () => {
    const user = useAuthStore((s) => s.user);
    const role = user?.user_type?.toLowerCase();

    return {
        role,
        isAdmin: role === 'admin',
        isManager: role === 'manager',
        isCashier: role === 'cashier',
        isCustomer: role === 'customer',
        isAdminOrManager: role === 'admin' || role === 'manager',
        canManageUsers: role === 'admin',
        canManageBranches: role === 'admin',
        canManageRoles: role === 'admin',
        canSeeCostPrice: role === 'admin' || role === 'manager',
        canSeeSalary: role === 'admin',
        canCreateSales: role === 'cashier' || role === 'admin',
        canManageInventory: role === 'admin' || role === 'manager',
        canManagePO: role === 'admin' || role === 'manager',
        canPlaceOrders: role === 'customer',
        canWriteReviews: role === 'customer',
        branchId: user?.employee?.branch?.branch_id ?? user?.employee?.branch_id ?? null,
    };
};

export default usePermissions;
