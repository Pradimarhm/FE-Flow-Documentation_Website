import apiClient from './apiClient';

export const flowService = {
    /**
     * Mengambil daftar semua flow (dengan paginasi)
     * @param {Object} params - { page: 1, per_page: 15 }
     */
    getFlows: async (params = {}) => {
        const response = await apiClient.get('/flows', { params });
        return response.data;
    },

    /**
     * Mengambil detail 1 flow berdasarkan ID
     * @param {string|number} flowId 
     */
    getFlowById: async (flowId) => {
        const response = await apiClient.get(`/flows/${flowId}`);
        return response.data;
    },

    /**
     * Membuat flow baru
     * @param {Object} payload - { name, description, status }
     */
    createFlow: async (payload) => {
        const response = await apiClient.post('/flows', payload);
        return response.data;
    },

    /**
     * Memperbarui data flow
     * @param {string|number} flowId 
     * @param {Object} payload - { name, description, status }
     */
    updateFlow: async (flowId, payload) => {
        const response = await apiClient.put(`/flows/${flowId}`, payload);
        return response.data;
    },

    /**
     * Menghapus flow berdasarkan ID
     * @param {string|number} flowId 
     */
    deleteFlow: async (flowId) => {
        const response = await apiClient.delete(`/flows/${flowId}`);
        return response.data;
    }
};