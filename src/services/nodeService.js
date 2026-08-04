import apiClient from "./apiClient";

export const nodeService = {
    // 1. Get List Nodes dalam sebuah Flow (GET /flows/{flow}/nodes)
    async getNodesByFlow(flowId) {
        try {
            const response = await apiClient.get(`/flows/${flowId}/nodes`);
            return response; // Berisi { data: [...] }
        } catch (error) {
            throw error.response
                ? error.response.data
                : { message: "Gagal mengambil daftar node" };
        }
    },

    // 2. Tambah Node ke Flow (POST /flows/{flow}/nodes)
    // async createNode(flowId, nodeData) {
    //     // Mapping ke snake_case sesuai database Laravel
    //     const payload = {
    //         template_id: nodeData.template_id || null,
    //         label: nodeData.label || "New Node",
    //         node_type: nodeData.type || nodeData.node_type || "process",
    //         icon: nodeData.icon || null,
    //         color: nodeData.color || null,
    //         pos_x: parseFloat(nodeData.pos_x ?? nodeData.position?.x ?? 0),
    //         pos_y: parseFloat(nodeData.pos_y ?? nodeData.position?.y ?? 0),
    //         input_params: nodeData.config?.input_params ?? nodeData.input_params ?? {},
    //         validation_rules: nodeData.config?.validation_rules ?? nodeData.validation_rules ?? "",
    //         process_logic: nodeData.config?.process_logic ?? nodeData.process_logic ?? "",
    //         output_template: nodeData.config?.output_template ?? nodeData.output_template ?? {},
    //         condition_expression: nodeData.config?.condition_expression ?? nodeData.condition_expression ?? "",
    //         order_index: nodeData.order_index ?? 1
    //     };

    //     const response = await apiClient.post(`/flows/${flowId}/nodes`, payload);
    //     return response;
    // },
    async createNode(flowId, nodeData) {
        try {
            // nodeData format: { template_id, type, label, position_x, position_y, config }
            // const response = await apiClient.post(
            //     `/flows/${flowId}/nodes`,
            //     nodeData,
            // );
            // return response; // Berisi { data: { id, ... } }
            const payload = {
                template_id: nodeData.template_id || null,
                label: nodeData.label || "New Node",
                node_type: nodeData.type || nodeData.node_type || "process",
                icon: nodeData.icon || null,
                color: nodeData.color || null,
                pos_x: parseFloat(nodeData.pos_x ?? nodeData.position?.x ?? 0),
                pos_y: parseFloat(nodeData.pos_y ?? nodeData.position?.y ?? 0),
                input_params:
                    nodeData.config?.input_params ??
                    nodeData.input_params ??
                    {},
                validation_rules:
                    nodeData.config?.validation_rules ??
                    nodeData.validation_rules ??
                    "",
                process_logic:
                    nodeData.config?.process_logic ??
                    nodeData.process_logic ??
                    "",
                output_template:
                    nodeData.config?.output_template ??
                    nodeData.output_template ??
                    {},
                condition_expression:
                    nodeData.config?.condition_expression ??
                    nodeData.condition_expression ??
                    "",
                order_index: nodeData.order_index ?? 1,
            };

            const response = await apiClient.post(
                `/flows/${flowId}/nodes`,
                payload,
            );
            return response;
        } catch (error) {
            throw error.response
                ? error.response.data
                : { message: "Gagal membuat node baru" };
        }
    },

    // 3. Detail satu node (GET /nodes/{node})
    async getNodeDetail(nodeId) {
        try {
            const response = await apiClient.get(`/nodes/${nodeId}`);
            return response;
        } catch (error) {
            throw error.response
                ? error.response.data
                : { message: "Gagal mengambil detail node" };
        }
    },

    // 4. Update Node (PUT /nodes/{node})
    async updateNode(nodeId, nodeData) {
        try {
            const response = await apiClient.put(`/nodes/${nodeId}`, nodeData);
            return response;
        } catch (error) {
            throw error.response
                ? error.response.data
                : { message: "Gagal memperbarui node" };
        }
    },

    // 5. Hapus Node (DELETE /nodes/{node})
    async deleteNode(nodeId) {
        try {
            const response = await apiClient.delete(`/nodes/${nodeId}`);
            return response;
        } catch (error) {
            throw error.response
                ? error.response.data
                : { message: "Gagal menghapus node" };
        }
    },
};
