import React, { useCallback, useState, useMemo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    useReactFlow, // Wajib dipanggil di dalam ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FloatingNodeMenu from './floatingNodeMenu'; // Import menu yang baru dibuat
import ApiNode from './apiNode';

const initialNodes = [
    // { id: '1', type: 'input', data: { label: 'POST /api/v1/auth' }, position: { x: 250, y: 50 }, style: { background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', padding: '10px' } },
];
const initialEdges = [];

let id = 2; // Simple ID generator
const getId = () => `${id++}`;

export default function FlowCanvas({ setSelectedNode }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow(); // Fungsi krusial untuk DND yang akurat

    const nodeTypes = useMemo(() => ({ customApi: ApiNode }), []);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    // Mencegah default behavior agar browser mengizinkan "drop"
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Eksekusi saat item dijatuhkan ke kanvas
    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow/type');
            const label = event.dataTransfer.getData('application/reactflow/label');

            if (!type) return;

            // if (typeof type === 'undefined' || !type) {
            //     return;
            // }

            // Menerjemahkan koordinat layar ke koordinat kanvas
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Styling dinamis sederhana berdasarkan template
            let customStyle = { borderRadius: '4px', padding: '10px', fontSize: '12px' };
            if (type === 'input') customStyle = { ...customStyle, background: '#1e293b', color: '#fff', border: '1px solid #334155' };
            else if (type === 'output') customStyle = { ...customStyle, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
            else customStyle = { ...customStyle, background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' };

            // const newNode = {
            //     id: getId(),
            //     type,
            //     position,
            //     data: { label: label },
            //     style: customStyle,
            // };

            const newNode = {
                id: getId(),
                type: 'customApi', // WAJIB SAMA DENGAN NAMA DI useMemo nodeTypes
                position,
                data: { 
                    label: label,
                    category: type, // Ini yang akan dibaca oleh getTheme() di ApiNode.jsx
                    method: type === 'trigger' ? 'POST' : null // Contoh data tambahan
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes]
    );

    const onNodeClick = (event, node) => {
        setSelectedNode(node); // Kirim data node ke Right Panel
    };

    const onPaneClick = () => {
        setSelectedNode(null); // Tutup panel jika klik area kosong
    };

    return (
        <div className="w-full h-full relative bg-olive-100">
            {/* Toolbar melayang di atas kanvas */}
            <FloatingNodeMenu/>
            
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                fitView
            >
                <Controls className="bg-white border border-slate-500 rounded-none" />
                <MiniMap nodeStrokeWidth={3} className="border border-slate-500 overflow-hidden rounded-none" />
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
            </ReactFlow>
        </div>
    );
}