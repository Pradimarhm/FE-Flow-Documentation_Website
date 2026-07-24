import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Clock, ArrowRight, X } from 'lucide-react';
import { flowService } from '@/services/flowService';

export default function FlowListPage() {
    const navigate = useNavigate();

    // State untuk Modal New Flow
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [flowName, setFlowName] = useState('');
    const [flowDescription, setFlowDescription] = useState('');
    const [version, setVersion] = useState("v1.0");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data dummy list flow (bisa diganti dengan data dari API GET /flows)
    const [flows, setFlows] = useState([
        { id: 1, title: 'Auth API Documentation', version: 'v2.0', nodes: 25, updated: 'Just now' },
        { id: 2, title: 'Payment Gateway Sequence', version: 'v1.1', nodes: 12, updated: '2 days ago' },
        { id: 3, title: 'User Onboarding Logic', version: 'v1.0', nodes: 8, updated: '1 week ago' },
    ]);

    // Buka flow yang sudah ada berdasarkan ID
    const handleOpenFlow = (flowId) => {
        navigate(`/flow/${flowId}`);
    };

    // Eksekusi Pembuatan Flow Baru
    const handleCreateNewFlow = async (e) => {
        e.preventDefault();
        if (!flowName.trim()) return;

        try {
            setIsSubmitting(true);
            
            // 1. Kirim Payload ke API Backend
            const response = await flowService.createFlow({
                name: flowName,
                description: flowDescription,
                version: version,
                status: 'draft'
            });

            // 2. Extract Data Response (Mendukung wrapper response response.data.data / response.data)
            const createdFlow = response?.data?.id || response?.data || response;
            
            console.log("Raw Response dari Service:", response);
            console.log("Type of Response:", typeof response);
            
            // 3. Validasi ID & Redireksi ke Canvas
            if (createdFlow?.id) {
                // Reset form state & tutup modal
                setIsModalOpen(false);
                setFlowName('');
                setFlowDescription('');
                setVersion("v1.0");

                // Direct Navigasi ke Halaman Canvas
                navigate(`/flow/${createdFlow.id}`);
            } else {
                console.error("ID Flow tidak ditemukan pada response backend:", createdFlow);
                alert("Gagal mengarahkan: Backend tidak mengembalikan field 'id'.");
            }
        } catch (error) {
            console.error("Gagal membuat flow baru:", error);
            alert("Terjadi kesalahan saat membuat flow baru. Cek log server atau koneksi jaringan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-olive-50 flex flex-col p-8 font-sans relative">
            {/* Header */}
            <div className="flex justify-between items-end mb-10 border-b-4 border-olive-900 pb-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-olive-900 tracking-tight">Flow Projects</h1>
                    <p className="text-olive-600 font-medium mt-1">Manage and document your system architecture.</p>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xs bg-olive-500 text-olive-50 font-bold border-2 border-olive-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-olive-700 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                    <Plus size={18} /> New Flow
                </button>
            </div>

            {/* Grid List Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flows.map((flow) => (
                    <div 
                        key={flow.id} 
                        className="bg-white rounded-sm border-4 border-olive-900 p-5 flex flex-col gap-4 shadow-[6px_6px_0px_rgba(54,69,79,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(54,69,79,1)] transition-all cursor-pointer"
                        onClick={() => handleOpenFlow(flow.id)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-olive-200 border-2 border-olive-900">
                                <FolderKanban size={24} className="text-olive-900" />
                            </div>
                            <span className="text-[10px] font-black uppercase bg-olive-900 text-white px-2 py-1">
                                {flow.version}
                            </span>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-bold text-olive-900">{flow.title}</h3>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs font-semibold text-olive-600 border border-olive-400 px-2 py-0.5">
                                    {flow.nodes} Nodes
                                </span>
                                <span className="flex items-center gap-1 text-xs font-semibold text-olive-600">
                                    <Clock size={12} /> {flow.updated}
                                </span>
                            </div>
                        </div>

                        <div className="mt-2 pt-4 border-t-2 border-dashed border-olive-300 flex justify-between items-center text-sm font-bold text-olive-900 group">
                            Open Workspace 
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL CREATE NEW FLOW */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-olive-50 border-4 border-olive-900 p-6 w-full max-w-md shadow-[10px_10px_0px_rgba(0,0,0,1)] relative">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-1 border-2 border-olive-900 hover:bg-olive-200"
                            type="button"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="text-xl font-extrabold text-olive-900 uppercase mb-4">
                            Buat Flow Baru
                        </h2>

                        <form onSubmit={handleCreateNewFlow} className="flex flex-col gap-4">
                            {/* Input Grid: Name & Version */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="text-xs font-bold text-olive-900 uppercase">
                                        Nama Flow *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Checkout Payment"
                                        value={flowName}
                                        onChange={(e) => setFlowName(e.target.value)}
                                        className="p-2 border-2 border-olive-900 bg-white text-sm font-semibold outline-none focus:bg-amber-50"
                                    />
                                </div>

                                <div className="col-span-1 flex flex-col gap-1">
                                    <label className="text-xs font-bold text-olive-900 uppercase">
                                        Version *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="v1.0"
                                        value={version}
                                        onChange={(e) => setVersion(e.target.value)}
                                        className="p-2 border-2 border-olive-900 bg-white text-sm font-semibold outline-none focus:bg-amber-50"
                                    />
                                </div>
                            </div>

                            {/* Input Description */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-olive-900 uppercase">
                                    Deskripsi
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Penjelasan singkat tujuan flow..."
                                    value={flowDescription}
                                    onChange={(e) => setFlowDescription(e.target.value)}
                                    className="p-2 border-2 border-olive-900 bg-white text-xs font-medium outline-none focus:bg-amber-50"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border-2 border-olive-900 bg-white text-xs font-bold hover:bg-olive-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border-2 border-olive-900 bg-green-500 text-white text-xs font-bold hover:bg-green-600 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                                >
                                    {isSubmitting ? "Membuat..." : "Buat & Buka Canvas"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}