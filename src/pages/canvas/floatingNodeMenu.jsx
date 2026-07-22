import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function FloatingNodeMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const onDragStart = (event, nodeType, label) => {
        event.dataTransfer.setData('application/reactflow/type', nodeType);
        event.dataTransfer.setData('application/reactflow/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    const nodeTemplates = [
        { type: 'trigger', label: 'Trigger (Input)', color: 'bg-olive-500 text-white' },
        { type: 'process', label: 'Process (Middleware)', color: 'bg-white text-olive-900 border-olive-500' },
        { type: 'output', label: 'Response (Output)', color: 'bg-green-100 text-green-900 border-green-500' },
        { type: 'database', label: 'Database / API', color: 'bg-blue-100 text-blue-900 border-blue-500' },
        { type: 'default', label: 'Default', color: 'bg-white text-black border-olive-500' },
    ];

    return (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 bg-olive-100 rounded-xs border-2 border-olive-900 shadow-[3px_3px_0px_rgba(54,69,79,1)] flex items-center justify-center cursor-pointer hover:bg-olive-200 active:translate-x-0.75 active:translate-y-0.75 active:shadow-none transition-all"
            >
                {isOpen ? <X size={20} className="text-olive-900" /> : <Plus size={20} className="text-olive-900" />}
            </button>

            {/* Menu Dropdown */}
            {isOpen && (
                <div className="bg-olive-50 rounded-sm border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] p-3 flex flex-col gap-2 w-48 transition-all">
                    <span className="w-full text-center text-[10px] font-bold text-olive-600 uppercase tracking-wider mb-1">Drag to Add Node</span>
                    {nodeTemplates.map((node, index) => (
                        <div
                            key={index}
                            className={`px-3 py-2 text-xs font-bold rounded-sm border-2 border-olive-900 cursor-grab active:cursor-grabbing text-center hover:-translate-y-0.5 transition-transform ${node.color}`}
                            onDragStart={(event) => onDragStart(event, node.type, node.label)}
                            draggable
                        >
                            {node.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}