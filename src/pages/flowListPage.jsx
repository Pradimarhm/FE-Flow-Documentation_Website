import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, ArrowRight, Loader2, Trash2 } from "lucide-react";
import { flowService } from "@/services/flowService";

export default function FlowListPage() {
    const navigate = useNavigate();
    const [flows, setFlows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal Create Flow State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [flowName, setFlowName] = useState("");
    const [flowDescription, setFlowDescription] = useState("");
    const [version, setVersion] = useState("v1.0");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal Delete Flow State
    const [deletingFlow, setDeletingFlow] = useState(null); // Menyimpan objek flow yang akan dihapus
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchFlows = async () => {
        try {
            setIsLoading(true);
            const res = await flowService.getFlows();
            const flowData = res?.data?.data || res?.data || res || [];
            setFlows(Array.isArray(flowData) ? flowData : []);
        } catch (err) {
            console.error("Gagal mengambil daftar flow:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFlows();
    }, []);

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
                alert("Gagal mendapatkan ID Flow dari server.");
            }
        } catch (error) {
            console.error("Gagal membuat flow:", error);
            alert("Terjadi kesalahan saat membuat flow.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler untuk mengeksekusi penghapusan Flow via API
    const handleDeleteFlow = async () => {
        if (!deletingFlow) return;
        const targetId = deletingFlow.id || deletingFlow.uuid;

        try {
            setIsDeleting(true);
            await flowService.deleteFlow(targetId);

            // Filter state lokal agar UI langsung ter-update tanpa perlu reload
            setFlows((prev) =>
                prev.filter((f) => (f.id || f.uuid) !== targetId),
            );
            setDeletingFlow(null);
        } catch (error) {
            console.error(`Gagal menghapus flow #${targetId}:`, error);
            alert("Terjadi kesalahan saat menghapus flow.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-olive-100 flex flex-col p-8 relative">
            <div className="flex justify-between items-end mb-10 border-b-4 border-olive-900 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-olive-900 tracking-tight">
                        Flow Projects
                    </h1>
                    <p className="text-olive-600 font-medium mt-1">
                        Kelola dan susun arsitektur sistem kamu.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold border-2 border-olive-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-green-700 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                    <Plus size={18} /> New Flow
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-olive-900 font-bold">
                    <Loader2 size={20} className="animate-spin" /> Memuat daftar
                    flow...
                </div>
            ) : flows.length === 0 ? (
                <div className="bg-white border-4 border-olive-900 p-8 text-center font-bold text-olive-800 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
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
                                className="bg-white border-4 border-olive-900 p-5 flex flex-col gap-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all cursor-pointer relative group"
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
                                        {/* Tombol Hapus Flow */}
                                        <button
                                            type="button"
                                            title="Hapus Flow"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Mencegah pemicu event navigate
                                                setDeletingFlow(flow);
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
                    <div className="bg-olive-50 border-4 border-olive-900 p-6 w-full max-w-md shadow-[10px_10px_0px_rgba(0,0,0,1)]">
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
                                    value={flowName}
                                    onChange={(e) =>
                                        setFlowName(e.target.value)
                                    }
                                    className="p-2 border-2 border-olive-900 bg-white text-sm font-semibold outline-none"
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
                                    className="p-2 border-2 border-olive-900 bg-white text-sm font-semibold outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-olive-900 uppercase">
                                    Deskripsi
                                </label>
                                <textarea
                                    rows={3}
                                    value={flowDescription}
                                    onChange={(e) =>
                                        setFlowDescription(e.target.value)
                                    }
                                    className="p-2 border-2 border-olive-900 bg-white text-xs outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border-2 border-olive-900 bg-white text-xs font-bold hover:bg-olive-200 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border-2 border-olive-900 bg-green-500 text-white text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5 hover:bg-green-700 active:translate-y-0 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
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

            {/* Pop-up Modal Konfirmasi Hapus */}
            {deletingFlow && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white border-4 border-olive-900 p-6 w-full max-w-sm shadow-[10px_10px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b-2 border-olive-900 pb-3">
                            <div className="p-2 bg-rose-100 border-2 border-olive-900 text-rose-600">
                                <Trash2 size={20} />
                            </div>
                            <h3 className="text-lg font-black text-olive-900 uppercase">
                                Hapus Flow?
                            </h3>
                        </div>

                        <p className="text-xs font-semibold text-olive-800 leading-relaxed">
                            Apakah kamu yakin ingin menghapus flow{" "}
                            <span className="font-black underline text-black">
                                "{deletingFlow.name}"
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan dan seluruh
                            node/koneksi di dalamnya akan terhapus.
                        </p>

                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeletingFlow(null)}
                                className="px-4 py-2 border-2 border-olive-900 bg-white text-xs font-bold hover:bg-olive-200 cursor-pointer disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDeleteFlow}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-olive-900 bg-rose-600 text-white text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5 hover:bg-rose-700 active:translate-y-0 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />{" "}
                                        Menghapus...
                                    </>
                                ) : (
                                    "Ya, Hapus Flow"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
