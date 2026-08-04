import React from 'react';
import { AlertTriangle, CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export default function ErrorPopup({ 
    isOpen, 
    onClose, 
    type = "error", // 'error' | 'success' | 'warning' | 'info'
    title, 
    message, 
    errors 
}) {
    if (!isOpen) return null;

    // 🎨 Configuration berdasarkan Tipe Notifikasi
    const config = {
        error: {
            headerBg: 'bg-red-500',
            badgeBg: 'bg-red-100',
            badgeText: 'text-red-900',
            defaultTitle: 'Gagal / Validasi Error',
            icon: AlertTriangle,
        },
        success: {
            headerBg: 'bg-emerald-500', // Hijau Neo-Brutalist
            badgeBg: 'bg-emerald-200',
            badgeText: 'text-emerald-950',
            defaultTitle: 'Berhasil!',
            icon: CheckCircle2,
        },
        warning: {
            headerBg: 'bg-amber-400',
            badgeBg: 'bg-amber-100',
            badgeText: 'text-amber-950',
            defaultTitle: 'Peringatan',
            icon: AlertCircle,
        },
        info: {
            headerBg: 'bg-sky-400',
            badgeBg: 'bg-sky-100',
            badgeText: 'text-sky-950',
            defaultTitle: 'Informasi',
            icon: Info,
        }
    };

    const currentTheme = config[type] || config.error;
    const IconComponent = currentTheme.icon;
    const displayTitle = title || currentTheme.defaultTitle;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white border-4 border-black rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden flex flex-col">
                
                {/* Header Popup - Warna Dinamis Berdasarkan Type */}
                <div className={`${currentTheme.headerBg} border-b-4 border-black p-4 flex items-center justify-between text-black`}>
                    <div className="flex items-center gap-2">
                        <IconComponent size={24} className="stroke-[2.5]" />
                        <h3 className="font-black text-lg uppercase tracking-wider">{displayTitle}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="bg-white text-black p-1 rounded-xs border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
                    >
                        <X size={18} className="stroke-3" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col gap-4 bg-amber-50/50">
                    {message && (
                        <p className={`font-bold text-sm ${currentTheme.badgeText} ${currentTheme.badgeBg} rounded-sm border-2 border-black p-3 shadow-[3px_3px_0px_rgba(0,0,0,1)]`}>
                            {message}
                        </p>
                    )}

                    {/* Menampilkan Detail Error Validasi (Laravel) Jika Ada */}
                    {errors && Object.keys(errors).length > 0 && (
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                            <span className="text-xs font-black uppercase text-gray-700">Detail Pesan:</span>
                            {Object.entries(errors).map(([field, messages], idx) => (
                                <div key={idx} className="bg-red-100 border-2 border-black p-2 text-xs font-semibold text-red-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    <span className="font-black capitalize">{field}:</span> {Array.isArray(messages) ? messages.join(', ') : messages}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Action Button */}
                <div className="p-4 bg-white border-t-4 border-black flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-black text-white px-5 py-2 font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_rgba(200,200,200,1)] hover:bg-neutral-800 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>
    );
}