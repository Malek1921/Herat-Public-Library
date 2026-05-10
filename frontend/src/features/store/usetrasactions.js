import { create } from 'zustand';

export const useTransactions = create((set) => ({
    transactions: [],
    editingTransaction: null,
    loading: false,

    setTransactions: (transactions) => set({ transactions }),
    addTransaction: (transaction) =>
        set((state) => ({
            transactions: [transaction, ...state.transactions],
        })),
    updateTransaction: (id, updates) =>
        set((state) => ({
            transactions: state.transactions.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        })),
    deleteTransaction: (id) =>
        set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
        })),
    setEditingTransaction: (transaction) => set({ editingTransaction: transaction }),
    clearEditingTransaction: () => set({ editingTransaction: null }),
    setLoading: (loading) => set({ loading }),
}));