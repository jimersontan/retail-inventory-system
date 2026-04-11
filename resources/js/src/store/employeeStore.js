import { create } from 'zustand';
import api from '../api/axios';

export const useEmployeeStore = create((set, get) => ({
    employees: [],
    pagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15
    },
    loading: false,
    error: null,
    selectedEmployee: null,

    fetchEmployees: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await api.get(`/employees?${queryParams}`);
            
            // Assuming Laravel pagination payload structure
            const data = response.data;
            set({ 
                employees: data.data || [], 
                pagination: {
                    currentPage: data.meta?.current_page || 1,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                    perPage: data.meta?.per_page || 15
                },
                loading: false 
            });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch employees', loading: false });
            throw error;
        }
    },

    fetchEmployee: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/employees/${id}`);
            const data = response.data.data || response.data;
            set({ selectedEmployee: data, loading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch employee', loading: false });
            throw error;
        }
    },

    createEmployee: async (employeeData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/employees', employeeData);
            const newEmployee = response.data.data || response.data;
            // Best practice with pagination is often to refetch, but we can optimistically append or let the component refetch
            set((state) => ({ loading: false }));
            return newEmployee;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to create employee', loading: false });
            throw error;
        }
    },

    updateEmployee: async (id, employeeData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/employees/${id}`, employeeData);
            const updatedEmployee = response.data.data || response.data;
            set((state) => ({
                employees: state.employees.map(e => e.employee_id === id ? updatedEmployee : e),
                selectedEmployee: state.selectedEmployee?.employee_id === id ? updatedEmployee : state.selectedEmployee,
                loading: false
            }));
            return updatedEmployee;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to update employee', loading: false });
            throw error;
        }
    },

    toggleEmployeeStatus: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.patch(`/employees/${id}/toggle`);
            const updatedEmployee = response.data.employee || response.data.data;
            set((state) => ({
                employees: state.employees.map(e => e.employee_id === id ? updatedEmployee : e),
                selectedEmployee: state.selectedEmployee?.employee_id === id ? updatedEmployee : state.selectedEmployee,
                loading: false
            }));
            return updatedEmployee;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to toggle status', loading: false });
            throw error;
        }
    },

    clearSelectedEmployee: () => set({ selectedEmployee: null })
}));
