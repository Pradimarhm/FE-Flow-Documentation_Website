import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react'; // WAJIB DI-IMPORT
import FlowCanvas from './flowCanvas';
// import RightSidebar from './panels/RightSidebar'; // Buat ini selanjutnya
// import BottomLog from './panels/BottomLog'; // Buat ini 

//icon
import { 
    PanelBottomOpen,
    PanelTopOpen, 
    ArrowLeft
} from 'lucide-react';


export default function CanvasLayout() {
    const [isBottomOpen, setIsBottomOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);                         

    return (
        // Wrapper utama tinggi 100vh agar tidak overflow
        <div className="w-full h-full flex flex-col bg-olive-100 overflow-hidden">
            {/* header */}
            <div className='flex flex-row p-2 gap-4 justify-between items-center border-b bg-olive-50'>
                <div className='flex flex-row gap-4 items-center'>
                    <a href='/flow' className='flex flex-row gap-2 p-2 items-center border-0 border-dashed border-olive-900 cursor-pointer hover:bg-olive-200 hover:border active:bg-olive-300 active:border-solid duration-300'>
                    <ArrowLeft size={18}/>
                    <p className='text-xs'>
                        Kembali
                    </p>
                    </a>
                    <span className='w-px h-8 bg-olive-400'></span>
                    <h2 className='font-semibold text-lg text-olive-800'>Flow Order</h2>
                    <div className='flex flex-row gap-2 p-2 bg-olive-100 shadow shadow-olive-200 border border-dashed border-olive-500'>
                        <p className='text-xs text-olive-500'>Version 2.0</p>
                        <span className='w-px h-4 bg-olive-500'></span>
                        <p className='text-xs text-green-500'>25 Nodes</p>
                        {/* <span className='w-px h-4 bg-olive-500'></span>
                        <p className='text-xs text-blue-500'>25 Connector</p> */}
                    </div>
                </div>
                <a href="" className='flex flex-row h-full px-4 mr-2 mb-1 text-xs font-semibold text-green-900 justify-center items-center rounded-xs bg-green-50 border border-green-500 cursor-pointer shadow-[4px_4px_0px_rgba(13,84,43,1)] hover:bg-green-100 active:translate-y-1 active:shadow-none transition-all'>
                    Run Simulation
                </a>
            </div>
            {/* Main Workspace */}
            <div className="flex-1 flex h-full relative overflow-hidden">
                
                {/* Canvas Area (Dibungkus ReactFlowProvider agar DND kalkulasinya jalan) */}
                <div className="flex-1 h-full relative">
                    <ReactFlowProvider>
                        <FlowCanvas setSelectedNode={setSelectedNode} />
                    </ReactFlowProvider>
                </div>

                {/* Right Panel (Node Info) - Placeholder */}
                {selectedNode && (
                    <div className="w-80 h-full border-l border-olive-300 bg-white z-10 flex flex-col">
                        <div className="p-4 border-b border-olive-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-sm text-olive-800">Node Settings</h3>
                            <button onClick={() => setSelectedNode(null)} className="text-olive-400 hover:text-black cursor-pointer text-xs">Close</button>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            <p className="text-xs text-olive-500 mb-2">ID: {selectedNode.id}</p>
                            <p className="text-sm font-medium text-olive-800 mb-4">{selectedNode.data.label}</p>
                            {/* Nanti kamu tambahkan tab Input, Process, Output di sini */}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Panel (Execution Log) - Placeholder */}
            <div className={`w-full h-fit border-t border-olive-900 bg-white transition-all duration-300 ease-in-out flex flex-col ${isBottomOpen ? 'h-48' : 'h-10'}`}>
                <div className='flex flex-row w-full h-fit p-2 justify-between'>
                    <div className="w-full pl-4 text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-700 animate-pulse"></span>
                        Execution Logs
                    </div>
                    <button 
                        className="h-fit w-fit rounded-xs bg-slate-50 flex items-center p-1 justify-between cursor-pointer border-b border-olive-200 hover:bg-olive-100 hover:border-2 hover:border-dashed hover:border-olive-700"
                        onClick={() => setIsBottomOpen(!isBottomOpen)}
                    >
                        <span className="text-xs text-olive-700 font-medium">{isBottomOpen ? 
                            <PanelTopOpen size={24}/> : <PanelBottomOpen size={24}/>
                        }</span>
                    </button>
                </div>
                
                {isBottomOpen && (
                    <div className="p-4 flex-1 w-full min-h-45 overflow-y-auto bg-olive-900 font-mono text-olive-400 text-xs">
                        {/* Dummy Log Data */}
                        <p>[{new Date().toLocaleTimeString()}] System Initialized.</p>
                        <p>[{new Date().toLocaleTimeString()}] Waiting for execution...</p>
                    </div>
                )}
            </div>
        </div>
    );
}