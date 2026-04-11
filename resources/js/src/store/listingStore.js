import { create } from 'zustand';
import api from '../api/axios';

export const useListingStore = create((set, get) => ({
    listings: [],
    currentListing: null,
    loading: false,
    pagination: { currentPage: 1, lastPage: 1, total: 0, perPage: 12 },

    // Fetch listings
    fetchListings: async (params = {}) => {
        set({ loading: true });
        try {
            const response = await api.get('/listings', { params });
            const data = response.data;
            set({
                listings: data.data || [],
                pagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 12,
                },
                loading: false,
            });
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            set({ loading: false });
            throw error;
        }
    },

    // Create or update listing
    saveListing: async (data) => {
        try {
            let response;
            if (data.seller_id) {
                // Update existing
                response = await api.put(`/listings/${data.seller_id}`, data);
            } else {
                // Create new
                response = await api.post('/listings', data);
            }
            const listing = response.data.data || response.data;
            
            // Update in listings array
            set(state => {
                const existingIndex = state.listings.findIndex(l => l.seller_id === listing.seller_id);
                if (existingIndex >= 0) {
                    const updated = [...state.listings];
                    updated[existingIndex] = listing;
                    return { listings: updated, currentListing: listing };
                } else {
                    return { listings: [listing, ...state.listings], currentListing: listing };
                }
            });
            
            return listing;
        } catch (error) {
            console.error('Failed to save listing:', error);
            throw error;
        }
    },

    // Toggle listing availability
    toggleListing: async (id) => {
        try {
            const response = await api.patch(`/listings/${id}/toggle`);
            const listing = response.data.data || response.data;
            
            set(state => ({
                listings: state.listings.map(l => l.seller_id === id ? listing : l),
                currentListing: state.currentListing?.seller_id === id ? listing : state.currentListing,
            }));
            
            return listing;
        } catch (error) {
            console.error('Failed to toggle listing:', error);
            throw error;
        }
    },

    // Delete listing
    deleteListing: async (id) => {
        try {
            await api.delete(`/listings/${id}`);
            
            set(state => ({
                listings: state.listings.filter(l => l.seller_id !== id),
                currentListing: state.currentListing?.seller_id === id ? null : state.currentListing,
            }));
        } catch (error) {
            console.error('Failed to delete listing:', error);
            throw error;
        }
    },

    setCurrentListing: (listing) => set({ currentListing: listing }),
    clearCurrentListing: () => set({ currentListing: null }),
}));
