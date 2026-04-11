import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (email, password) => {
                const response = await api.post('/login', { email, password });
                const { token, user } = response.data;
                // Normalize user_type to lowercase
                if (user && user.user_type) {
                    user.user_type = user.user_type.toLowerCase();
                }
                set({ user, token, isAuthenticated: true });
                return user;
            },

            logout: async () => {
                try {
                    // Try to notify the backend via token deletion if there is a token.
                    const state = JSON.parse(localStorage.getItem('ris-auth'))?.state;
                    if (state?.token) {
                        await api.post('/logout');
                    }
                } catch (error) {
                    // Ignore errors on logout since we're clearing the token anyway
                    console.error("Logout error", error);
                } finally {
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            fetchMe: async () => {
                try {
                    const response = await api.get('/me');
                    // Ensure we handle Resource wrapping if applicable
                    const userData = response.data.data ? response.data.data : response.data;
                    // Normalize user_type to lowercase
                    if (userData && userData.user_type) {
                        userData.user_type = userData.user_type.toLowerCase();
                    }
                    set({ user: userData, isAuthenticated: true });
                } catch (error) {
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'ris-auth',
        }
    )
);

export default useAuthStore;
