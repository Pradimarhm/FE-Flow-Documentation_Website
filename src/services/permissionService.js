import apiClient from "./apiClient";

export const permissionService = {
    getAllPermissions: async () => {
        return await apiClient.get("/permissions");
    },

    getPermissionById: async (id) => {
        return await apiClient.get(`/permissions/${id}`);
    },

    createPermission: async (payload) => {
        // payload: { role_id, module_id, permission: ["read", "create"] }
        return await apiClient.post("/permissions", payload);
    },

    updatePermission: async (id, payload) => {
        return await apiClient.put(`/permissions/${id}`, payload);
    },

    deletePermission: async (id) => {
        return await apiClient.delete(`/permissions/${id}`);
    },
};