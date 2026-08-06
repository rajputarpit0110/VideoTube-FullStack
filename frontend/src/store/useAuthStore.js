import { create } from 'zustand';
import axiosInstance from '../utils/axios';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sidebarOpen: true,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get('/users/current-user');
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    const res = await axiosInstance.post('/users/login', credentials);
    const user = res.data.data.user;
    set({ user, isAuthenticated: true });
    return user;
  },

  register: async (formData) => {
    const res = await axiosInstance.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  logout: async () => {
    try {
      await axiosInstance.post('/users/logout');
    } catch (e) {
      // Ignore error during logout
    }
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updatedUserData) => set((state) => ({
    user: { ...state.user, ...updatedUserData }
  }))
}));
