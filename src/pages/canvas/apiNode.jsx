import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Settings2, Database, Zap, LogIn } from 'lucide-react'; // Pastikan lucide-react terinstall

export default function ApiNode({ data }) {
    // Menentukan style dan icon berdasarkan tipe yang dikirim via data
    const getTheme = () => {
        switch (data.category) {
            case 'trigger':
                return { bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-white', icon: <LogIn size={14} className="text-blue-400" /> };
            case 'process':
                return { bg: 'bg-white', border: 'border-slate-300', text: 'text-slate-800', icon: <Settings2 size={14} className="text-slate-500" /> };
            case 'database':
                return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: <Database size={14} className="text-blue-600" /> };
            case 'output':
                return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900', icon: <Zap size={14} className="text-green-600" /> };
            default:
                return { bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-800', icon: null };
        }
    };

    const theme = getTheme();

    return (
        <div className={`flex flex-col min-w-45 shadow-md border ${theme.bg} ${theme.border}`}>
            {/* Handle Target (Input koneksi dari atas) */}
            {data.category !== 'trigger' && (
                <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400 border-2 border-white" />
            )}

            {/* Header Node */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-black/10">
                {theme.icon}
                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.text} opacity-80`}>
                    {data.category || 'Node'}
                </span>
            </div>

            {/* Body Node */}
            <div className="px-3 py-3">
                <div className={`text-xs font-semibold ${theme.text}`}>
                    {data.label}
                </div>
                {data.method && (
                    <span className="inline-block px-1.5 py-0.5 bg-black/5 rounded text-[10px] font-mono text-slate-500">
                        {data.method}
                    </span>
                )}
            </div>

            {/* Handle Source (Output koneksi ke bawah) */}
            {data.category !== 'output' && (
                <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
            )}
        </div>
    );
}