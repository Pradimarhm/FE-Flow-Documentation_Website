import React from "react";
import { useDashboard } from "../hooks/useDashboard";

export default function Dashboard() {
    const {
        totalFlows,
        totalSimulations,
        successRate,
        avgDuration,
        recentActivities,
        loading,
        error,
    } = useDashboard();

    const stats = [
        {
            title: "Total Flows",
            value: loading ? "..." : totalFlows,
            color: "bg-white",
            text: "text-olive-900",
        },
        {
            title: "Total Simulations",
            value: loading ? "..." : totalSimulations,
            color: "bg-white",
            text: "text-olive-900",
        },
        {
            title: "Success Rate",
            value: loading ? "..." : successRate,
            color: "bg-green-100",
            text: "text-green-900",
        },
        {
            title: "Avg Duration",
            value: loading ? "..." : avgDuration,
            color: "bg-yellow-100",
            text: "text-yellow-900",
        },
    ];

    return (
        <div className="w-full h-full flex flex-col bg-olive-100 overflow-y-auto p-6 gap-6">
            {/* Header Title */}
            <div className="border-b-4 pb-4">
                <h1 className="text-3xl font-black text-olive-900 uppercase tracking-tight">
                    Dashboard Overview
                </h1>
                <p className="font-semibold text-olive-700">
                    Ringkasan aktivitas dan performa sistem flow dokumentasi.
                </p>
            </div>

            {/* Error Indicator */}
            {error && (
                <div className="p-4 border-2 border-olive-900 bg-red-100 text-red-900 font-bold text-sm rounded-xs">
                    ⚠️ {error}
                </div>
            )}

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-4 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] rounded-xs ${stat.color} flex flex-col justify-between`}
                    >
                        <span className="text-xs font-bold text-olive-700 uppercase">
                            {stat.title}
                        </span>
                        <span
                            className={`text-3xl font-black mt-2 ${stat.text}`}
                        >
                            {stat.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Section: Recent Flow Activity (Tabel Neo-Brutalisme) */}
            <div className="bg-olive-50 border-2 border-olive-900 shadow-[6px_6px_0px_rgba(54,69,79,1)] rounded-xs p-5 flex flex-col gap-4">
                <div className="border-b-2 border-olive-900 pb-3">
                    <h2 className="text-sm font-black text-olive-900 uppercase tracking-wider">
                        Recent Flow Activity
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <div className="relative flex-1 overflow-y-auto">
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
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="p-4 text-center font-bold text-olive-700"
                                        >
                                            Memuat data aktivitas...
                                        </td>
                                    </tr>
                                ) : recentActivities.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="p-4 text-center font-bold text-olive-700"
                                        >
                                            Belum ada aktivitas flow.
                                        </td>
                                    </tr>
                                ) : (
                                    recentActivities.map((item, idx) => (
                                        <tr
                                            key={item.id || idx}
                                            className="hover:bg-olive-100 transition-colors"
                                        >
                                            <td className="p-3 font-bold">
                                                {item.name}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-black uppercase border-2 border-olive-900 ${
                                                        item.status === "ACTIVE"
                                                            ? "bg-green-400 text-black"
                                                            : "bg-yellow-300 text-black"
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono font-bold text-blue-800">
                                                {item.executions}
                                            </td>
                                            <td className="p-3 font-mono font-bold text-green-800">
                                                {item.successRate}
                                            </td>
                                            <td className="p-3 font-mono text-olive-700 text-[11px]">
                                                {item.lastRun}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
