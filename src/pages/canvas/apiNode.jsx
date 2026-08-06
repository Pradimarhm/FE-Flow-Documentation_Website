// src/components/flows/ApiNode.jsx
import React, { useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { NODE_TYPE_CONFIG } from "@/config/nodeTypes";

export default function ApiNode({ id, data, selected, className = "" }) {
    const { updateNodeData } = useReactFlow();
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);

    const categoryKey = (data.category || data.type || "process").toLowerCase();
    const theme = NODE_TYPE_CONFIG[categoryKey] || NODE_TYPE_CONFIG.process;
    const IconComponent = theme.icon;

    const executionStatus = data.executionStatus; // "running" | "success" | "failed" | undefined
    let executionRingClass = "";
    if (executionStatus === "running") {
        executionRingClass = "ring-4 ring-emerald-400 animate-pulse";
    } else if (
        executionStatus === "success" ||
        executionStatus === "completed"
    ) {
        executionRingClass = "ring-3 ring-emerald-500";
    } else if (executionStatus === "failed") {
        executionRingClass = "ring-4 ring-rose-500";
    }

    const executionZIndex = executionStatus === "running" ? "z-20" : "z-0";

    return (
        <div
            className={`relative flex flex-col min-w-56 max-w-56 rounded-sm border-2 transition-all duration-150 
            ${executionZIndex}
            ${selected ? "shadow-[6px_6px_0px_rgba(54,69,79,1)] -translate-y-0.5 ring-3 ring-blue-500" : "shadow-[4px_4px_0px_rgba(54,69,79,1)]"} 
            ${executionRingClass}
            ${theme.bg} ${theme.border}
            ${className}`}
        >
            {executionStatus === "running" && (
                <span className="absolute -top-2.5 -right-2 z-10 flex items-center gap-1 bg-emerald-400 text-olive-900 text-[9px] font-black px-1.5 py-0.5 border-2 border-olive-900 uppercase tracking-wider animate-pulse rounded-xs shadow-[2px_2px_0px_rgba(54,69,79,1)]">
                    Running
                </span>
            )}
            {executionStatus === "failed" && (
                <span className="absolute -top-2.5 -right-2 z-10 flex items-center gap-1 bg-rose-400 text-olive-900 text-[9px] font-black px-1.5 py-0.5 border-2 border-olive-900 uppercase tracking-wider rounded-xs shadow-[2px_2px_0px_rgba(54,69,79,1)]">
                    Failed
                </span>
            )}

            {/* Node Start tidak butuh Input Handle */}
            {categoryKey !== "start" && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="w-3! h-3! bg-white! border-2! border-olive-900! rounded-none!"
                />
            )}

            {/* Header Node */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b-2 border-olive-900 bg-olive-900/5">
                <div
                    className={`p-1 border border-olive-900 rounded-xs ${theme.badgeColor}`}
                >
                    <IconComponent size={13} className="text-olive-900" />
                </div>
                <span
                    className={`text-[10px] font-black uppercase tracking-wider ${theme.text}`}
                >
                    {data.category || data.type || theme.label}
                </span>
            </div>

            {/* Body Node */}
            <div className="px-3 py-2.5 flex flex-col gap-1 bg-white/60">
                {/* LABEL */}
                {isEditingLabel ? (
                    <input
                        autoFocus
                        value={data.label || ""}
                        onChange={(e) =>
                            updateNodeData(id, { label: e.target.value })
                        }
                        onBlur={() => setIsEditingLabel(false)}
                        onKeyDown={(e) =>
                            e.key === "Enter" && setIsEditingLabel(false)
                        }
                        className={`text-xs font-bold border-b-2 border-olive-900 bg-white p-0.5 outline-none w-full leading-tight ${theme.text}`}
                    />
                ) : (
                    <div
                        onDoubleClick={() => setIsEditingLabel(true)}
                        className={`text-xs font-extrabold cursor-text hover:bg-olive-900/10 p-0.5 rounded-xs leading-tight ${theme.text}`}
                        title={data.label}
                    >
                        {data.label?.length > 28
                            ? `${data.label.substring(0, 28)}...`
                            : data.label || "New Node"}
                    </div>
                )}

                {/* DESCRIPTION */}
                {isEditingDesc ? (
                    <textarea
                        autoFocus
                        rows={2}
                        value={data.description || ""}
                        placeholder="Tambahkan deskripsi..."
                        onChange={(e) =>
                            updateNodeData(id, { description: e.target.value })
                        }
                        onBlur={() => setIsEditingDesc(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                setIsEditingDesc(false);
                            }
                        }}
                        className={`min-h-12 text-[10px] border-b-2 border-olive-900 bg-white p-0.5 outline-none w-full leading-3 mt-1 resize-none ${theme.text}`}
                    />
                ) : (
                    <div
                        onDoubleClick={() => setIsEditingDesc(true)}
                        className={`text-[10px] font-semibold cursor-text opacity-75 hover:bg-olive-900/10 p-0.5 leading-3 mt-0.5 whitespace-pre-wrap wrap-break-word ${theme.text}`}
                    >
                        {data.description || "Double click untuk deskripsi..."}
                    </div>
                )}
            </div>

            {/* Node End tidak butuh Output Handle */}
            {categoryKey !== "end" && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="w-3! h-3! bg-olive-900! border-2! border-white! rounded-none!"
                />
            )}
        </div>
    );
}
