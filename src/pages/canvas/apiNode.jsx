import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Settings2, Database, Zap, LogIn } from 'lucide-react'; 

export default function ApiNode({ id, data }) {
    // Wajib untuk mengupdate data secara real-time ke canvas
    const { updateNodeData } = useReactFlow(); 
    
    // State lokal untuk mode edit
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);

    const getTheme = () => {
        switch (data.category) {
            case 'trigger': return { bg: 'bg-olive-500', border: 'border-olive-900', text: 'text-olive-50', icon: <LogIn size={14} className="text-olive-200" /> };
            case 'process': return { bg: 'bg-white', border: 'border-olive-900', text: 'text-olive-900', icon: <Settings2 size={14} className="text-olive-600" /> };
            case 'database': return { bg: 'bg-olive-100', border: 'border-olive-900', text: 'text-olive-900', icon: <Database size={14} className="text-olive-700" /> };
            case 'output': return { bg: 'bg-green-100', border: 'border-olive-900', text: 'text-green-900', icon: <Zap size={14} className="text-green-700" /> };
            default: return { bg: 'bg-white', border: 'border-olive-900', text: 'text-olive-900', icon: null };
        }
    };

    const theme = getTheme();

    return (
        <div className={`flex flex-col min-w-48 border-2 rounded-xs shadow-[4px_4px_0px_rgba(54,69,79,1)] ${theme.bg} ${theme.border}`}>
            {data.category !== 'trigger' && (
                <Handle type="target" position={Position.Top} className="w-3 h-3 bg-olive-200 border-2 border-olive-900 rounded-none" />
            )}

            <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-olive-900 bg-black/5">
                {theme.icon}
                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.text}`}>
                    {data.category || 'Node'}
                </span>
            </div>

            <div className="px-3 py-3 flex flex-col gap-1">
                {/* Inline Edit Label */}
                {isEditingLabel ? (
                    <input
                        autoFocus
                        value={data.label}
                        onChange={(e) => updateNodeData(id, { label: e.target.value })}
                        onBlur={() => setIsEditingLabel(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingLabel(false)}
                        className="text-xs font-bold border-b-2 border-olive-900 bg-transparent outline-none w-full"
                    />
                ) : (
                    <div 
                        onDoubleClick={() => setIsEditingLabel(true)} 
                        className={`text-xs font-bold cursor-text hover:bg-black/5 p-0.5 rounded ${theme.text}`}
                        title="Double click to edit"
                    >
                        {data.label}
                    </div>
                )}

                {/* Inline Edit Description (Jika data.description tidak ada, sediakan fallback) */}
                {isEditingDesc ? (
                    <input
                        autoFocus
                        value={data.description || ''}
                        placeholder="Add description..."
                        onChange={(e) => updateNodeData(id, { description: e.target.value })}
                        onBlur={() => setIsEditingDesc(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingDesc(false)}
                        className="text-[10px] border-b-2 border-olive-500 bg-transparent outline-none w-full mt-1"
                    />
                ) : (
                    <div 
                        onDoubleClick={() => setIsEditingDesc(true)} 
                        className={`text-[10px] font-medium cursor-text opacity-80 hover:bg-black/5 p-0.5 mt-1 ${theme.text}`}
                        title="Double click to edit"
                    >
                        {data.description || 'Double click to add desc...'}
                    </div>
                )}
                
                {data.method && (
                    <span className="inline-block mt-2 px-2.5 bg-olive-500 text-white rounded-none border border-white w-fit text-[10px] font-mono">
                        {data.method}
                    </span>
                )}
            </div>

            {data.category !== 'output' && (
                <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-olive-500 border-2 border-olive-900 rounded-none" />
            )}
        </div>
    );
}