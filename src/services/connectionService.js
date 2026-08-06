// src/services/connectionService.js
import apiClient from "./apiClient";

export const connectionService = {
    formatConnectionPayload(edgeData) {
        const rawLabel =
            edgeData.branch_label ?? edgeData.label ?? edgeData.condition_value;
        return {
            source_node_id: String(edgeData.source_node_id || edgeData.source),
            target_node_id: String(edgeData.target_node_id || edgeData.target),
            branch_label: rawLabel
                ? String(rawLabel).toLowerCase().trim()
                : null,
        };
    },

    getConnectionsByFlow: async (flowId) => {
        try {
            return await apiClient.get(`/flows/${flowId}/connections`);
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createConnection: async (flowId, payload) => {
        try {
            const formattedPayload =
                connectionService.formatConnectionPayload(payload);
            return await apiClient.post(
                `/flows/${flowId}/connections`,
                formattedPayload,
            );
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getConnectionById: async (connectionId) => {
        try {
            return await apiClient.get(`/connections/${connectionId}`);
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateConnection: async (connectionId, payload) => {
        try {
            const formattedPayload =
                connectionService.formatConnectionPayload(payload);
            return await apiClient.put(
                `/connections/${connectionId}`,
                formattedPayload,
            );
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteConnection: async (connectionId) => {
        try {
            return await apiClient.delete(`/connections/${connectionId}`);
        } catch (error) {
            // Re-throw dengan menyertakan status code HTTP Axios agar bisa dicek di useFlowEditor
            const errData = error.response?.data || {};
            errData.status = error.response?.status || error.status || 500;
            throw errData;
        }
    },
};
