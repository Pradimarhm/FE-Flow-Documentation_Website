import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Clock, ArrowRight } from 'lucide-react';

export default function FlowListPage() {
    const navigate = useNavigate();

    // Data dummy. Index 0 adalah target utama
    const flows = [
        { id: 1, title: 'Auth API Documentation', version: 'v2.0', nodes: 25, updated: 'Just now' },
        { id: 2, title: 'Payment Gateway Sequence', version: 'v1.1', nodes: 12, updated: '2 days ago' },
        { id: 3, title: 'User Onboarding Logic', version: 'v1.0', nodes: 8, updated: '1 week ago' },
        { id: 4, title: 'User Onboarding Logic', version: 'v1.0', nodes: 8, updated: '1 week ago' },
        { id: 5, title: 'User Onboarding Logic', version: 'v1.0', nodes: 8, updated: '1 week ago' },
    ];

    const handleOpenFlow = (index) => {
        if (index === 0) {
            navigate('/flow/canvas'); // Sesuaikan rute ini dengan konfigurasi router Anda
        } else {
            alert('Dummy flow. Click the first one to test canvas.');
        }
    };

    return (
        <div className="w-full min-h-screen bg-olive-50 flex flex-col p-8 font-sans">
            {/* Header */}
            <div className="flex justify-between items-end mb-10 border-b-4 border-olive-900 pb-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-olive-900 tracking-tight">Flow Projects</h1>
                    <p className="text-olive-600 font-medium mt-1">Manage and document your system architecture.</p>
                </div>
                <a href='/flow/canvas' className="flex items-center gap-2 px-4 py-2 rounded-xs bg-olive-500 text-olive-50 font-bold border-2 border-olive-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-olive-700 active:translate-y-1 active:shadow-none transition-all">
                    <Plus size={18} /> New Flow
                </a>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flows.map((flow, index) => (
                    <div 
                        key={flow.id} 
                        className="bg-white rounded-sm border-4 border-olive-900 p-5 flex flex-col gap-4 shadow-[6px_6px_0px_rgba(54,69,79,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(54,69,79,1)] transition-all cursor-pointer"
                        onClick={() => handleOpenFlow(index)}
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
        </div>
    );
}