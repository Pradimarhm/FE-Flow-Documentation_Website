import React from "react";
import { useDashboard } from "../hooks/useDashboard";
import { AlertTriangle, Activity, RefreshCw } from "lucide-react";

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
            value: totalFlows,
            color: "bg-white",
            text: "text-olive-900",
        },
        {
            title: "Total Simulations",
            value: totalSimulations,
            color: "bg-white",
            text: "text-olive-900",
        },
        {
            title: "Success Rate",
            value: successRate,
            color: "bg-green-100",
            text: "text-green-900",
        },
        {
            title: "Avg Duration",
            value: avgDuration,
            color: "bg-yellow-100",
            text: "text-yellow-900",
        },
    ];

    return (
        <div className="w-full h-full flex flex-col bg-olive-50 overflow-y-auto p-6 gap-6">
            {/* Header Title */}
            <div className="border-b-4 border-olive-900 pb-4 rounded-sm">
                <h1 className="text-3xl font-black text-olive-900 uppercase tracking-tight">
                    Dashboard Overview
                </h1>
                <p className="font-semibold text-olive-700">
                    Ringkasan aktivitas dan performa sistem flow dokumentasi.
                </p>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, index) => (
                          <div
                              key={index}
                              className="p-4 border-2 border-olive-300 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] rounded-sm bg-white flex flex-col justify-between gap-3 animate-pulse"
                          >
                              <div className="h-3 bg-olive-200 rounded-xs w-1/2" />
                              <div className="h-8 bg-olive-200 rounded-xs w-3/4 mt-1" />
                          </div>
                      ))
                    : stats.map((stat, index) => (
                          <div
                              key={index}
                              className={`p-4 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] rounded-sm ${stat.color} flex flex-col justify-between`}
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

            {/* Section: Recent Flow Activity Card */}
            {loading ? (
                /*FULL CARD TABLE SKELETON (JUDUL, HEADER TABEL, & BARIS-BARIS) */
                <div className="bg-white border-2 border-olive-300 shadow-[6px_6px_0px_rgba(0,0,0,0.1)] rounded-sm p-5 flex flex-col gap-4 animate-pulse">
                    {/* Judul Skeleton */}
                    <div className="border-b-2 border-olive-300 pb-3">
                        <div className="h-5 bg-olive-200 rounded-xs w-48" />
                    </div>

                    {/* Content Table Skeleton */}
                    <div className="flex flex-col gap-3">
                        <div className="h-8 bg-olive-200 rounded-xs w-full" />
                        <div className="h-6 bg-olive-100 rounded-xs w-full" />
                        <div className="h-6 bg-olive-100 rounded-xs w-full" />
                        <div className="h-6 bg-olive-100 rounded-xs w-full" />
                        <div className="h-6 bg-olive-100 rounded-xs w-full" />
                        <div className="h-6 bg-olive-100 rounded-xs w-full" />
                    </div>
                </div>
            ) : error ? (
                /* ⚠️ CARD CONTAINER STATE: ERROR DISAJIKAN DI DALAM CARD TABEL */
                <div className="bg-rose-50 border-2 border-olive-900 shadow-[6px_6px_0px_rgba(54,69,79,1)] rounded-sm p-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="p-3 bg-rose-200 border-2 border-olive-900 rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                        <AlertTriangle size={32} className="text-rose-700" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-rose-900 uppercase tracking-tight">
                            Gagal Memuat Aktivitas
                        </h3>
                        <p className="text-xs font-semibold text-rose-800 mt-1">
                            {error}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-white border-2 border-olive-900 text-olive-900 font-bold text-xs rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-olive-100 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
                    >
                        <RefreshCw size={14} /> Muat Ulang Halaman
                    </button>
                </div>
            ) : (
                /* CARD UTAMA TABEL ACTIVITAS */
                <div className="bg-white border-2 border-olive-900 shadow-[6px_6px_0px_rgba(54,69,79,1)] rounded-sm p-5 flex flex-col gap-4">
                    <div className="border-b-2 border-olive-900 pb-3">
                        <h2 className="text-sm font-black text-olive-900 uppercase tracking-wider">
                            Aktivitas Flow Terbaru
                        </h2>
                    </div>

                    {recentActivities.length === 0 ? (
                        /* EMPTY STATE IN-CARD (TENTENGAH/CENTERED) */
                        <div className="flex flex-col items-center justify-center p-8 gap-2 select-none">
                            <div className="p-2.5 bg-olive-100 border-2 border-olive-900 rounded-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                <Activity
                                    size={24}
                                    className="text-olive-900"
                                />
                            </div>
                            <h4 className="text-xs font-black text-olive-900 uppercase tracking-wider mt-1">
                                Belum Ada Aktivitas Flow
                            </h4>
                            <p className="text-[11px] font-semibold text-olive-600">
                                Jalankan simulasi flow terlebih dahulu untuk
                                melihat statistik di sini.
                            </p>
                        </div>
                    ) : (
                        /* TABEL DATA AKTIVITAS */
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
