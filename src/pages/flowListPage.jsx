import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { flowService } from '@/services/flowService';

export default function FlowListPage() {
    const navigate = useNavigate();
    const [flows, setFlows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [flowName, setFlowName] = useState('');
    const [flowDescription, setFlowDescription] = useState('');
    const [version, setVersion] = useState("v1.0");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFlows = async () => {
        try {
            setIsLoading(true);
            const res = await flowService.getFlows();
            setFlows(res?.data || res || []);
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
                status: 'draft'
            });

            const createdFlow = res?.data || res;
            if (createdFlow?.id) {
                setIsModalOpen(false);
                navigate(`/flow/${createdFlow.id}`);
            }
        } catch (error) {
            console.error("Gagal membuat flow:", error);
            alert("Terjadi kesalahan saat membuat flow.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-olive-100 flex flex-col p-8 relative">
            <div className="flex justify-between items-end mb-10 border-b-4 border-olive-900 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-olive-900 tracking-tight">Flow Projects</h1>
                    <p className="text-olive-600 font-medium mt-1">Kelola dan susun arsitektur sistem kamu.</p>
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
                    <Loader2 size={20} className="animate-spin" /> Memuat daftar flow...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flows.map((flow) => (
                        <div 
                            key={flow.id} 
                            className="bg-white border-4 border-olive-900 p-5 flex flex-col gap-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                            onClick={() => navigate(`/flows/${flow.id}`)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-olive-200 border-2 border-olive-900">
                                    <FolderKanban size={24} className="text-olive-900" />
                                </div>
                                <span className="text-[10px] font-black uppercase bg-olive-900 text-white px-2 py-1">
                                    {flow.version || 'v1.0'}
                                </span>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold text-olive-900">{flow.name}</h3>
                                <p className="text-xs text-olive-600 line-clamp-2 mt-1">{flow.description || "Tidak ada deskripsi"}</p>
                            </div>

                            <div className="mt-2 pt-4 border-t-2 border-dashed border-olive-300 flex justify-between items-center text-sm font-bold text-olive-900 group">
                                Buka Canvas 
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Input Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-olive-50 border-4 border-olive-900 p-6 w-full max-w-md shadow-[10px_10px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-xl font-black text-olive-900 uppercase mb-4">Buat Flow Baru</h2>
                        <form onSubmit={handleCreateNewFlow} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-olive-900 uppercase">Nama Flow *</label>
                                <input
                                    type="text" required value={flowName}
                                    onChange={(e) => setFlowName(e.target.value)}
                                    className="p-2 border-2 border-olive-900 bg-white text-sm font-semibold outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-olive-900 uppercase">Version *</label>
                                <input
                                    type="text" required value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    className="p-2 border-2 border-olive-900 bg-white text-sm font-semibold outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-olive-900 uppercase">Deskripsi</label>
                                <textarea
                                    rows={3} value={flowDescription}
                                    onChange={(e) => setFlowDescription(e.target.value)}
                                    className="p-2 border-2 border-olive-900 bg-white text-xs outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border-2 border-olive-900 bg-white text-xs font-bold hover:bg-olive-200 cursor-pointer">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 border-2 border-olive-900 bg-green-500 text-white text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-0.5 hover:bg-green-700 active:translate-y-0 active:shadow-none transition-all cursor-pointer">
                                    {isSubmitting ? "Membuat..." : "Simpan & Buka Canvas"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}