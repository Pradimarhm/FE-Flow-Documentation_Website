import apiClient from "./apiClient";

export const userService = {
    // --- METHOD RBAC YANG SUDAH ADA ---[cite: 2]
    async getAllPermissions() {
        try {
            const response = await apiClient.get("/permissions");
            return response.data || response; // Menyesuaikan interceptor apiClient[cite: 4]
        } catch (error) {
            throw error.response
                ? error.response.data
                : { message: "Gagal mengambil master permissions" };
        }
    },

    // async syncUserPermissions(roleId) {
    //     try {
    //         const allPermissions = await this.getAllPermissions();
    //         const filteredAccess = allPermissions
    //             .filter((item) => item.role_id === roleId)
    //             .map((item) => {
    //                 const permObject = item.permission || {};
    //                 const allowedActions = Object.keys(permObject).filter(
    //                     actionKey => permObject[actionKey] === true
    //                 );

    //                 // const perm = item.permission;
    //                 // let allowedActions = [];

    //                 // if (Array.isArray(perm)) {
    //                 //     // Jika permission dari backend berbentuk Array ["read", "create"]
    //                 //     allowedActions = perm;
    //                 // } else if (typeof perm === "object" && perm !== null) {
    //                 //     // Jika permission dari backend berbentuk Object { read: true, ... }
    //                 //     allowedActions = Object.keys(perm).filter(
    //                 //         (key) => perm[key] === true,
    //                 //     );
    //                 // }

    //                 return {
    //                     module: item.module.slug,
    //                     actions: allowedActions,
    //                 };
    //             });

    //         return filteredAccess;
    //     } catch (error) {
    //         console.error("Gagal melakukan sinkronisasi RBAC lokal:", error);
    //         throw error;
    //     }
    // },

    // get user by name (searcing feature)
    async getUsers(name = "") {
        const params = name ? { name } : {};
        return await apiClient.get("/users", { params });
    },

    // --- METHOD CRUD USERS DARI SWAGGER API ---
    // async getUsers() {
    //     return await apiClient.get("/users");
    // },

    async getUserById(id) {
        return await apiClient.get(`/users/${id}`);
    },

    async createUser(payload) {
        return await apiClient.post("/users", payload);
    },

    async updateUser(id, payload) {
        return await apiClient.put(`/users/${id}`, payload);
    },

    async deleteUser(id) {
        return await apiClient.delete(`/users/${id}`);
    },
};
