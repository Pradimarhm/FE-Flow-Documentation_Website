import React, { useState, useEffect, useMemo } from "react";
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
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    FolderPlus,
    RefreshCw,
} from "lucide-react";
import { flowService } from "@/services/flowService";
import { aiService } from "@/services/aiService";
import ErrorPopup from "../components/error/errorPopUp";

const ITEMS_PER_PAGE = 6; // Jumlah card per halaman

export default function FlowListPage() {
    const navigate = useNavigate();
    const [flows, setFlows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // State Pagination

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
            setCurrentPage(1); // Reset ke halaman 1 setiap kali query pencarian berubah
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

    // Kalkulasi Pagination
    const totalPages = useMemo(() => {
        return Math.ceil(flows.length / ITEMS_PER_PAGE) || 1;
    }, [flows]);

    const paginatedFlows = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return flows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [flows, currentPage]);

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
        <div className="w-full h-full bg-olive-50 flex flex-col p-8 overflow-hidden relative">
            {/* Header Sticky / Tetap Di Atas */}
            <div className="flex justify-between items-end mb-6 border-b-4 border-olive-900 pb-4 shrink-0">
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

            {/* Content Area dengan Scrollable Container */}
            <div className="flex-1 overflow-y-auto pr-2 py-4 flex flex-col">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: ITEMS_PER_PAGE }).map(
                            (_, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white border-4 rounded-md border-olive-300 p-5 flex flex-col gap-4 shadow-[6px_6px_0px_rgba(0,0,0,0.1)] animate-pulse"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 bg-olive-200 border-2 border-olive-300 rounded-xs" />
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-5 bg-olive-200 border border-olive-300 rounded-xs" />
                                            <div className="w-7 h-7 bg-olive-100 border-2 border-olive-300 rounded-xs" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="h-5 bg-olive-200 rounded-xs w-3/4" />
                                        <div className="h-3 bg-olive-100 rounded-xs w-full" />
                                        <div className="h-3 bg-olive-100 rounded-xs w-1/2" />
                                    </div>

                                    <div className="mt-2 pt-4 border-t-2 border-dashed border-olive-300 flex justify-between items-center">
                                        <div className="h-4 bg-olive-200 rounded-xs w-1/3" />
                                        <div className="w-4 h-4 bg-olive-200 rounded-xs" />
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                ) : fetchError ? (
                    <div className="m-auto flex flex-col items-center justify-center p-8 rounded-md max-w-md text-center gap-3">
                        <div className="p-3 bg-rose-200 border-2 border-olive-900 rounded-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                            <AlertTriangle
                                size={42}
                                className="text-rose-700"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">
                                Terjadi Kesalahan
                            </h3>
                            <p className="text-xs font-semibold text-rose-800 mt-1">
                                {fetchError}
                            </p>
                        </div>
                        <button
                            onClick={() => fetchFlows(searchQuery)}
                            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-sm bg-white border-2 border-olive-900 text-olive-900 font-bold text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-olive-100 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
                        >
                            <RefreshCw size={14} /> Coba Lagi
                        </button>
                    </div>
                ) : flows.length === 0 ? (
                    <div className="m-auto flex flex-col items-center justify-center p-8 rounded-md max-w-md text-center gap-3">
                        <div className="p-3 bg-olive-200 border-2 border-olive-900 rounded-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                            <FolderPlus size={32} className="text-olive-900" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-olive-900 uppercase tracking-tight">
                                Belum Ada Flow Project
                            </h3>
                            <p className="text-xs font-semibold text-olive-600 mt-1">
                                Mulai buat arsitektur sistem baru dengan menekan
                                tombol dibawah ini.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedFlows.map((flow) => {
                            const targetId = flow.id || flow.uuid;
                            return (
                                <div
                                    key={targetId}
                                    className="bg-white border-4 rounded-md border-olive-900 p-5 flex flex-col gap-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all cursor-pointer relative group"
                                    onClick={() =>
                                        navigate(`/flows/${targetId}`)
                                    }
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
            </div>

            {/* Pagination Controls / Page Break Bar (Di Bawah Layout) */}
            {isLoading ? (
                /*  PAGINATION SKELETON LOADING STATE */
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
            ) : !fetchError && flows.length > 0 ? (
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
                                flows.length,
                            )}
                        </span>{" "}
                        dari{" "}
                        <span className="text-olive-900 font-extrabold">
                            {flows.length}
                        </span>{" "}
                        Flow
                    </span>

                    <div className="flex items-center gap-2">
                        {/* Tombol Previous */}
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

                        {/* Angka Halaman */}
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

                        {/* Tombol Next */}
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
