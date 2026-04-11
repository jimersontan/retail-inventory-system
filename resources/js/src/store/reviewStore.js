import { create } from 'zustand';
import api from '../api/axios';

export const useReviewStore = create((set, get) => ({
    reviews: [],
    currentReview: null,
    stats: {},
    loading: false,
    pagination: { currentPage: 1, lastPage: 1, total: 0, perPage: 15 },

    // Fetch all reviews (admin/manager - management page)
    fetchReviews: async (params = {}) => {
        set({ loading: true });
        try {
            const response = await api.get('/reviews', { params });
            const data = response.data;
            set({
                reviews: data.data || [],
                stats: data.stats || {},
                pagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 15,
                },
                loading: false,
            });
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            set({ loading: false });
            throw error;
        }
    },

    // Fetch reviews for a specific product (public)
    fetchProductReviews: async (productId, page = 1) => {
        set({ loading: true });
        try {
            const response = await api.get(`/products/${productId}/reviews`, { 
                params: { page } 
            });
            const data = response.data;
            set({
                reviews: data.data || [],
                pagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 10,
                },
                loading: false,
            });
        } catch (error) {
            console.error('Failed to fetch product reviews:', error);
            set({ loading: false });
            throw error;
        }
    },

    // Submit a new review
    submitReview: async (productId, data) => {
        try {
            const response = await api.post(`/products/${productId}/reviews`, data);
            const newReview = response.data.data || response.data;
            set(state => ({
                reviews: [newReview, ...state.reviews],
                currentReview: newReview,
            }));
            return newReview;
        } catch (error) {
            console.error('Failed to submit review:', error);
            throw error;
        }
    },

    // Update existing review
    updateReview: async (reviewId, data) => {
        try {
            const response = await api.put(`/reviews/${reviewId}`, data);
            const updated = response.data.data || response.data;
            set(state => ({
                reviews: state.reviews.map(r => r.review_id === reviewId ? updated : r),
                currentReview: state.currentReview?.review_id === reviewId ? updated : state.currentReview,
            }));
            return updated;
        } catch (error) {
            console.error('Failed to update review:', error);
            throw error;
        }
    },

    // Delete review
    deleteReview: async (reviewId) => {
        try {
            await api.delete(`/reviews/${reviewId}`);
            set(state => ({
                reviews: state.reviews.filter(r => r.review_id !== reviewId),
                currentReview: state.currentReview?.review_id === reviewId ? null : state.currentReview,
            }));
        } catch (error) {
            console.error('Failed to delete review:', error);
            throw error;
        }
    },

    // Set current review for modal/detail view
    setCurrentReview: (review) => set({ currentReview: review }),
    
    // Clear current review
    clearCurrentReview: () => set({ currentReview: null }),
}));
