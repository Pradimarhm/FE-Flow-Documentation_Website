import apiClient from './apiClient';
import { DASHBOARD_ENDPOINTS } from '../constants/dashboardContants';

export const dashboardService = {
    /**
     * Mengambil seluruh data flow beserta kalkulasi simulasi masing-masing
     */
    async getDashboardSummary() {
        try {
            // 1. Fetch semua daftar flows
            const flowsRes = await apiClient.get(DASHBOARD_ENDPOINTS.FLOWS);
            const flows = flowsRes?.data || flowsRes || [];

            if (!Array.isArray(flows) || flows.length === 0) {
                return {
                    totalFlows: 0,
                    totalSimulations: 0,
                    successRate: '0%',
                    avgDuration: '0s',
                    recentActivities: []
                };
            }

            // 2. Fetch data simulasi secara paralel untuk tiap flow
            const simulationPromises = flows.map(async (flow) => {
                try {
                    const simRes = await apiClient.get(DASHBOARD_ENDPOINTS.FLOW_SIMULATIONS(flow.id));
                    const simData = simRes?.data || simRes || [];
                    return {
                        flowId: flow.id,
                        simulations: Array.isArray(simData) ? simData : []
                    };
                } catch (err) {
                    return { flowId: flow.id, simulations: [] };
                }
            });

            const simulationsResults = await Promise.all(simulationPromises);

            // 3. Gabungkan dan kalkulasi metrik agregat
            let globalTotalSimulations = 0;
            let globalSuccessSimulations = 0;
            let globalTotalDurationMs = 0;

            const recentActivities = flows.map((flow) => {
                const simObj = simulationsResults.find(s => s.flowId === flow.id);
                const sims = simObj ? simObj.simulations : [];
                
                const execCount = sims.length;
                const successCount = sims.filter(s => s.status === 'success' || s.status === 'COMPLETED').length;
                const flowSuccessRate = execCount > 0 ? ((successCount / execCount) * 100).toFixed(1) + '%' : '0.0%';

                // Cari tanggal eksekusi / run terakhir
                let lastRunStr = '-';
                if (sims.length > 0) {
                    const sortedSims = [...sims].sort((a, b) => new Date(b.created_at || b.started_at) - new Date(a.created_at || a.started_at));
                    const latestDate = new Date(sortedSims[0].created_at || sortedSims[0].started_at);
                    lastRunStr = latestDate.toLocaleString('id-ID');
                } else if (flow.updated_at || flow.created_at) {
                    lastRunStr = new Date(flow.updated_at || flow.created_at).toLocaleString('id-ID');
                }

                // Tambahkan ke statistik global
                globalTotalSimulations += execCount;
                globalSuccessSimulations += successCount;
                sims.forEach(s => {
                    globalTotalDurationMs += (s.total_duration_ms || 0);
                });

                return {
                    id: flow.id,
                    name: flow.name,
                    status: (flow.status || 'DRAFT').toUpperCase(),
                    executions: execCount,
                    successRate: flowSuccessRate,
                    lastRun: lastRunStr,
                    rawUpdatedAt: new Date(flow.updated_at || flow.created_at || 0)
                };
            });

            // Urutkan aktivitas berdasarkan tanggal update/run terbaru
            recentActivities.sort((a, b) => b.rawUpdatedAt - a.rawUpdatedAt);

            // Kalkulasi Akhir Metrik Global
            const overallSuccessRate = globalTotalSimulations > 0 
                ? Math.round((globalSuccessSimulations / globalTotalSimulations) * 100) + '%' 
                : '0%';

            const avgDurationSec = globalTotalSimulations > 0 
                ? Math.round((globalTotalDurationMs / globalTotalSimulations) / 1000) + 's' 
                : '0s';

            return {
                totalFlows: flows.length,
                totalSimulations: globalTotalSimulations,
                successRate: overallSuccessRate,
                avgDuration: avgDurationSec,
                recentActivities
            };

        } catch (error) {
            console.error("Gagal mengambil data dashboard:", error);
            throw error;
        }
    }
};