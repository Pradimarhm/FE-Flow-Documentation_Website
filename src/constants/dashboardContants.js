export const DASHBOARD_ENDPOINTS = {
    FLOWS: '/flows',
    FLOW_SIMULATIONS: (flowId) => `/flows/${flowId}/simulations`,
};

export const DEFAULT_DASHBOARD_STATS = [
    { title: 'Total Flows', value: '0', color: 'bg-white', text: 'text-olive-900' },
    { title: 'Total Simulations', value: '0', color: 'bg-white', text: 'text-olive-900' },
    { title: 'Success Rate', value: '0%', color: 'bg-green-100', text: 'text-green-900' },
    { title: 'Avg Duration', value: '0s', color: 'bg-yellow-100', text: 'text-yellow-900' },
];