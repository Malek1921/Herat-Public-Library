import { create } from 'zustand';

export const useUser = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,

    setUser: (user, token) => {
        if (user && token) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
        }
        set({ user, token, error: null });
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null, error: null });
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    isAuthenticated: () => {
        const { user, token } = set.getState?.() || {};
        return !!(user && token);
    },

    isAdmin: () => {
        const { user } = set.getState?.() || {};
        return user?.role === 'admin';
    },
}));