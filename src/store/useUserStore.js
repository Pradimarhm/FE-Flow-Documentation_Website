import { create } from 'zustand';
import { userService } from '../services/userService';

export const useUserStore = create((set, get) => ({
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null,
    validationErrors: null,

    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await userService.getUsers();
            // Respon 200 Swagger: { success: true, message: "...", data: [...] }[cite: 1]
            set({ users: res.data || [], isLoading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message || 'Gagal mengambil data user',
                isLoading: false,
            });
        }
    },

    addUser: async (payload) => {
        set({ isLoading: true, validationErrors: null, error: null });
        try {
            await userService.createUser(payload);
            set({ isLoading: false });
            get().fetchUsers();
            return { success: true };
        } catch (err) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 422) {
                // Tangkap error validasi Laravel dari Swagger[cite: 1]
                set({ validationErrors: data.errors, isLoading: false });
            } else {
                set({
                    error: data?.message || 'Gagal menambahkan user',
                    isLoading: false,
                });
            }
            return { success: false };
        }
    },

    editUser: async (id, payload) => {
        set({ isLoading: true, validationErrors: null, error: null });
        try {
            await userService.updateUser(id, payload);
            set({ isLoading: false });
            get().fetchUsers();
            return { success: true };
        } catch (err) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 422) {
                set({ validationErrors: data.errors, isLoading: false });
            } else {
                set({
                    error: data?.message || 'Gagal mengupdate user',
                    isLoading: false,
                });
            }
            return { success: false };
        }
    },

    removeUser: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await userService.deleteUser(id);
            set({ isLoading: false });
            get().fetchUsers();
            return { success: true };
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Gagal menghapus user',
                isLoading: false,
            });
            return { success: false };
        }
    },

    resetErrors: () => set({ validationErrors: null, error: null }),
}));