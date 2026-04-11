import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Zustand persist stores data inside 'state' key
        const authStore = JSON.parse(localStorage.getItem('ris-auth'));
        const token = authStore?.state?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthenticated: clear store and redirect
            useAuthStore.getState().logout();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            // Unauthorized
            if (window.location.pathname !== '/unauthorized') {
                window.location.href = '/unauthorized';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
