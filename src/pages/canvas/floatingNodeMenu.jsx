import React, { useState } from "react";
import { Plus, X } from "lucide-react";

export default function FloatingNodeMenu() {
    const [isOpen, setIsOpen] = useState(false);

    // Kirim category, bukan sekadar "type" global
    const onDragStart = (event, category, label) => {
        event.dataTransfer.setData("application/reactflow/type", "customApi"); // Harus selalu customApi untuk MVP ini
        event.dataTransfer.setData("application/reactflow/category", category);
        event.dataTransfer.setData("application/reactflow/label", label);
        event.dataTransfer.effectAllowed = "move";
    };

    // 6 Tipe Pasti
    const nodeTemplates = [
        {
            category: "start",
            label: "Start Flow",
            color: "bg-green-500 text-white border-black",
        },
        {
            category: "end",
            label: "End Flow",
            color: "bg-red-500 text-white border-black",
        },
        {
            category: "process",
            label: "Process",
            color: "bg-white text-olive-900 border-black",
        },
        {
            category: "validation",
            label: "Validation",
            color: "bg-yellow-100 text-yellow-900 border-black",
        },
        {
            category: "database",
            label: "Database",
            color: "bg-blue-100 text-blue-900 border-black",
        },
        {
            category: "api",
            label: "API Request",
            color: "bg-purple-100 text-purple-900 border-black",
        },
    ];

    return (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 bg-olive-100 rounded-xs border-2 border-olive-900 shadow-[3px_3px_0px_rgba(54,69,79,1)] flex items-center justify-center cursor-pointer hover:bg-olive-200 active:translate-x-0.75 active:translate-y-0.75 active:shadow-none transition-all"
            >
                {isOpen ? (
                    <X size={20} className="text-olive-900" />
                ) : (
                    <Plus size={20} className="text-olive-900" />
                )}
            </button>

            {isOpen && (
                <div className="bg-olive-50 rounded-sm border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] p-3 flex flex-col gap-2 w-48 transition-all">
                    <span className="w-full text-center text-[10px] font-bold text-olive-600 uppercase tracking-wider mb-1">
                        Drag to Add Node
                    </span>
                    {nodeTemplates.map((node, index) => (
                        <div
                            key={index}
                            className={`px-3 py-2 text-xs font-bold rounded-sm border-2 cursor-grab active:cursor-grabbing text-center hover:-translate-y-0.5 transition-transform ${node.color}`}
                            onDragStart={(event) =>
                                onDragStart(event, node.category, node.label)
                            }
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
