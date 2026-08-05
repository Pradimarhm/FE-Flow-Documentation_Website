import React, { useEffect, useState } from "react";
import { useTemplateStore } from "@/store/templateStore";
import { Loader2, GripVertical, Plus, X, RefreshCcw } from "lucide-react";
import { useReactFlow } from "@xyflow/react"; // 1. Import useReactFlow

const BASIC_NODES = [
    {
        label: "Start Node",
        category: "start",
        color: "bg-green-100",
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
        color: "bg-indigo-100",
        config: {
            input_params: { variable: "" },
            validation_rules: "variable == true",
            process_logic: "// Evaluasi kondisi boolean",
            output_template: { branch: "true" },
            condition_expression: "total_belanja >= 100000"
        },
    },
    {
        label: "Process Node",
        category: "process",
        color: "bg-white",
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
        color: "bg-yellow-100",
        config: {
            input_params: { value: "" },
            validation_rules: "value != null",
            process_logic: "// Validasi input sebelum lanjut ke node berikutnya",
            output_template: { valid: true },
        },
    },
    {
        label: "Database Node",
        category: "database",
        color: "bg-blue-100",
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
        color: "bg-purple-100",
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
        color: "bg-red-100",
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

    // Cuma butuh screenToFlowPosition buat hitung posisi klik -> koordinat
    // canvas. Penambahan node SEBENARNYA (setNodes + tracking dirty) sudah
    // didelegasikan ke useFlowEditor lewat prop onAddNode, supaya node yang
    // ditambah lewat klik ikut ter-track dan benar-benar tersimpan ke
    // backend saat "Simpan Flow" (lihat useFlowEditor.addNodeAtPosition).
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

    // Helper untuk membentuk data/payload node
    const createNodePayload = (nodeItem, isTemplate = false) => {
        return isTemplate
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

    // Tambah node langsung ke tengah layar via klik. Payload dibentuk di
    // sini (sama seperti sebelumnya), tapi PENAMBAHAN node ke canvas +
    // pencatatan dirty state sekarang didelegasikan sepenuhnya ke
    // useFlowEditor.addNodeAtPosition lewat prop onAddNode, supaya
    // konsisten dengan alur drag & drop (onDrop) dan benar-benar
    // terkirim ke backend saat "Simpan Flow".
    const handleAddNodeByClick = (nodeItem, isTemplate = false) => {
        if (!onAddNode) {
            console.warn(
                "[FloatingNodeMenu] onAddNode belum di-pass dari FlowCanvas, node tidak akan tersimpan ke backend.",
            );
            return;
        }

        // Ambil titik tengah layar browser
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Konversi koordinat layar ke koordinat canvas Flow
        const position = screenToFlowPosition({ x: centerX, y: centerY });

        const nodePayload = createNodePayload(nodeItem, isTemplate);

        // buildNodeContent (dipanggil di dalam addNodeAtPosition) menerima
        // payload dengan bentuk { label, category/type, template_id, config }
        // -- sudah persis sama dengan nodePayload di sini, jadi tinggal
        // diteruskan apa adanya.
        onAddNode(nodePayload, position);
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title="Tambah Node"
                className="absolute top-4 left-4 z-10 w-11 h-11 flex items-center justify-center rounded-sm bg-olive-900 text-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] hover:bg-olive-700 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
            >
                <Plus size={20} />
            </button>
        );
    }

    return (
        <div className="absolute top-4 left-4 z-10 bg-olive-50 rounded-sm border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] flex flex-col w-56 max-h-[80vh]">
            <div className="flex items-center justify-between px-3 py-2 rounded-t-sm border-b-2 border-olive-900 bg-olive-200">
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
                                onClick={() =>
                                    handleAddNodeByClick(node, false)
                                } // <-- Klik Tambah Node
                                className={`flex items-center justify-between p-1.5 border-2 border-olive-900 shadow-[2px_2px_0px_rgba(54,69,79,1)] cursor-pointer hover:opacity-80 transition-all text-xs font-bold text-olive-900 ${node.color}`}
                            >
                                <span className="capitalize">{node.label}</span>
                                <GripVertical
                                    size={14}
                                    className="text-olive-700 cursor-grab active:cursor-grabbing"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. TEMPLATES DARI BACKEND */}
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
                            <span className="text-[11px] font-semibold">
                                Loading...
                            </span>
                        </div>
                    ) : templates.length === 0 ? (
                        <p className="text-[11px] text-olive-500 italic py-1">
                            Belum ada template.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {templates.map((tpl) => (
                                <div
                                    key={tpl.id}
                                    draggable={true}
                                    onDragStart={(e) =>
                                        onDragStart(e, tpl, true)
                                    }
                                    onClick={() =>
                                        handleAddNodeByClick(tpl, true)
                                    } // <-- Klik Tambah Template
                                    className="flex items-center justify-between p-1.5 bg-white border-2 border-olive-900 shadow-[2px_2px_0px_rgba(54,69,79,1)] cursor-pointer hover:bg-olive-100 transition-all text-xs font-bold text-olive-900"
                                >
                                    <span className="truncate max-w-32.5">
                                        {tpl.name || tpl.label}
                                    </span>
                                    <GripVertical
                                        size={14}
                                        className="text-olive-500 cursor-grab active:cursor-grabbing"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
