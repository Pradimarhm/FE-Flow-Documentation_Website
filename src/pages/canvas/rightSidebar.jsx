import React, { useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

export default function RightSidebar({ selectedNode, setSelectedNode }) {
    const { setNodes } = useReactFlow();
    const [formData, setFormData] = useState({});

    // State baru untuk teater UX penyimpanan
    const [saveStatus, setSaveStatus] = useState("IDLE");

    useEffect(() => {
        if (selectedNode) {
            setFormData(selectedNode.data || {});
            setSaveStatus("IDLE"); // Reset status saat ganti node
        } else {
            setFormData({});
        }
    }, [selectedNode]);

    // Efek untuk memalsukan proses penyimpanan
    useEffect(() => {
        if (saveStatus === "SAVING") {
            const timer = setTimeout(() => {
                setSaveStatus("SAVED");
                setTimeout(() => setSaveStatus("IDLE"), 2000);
            }, 600); // Jeda 600ms agar terlihat seperti sedang memproses
            return () => clearTimeout(timer);
        }
    }, [saveStatus, formData]);

    if (!selectedNode) {
        return (
            <div className="w-80 h-full bg-olive-50 border-l-4 border-olive-900 p-4 flex flex-col items-center justify-center text-olive-900 shadow-[-4px_0px_0px_rgba(54,69,79,1)]">
                <p className="text-sm font-bold text-center">
                    Pilih node di kanvas untuk melihat konfigurasi.
                </p>
            </div>
        );
    }

    const handleInputChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        setSaveStatus("SAVING"); // Memicu efek visual

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return { ...node, data: newData };
                }
                return node;
            }),
        );
    };

    // Render badge dinamis
    const renderStatusBadge = () => {
        if (saveStatus === "SAVING")
            return (
                <div className="bg-blue-400 text-black text-[10px] font-black px-2 py-1 uppercase border-2 border-black animate-pulse">
                    Saving...
                </div>
            );
        if (saveStatus === "SAVED")
            return (
                <div className="bg-green-400 text-black text-[10px] font-black px-2 py-1 uppercase border-2 border-black">
                    Saved!
                </div>
            );
        return (
            <div className="bg-yellow-400 text-black text-[10px] font-black px-2 py-1 uppercase border-2 border-black">
                Idle
            </div>
        );
    };

    return (
        <div className="w-80 h-full bg-olive-50 border-l-2 border-olive-900 flex flex-col overflow-y-auto">
            <div className="p-4 border-b-4 border-olive-900 bg-olive-200 flex justify-between items-center transition-colors">
                <div>
                    <h2 className="font-black text-lg text-olive-900 uppercase">
                        Config
                    </h2>
                    <p className="text-xs font-bold text-olive-700">
                        ID: {selectedNode.id}
                    </p>
                </div>
                {/* Panggil badge di sini */}
                {renderStatusBadge()}
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
                            handleInputChange("label", e.target.value)
                        }
                        className="p-2 rounded border-2 border-olive-900 bg-white text-sm font-semibold outline-none focus:bg-olive-100 transition-colors"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Node Category
                    </label>
                    <select
                        value={formData.category || "process"}
                        onChange={(e) =>
                            handleInputChange("category", e.target.value)
                        }
                        className="p-2 rounded border-2 border-olive-900 bg-olive-50 text-sm font-semibold outline-none focus:bg-olive-100 cursor-pointer capitalize transition-colors"
                    >
                        <option value="start">Start</option>
                        <option value="end">End</option>
                        <option value="process">Process</option>
                        <option value="validation">Validation</option>
                        <option value="database">Database</option>
                        <option value="api">API</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Input Params (JSON)
                    </label>
                    <textarea
                        rows={4}
                        value={formData.inputParams || ""}
                        onChange={(e) =>
                            handleInputChange("inputParams", e.target.value)
                        }
                        className="p-2 rounded border-2 border-olive-900 bg-olive-200 text-olive-900 font-mono text-xs outline-none transition-colors"
                        placeholder='{"key": "value"}'
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-olive-900 uppercase">
                        Validation Rules
                    </label>
                    <textarea
                        rows={2}
                        value={formData.validationRules || ""}
                        onChange={(e) =>
                            handleInputChange("validationRules", e.target.value)
                        }
                        className="p-2 rounded border-2 border-olive-900 bg-white text-sm font-semibold outline-none focus:bg-olive-100 transition-colors"
                        placeholder="Contoh: origin tidak boleh kosong"
                    />
                </div>
            </div>
        </div>
    );
}
