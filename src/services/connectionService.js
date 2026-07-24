import apiClient from './apiClient';

export const connectionService = {
    // GET /flows/{flow}/connections
    getConnectionsByFlow: async (flowId) => {
        const response = await apiClient.get(`/flows/${flowId}/connections`);
        // return response.data;
    },

    // POST /flows/{flow}/connections
    createConnection: async (flowId, payload) => {
        const response = await apiClient.post(`/flows/${flowId}/connections`, payload);
        // return response.data;
    },

    // GET /connections/{connection}
    getConnectionById: async (connectionId) => {
        const response = await apiClient.get(`/connections/${connectionId}`);
        // return response.data;
    },

    // PUT /connections/{connection}
    updateConnection: async (connectionId, payload) => {
        const response = await apiClient.put(`/connections/${connectionId}`, payload);
        // return response.data;
    },

    // DELETE /connections/{connection}
    deleteConnection: async (connectionId) => {
        const response = await apiClient.delete(`/connections/${connectionId}`);
        // return response.data;
    }
};