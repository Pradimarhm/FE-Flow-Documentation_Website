import React, { useEffect, useState } from "react";
import { templateService } from "@/services/templateService";
import { Loader2, GripVertical } from "lucide-react";

// Basic Nodes (Bisa dipake kapan aja tanpa template backend)
const BASIC_NODES = [
    { label: "Start Node", category: "start", color: "bg-green-100" },
    { label: "Process Node", category: "process", color: "bg-white" },
    { label: "Validation Node", category: "validation", color: "bg-yellow-100" },
    { label: "Database Node", category: "database", color: "bg-blue-100" },
    { label: "API Request", category: "api", color: "bg-purple-100" },
    { label: "End Node", category: "end", color: "bg-red-100" },
];

export default function FloatingNodeMenu() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setIsLoading(true);
                const response = await templateService.getTemplates();
                const data = Array.isArray(response) ? response : (response?.data || []);
                setTemplates(data);
            } catch (error) {
                console.error("Gagal mengambil data template node:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    // FUNGSIONALITAS DRAG YANG WORK DENGAN useFlowEditor.js
    const onDragStart = (event, nodeItem, isTemplate = false) => {
        // 1. Kirim 'type' (Wajib 'customApi' agar passing validasi 'if (!type)' di hook)
        event.dataTransfer.setData("application/reactflow/type", "customApi");

        // 2. Kirim 'nodeData' dalam bentuk JSON String
        const nodePayload = {
            template_id: isTemplate ? nodeItem.id : null,
            type: isTemplate ? (nodeItem.type || nodeItem.category) : nodeItem.category,
            label: isTemplate ? (nodeItem.name || nodeItem.label) : nodeItem.label,
            config: isTemplate ? (nodeItem.default_config || {}) : {},
        };

        event.dataTransfer.setData("application/reactflow/nodeData", JSON.stringify(nodePayload));
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <div className="absolute top-4 left-4 z-10 bg-olive-50 border-2 border-olive-900 p-3 shadow-[4px_4px_0px_rgba(54,69,79,1)] flex flex-col gap-3 w-56 max-h-[80vh] overflow-y-auto">
            
            {/* 1. BASIC NODES */}
            <div>
                <h3 className="text-[11px] font-black text-olive-900 uppercase tracking-wider border-b-2 border-olive-900 pb-1 mb-2">
                    Basic Nodes
                </h3>
                <div className="flex flex-col gap-1.5">
                    {BASIC_NODES.map((node, index) => (
                        <div
                            key={`basic-${index}`}
                            draggable={true} // 👈 WAJIB DRAGGABLE
                            onDragStart={(e) => onDragStart(e, node, false)}
                            className={`flex items-center justify-between p-1.5 border-2 border-olive-900 shadow-[2px_2px_0px_rgba(54,69,79,1)] cursor-grab active:cursor-grabbing hover:opacity-80 transition-all text-xs font-bold text-olive-900 ${node.color}`}
                        >
                            <span className="capitalize">{node.label}</span>
                            <GripVertical size={14} className="text-olive-700" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. TEMPLATES DARI BACKEND */}
            <div>
                <h3 className="text-[11px] font-black text-olive-900 uppercase tracking-wider border-b-2 border-olive-900 pb-1 mb-2">
                    Saved Templates
                </h3>

                {isLoading ? (
                    <div className="flex items-center gap-2 text-olive-600 py-1">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-[11px] font-semibold">Loading...</span>
                    </div>
                ) : templates.length === 0 ? (
                    <p className="text-[11px] text-olive-500 italic py-1">Belum ada template.</p>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {templates.map((tpl) => (
                            <div
                                key={tpl.id}
                                draggable={true} // 👈 WAJIB DRAGGABLE
                                onDragStart={(e) => onDragStart(e, tpl, true)}
                                className="flex items-center justify-between p-1.5 bg-white border-2 border-olive-900 shadow-[2px_2px_0px_rgba(54,69,79,1)] cursor-grab active:cursor-grabbing hover:bg-olive-100 transition-all text-xs font-bold text-olive-900"
                            >
                                <span className="truncate max-w-[130px]">{tpl.name || tpl.label}</span>
                                <GripVertical size={14} className="text-olive-500" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}