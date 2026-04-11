import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useProductStore = create(
    persist(
        (set, get) => ({
            products: [],
            selectedProduct: null,
            viewMode: 'table', // 'grid' | 'table'
            pagination: { currentPage: 1, lastPage: 1, total: 0, perPage: 20 },
            loading: false,
            error: null,

            setViewMode: (mode) => set({ viewMode: mode }),

            fetchProducts: async (params = {}) => {
                set({ loading: true, error: null });
                try {
                    const queryParams = new URLSearchParams(params).toString();
                    const response = await api.get(`/products?${queryParams}`);
                    const data = response.data;
                    set({ 
                        products: data.data || [],
                        pagination: {
                            currentPage: data.meta?.current_page || 1,
                            lastPage: data.meta?.last_page || 1,
                            total: data.meta?.total || 0,
                            perPage: data.meta?.per_page || 20
                        },
                        loading: false 
                    });
                } catch (error) {
                    set({ error: error.message, loading: false });
                }
            },

            fetchProduct: async (id) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.get(`/products/${id}`);
                    const product = response.data.data || response.data;
                    set({ selectedProduct: product, loading: false });
                    return product;
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            createProduct: async (data) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.post('/products', data);
                    set({ loading: false });
                    return response.data.data || response.data;
                } catch (error) {
                    set({ error: error.response?.data?.message || 'Failed to create product', loading: false });
                    throw error;
                }
            },

            updateProduct: async (id, data) => {
                set({ loading: true, error: null });
                try {
                    // If data is FormData, we assume it has _method: 'PUT' appended
                    // and we must use POST for it to work correctly with PHP file uploads
                    const response = data instanceof FormData 
                        ? await api.post(`/products/${id}`, data)
                        : await api.put(`/products/${id}`, data);
                        
                    const updatedProduct = response.data.data || response.data;
                    set(state => ({
                        products: state.products.map(p => p.product_id === id ? updatedProduct : p),
                        selectedProduct: state.selectedProduct?.product_id === id ? updatedProduct : state.selectedProduct,
                        loading: false
                    }));
                    return updatedProduct;
                } catch (error) {
                    set({ error: error.message, loading: false });
                    throw error;
                }
            },

            updateProductStatus: async (id, status) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.patch(`/products/${id}/status`, { status });
                    const updatedProduct = response.data.product || response.data.data;
                    set(state => ({
                        products: state.products.map(p => p.product_id === id ? updatedProduct : p),
                        selectedProduct: state.selectedProduct?.product_id === id ? updatedProduct : state.selectedProduct,
                        loading: false
                    }));
                    return updatedProduct;
                } catch (error) {
                    set({ error: error.response?.data?.message || 'Update failed', loading: false });
                    throw error;
                }
            },

            deleteProduct: async (id) => {
                set({ loading: true, error: null });
                try {
                    await api.delete(`/products/${id}`);
                    set(state => ({
                        products: state.products.filter(p => p.product_id !== id),
                        loading: false
                    }));
                } catch (error) {
                    set({ error: error.response?.data?.message || 'Delete failed', loading: false });
                    throw error;
                }
            }
        }),
        {
            name: 'product-store-prefs',
            partialize: (state) => ({ viewMode: state.viewMode })
        }
    )
);
