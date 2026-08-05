import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FolderKanban,
    Plus,
    ArrowRight,
    Loader2,
    Trash2,
    Sparkles,
    Search,
    X,
} from "lucide-react";
import { flowService } from "@/services/flowService";
import { aiService } from "@/services/aiService";
import ErrorPopup from "../components/error/errorPopUp";

export default function FlowListPage() {
    const navigate = useNavigate();
    const [flows, setFlows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [flowName, setFlowName] = useState("");
    const [flowDescription, setFlowDescription] = useState("");
    const [version, setVersion] = useState("v1.0");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [actionPopup, setActionPopup] = useState({
        isOpen: false,
        title: "",
        type: "error",
        message: "",
        errors: null,
        onConfirm: null,
    });

    const fetchFlows = async (query = "") => {
        try {
            setIsLoading(true);
            setFetchError(null);
            const res = await flowService.getFlows(query);
            const flowData = res?.data?.data || res?.data || res || [];
            setFlows(Array.isArray(flowData) ? flowData : []);
        } catch (err) {
            console.error("Gagal mengambil daftar flow:", err);
            setFetchError(
                err?.message || "Gagal memuat daftar flow dari server.",
            );
            setFlows([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFlows(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAIGenerate = async () => {
        if (!flowName.trim()) {
            setActionPopup({
                isOpen: true,
                title: "Input Kurang Lengkap",
                type: "warning",
                message: "Isi Nama Flow terlebih dahulu!",
                onConfirm: null,
            });
            return;
        }

        setIsGenerating(true);
        try {
            const res = await aiService.generateFlowDetails({ flowName });
            if (res.description) {
                setFlowDescription(res.description);
            }
        } catch (error) {
            setActionPopup({
                isOpen: true,
                title: "Gagal Generate AI",
                type: "error",
                message: error.message || "Gagal generate deskripsi via AI.",
                onConfirm: null,
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreateNewFlow = async (e) => {
        e.preventDefault();
        if (!flowName.trim()) return;

        try {
            setIsSubmitting(true);
            const res = await flowService.createFlow({
                name: flowName,
                description: flowDescription,
                version: version,
                status: "draft",
            });

            const createdFlow = res?.data?.data || res?.data || res;
            const flowId = createdFlow?.id || createdFlow?.uuid;

            if (flowId) {
                setIsModalOpen(false);
                setFlowName("");
                setFlowDescription("");
                navigate(`/flows/${flowId}`);
            } else {
                setActionPopup({
                    isOpen: true,
                    title: "Gagal Membuat Flow",
                    type: "error",
                    message: "Gagal mendapatkan ID Flow dari server.",
                    onConfirm: null,
                });
            }
        } catch (error) {
            setActionPopup({
                isOpen: true,
                title: "Gagal Membuat Flow",
                type: "error",
                message:
                    error?.message || "Terjadi kesalahan saat membuat flow.",
                onConfirm: null,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const promptDeleteFlow = (flow) => {
        const targetId = flow.id || flow.uuid;
        setActionPopup({
            isOpen: true,
            title: "Hapus Flow Project?",
            type: "confirm",
            message: `Apakah kamu yakin ingin menghapus flow "${flow.name}"? Tindakan ini tidak dapat dibatalkan.`,
            onConfirm: async () => {
                try {
                    await flowService.deleteFlow(targetId);
                    setFlows((prev) =>
                        prev.filter((f) => (f.id || f.uuid) !== targetId),
                    );
                    setActionPopup({
                        isOpen: true,
                        title: "Berhasil Menghapus",
                        type: "success",
                        message: `Flow project "${flow.name}" berhasil dihapus.`,
                        onConfirm: null,
                    });
                } catch (error) {
                    setActionPopup({
                        isOpen: true,
                        title: "Gagal Menghapus",
                        type: "error",
                        message:
                            error?.message ||
                            "Terjadi kesalahan saat menghapus flow.",
                        onConfirm: null,
                    });
                }
            },
        });
    };

    return (
        <div className="w-full min-h-screen bg-olive-50 flex flex-col p-8 relative">
            <div className="flex justify-between items-end mb-10 border-b-4 border-olive-900 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-olive-900 tracking-tight">
                        Flow Projects
                    </h1>
                    <p className="text-olive-600 font-medium mt-1">
                        Kelola dan susun arsitektur sistem kamu.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-700 pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Cari flow berdasarkan nama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2.5 bg-white border-2 border-olive-900 text-sm font-semibold text-olive-900 placeholder:text-olive-400 outline-none shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all rounded-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-olive-600 hover:text-olive-900 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-sm bg-green-500 text-white font-bold border-2 border-olive-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-green-700 active:translate-y-1 active:shadow-none transition-all cursor-pointer whitespace-nowrap"
                    >
                        <Plus size={18} /> New Flow
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-olive-900 font-bold">
                    <Loader2 size={20} className="animate-spin" /> Memuat daftar
                    flow...
                </div>
            ) : fetchError ? (
                <div className="bg-red-100 border-2 border-olive-900 p-4 font-bold text-red-900 rounded-sm">
                    ⚠️ {fetchError}
                </div>
            ) : flows.length === 0 ? (
                <div className="bg-white border-4 rounded-sm border-olive-900 p-8 text-center font-bold text-olive-800 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                    Belum ada Flow Project. Klik tombol "New Flow" di atas untuk
                    membuat project baru!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flows.map((flow) => {
                        const targetId = flow.id || flow.uuid;
                        return (
                            <div
                                key={targetId}
                                className="bg-white border-4 rounded-md border-olive-900 p-5 flex flex-col gap-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all cursor-pointer relative group"
                                onClick={() => navigate(`/flows/${targetId}`)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-olive-200 border-2 border-olive-900">
                                        <FolderKanban
                                            size={24}
                                            className="text-olive-900"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase bg-olive-900 text-white px-2 py-1">
                                            {flow.version || "v1.0"}
                                        </span>
                                        <button
                                            type="button"
                                            title="Hapus Flow"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                promptDeleteFlow(flow);
                                            }}
                                            className="p-1.5 bg-rose-100 hover:bg-rose-500 hover:text-white text-rose-700 border-2 border-olive-900 transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-olive-900">
                                        {flow.name}
                                    </h3>
                                    <p className="text-xs text-olive-600 line-clamp-2 mt-1">
                                        {flow.description ||
                                            "Tidak ada deskripsi"}
                                    </p>
                                </div>

                                <div className="mt-2 pt-4 border-t-2 border-dashed border-olive-300 flex justify-between items-center text-sm font-bold text-olive-900">
                                    Buka Canvas
                                    <ArrowRight
                                        size={16}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Create Flow */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-olive-50 rounded-md border-4 border-olive-900 p-6 w-full max-w-md shadow-[10px_10px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-xl font-black text-olive-900 uppercase mb-4">
                            Buat Flow Baru
                        </h2>
                        <form
                            onSubmit={handleCreateNewFlow}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-olive-900 uppercase">
                                    Nama Flow *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Approval Cuti Karyawan"
                                    value={flowName}
                                    onChange={(e) =>
                                        setFlowName(e.target.value)
                                    }
                                    className="p-2 rounded-sm border-2 border-olive-900 bg-white text-sm font-semibold outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-olive-900 uppercase">
                                    Version *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    className="p-2 rounded-sm border-2 border-olive-900 bg-white text-sm font-semibold outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-olive-900 uppercase">
                                        Deskripsi
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAIGenerate}
                                        disabled={
                                            isGenerating || !flowName.trim()
                                        }
                                        className="flex items-center gap-1 text-[11px] font-black text-black bg-amber-300 px-2 py-0.5 rounded-sm border-2 border-olive-900 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:bg-amber-400 active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2
                                                    size={12}
                                                    className="animate-spin"
                                                />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={12} />
                                                Auto-fill via AI
                                            </>
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    rows={3}
                                    placeholder="Ketik deskripsi atau klik Auto-fill via AI..."
                                    value={flowDescription}
                                    onChange={(e) =>
                                        setFlowDescription(e.target.value)
                                    }
                                    className="p-2 rounded-sm border-2 border-olive-900 bg-white text-xs outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-sm border-2 border-olive-900 bg-white text-xs font-bold hover:bg-olive-200 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-sm border-2 border-olive-900 bg-green-500 text-white text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5 hover:bg-green-700 active:translate-y-0 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Membuat..."
                                        : "Simpan & Buka Canvas"}
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
