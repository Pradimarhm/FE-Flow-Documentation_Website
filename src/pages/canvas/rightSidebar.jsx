import React, { useState, useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

export default function RightSidebar({ selectedNode, onNodeDataChange }) {
    const { setNodes } = useReactFlow();
    const [formData, setFormData] = useState({});
    const [jsonInputText, setJsonInputText] = useState("");
    const [justEdited, setJustEdited] = useState(false);
    const editedTimerRef = useRef(null);

    useEffect(() => {
        if (selectedNode) {
            const data = selectedNode.data || {};
            setFormData(data);

            // Ambil input_params dengan fallback
            const params = data.config?.input_params || {};
            setJsonInputText(
                typeof params === "object"
                    ? JSON.stringify(params, null, 2)
                    : String(params),
            );

            setJustEdited(false);
        } else {
            setFormData({});
            setJsonInputText("");
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
        applyChange({
            ...formData,
            config: {
                ...(formData.config || {}),
                [field]: value,
            },
        });
    };

    const handleJsonChange = (rawText) => {
        setJsonInputText(rawText);
        let parsedValue = rawText;
        try {
            parsedValue = JSON.parse(rawText);
        } catch (e) {
            parsedValue = rawText;
        }

        applyChange({
            ...formData,
            config: {
                ...(formData.config || {}),
                input_params: parsedValue,
            },
        });
    };

    const handleRootChange = (field, value) => {
        applyChange({ ...formData, [field]: value });
    };

    const nodeCategory = (
        formData.category ||
        formData.type ||
        "process"
    ).toLowerCase();

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
                {/* NODE LABEL */}
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
                        className="p-2 border-2 border-olive-900 text-sm font-semibold outline-none bg-white"
                    />
                </div>

                {/* NODE CATEGORY */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Node Category
                    </label>
                    <select
                        value={nodeCategory}
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

                {/* INPUT PARAMS (JSON) */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Input Params (JSON)
                    </label>
                    <textarea
                        rows={4}
                        value={jsonInputText}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        className="p-2 border-2 border-olive-900 font-mono text-xs outline-none bg-white"
                    />
                </div>

                {/* CONDITION EXPRESSION (Tampil Khusus Node Condition / Selalu Ada) */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Condition Expression
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. total_belanja >= minimum_belanja"
                        value={formData.config?.condition_expression || ""}
                        onChange={(e) =>
                            handleConfigChange(
                                "condition_expression",
                                e.target.value,
                            )
                        }
                        className="p-2 border-2 border-olive-900 text-xs font-mono outline-none bg-amber-50 font-semibold"
                    />
                </div>

                {/* VALIDATION RULES */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Validation Logic
                    </label>
                    <input
                        type="text"
                        value={formData.config?.validation_rules || ""}
                        onChange={(e) =>
                            handleConfigChange(
                                "validation_rules",
                                e.target.value,
                            )
                        }
                        className="p-2 border-2 border-olive-900 text-xs outline-none bg-white font-mono"
                    />
                </div>

                {/* PROCESS LOGIC */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Process Logic
                    </label>
                    <input
                        type="text"
                        value={formData.config?.process_logic || ""}
                        onChange={(e) =>
                            handleConfigChange("process_logic", e.target.value)
                        }
                        className="p-2 border-2 border-olive-900 text-xs outline-none bg-white font-mono"
                    />
                </div>

                {/* DESCRIPTION */}
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
                        className="p-2 border-2 border-olive-900 text-xs outline-none bg-white"
                    />
                </div>
            </div>
        </div>
    );
}
