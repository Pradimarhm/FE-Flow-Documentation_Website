// src/services/connectionService.js
import apiClient from './apiClient';

export const connectionService = {
    // GET /flows/{flow}/connections
    getConnectionsByFlow: async (flowId) => {
        const response = await apiClient.get(`/flows/${flowId}/connections`);
        return response; // <-- tambahkan return
    },

    // POST /flows/{flow}/connections
    createConnection: async (flowId, payload) => {
        const response = await apiClient.post(`/flows/${flowId}/connections`, payload);
        return response;
    },

    // GET /connections/{connection}
    getConnectionById: async (connectionId) => {
        const response = await apiClient.get(`/connections/${connectionId}`);
        return response;
    },

    // PUT /connections/{connection}
    updateConnection: async (connectionId, payload) => {
        const response = await apiClient.put(`/connections/${connectionId}`, payload);
        return response;
    },

    // DELETE /connections/{connection}
    deleteConnection: async (connectionId) => {
        const response = await apiClient.delete(`/connections/${connectionId}`);
        return response;
    }
};