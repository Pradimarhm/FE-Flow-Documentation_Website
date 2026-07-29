import React, { useEffect, useState } from "react";
import { useTemplateStore } from "@/store/templateStore";
import { Loader2, GripVertical, Plus, X, RefreshCcw } from "lucide-react";

// Basic Nodes — isi config-nya SAMA BENTUKNYA dengan template dari backend
// (inputParams / validationRules / processLogic / outputTemplate), supaya
// ApiNode & RightSidebar selalu menerima struktur data yang konsisten baik
// node berasal dari "Basic Nodes" maupun dari "Saved Templates".
const BASIC_NODES = [
    {
        label: "Start Node",
        category: "start",
        color: "bg-green-100",
        config: {
            inputParams: {},
            validationRules: "",
            processLogic: "// Titik awal alur, tidak memproses data",
            outputTemplate: {},
        },
    },
    {
        label: "Process Node",
        category: "process",
        color: "bg-white",
        config: {
            inputParams: { input: "" },
            validationRules: "required:input",
            processLogic: "// Proses data input di sini",
            outputTemplate: { result: "" },
        },
    },
    {
        label: "Validation Node",
        category: "validation",
        color: "bg-yellow-100",
        config: {
            inputParams: { value: "" },
            validationRules: "value != null",
            processLogic: "// Validasi input sebelum lanjut ke node berikutnya",
            outputTemplate: { valid: true },
        },
    },
    {
        label: "Database Node",
        category: "database",
        color: "bg-blue-100",
        config: {
            inputParams: { query: "", table: "" },
            validationRules: "table != null",
            processLogic: "// Eksekusi query ke database",
            outputTemplate: { rows: [] },
        },
    },
    {
        label: "API Request",
        category: "api",
        color: "bg-purple-100",
        config: {
            inputParams: { method: "GET", url: "", headers: {} },
            validationRules: "url != null",
            processLogic: "// Kirim request API ke endpoint eksternal",
            outputTemplate: { status: 200, body: {} },
        },
    },
    {
        label: "End Node",
        category: "end",
        color: "bg-red-100",
        config: {
            inputParams: {},
            validationRules: "",
            processLogic: "// Titik akhir alur",
            outputTemplate: {},
        },
    },
];

export default function FloatingNodeMenu() {
    const [isOpen, setIsOpen] = useState(true);

    // Template diambil dari cache (memory + IndexedDB), BUKAN call API
    // langsung di komponen ini. fetchTemplates() sendiri sudah pintar:
    // kalau data masih segar, tidak ada request sama sekali; kalau data
    // ada tapi basi, dipakai dulu sambil di-refresh di belakang layar.
    const templates = useTemplateStore((s) => s.templates);
    const isLoading = useTemplateStore((s) => s.isLoading && s.templates.length === 0);
    const fetchTemplates = useTemplateStore((s) => s.fetchTemplates);
    const hydrateFromCache = useTemplateStore((s) => s.hydrateFromCache);

    useEffect(() => {
        hydrateFromCache().then(() => fetchTemplates());
    }, [hydrateFromCache, fetchTemplates]);

    const onDragStart = (event, nodeItem, isTemplate = false) => {
        event.dataTransfer.setData("application/reactflow/type", "customApi");

        const nodePayload = isTemplate
            ? {
                    template_id: nodeItem.id,
                    type: nodeItem.node_type,
                    label: nodeItem.name,
                    color: nodeItem.color || null,
                    icon: nodeItem.icon || null,
                    config: {
                        inputParams: nodeItem.default_input_params || {},
                        validationRules: nodeItem.default_validation || "",
                        processLogic: nodeItem.default_process_logic || "",
                        outputTemplate: nodeItem.default_output_template || {},
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

        event.dataTransfer.setData("application/reactflow/nodeData", JSON.stringify(nodePayload));
        event.dataTransfer.effectAllowed = "move";
    };

    // Menu tertutup -> hanya tombol bulat "+" (hemat ruang canvas, cocok
    // dipakai berkali-kali / banyak node ke depannya -> lebih scalable)
    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title="Tambah Node"
                className="absolute top-4 left-4 z-10 w-11 h-11 flex items-center justify-center bg-olive-900 text-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] hover:bg-olive-700 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
            >
                <Plus size={20} />
            </button>
        );
    }

    return (
        <div className="absolute top-4 left-4 z-10 bg-olive-50 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] flex flex-col w-56 max-h-[80vh]">
            {/* Header + tombol tutup */}
            <div className="flex items-center justify-between px-3 py-2 border-b-2 border-olive-900 bg-olive-200">
                <span className="text-[11px] font-black text-olive-900 uppercase tracking-wider">
                    Tambah Node
                </span>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    title="Tutup"
                    className="p-1 hover:bg-olive-300 cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-3 flex flex-col gap-3 overflow-y-auto">
                {/* 1. BASIC NODES */}
                <div>
                    <h3 className="text-[11px] font-black text-olive-900 uppercase tracking-wider border-b-2 border-olive-900 pb-1 mb-2">
                        Basic Nodes
                    </h3>
                    <div className="flex flex-col gap-1.5">
                        {BASIC_NODES.map((node, index) => (
                            <div
                                key={`basic-${index}`}
                                draggable={true}
                                onDragStart={(e) => onDragStart(e, node, false)}
                                className={`flex items-center justify-between p-1.5 border-2 border-olive-900 shadow-[2px_2px_0px_rgba(54,69,79,1)] cursor-grab active:cursor-grabbing hover:opacity-80 transition-all text-xs font-bold text-olive-900 ${node.color}`}
                            >
                                <span className="capitalize">{node.label}</span>
                                <GripVertical size={14} className="text-olive-700" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. TEMPLATES DARI BACKEND (via cache) */}
                <div>
                    <div className="flex items-center justify-between border-b-2 border-olive-900 pb-1 mb-2">
                        <h3 className="text-[11px] font-black text-olive-900 uppercase tracking-wider">
                            Saved Templates
                        </h3>
                        <button
                            type="button"
                            title="Refresh daftar template"
                            onClick={() => fetchTemplates(true)}
                            className="p-0.5 text-olive-700 hover:text-olive-900 cursor-pointer"
                        >
                            <RefreshCcw size={12} />
                        </button>
                    </div>

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
                                    draggable={true}
                                    onDragStart={(e) => onDragStart(e, tpl, true)}
                                    className="flex items-center justify-between p-1.5 bg-white border-2 border-olive-900 shadow-[2px_2px_0px_rgba(54,69,79,1)] cursor-grab active:cursor-grabbing hover:bg-olive-100 transition-all text-xs font-bold text-olive-900"
                                >
                                    <span className="truncate max-w-32.5">{tpl.name || tpl.label}</span>
                                    <GripVertical size={14} className="text-olive-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}