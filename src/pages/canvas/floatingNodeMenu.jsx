// src/components/flows/floatingNodeMenu.jsx
import React, { useEffect, useState } from "react";
import { useTemplateStore } from "@/store/templateStore";
import {
    Loader2,
    GripVertical,
    Plus,
    X,
    RefreshCcw,
    Layers,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { NODE_TYPE_CONFIG } from "@/config/nodeTypes";

const BASIC_NODES = [
    {
        label: "Start Node",
        category: "start",
        config: {
            input_params: {},
            validation_rules: "",
            process_logic: "// Titik awal alur",
            output_template: {},
        },
    },
    {
        label: "Condition Node",
        category: "condition",
        config: {
            input_params: { variable: "" },
            validation_rules: "variable == true",
            process_logic: "// Evaluasi kondisi boolean",
            output_template: { branch: "true" },
            condition_expression: "total_belanja >= 100000",
        },
    },
    {
        label: "Process Node",
        category: "process",
        config: {
            input_params: { input: "" },
            validation_rules: "required:input",
            process_logic: "// Proses data input di sini",
            output_template: { result: "" },
        },
    },
    {
        label: "Validation Node",
        category: "validation",
        config: {
            input_params: { value: "" },
            validation_rules: "value != null",
            process_logic:
                "// Validasi input sebelum lanjut ke node berikutnya",
            output_template: { valid: true },
        },
    },
    {
        label: "Database Node",
        category: "database",
        config: {
            input_params: { query: "", table: "" },
            validation_rules: "table != null",
            process_logic: "// Eksekusi query ke database",
            output_template: { rows: [] },
        },
    },
    {
        label: "API Request",
        category: "api",
        config: {
            input_params: { method: "GET", url: "", headers: {} },
            validation_rules: "url != null",
            process_logic: "// Kirim request API ke endpoint eksternal",
            output_template: { status: 200, body: {} },
        },
    },
    {
        label: "End Node",
        category: "end",
        config: {
            input_params: {},
            validation_rules: "",
            process_logic: "// Titik akhir alur",
            output_template: {},
        },
    },
];

export default function FloatingNodeMenu({ onAddNode }) {
    const [isOpen, setIsOpen] = useState(true);
    const { screenToFlowPosition } = useReactFlow();

    const templates = useTemplateStore((s) => s.templates);
    const isLoading = useTemplateStore(
        (s) => s.isLoading && s.templates.length === 0,
    );
    const fetchTemplates = useTemplateStore((s) => s.fetchTemplates);
    const hydrateFromCache = useTemplateStore((s) => s.hydrateFromCache);

    useEffect(() => {
        hydrateFromCache().then(() => fetchTemplates());
    }, [hydrateFromCache, fetchTemplates]);

    const createNodePayload = (nodeItem, isTemplate = false) => {
        return isTemplate
            ? {
                  template_id: nodeItem.id,
                  type: nodeItem.node_type,
                  label: nodeItem.name,
                  color: nodeItem.color || null,
                  icon: nodeItem.icon || null,
                  config: {
                      input_params: nodeItem.default_input_params || {},
                      validation_rules: nodeItem.default_validation || "",
                      process_logic: nodeItem.default_process_logic || "",
                      output_template: nodeItem.default_output_template || {},
                      description: nodeItem.description || "",
                  },
              }
            : {
                  template_id: null,
                  type: nodeItem.category,
                  label: nodeItem.label,
                  color: null,
                  icon: null,
                  config: nodeItem.config,
              };
    };

    const onDragStart = (event, nodeItem, isTemplate = false) => {
        event.dataTransfer.setData("application/reactflow/type", "customApi");
        const nodePayload = createNodePayload(nodeItem, isTemplate);
        event.dataTransfer.setData(
            "application/reactflow/nodeData",
            JSON.stringify(nodePayload),
        );
        event.dataTransfer.effectAllowed = "move";
    };

    const handleAddNodeByClick = (nodeItem, isTemplate = false) => {
        if (!onAddNode) return;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const position = screenToFlowPosition({ x: centerX, y: centerY });
        const nodePayload = createNodePayload(nodeItem, isTemplate);
        onAddNode(nodePayload, position);
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title="Tambah Node"
                className="absolute top-4 left-4 z-10 w-11 h-11 flex items-center justify-center rounded-sm bg-olive-900 text-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] hover:bg-olive-800 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
            >
                <Plus size={20} />
            </button>
        );
    }

    return (
        <div className="absolute top-4 left-4 z-10 bg-olive-50 rounded-sm border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] flex flex-col w-60 max-h-[65vh]">
            <div className="flex items-center justify-between px-3 py-2 rounded-t-sm border-b-2 border-olive-900 bg-olive-200">
                <span className="text-[11px] font-black text-olive-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus size={14} className="stroke-3" /> Tambah Node
                </span>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    title="Tutup"
                    className="p-1 hover:bg-olive-300 rounded-xs text-olive-900 cursor-pointer transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-3 flex flex-col gap-4 overflow-y-auto">
                {/* 1. BASIC NODES */}
                <div>
                    <h3 className="text-[10px] font-black text-olive-700 uppercase tracking-wider border-b-2 border-olive-900 pb-1 mb-2">
                        Basic Nodes
                    </h3>
                    <div className="flex flex-col gap-2">
                        {BASIC_NODES.map((node, index) => {
                            const theme =
                                NODE_TYPE_CONFIG[node.category] ||
                                NODE_TYPE_CONFIG.process;
                            const IconComp = theme.icon;

                            return (
                                <div
                                    key={`basic-${index}`}
                                    draggable={true}
                                    onDragStart={(e) =>
                                        onDragStart(e, node, false)
                                    }
                                    onClick={() =>
                                        handleAddNodeByClick(node, false)
                                    }
                                    className={`flex items-center justify-between p-2 border-2 ${theme.border} ${theme.bg} shadow-[2px_2px_0px_rgba(54,69,79,1)] cursor-pointer hover:brightness-95 transition-all rounded-sm`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`p-1 border border-olive-900 rounded-xs ${theme.badgeColor}`}
                                        >
                                            <IconComp
                                                size={12}
                                                className="text-olive-900"
                                            />
                                        </div>
                                        <span
                                            className={`text-xs font-black uppercase tracking-tight ${theme.text}`}
                                        >
                                            {node.label}
                                        </span>
                                    </div>
                                    <GripVertical
                                        size={14}
                                        className="text-olive-700 cursor-grab active:cursor-grabbing opacity-70 hover:opacity-100"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. TEMPLATES DARI BACKEND */}
                <div>
                    <div className="flex items-center justify-between border-b-2 border-olive-900 pb-1 mb-2">
                        <h3 className="text-[10px] font-black text-olive-700 uppercase tracking-wider">
                            Saved Templates
                        </h3>
                        <button
                            type="button"
                            title="Refresh daftar template"
                            onClick={() => fetchTemplates(true)}
                            className="p-0.5 text-olive-700 hover:text-olive-900 cursor-pointer transition-colors"
                        >
                            <RefreshCcw size={12} />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center gap-2 text-olive-700 py-2 justify-center">
                            <Loader2
                                size={14}
                                className="animate-spin text-olive-900"
                            />
                            <span className="text-[11px] font-bold">
                                Memuat Template...
                            </span>
                        </div>
                    ) : templates.length === 0 ? (
                        <p className="text-[11px] text-olive-600 font-semibold italic py-1 text-center">
                            Belum ada template tersimpan.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {templates.map((tpl) => {
                                const tplCategory = (
                                    tpl.node_type || "process"
                                ).toLowerCase();
                                const theme =
                                    NODE_TYPE_CONFIG[tplCategory] ||
                                    NODE_TYPE_CONFIG.process;

                                return (
                                    <div
                                        key={tpl.id}
                                        draggable={true}
                                        onDragStart={(e) =>
                                            onDragStart(e, tpl, true)
                                        }
                                        onClick={() =>
                                            handleAddNodeByClick(tpl, true)
                                        }
                                        className={`flex items-center justify-between p-2 bg-white border-2 border-olive-900 shadow-[2px_2px_0px_rgba(54,69,79,1)] cursor-pointer hover:bg-olive-100 transition-all rounded-sm`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 border border-olive-900 bg-olive-200 rounded-xs">
                                                <Layers
                                                    size={12}
                                                    className="text-olive-900"
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-olive-900 truncate max-w-32.5">
                                                {tpl.name || tpl.label}
                                            </span>
                                        </div>
                                        <GripVertical
                                            size={14}
                                            className="text-olive-600 cursor-grab active:cursor-grabbing"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
