import React, { useEffect, useState, useMemo } from "react";
import { templateService } from "@/services/templateService";
import { aiService } from "@/services/aiService";
import {
    Plus,
    Trash2,
    Loader2,
    ChevronDown,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Layers,
    RefreshCw,
} from "lucide-react";
import { NODE_TYPE_CONFIG } from "@/config/nodeTypes";
import ErrorPopup from "../components/error/errorPopUp";

const ITEMS_PER_PAGE = 6; // Menampilkan 6 card template per halaman

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1); // State Pagination

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Logika Kalkulasi Pagination
    const totalPages = useMemo(() => {
        return Math.ceil(templates.length / ITEMS_PER_PAGE) || 1;
    }, [templates]);

    const paginatedTemplates = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return templates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [templates, currentPage]);

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

        if (isSubmitting) return;

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

            setIsSubmitting(true);

            const payload = {
                name: formData.name,
                node_type: formData.node_type,
                default_input_params: parsedInput,
                default_validation: formData.default_validation,
                default_process_logic: formData.default_process_logic,
                default_output_template: parsedOutput,
            };

            await templateService.createTemplate(payload);

            setFormData({
                name: "",
                node_type: "process",
                default_input_params: "{}",
                default_validation: "",
                default_process_logic: "",
                default_output_template: "{}",
            });

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
        } finally {
            setIsSubmitting(false);
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

                    if (paginatedTemplates.length === 1 && currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                    }

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
        <div className="p-6 bg-olive-50 h-full flex flex-col justify-between overflow-hidden">
            {/* Header Sticky */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-olive-900 shrink-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-olive-900 tracking-tight">
                        Node Templates
                    </h1>
                    <p className="text-olive-700 font-medium">
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

            {/* Scrollable Container Content */}
            <div className="flex-1 overflow-y-auto pr-2 py-4 flex flex-col">
                {isLoading ? (
                    /* 💀 CARD SKELETON LOADING STATE */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: ITEMS_PER_PAGE }).map(
                            (_, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-white border-2 border-olive-300 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between gap-3 rounded-sm animate-pulse"
                                >
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-olive-200 border-2 border-olive-300 rounded-xs" />
                                                <div className="h-4 bg-olive-200 rounded-xs w-28" />
                                            </div>
                                            <div className="w-14 h-5 bg-olive-200 border border-olive-300 rounded-xs" />
                                        </div>

                                        <div className="mt-3 bg-olive-100 p-2.5 rounded-sm border-2 border-olive-200 flex flex-col gap-2">
                                            <div className="h-3 bg-olive-200 rounded-xs w-20" />
                                            <div className="h-10 bg-olive-200 rounded-xs w-full" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end border-t-2 border-olive-200 pt-2">
                                        <div className="w-6 h-6 bg-rose-100 border border-olive-200 rounded-xs" />
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                ) : fetchError ? (
                    /* ⚠️ ERROR STATE (CENTERED & NEOBRUTALISM WITH LUCIDE ICON) */
                    <div className="m-auto flex flex-col items-center justify-center p-8 bg-rose-50 border-4 border-olive-900 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md text-center gap-3">
                        <div className="p-3 bg-rose-200 border-2 border-olive-900 rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                            <AlertTriangle
                                size={32}
                                className="text-rose-700"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">
                                Gagal Memuat Template
                            </h3>
                            <p className="text-xs font-semibold text-rose-800 mt-1">
                                {fetchError}
                            </p>
                        </div>
                        <button
                            onClick={fetchTemplates}
                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-white border-2 border-olive-900 text-olive-900 font-bold text-xs rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-olive-100 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
                        >
                            <RefreshCw size={14} /> Coba Lagi
                        </button>
                    </div>
                ) : templates.length === 0 ? (
                    /* 📭 EMPTY STATE (CENTERED & NEOBRUTALISM WITH LUCIDE ICON) */
                    <div className="m-auto flex flex-col items-center justify-center p-8 bg-white border-4 border-olive-900 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md text-center gap-3">
                        <div className="p-3 bg-olive-200 border-2 border-olive-900 rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                            <Layers size={32} className="text-olive-900" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-olive-900 uppercase tracking-tight">
                                Belum Ada Template Node
                            </h3>
                            <p className="text-xs font-semibold text-olive-600 mt-1">
                                Buat master template node baru untuk mempermudah
                                penyusunan canvas flow.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-green-500 text-white border-2 border-olive-900 font-bold text-xs rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-green-600 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
                        >
                            <Plus size={16} /> Tambah Template Sekarang
                        </button>
                    </div>
                ) : (
                    /* 📋 DAFTAR TEMPLATE LIST */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedTemplates.map((item) => {
                            const typeConfig =
                                NODE_TYPE_CONFIG[item.node_type] ||
                                NODE_TYPE_CONFIG.process;
                            const IconComponent = typeConfig.icon;

                            return (
                                <div
                                    key={item.id}
                                    className="p-4 bg-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-3 rounded-sm hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
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

                                        <div className="mt-3 text-[10px] bg-slate-50 p-2 rounded-sm border-2 border-black font-mono overflow-x-auto max-h-28">
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
                                            title="Hapus Template"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Controls Bar / Bottom Pagination Skeleton & Actual Bar */}
            {isLoading ? (
                /* 💀 PAGINATION SKELETON LOADING STATE */
                <div className="pt-4 border-t-4 border-olive-300 flex flex-col md:flex-row justify-between items-center gap-4 bg-olive-50 shrink-0 animate-pulse">
                    <div className="h-4 bg-olive-200 rounded-xs w-48" />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-olive-200 border border-olive-300 rounded-xs" />
                        <div className="flex gap-1">
                            <div className="w-8 h-8 bg-olive-200 border border-olive-300 rounded-xs" />
                            <div className="w-8 h-8 bg-olive-200 border border-olive-300 rounded-xs" />
                        </div>
                        <div className="w-8 h-8 bg-olive-200 border border-olive-300 rounded-xs" />
                    </div>
                </div>
            ) : !fetchError && templates.length > 0 ? (
                <div className="pt-4 border-t-4 border-olive-900 flex flex-col md:flex-row justify-between items-center gap-4 bg-olive-50 shrink-0">
                    <span className="text-xs font-bold text-olive-800">
                        Menampilkan{" "}
                        <span className="text-olive-900 font-extrabold">
                            {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{" "}
                        -{" "}
                        <span className="text-olive-900 font-extrabold">
                            {Math.min(
                                currentPage * ITEMS_PER_PAGE,
                                templates.length,
                            )}
                        </span>{" "}
                        dari{" "}
                        <span className="text-olive-900 font-extrabold">
                            {templates.length}
                        </span>{" "}
                        Template
                    </span>

                    <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="p-2 bg-white border-2 border-olive-900 text-olive-900 font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-olive-200 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-xs cursor-pointer"
                            title="Halaman Sebelumnya"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from(
                                { length: totalPages },
                                (_, idx) => idx + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 text-xs font-black border-2 border-olive-900 transition-all rounded-xs cursor-pointer ${
                                        currentPage === page
                                            ? "bg-olive-900 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                            : "bg-white text-olive-900 hover:bg-olive-200 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        {/* Next Button */}
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages),
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white border-2 border-olive-900 text-olive-900 font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-olive-200 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-xs cursor-pointer"
                            title="Halaman Selanjutnya"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            ) : null}

            {/* Modal Tambah Template */}
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
                                            "condition",
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
                                    disabled={isSubmitting || isGenerating}
                                    className="flex items-center gap-2 px-4 py-2 rounded-sm bg-green-500 text-green-50 text-xs font-bold border-2 border-olive-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-green-700 active:translate-y-0 active:shadow-none -translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Simpan Template"
                                    )}
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
