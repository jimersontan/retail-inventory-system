import { useMemo } from 'react';
import useAuthStore from '../store/authStore';

export const useBranchScope = () => {
    const user = useAuthStore((state) => state.user);

    return useMemo(() => {
        if (!user) {
            return {
                isAdmin: false,
                isManager: false,
                isCashier: false,
                canEdit: false,
                isScopedAccess: false,
                userBranchId: null
            };
        }

        const isAdmin = user.user_type === 'admin';
        const isManager = user.user_type === 'manager';
        const isCashier = user.user_type === 'cashier';
        const isCustomer = user.user_type === 'customer';
        
        // Admin gets full access, Manager/Cashier gets their specific branch
        const isScopedAccess = isManager || isCashier;
        
        // Ensure to access the branch_id gracefully matching backend relations
        const userBranchId = user.employee?.branch_id || null;

        return {
            isAdmin,
            isManager,
            isCashier,
            isCustomer,
            canEdit: isAdmin || isManager, // Admins and Managers have editing capabilities
            isScopedAccess,
            userBranchId
        };
    }, [user]);
};

export default useBranchScope;
