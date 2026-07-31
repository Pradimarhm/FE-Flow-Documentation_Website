import React, { useState, useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

// Catatan skema penyimpanan:
// Sebelumnya komponen ini nge-debounce lalu langsung PUT /nodes/{id} tiap
// user ngetik. Itu bentrok dengan skema 2 (Simpan Flow manual) yang sekarang
// dipakai di seluruh canvas -> sekarang RightSidebar HANYA mengubah node di
// canvas (state lokal React Flow) dan menandai node itu "dirty" lewat
// onNodeDataChange. Data baru benar-benar terkirim ke backend saat user klik
// tombol "Simpan Flow" di header (lihat useFlowEditor.saveFlow).
export default function RightSidebar({ selectedNode, onNodeDataChange }) {
    const { setNodes } = useReactFlow();
    const [formData, setFormData] = useState({});
    const [justEdited, setJustEdited] = useState(false);
    const editedTimerRef = useRef(null);

    useEffect(() => {
        if (selectedNode) {
            setFormData(selectedNode.data || {});
            setJustEdited(false);
        } else {
            setFormData({});
        }
        return () => clearTimeout(editedTimerRef.current);
    }, [selectedNode]);

    if (!selectedNode) return null;

    const flashEdited = () => {
        setJustEdited(true);
        clearTimeout(editedTimerRef.current);
        editedTimerRef.current = setTimeout(() => setJustEdited(false), 1200);
    };

    const applyChange = (newData) => {
        setFormData(newData);
        setNodes((nds) =>
            nds.map((node) =>
                node.id === selectedNode.id ? { ...node, data: newData } : node,
            ),
        );
        onNodeDataChange?.(selectedNode.id);
        flashEdited();
    };

    const handleConfigChange = (field, value) => {
        let parsedValue = value;

        // Jika field inputParams, coba parse dari string textarea ke JSON object
        if (field === "inputParams") {
            try {
                parsedValue = JSON.parse(value);
            } catch (e) {
                // Jika user masih mengetik JSON belum selesai/valid, biarkan string
                parsedValue = value;
            }
        }

        applyChange({
            ...formData,
            config: {
                ...(formData.config || {}),
                [field]: parsedValue,
            },
        });
    };

    const handleRootChange = (field, value) => {
        applyChange({ ...formData, [field]: value });
    };

    return (
        <div className="w-full h-full bg-olive-50 border-l-2 border-olive-900 flex flex-col overflow-y-auto">
            <div className="p-4 border-b-4 border-olive-900 bg-olive-200 flex justify-between items-center">
                <div>
                    <h2 className="font-black text-lg text-olive-900 uppercase">
                        Config
                    </h2>
                    <p className="text-xs font-bold text-olive-700">
                        ID: {selectedNode.id}
                    </p>
                </div>
                <div
                    className={`text-[10px] font-black px-2 py-1 uppercase border-2 border-black transition-colors ${
                        justEdited ? "bg-amber-200" : "bg-white"
                    }`}
                >
                    {justEdited ? "DIUBAH" : "IDLE"}
                </div>
            </div>

            <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Node Label
                    </label>
                    <input
                        type="text"
                        value={formData.label || ""}
                        onChange={(e) =>
                            handleRootChange("label", e.target.value)
                        }
                        className="p-2 border-2 border-olive-900 text-sm font-semibold outline-none"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Node Category
                    </label>
                    <select
                        value={formData.category || formData.type || "process"}
                        onChange={(e) =>
                            handleRootChange("category", e.target.value)
                        }
                        className="p-2 border-2 border-olive-900 bg-white text-sm font-semibold outline-none"
                    >
                        <option value="start">Start</option>
                        <option value="condition">Condition</option>
                        <option value="process">Process</option>
                        <option value="validation">Validation</option>
                        <option value="database">Database</option>
                        <option value="api">API</option>
                        <option value="end">End</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Input Params (JSON)
                    </label>
                    <textarea
                        rows={3}
                        value={
                            typeof formData.config?.inputParams === "object"
                                ? JSON.stringify(
                                      formData.config.inputParams,
                                      null,
                                      2,
                                  )
                                : formData.config?.inputParams || ""
                        }
                        onChange={(e) =>
                            handleConfigChange("inputParams", e.target.value)
                        }
                        className="p-2 border-2 border-olive-900 font-mono text-xs outline-none"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Validation Logic
                    </label>
                    <input
                        type="text"
                        value={formData.config?.validationRules || ""}
                        onChange={(e) =>
                            handleConfigChange(
                                "validationRules",
                                e.target.value,
                            )
                        }
                        className="p-2 border-2 border-olive-900 text-xs outline-none"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Process Logic
                    </label>
                    <input
                        type="text"
                        value={formData.config?.processLogic || ""}
                        onChange={(e) =>
                            handleConfigChange("processLogic", e.target.value)
                        }
                        className="p-2 border-2 border-olive-900 text-xs outline-none"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Description
                    </label>
                    <textarea
                        rows={2}
                        value={formData.description || ""}
                        onChange={(e) =>
                            handleRootChange("description", e.target.value)
                        }
                        className="p-2 border-2 border-olive-900 text-xs outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
