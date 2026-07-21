import React from 'react';

export default function FloatingNodeMenu() {
    // Event handler saat user mulai men-drag node dari menu
    const onDragStart = (event, nodeType, label) => {
        event.dataTransfer.setData('application/reactflow/type', nodeType);
        event.dataTransfer.setData('application/reactflow/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    const nodeTemplates = [
        { type: 'trigger', label: 'Trigger (Input)', color: 'bg-slate-800 text-white' },
        { type: 'process', label: 'Process (Middleware)', color: 'bg-white text-slate-800 border-slate-300' },
        { type: 'output', label: 'Response (Output)', color: 'bg-green-50 text-green-800 border-green-200' },
        { type: 'database', label: 'Database / API', color: 'bg-blue-50 text-blue-800 border-blue-200' },
        { type: 'default', label: 'default', color: 'bg-white text-black border-gray-500' },
    ];

    return (
        <div className="absolute top-4 left-4 z-10 bg-white border border-slate-500 border-dashed p-3 flex flex-col gap-2 w-48">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Drag to Add</span>
            {nodeTemplates.map((node, index) => (
                <div
                    key={index}
                    className={`px-3 py-2 text-xs font-medium border cursor-grab active:cursor-grabbing text-center ${node.color}`}
                    onDragStart={(event) => onDragStart(event, node.type, node.label)}
                    draggable
                >
                    {node.label}
                </div>
            ))}
        </div>
    );
}