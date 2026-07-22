import React, { useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import {
    Play,
    Square,
    Settings2,
    CheckCircle2,
    Database,
    Webhook,
} from "lucide-react";

export default function ApiNode({ id, data, selected }) {
    const { updateNodeData } = useReactFlow();
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);

    const getTheme = () => {
        // Pemetaan ketat 6 kategori
        switch (data.category?.toLowerCase()) {
            case "start":
                return {
                    bg: "bg-green-500",
                    border: "border-black",
                    text: "text-white",
                    icon: <Play size={14} className="text-white" />,
                };
            case "end":
                return {
                    bg: "bg-red-500",
                    border: "border-black",
                    text: "text-white",
                    icon: <Square size={14} className="text-white" />,
                };
            case "process":
                return {
                    bg: "bg-white",
                    border: "border-black",
                    text: "text-olive-900",
                    icon: <Settings2 size={14} className="text-olive-600" />,
                };
            case "validation":
                return {
                    bg: "bg-yellow-100",
                    border: "border-black",
                    text: "text-yellow-900",
                    icon: (
                        <CheckCircle2 size={14} className="text-yellow-700" />
                    ),
                };
            case "database":
                return {
                    bg: "bg-blue-100",
                    border: "border-black",
                    text: "text-blue-900",
                    icon: <Database size={14} className="text-blue-700" />,
                };
            case "api":
                return {
                    bg: "bg-purple-100",
                    border: "border-black",
                    text: "text-purple-900",
                    icon: <Webhook size={14} className="text-purple-700" />,
                };
            default:
                return {
                    bg: "bg-white",
                    border: "border-black",
                    text: "text-olive-900",
                    icon: <Settings2 size={14} className="text-olive-600" />,
                };
        }
    };

    const theme = getTheme();

    return (
        <div
            className={`flex flex-col min-w-56 max-w-56 border-2 rounded-xs transition-all duration-200 
            ${selected ? "shadow-[8px_8px_0px_rgba(54,69,79,1)] -translate-y-1 ring-4 ring-gray-500/75" : "shadow-[4px_4px_0px_rgba(54,69,79,1)]"} 
            ${theme.bg} ${theme.border}`}
        >
            {/* Start tidak punya input */}
            {data.category?.toLowerCase() !== "start" && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="w-3 h-3 bg-olive-200 border-2 border-olive-900 rounded-none"
                />
            )}

            <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-inherit bg-black/10">
                {theme.icon}
                <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${theme.text}`}
                >
                    {data.category || "Node"}
                </span>
            </div>

            <div className="px-3 py-3 flex flex-col gap-0">
                {/* LABEL */}
                {isEditingLabel ? (
                    <input
                        autoFocus
                        value={data.label}
                        onChange={(e) =>
                            updateNodeData(id, { label: e.target.value })
                        }
                        onBlur={() => setIsEditingLabel(false)}
                        onKeyDown={(e) =>
                            e.key === "Enter" && setIsEditingLabel(false)
                        }
                        className={`text-xs font-bold border-b-2 border-black/30 bg-transparent outline-none w-full leading-tight ${theme.text}`}
                    />
                ) : (
                    <div
                        onDoubleClick={() => setIsEditingLabel(true)}
                        className={`text-xs font-bold cursor-text hover:bg-black/10 px-1 py-0.5 rounded leading-tight ${theme.text}`}
                        title={data.label}
                    >
                        {data.label?.length > 30
                            ? `${data.label.substring(0, 30)}...`
                            : data.label || "New Node"}
                    </div>
                )}

                {isEditingDesc ? (
                    <textarea
                        autoFocus
                        rows={2}
                        value={data.description || ""}
                        placeholder="Add description..."
                        onChange={(e) =>
                            updateNodeData(id, { description: e.target.value })
                        }
                        onBlur={() => setIsEditingDesc(false)}
                        onKeyDown={(e) => {
                            // Enter untuk save, Shift + Enter untuk baris baru
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                setIsEditingDesc(false);
                            }
                        }}
                        className={`min-h-15 text-[10px] border-b-2 border-black/30 bg-transparent outline-none w-full leading-3 mt-1 resize-none ${theme.text}`}
                    />
                ) : (
                    <div
                        onDoubleClick={() => setIsEditingDesc(true)}
                        className={`text-[10px] font-medium gap-0 cursor-text opacity-90 hover:bg-black/10 p-0.5 leading-3 mt-1 whitespace-pre-wrap wrap-break-word ${theme.text}`}
                    >
                        {data.description || "Double click to add desc..."}
                    </div>
                )}
            </div>

            {/* End tidak punya output */}
            {data.category?.toLowerCase() !== "end" && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="w-3 h-3 bg-olive-500 border-2 border-olive-900 rounded-none"
                />
            )}
        </div>
    );
}
