import React from 'react';

export default function Dashboard() {
    // Data tiruan (mock data) sesuai referensi tabel & metrik
    const stats = [
        { title: 'Total Flows', value: '17', color: 'bg-white', text: 'text-olive-900' },
        { title: 'Total Simulations', value: '130', color: 'bg-white', text: 'text-olive-900' },
        { title: 'Success Rate', value: '100%', color: 'bg-green-100', text: 'text-green-900' },
        { title: 'Avg Duration', value: '26s', color: 'bg-yellow-100', text: 'text-yellow-900' },
    ];

    const recentActivities = [
        { name: 'Cek Ongkir', status: 'DRAFT', executions: 48, successRate: '100.0%', lastRun: '22/7/2026, 08.32.17' },
        { name: 'Cek Ongkir Calculator', status: 'DRAFT', executions: 19, successRate: '100.0%', lastRun: '20/5/2026, 13.28.12' },
        { name: 'Simulasi Iterator Kurir (Satu Per Satu)', status: 'DRAFT', executions: 17, successRate: '100.0%', lastRun: '18/5/2026, 10.44.24' },
        { name: 'Buat Pesanan - Order Creation Flow (Single Order)', status: 'DRAFT', executions: 14, successRate: '100.0%', lastRun: '21/5/2026, 14.18.40' },
        { name: 'Order Processing Flow', status: 'ACTIVE', executions: 7, successRate: '85.7%', lastRun: '13/5/2026, 14.35.43' },
        { name: 'E-Commerce Checkout Process', status: 'DRAFT', executions: 3, successRate: '100.0%', lastRun: '16/7/2026, 11.15.47' },
    ];

    return (
        <div className="w-full h-full flex flex-col bg-olive-100 overflow-y-auto p-6 gap-6">
            
            {/* Header Title */}
            <div>
                <h1 className="text-2xl font-black text-olive-900 uppercase tracking-wide">Dashboard Overview</h1>
                <p className="text-xs font-bold text-olive-700">Ringkasan aktivitas dan performa sistem flow dokumentasi.</p>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div 
                        key={index} 
                        className={`p-4 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] rounded-xs ${stat.color} flex flex-col justify-between`}
                    >
                        <span className="text-xs font-bold text-olive-700 uppercase">{stat.title}</span>
                        <span className={`text-3xl font-black mt-2 ${stat.text}`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Section: Recent Flow Activity (Tabel Neo-Brutalisme) */}
            <div className="bg-olive-50 border-2 border-olive-900 shadow-[6px_6px_0px_rgba(54,69,79,1)] rounded-xs p-5 flex flex-col gap-4">
                <div className="border-b-2 border-olive-900 pb-3">
                    <h2 className="text-sm font-black text-olive-900 uppercase tracking-wider">Recent Flow Activity</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-olive-900 text-[11px] font-black text-olive-800 uppercase tracking-wider bg-olive-200">
                                <th className="p-3">Flow</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Executions</th>
                                <th className="p-3">Success Rate</th>
                                <th className="p-3">Last Run</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-semibold text-olive-900 divide-y-2 divide-olive-200">
                            {recentActivities.map((item, idx) => (
                                <tr key={idx} className="hover:bg-olive-100 transition-colors">
                                    <td className="p-3 font-bold">{item.name}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase border-2 border-olive-900 ${
                                            item.status === 'ACTIVE' ? 'bg-green-400 text-black' : 'bg-yellow-300 text-black'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono font-bold text-blue-800">{item.executions}</td>
                                    <td className="p-3 font-mono font-bold text-green-800">{item.successRate}</td>
                                    <td className="p-3 font-mono text-olive-700 text-[11px]">{item.lastRun}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}