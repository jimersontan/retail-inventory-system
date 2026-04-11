import { create } from 'zustand';
import toast from 'react-hot-toast';

const useAdjustmentStore = create((set, get) => ({
    adjustments: [],
    stats: {
        total_adjustments: 0,
        today_count: 0,
        total_in_qty: 0,
        total_out_qty: 0,
    },
    loading: false,
    pagination: {
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
    },
    currentAdjustment: null,

    // Fetch all adjustments with optional filters
    fetchAdjustments: async (params = {}) => {
        set({ loading: true });
        try {
            const queryParams = new URLSearchParams();
            if (params.branch_id) queryParams.append('branch_id', params.branch_id);
            if (params.reason) queryParams.append('reason', params.reason);
            if (params.type) queryParams.append('type', params.type);
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);
            if (params.moved_by) queryParams.append('moved_by', params.moved_by);
            if (params.search) queryParams.append('search', params.search);
            if (params.page) queryParams.append('page', params.page);

            const response = await fetch(`/api/adjustments?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch adjustments');

            const data = await response.json();

            set({
                adjustments: data.data || [],
                stats: data.stats || {},
                pagination: data.pagination || {},
                loading: false,
            });
        } catch (error) {
            set({ loading: false });
            toast.error('Failed to load adjustments: ' + error.message);
        }
    },

    // Create a new bulk adjustment
    createAdjustment: async (adjustmentData) => {
        try {
            const response = await fetch('/api/adjustments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content'),
                },
                body: JSON.stringify(adjustmentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create adjustment');
            }

            const data = await response.json();
            toast.success(data.message);

            // Refetch adjustments to update the list
            await get().fetchAdjustments();

            return data;
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    },

    // Set current adjustment for detail view
    setCurrentAdjustment: (adjustment) => {
        set({ currentAdjustment: adjustment });
    },

    // Clear current adjustment
    clearCurrentAdjustment: () => {
        set({ currentAdjustment: null });
    },

    // Delete an adjustment (not typical, but included for reference)
    deleteAdjustment: async (movementId) => {
        try {
            const response = await fetch(`/api/adjustments/${movementId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content'),
                },
            });

            if (!response.ok) throw new Error('Failed to delete adjustment');

            toast.success('Adjustment deleted');
            await get().fetchAdjustments();
        } catch (error) {
            toast.error('Error: ' + error.message);
        }
    },
}));

export default useAdjustmentStore;
