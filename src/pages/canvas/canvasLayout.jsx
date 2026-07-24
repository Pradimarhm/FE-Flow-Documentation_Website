import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import { Rocket, PanelBottomOpen, PanelTopOpen, ArrowLeft, Loader2 } from "lucide-react";

import FlowCanvas from "./flowCanvas";
import RightSidebar from "./rightSidebar";
import { flowService } from "@/services/flowService";

export default function CanvasLayout() {
    const { flowId } = useParams();

    const [flowDetail, setFlowDetail] = useState(null);
    const [isFlowLoading, setIsFlowLoading] = useState(true);
    const [isBottomOpen, setIsBottomOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        const fetchFlowDetail = async () => {
            if (!flowId) return;

            try {
                setLoading(true);
                const data = await flowService.getFlowById(flowId);
                setFlowData(data);
            } catch (error) {
                console.error(`Gagal mengambil detail Flow #${flowId}:`, error);
                
                if (error.code === 'ECONNABORTED') {
                    alert("Server backend lambat/tidak merespons (Timeout 10s). Periksa apakah server backend aktif.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFlowDetail();
    }, [flowId]);

    return (
        // Wrap SELURUH Layout pakai ReactFlowProvider agar instance tersambung penuh
        <ReactFlowProvider>
            <div className="w-full h-full flex flex-col bg-olive-100 overflow-hidden">
                {/* Header */}
                <div className="flex flex-row p-2 gap-4 justify-between items-center border-b bg-olive-50 z-20">
                    <div className="flex flex-row gap-4 items-center">
                        <Link
                            to="/flows"
                            className="flex flex-row gap-2 p-2 items-center border-0 border-dashed border-olive-900 cursor-pointer hover:bg-olive-200 hover:border active:bg-olive-300 active:border-solid duration-300"
                        >
                            <ArrowLeft size={18} />
                            <p className="text-xs font-bold text-olive-900">Kembali</p>
                        </Link>
                        <span className="w-px h-8 bg-olive-400"></span>

                        {isFlowLoading ? (
                            <div className="flex items-center gap-2 text-olive-600">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-xs font-semibold">Memuat info flow...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div>
                                    <h2 className="font-semibold text-lg text-olive-800 leading-tight">
                                        {flowDetail?.name || `Flow #${flowId}`}
                                    </h2>
                                    {flowDetail?.description && (
                                        <p className="text-[11px] text-olive-600 truncate max-w-xs">
                                            {flowDetail.description}
                                        </p>
                                    )}
                                </div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase ${
                                    flowDetail?.status === 'active' 
                                        ? 'bg-green-300 text-green-900' 
                                        : 'bg-amber-200 text-amber-900'
                                }`}>
                                    {flowDetail?.status || 'draft'}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="flex flex-row h-full px-4 mr-2 mb-1 gap-2 text-xs font-semibold text-green-50 justify-center items-center rounded-xs bg-green-600 border border-green-900 cursor-pointer shadow-[4px_4px_0px_rgba(13,84,43,1)] hover:bg-green-500 active:translate-y-1 active:shadow-none transition-all"
                    >
                        <Rocket size={18} />
                        Run Simulation
                    </button>
                </div>

                {/* Main Workspace */}
                <div className="flex-1 flex h-full relative overflow-hidden">
                    <div className="flex-1 h-full relative">
                        <FlowCanvas flowId={flowId} setSelectedNode={setSelectedNode} />
                    </div>

                    {selectedNode && (
                        <div className="w-80 h-full border-l-2 border-olive-300 bg-white z-10 flex flex-col">
                            <RightSidebar
                                flowId={flowId}
                                selectedNode={selectedNode}
                                setSelectedNode={setSelectedNode}
                            />
                        </div>
                    )}
                </div>

                {/* Bottom Logs Panel */}
                <div
                    className={`w-full border-t border-olive-900 bg-white transition-all duration-300 ease-in-out flex flex-col ${
                        isBottomOpen ? "h-48" : "h-10"
                    }`}
                >
                    <div className="flex flex-row w-full h-fit p-2 justify-between">
                        <div className="w-full pl-4 text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-700 animate-pulse"></span>
                            Execution Logs
                        </div>
                        <button
                            className="h-fit w-fit rounded-xs bg-slate-50 flex items-center p-1 justify-between cursor-pointer border-b border-olive-200 hover:bg-olive-100 hover:border-2 hover:border-dashed hover:border-olive-700"
                            onClick={() => setIsBottomOpen(!isBottomOpen)}
                        >
                            {isBottomOpen ? <PanelTopOpen size={24} /> : <PanelBottomOpen size={24} />}
                        </button>
                    </div>

                    {isBottomOpen && (
                        <div className="p-4 flex-1 w-full min-h-45 overflow-y-auto bg-olive-900 font-mono text-olive-400 text-xs">
                            <p>[{new Date().toLocaleTimeString()}] Active Session for Flow: {flowDetail?.name || flowId}</p>
                        </div>
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
}