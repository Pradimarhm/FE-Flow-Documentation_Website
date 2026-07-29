import { create } from "zustand";
import { permissionService } from "@/services/permissionService";

export const usePermissionStore = create((set, get) => ({
    permissions: [],
    isLoading: false,
    error: null,

    // Modal State
    isModalOpen: false,
    editingPermission: null,

    // Fetch All Data
    fetchPermissions: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await permissionService.getAllPermissions();
            const data = res?.data || res || [];
            set({ permissions: data, isLoading: false });
        } catch (err) {
            set({
                error: err?.response?.data?.message || "Gagal mengambil data permission",
                isLoading: false,
            });
        }
    },

    // Handlers Modal
    openCreateModal: () => set({ isModalOpen: true, editingPermission: null }),
    openEditModal: (permission) => set({ isModalOpen: true, editingPermission: permission }),
    closeModal: () => set({ isModalOpen: false, editingPermission: null }),

    // CRUD Actions
    addPermission: async (payload) => {
        const res = await permissionService.createPermission(payload);
        await get().fetchPermissions();
        return res;
    },

    updatePermission: async (id, payload) => {
        const res = await permissionService.updatePermission(id, payload);
        await get().fetchPermissions();
        return res;
    },

    deletePermission: async (id) => {
        const res = await permissionService.deletePermission(id);
        set((state) => ({
            permissions: state.permissions.filter((p) => p.id !== id),
        }));
        return res;
    },
}));