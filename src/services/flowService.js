import apiClient from "./apiClient";

export const flowService = {
    // Flows CRUD
    getFlows: () => apiClient.get("/flows"),
    getFlowById: (id) => apiClient.get(`/flows/${id}`),
    createFlow: (payload) => apiClient.post("/flows", payload),
    updateFlow: (id, payload) => apiClient.put(`/flows/${id}`, payload),
    deleteFlow: (id) => apiClient.delete(`/flows/${id}`),

    // Flow Nodes
    getNodesByFlow: (flowId) => apiClient.get(`/flows/${flowId}/nodes`),
    createNodeInFlow: (flowId, payload) =>
        apiClient.post(`/flows/${flowId}/nodes`, payload),

    // Flow Connections
    getConnectionsByFlow: (flowId) =>
        apiClient.get(`/flows/${flowId}/connections`),
    createConnectionInFlow: (flowId, payload) =>
        apiClient.post(`/flows/${flowId}/connections`, payload),

    // Simulations
    runSimulation: (flowId, inputData = {}) =>
        apiClient.post(`/flows/${flowId}/simulations`, {
            status: "pending", // atau "running"
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(), // opsional
            input_data: inputData,
            total_duration_ms: 0,
        }),
    getSimulationsByFlow: (flowId) =>
        apiClient.get(`/flows/${flowId}/simulations`),

    getSimulationById: (simulationId) =>
        apiClient.get(`/simulations/${simulationId}`),
};
