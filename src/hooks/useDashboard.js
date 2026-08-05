import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
    const [data, setData] = useState({
        totalFlows: '0',
        totalSimulations: '0',
        successRate: '0%',
        avgDuration: '0s',
        recentActivities: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchedRef = useRef(false);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const summary = await dashboardService.getDashboardSummary();
            setData({
                totalFlows: String(summary.totalFlows),
                totalSimulations: String(summary.totalSimulations),
                successRate: summary.successRate,
                avgDuration: summary.avgDuration,
                recentActivities: summary.recentActivities,
            });
        } catch (err) {
            setError(err.message || 'Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        ...data,
        loading,
        error,
        refetch: fetchDashboardData,
    };
};