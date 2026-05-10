import { create } from 'zustand';

export const useEdit = create((set) => ({
    editingItem: null,
    editingType: null,

    setEditing: (item, type) => {
        set({ editingItem: item, editingType: type });
    },

    clearEditing: () => {
        set({ editingItem: null, editingType: null });
    },
}));