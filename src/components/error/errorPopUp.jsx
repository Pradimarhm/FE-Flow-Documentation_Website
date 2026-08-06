// src/components/error/errorPopUp.jsx
import React, { useState } from "react";
import {
    AlertTriangle,
    CheckCircle,
    HelpCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";

export default function ErrorPopup({
    isOpen,
    onClose,
    title,
    message,
    type = "error", // 'error' | 'success' | 'warning' | 'confirm'
    errors = null,
    onConfirm = null,
    confirmLabel = "Ya, Lanjutkan",
    cancelLabel = "Batal",
    loadingLabel = "Memproses...", // 👈 Dibuat fleksibel (bisa "Menyimpan...", "Menghapus...", dll)
}) {
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirmAction = async () => {
        if (!onConfirm) {
            onClose();
            return;
        }

        try {
            setIsConfirmLoading(true);
            await onConfirm(); // Menunggu proses API selesai
            onClose(); // 🚀 FIX KRUSIAL: Otomatis tutup popup setelah proses sukses!
        } catch (err) {
            console.error("Error pada konfirmasi aksi:", err);
        } finally {
            setIsConfirmLoading(false);
        }
    };

    const config =
        {
            error: {
                bg: "bg-rose-100",
                border: "border-rose-900",
                btn: "bg-rose-600 text-white hover:bg-rose-700",
                icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
            },
            success: {
                bg: "bg-green-100",
                border: "border-green-900",
                btn: "bg-green-600 text-white hover:bg-green-700",
                icon: <CheckCircle className="w-6 h-6 text-green-600" />,
            },
            warning: {
                bg: "bg-amber-100",
                border: "border-amber-900",
                btn: "bg-amber-500 text-black hover:bg-amber-600",
                icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
            },
            confirm: {
                bg: "bg-amber-100",
                border: "border-amber-900",
                btn: "bg-green-600 text-white hover:bg-green-700", // 👈 Warna hijau biar lebih ramah konfirmasi
                icon: <HelpCircle className="w-6 h-6 text-amber-600" />,
            },
        }[type] || config.error;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-md border-4 border-black p-6 w-full max-w-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col gap-4 relative">
                {/* Header */}
                <div className="flex items-center gap-3 border-b-2 border-black pb-3">
                    <div
                        className={`p-2 rounded-sm border-2 border-black ${config.bg}`}
                    >
                        {config.icon}
                    </div>
                    <h3 className="text-lg font-black uppercase text-black">
                        {title || "Pemberitahuan"}
                    </h3>
                </div>

                {/* Message & List Errors */}
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                        {message}
                    </p>

                    {errors && typeof errors === "object" && (
                        <div className="bg-rose-50 border-2 border-rose-400 p-2.5 rounded-sm max-h-32 overflow-y-auto">
                            <ul className="list-disc list-inside text-[11px] font-semibold text-rose-700 space-y-1">
                                {Object.entries(errors).map(
                                    ([field, errList]) => (
                                        <li key={field}>
                                            <span className="capitalize font-bold">
                                                {field}:
                                            </span>{" "}
                                            {Array.isArray(errList)
                                                ? errList.join(", ")
                                                : String(errList)}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-2 mt-2">
                    {type === "confirm" ? (
                        <>
                            <button
                                type="button"
                                disabled={isConfirmLoading}
                                onClick={onClose}
                                className="px-4 py-2 rounded-sm border-2 border-black bg-white text-xs font-bold hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                disabled={isConfirmLoading}
                                onClick={handleConfirmAction}
                                className={`px-4 py-2 rounded-sm border-2 border-black text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-2 cursor-pointer disabled:opacity-50 ${config.btn}`}
                            >
                                {isConfirmLoading ? (
                                    <>
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                        {loadingLabel}
                                    </>
                                ) : (
                                    confirmLabel
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-sm border-2 border-black text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none cursor-pointer ${config.btn}`}
                        >
                            Tutup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
