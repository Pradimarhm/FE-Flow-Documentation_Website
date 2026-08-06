// src/services/nodeService.js
import apiClient from "./apiClient";

export const nodeService = {
    // 1. Get List Nodes
    async getNodesByFlow(flowId) {
        try {
            return await apiClient.get(`/flows/${flowId}/nodes`);
        } catch (error) {
            throw (
                error.response?.data || {
                    message: "Gagal mengambil daftar node",
                }
            );
        }
    },

    // Helper untuk standardisasi payload node ke Laravel
    formatNodePayload(nodeData) {
        return {
            template_id: nodeData.template_id || null,
            label: nodeData.label || nodeData.data?.label || "New Node",
            node_type: (
                nodeData.node_type ||
                nodeData.type ||
                nodeData.data?.category ||
                nodeData.data?.type ||
                "process"
            ).toLowerCase(),
            icon: nodeData.icon || null,
            color: nodeData.color || null,
            pos_x: parseFloat(nodeData.pos_x ?? nodeData.position?.x ?? 0),
            pos_y: parseFloat(nodeData.pos_y ?? nodeData.position?.y ?? 0),
            input_params:
                nodeData.config?.input_params ??
                nodeData.data?.config?.input_params ??
                nodeData.input_params ??
                {},
            validation_rules:
                nodeData.config?.validation_rules ??
                nodeData.data?.config?.validation_rules ??
                nodeData.validation_rules ??
                "",
            process_logic:
                nodeData.config?.process_logic ??
                nodeData.data?.config?.process_logic ??
                nodeData.process_logic ??
                "",
            condition_expression:
                nodeData.config?.condition_expression ??
                nodeData.data?.config?.condition_expression ??
                nodeData.condition_expression ??
                "",
            output_template:
                nodeData.config?.output_template ??
                nodeData.data?.config?.output_template ??
                nodeData.output_template ??
                {},
            order_index: nodeData.order_index ?? 1,
        };
    },

    // 2. Tambah Node ke Flow
    async createNode(flowId, nodeData) {
        try {
            const payload = this.formatNodePayload(nodeData);
            return await apiClient.post(`/flows/${flowId}/nodes`, payload);
        } catch (error) {
            throw (
                error.response?.data || { message: "Gagal membuat node baru" }
            );
        }
    },

    // 3. Detail Node
    async getNodeDetail(nodeId) {
        try {
            return await apiClient.get(`/nodes/${nodeId}`);
        } catch (error) {
            throw (
                error.response?.data || {
                    message: "Gagal mengambil detail node",
                }
            );
        }
    },

    // 4. Update Node
    async updateNode(nodeId, nodeData) {
        try {
            const payload = this.formatNodePayload(nodeData);
            return await apiClient.put(`/nodes/${nodeId}`, payload);
        } catch (error) {
            throw error.response?.data || { message: "Gagal memperbarui node" };
        }
    },

    // 5. Hapus Node
    async deleteNode(nodeId) {
        try {
            return await apiClient.delete(`/nodes/${nodeId}`);
        } catch (error) {
            throw error.response?.data || { message: "Gagal menghapus node" };
        }
    },
};
