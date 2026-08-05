import React, { useEffect, useState } from "react";
import { templateService } from "@/services/templateService";
import { aiService } from "@/services/aiService";
import { Plus, Trash2, Loader2, ChevronDown, Sparkles } from "lucide-react";
import { NODE_TYPE_CONFIG } from "@/config/nodeTypes";
import ErrorPopup from "../components/error/errorPopUp";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        node_type: "process",
        default_input_params: "{}",
        default_validation: "",
        default_process_logic: "",
        default_output_template: "{}",
    });

    const [actionPopup, setActionPopup] = useState({
        isOpen: false,
        title: "",
        type: "error",
        message: "",
        errors: null,
        onConfirm: null,
    });

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            setFetchError(null);
            const res = await templateService.getTemplates();
            setTemplates(res?.data || res || []);
        } catch (err) {
            console.error("Gagal ambil template:", err);
            setFetchError(err?.message || "Gagal mengambil data template.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleAIGenerate = async () => {
        if (!formData.name.trim()) {
            setActionPopup({
                isOpen: true,
                title: "Input Diperlukan",
                type: "warning",
                message: "Silakan isi Nama Template terlebih dahulu!",
                onConfirm: null,
            });
            return;
        }

        setIsGenerating(true);
        try {
            const aiData = await aiService.generateTemplateDetails({
                name: formData.name,
                nodeType: formData.node_type,
            });

            setFormData((prev) => ({
                ...prev,
                default_input_params: JSON.stringify(
                    aiData.default_input_params || {},
                    null,
                    2,
                ),
                default_validation: aiData.default_validation || "",
                default_process_logic: aiData.default_process_logic || "",
                default_output_template: JSON.stringify(
                    aiData.default_output_template || {},
                    null,
                    2,
                ),
            }));
        } catch (error) {
            setActionPopup({
                isOpen: true,
                title: "Gagal Generate Config AI",
                type: "error",
                message: error.message || "Terjadi kesalahan pada layanan AI.",
                onConfirm: null,
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let parsedInput = {};
            let parsedOutput = {};

            try {
                parsedInput =
                    typeof formData.default_input_params === "string"
                        ? JSON.parse(formData.default_input_params)
                        : formData.default_input_params;
            } catch (e) {
                setActionPopup({
                    isOpen: true,
                    title: "Format JSON Tidak Valid",
                    type: "error",
                    message:
                        "Format JSON pada Default Input Params tidak valid!",
                    onConfirm: null,
                });
                return;
            }

            try {
                parsedOutput =
                    typeof formData.default_output_template === "string"
                        ? JSON.parse(formData.default_output_template)
                        : formData.default_output_template;
            } catch (e) {
                setActionPopup({
                    isOpen: true,
                    title: "Format JSON Tidak Valid",
                    type: "error",
                    message:
                        "Format JSON pada Default Output Template tidak valid!",
                    onConfirm: null,
                });
                return;
            }

            const payload = {
                name: formData.name,
                node_type: formData.node_type,
                default_input_params: parsedInput,
                default_validation: formData.default_validation,
                default_process_logic: formData.default_process_logic,
                default_output_template: parsedOutput,
            };

            await templateService.createTemplate(payload);
            setIsModalOpen(false);
            fetchTemplates();

            setActionPopup({
                isOpen: true,
                title: "Berhasil Menambah Template",
                type: "success",
                message: "Master template node baru telah dibuat.",
                onConfirm: null,
            });
        } catch (err) {
            setActionPopup({
                isOpen: true,
                title: "Gagal Membuat Template",
                type: "error",
                message:
                    err?.message || "Terjadi kesalahan saat menyimpan data.",
                onConfirm: null,
            });
        }
    };

    const promptDeleteTemplate = (id, name) => {
        setActionPopup({
            isOpen: true,
            title: "Hapus Template?",
            type: "confirm",
            message: `Apakah kamu yakin ingin menghapus template "${name}"?`,
            onConfirm: async () => {
                try {
                    await templateService.deleteTemplate(id);
                    fetchTemplates();
                    setActionPopup({
                        isOpen: true,
                        title: "Berhasil Menghapus",
                        type: "success",
                        message: `Template "${name}" telah berhasil dihapus.`,
                        onConfirm: null,
                    });
                } catch (err) {
                    setActionPopup({
                        isOpen: true,
                        title: "Gagal Menghapus",
                        type: "error",
                        message:
                            err?.message ||
                            "Tidak dapat menghapus template ini.",
                        onConfirm: null,
                    });
                }
            },
        });
    };

    return (
        <div className="p-6 bg-olive-50 min-h-screen">
            <div className="flex justify-between items-center mb-10 pb-4 border-b-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-olive-900 tracking-tight">
                        Node Templates
                    </h1>
                    <p className="text-olive-700">
                        Kelola master template node untuk canvas flow
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-sm bg-green-500 text-green-50 text-xs font-bold border-2 border-olive-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-green-700 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                    <Plus size={16} /> Tambah Template
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-olive-800">
                    <Loader2 className="animate-spin" size={20} /> Memuat data
                    template...
                </div>
            ) : fetchError ? (
                <div className="p-4 bg-red-100 border-2 border-black font-bold text-red-900 rounded-sm">
                    ⚠️ {fetchError}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((item) => {
                        const typeConfig =
                            NODE_TYPE_CONFIG[item.node_type] ||
                            NODE_TYPE_CONFIG.process;
                        const IconComponent = typeConfig.icon;

                        return (
                            <div
                                key={item.id}
                                className="p-4 bg-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-3 rounded-sm"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`p-1.5 rounded-xs border-2 border-black ${typeConfig.badgeColor}`}
                                            >
                                                <IconComponent
                                                    size={16}
                                                    className="text-black"
                                                />
                                            </div>
                                            <h3 className="font-bold text-olive-900 text-sm">
                                                {item.name}
                                            </h3>
                                        </div>

                                        <span
                                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border border-black ${typeConfig.badgeColor}`}
                                        >
                                            {item.node_type}
                                        </span>
                                    </div>

                                    <div className="mt-3 text-[10px] bg-slate-50 p-2 rounded-sm border-2 border-black font-mono overflow-x-auto max-h-24">
                                        <p className="font-bold text-black mb-1">
                                            Input Params:
                                        </p>
                                        <pre>
                                            {JSON.stringify(
                                                item.default_input_params,
                                                null,
                                                2,
                                            )}
                                        </pre>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t-2 border-olive-200 pt-2">
                                    <button
                                        onClick={() =>
                                            promptDeleteTemplate(
                                                item.id,
                                                item.name,
                                            )
                                        }
                                        className="p-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-300 rounded cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-md border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b-2 border-olive-200 pb-2">
                            <h2 className="text-lg font-black text-olive-900">
                                Tambah Template Node
                            </h2>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3 text-xs"
                        >
                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Nama Template *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Validasi Stok Produk"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 rounded-sm border-2 border-olive-900 font-semibold"
                                />

                                <button
                                    type="button"
                                    onClick={handleAIGenerate}
                                    disabled={
                                        isGenerating || !formData.name.trim()
                                    }
                                    className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-black text-black bg-amber-300 rounded-sm border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-amber-400 active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />
                                            Generating Config with Gemini...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            Auto-Fill Details with AI
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="relative">
                                <label className="font-bold text-olive-900 block mb-1">
                                    Node Type
                                </label>
                                <div
                                    onClick={() =>
                                        setIsDropdownOpen(!isDropdownOpen)
                                    }
                                    className="w-full p-2 rounded-sm border-2 border-olive-900 font-semibold bg-white cursor-pointer flex justify-between items-center select-none"
                                >
                                    <span className="capitalize">
                                        {formData.node_type}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-olive-900 transition-transform duration-200 ${
                                            isDropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-sm border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] z-50 flex flex-col">
                                        {[
                                            "start",
                                            "process",
                                            "validation",
                                            "database",
                                            "api",
                                            "end",
                                        ].map((type) => (
                                            <div
                                                key={type}
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        node_type: type,
                                                    });
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="p-2 text-xs font-semibold hover:bg-olive-200 cursor-pointer capitalize border-b border-olive-200 last:border-b-0"
                                            >
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Input Params (JSON)
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.default_input_params}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            default_input_params:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full p-2 rounded-sm border-2 border-olive-900 font-mono text-[11px]"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Validation Logic
                                </label>
                                <input
                                    type="text"
                                    value={formData.default_validation}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            default_validation: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 rounded-sm border-2 border-olive-900 font-mono text-[11px]"
                                    placeholder="Contoh: stock > 10"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Process Logic
                                </label>
                                <input
                                    type="text"
                                    value={formData.default_process_logic}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            default_process_logic:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full p-2 rounded-sm border-2 border-olive-900 font-mono text-[11px]"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Output Template (JSON)
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.default_output_template}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            default_output_template:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full p-2 rounded-sm border-2 border-olive-900 font-mono text-[11px]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4 pt-2 border-t-2 border-olive-200">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-sm border-2 border-black font-bold text-olive-900 hover:bg-olive-200 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 rounded-sm bg-green-500 text-green-50 text-xs font-bold border-2 border-olive-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-green-700 -translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ErrorPopup
                isOpen={actionPopup.isOpen}
                onClose={() =>
                    setActionPopup({ ...actionPopup, isOpen: false })
                }
                title={actionPopup.title}
                type={actionPopup.type}
                message={actionPopup.message}
                errors={actionPopup.errors}
                onConfirm={actionPopup.onConfirm}
            />
        </div>
    );
}
