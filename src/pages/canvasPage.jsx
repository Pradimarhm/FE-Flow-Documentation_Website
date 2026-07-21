import React, { useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
} from '@xyflow/react';

// Wajib import CSS dari @xyflow/react
import '@xyflow/react/dist/style.css';

// 1. Mock Data Initial Nodes (Langsung berisi alur API Simulasi agar siap demo)
const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: 'POST /api/v1/auth/login' },
        position: { x: 250, y: 50 },
        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155', rounded: "0px", borderRadius: '8px', padding: '10px' },
    },
    {
        id: '2',
        data: { label: 'Validate Payload & JWT' },
        position: { x: 250, y: 180 },
        style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', rounded: "0px", borderRadius: '8px', padding: '10px' },
    },
    {
        id: '3',
        type: 'output',
        data: { label: '200 OK - Return Auth Token' },
        position: { x: 250, y: 310 },
        style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', rounded: "0px", borderRadius: '8px', padding: '10px' },
    },
];

// 2. Mock Connections (Edges)
const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: false, style: { stroke: '#64748b' } },
    { id: 'e2-3', source: '2', target: '3', animated: false, style: { stroke: '#22c55e' } },
];

export default function CanvasPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Fungsi untuk menyambungkan node baru secara interaktif
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    // Fungsi darurat untuk menambah Node baru di tengah layar tanpa perlu Drag-and-Drop rumit
    const handleAddNode = () => {
        const id = (nodes.length + 1).toString();
            const newNode = {
            id,
            data: { label: `New Node Endpoint ${id}` },
            position: {
                x: Math.random() * 300 + 100,
                y: Math.random() * 300 + 100,
            },
            style: { background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1',  rounded: none, borderRadius: '8px', padding: '10px' },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    return (
        <div className="w-full h-full flex flex-col relative bg-white">
        {/* TOOLBAR CANVAS DARURAT */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 bg-gray-50 border border-slate-500 p-2">
            <button
            onClick={handleAddNode}
            className="px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            >
                + Add Node
            </button>
            <div className="h-6 w-px bg-slate-200 my-auto" />
            <span className="text-xs text-slate-500 my-auto px-1 font-mono">
            Nodes: {nodes.length}
            </span>
        </div>

        {/* REACT FLOW CANVAS CONTAINER */}
        <div className="w-full flex-1 h-[calc(100vh-60px)]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Controls className="bg-white border border-slate-500" />
                <MiniMap 
                    nodeStrokeWidth={3} 
                    className="border border-slate-500 overflow-hidden" 
                />
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
            </ReactFlow>
        </div>
        </div>
    );
}