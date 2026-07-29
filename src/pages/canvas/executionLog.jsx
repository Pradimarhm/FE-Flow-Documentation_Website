// src/components/flows/ExecutionLog.jsx
import React, { useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    CircleCheck,
    CircleAlert,
    Loader2,
} from "lucide-react";

const statusConfig = {
    SUCCESS: {
        icon: CircleCheck,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    RUNNING: { icon: Loader2, color: "text-amber-500", bg: "bg-amber-50" },
    FAILED: { icon: CircleAlert, color: "text-rose-600", bg: "bg-rose-50" },
    PENDING: { icon: CircleAlert, color: "text-slate-400", bg: "bg-slate-50" },
};

export default function ExecutionLog({ logs = [], showRunId = true }) {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (logs.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 italic text-sm p-4">
                Belum ada aktivitas simulasi...
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-auto">
            <table className="w-full text-sm border-collapse">
                <thead className="bg-olive-100 border-b-2 border-olive-900 sticky top-0 z-10">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-black text-olive-900 uppercase w-20">
                            Time
                        </th>
                        {showRunId && (
                            <th className="px-3 py-2 text-left text-xs font-black text-olive-900 uppercase w-24">
                                Run ID
                            </th>
                        )}
                        <th className="px-3 py-2 text-left text-xs font-black text-olive-900 uppercase">
                            Node
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-black text-olive-900 uppercase w-24">
                            Status
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-black text-olive-900 uppercase w-24">
                            Duration
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-black text-olive-900 uppercase w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => {
                        const StatusIcon =
                            statusConfig[log.status]?.icon || CircleAlert;
                        const statusColor =
                            statusConfig[log.status]?.color || "text-slate-500";
                        const isExpanded = expandedId === log.id;

                        return (
                            <React.Fragment key={log.id}>
                                <tr
                                    className={`border-b border-olive-200 cursor-pointer hover:bg-olive-50 transition-colors ${
                                        isExpanded ? "bg-olive-50" : ""
                                    }`}
                                    onClick={() => toggleExpand(log.id)}
                                >
                                    <td className="px-3 py-2 font-mono text-xs text-olive-800">
                                        {log.time}
                                    </td>
                                    {showRunId && (
                                        <td className="px-3 py-2 font-mono text-xs text-olive-600">
                                            {log.runId || "-"}
                                        </td>
                                    )}
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-olive-900">
                                                {log.node}
                                            </span>
                                            <span className="text-[10px] font-medium bg-olive-200 px-1.5 py-0.5 border border-olive-900 uppercase">
                                                {log.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div
                                            className={`flex items-center gap-1.5 ${statusColor}`}
                                        >
                                            <StatusIcon
                                                size={14}
                                                className={
                                                    log.status === "RUNNING"
                                                        ? "animate-spin"
                                                        : ""
                                                }
                                            />
                                            <span className="font-bold text-xs">
                                                {log.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 font-mono text-xs text-olive-800">
                                        {log.duration
                                            ? `${log.duration}ms`
                                            : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-olive-500">
                                        {isExpanded ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                    </td>
                                </tr>

                                {/* Expandable detail row */}
                                {isExpanded && (
                                    <tr>
                                        <td
                                            colSpan={showRunId ? 6 : 5}
                                            className="px-3 py-3 bg-olive-50 border-b border-olive-200"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <span className="font-bold text-olive-700">
                                                        Message:
                                                    </span>
                                                    <p className="mt-1 font-mono bg-white p-2 border border-olive-300 rounded whitespace-pre-wrap wrap-break-word">
                                                        {log.message || "—"}
                                                    </p>
                                                </div>
                                                {log.data && (
                                                    <div>
                                                        <span className="font-bold text-olive-700">
                                                            Output Data:
                                                        </span>
                                                        <pre className="mt-1 font-mono text-[11px] bg-white p-2 border border-olive-300 rounded max-h-40 overflow-auto">
                                                            {typeof log.data ===
                                                            "string"
                                                                ? log.data
                                                                : JSON.stringify(
                                                                        log.data,
                                                                        null,
                                                                        2,
                                                                    )}
                                                        </pre>
                                                    </div>
                                                )}
                                                {!log.data && (
                                                    <div className="text-olive-400 italic">
                                                        Tidak ada data tambahan
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
