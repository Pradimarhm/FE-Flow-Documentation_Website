import React, { useMemo } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import FloatingNodeMenu from "./floatingNodeMenu";
import ApiNode from "./apiNode";
import { Copy, CopyPlus, Trash2, ClipboardPaste, Loader2 } from "lucide-react";
import { useFlowEditor } from "@/hooks/useFlowEditor";

export default function FlowCanvas({ flowId, setSelectedNode }) {
    const {
        nodes,
        edges,
        isLoading,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDrop,
        onDragOver,
        menu,
        copiedNode,
        reactFlowWrapper,
        onNodeContextMenu,
        onPaneContextMenu,
        actions,
        interactions,
    } = useFlowEditor(flowId, setSelectedNode);

    const nodeTypes = useMemo(() => ({ customApi: ApiNode }), []);

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-olive-100 gap-2 font-bold text-olive-900">
                <Loader2 size={32} className="animate-spin text-olive-800" />
                <p className="text-sm">Memuat Node Flow #{flowId}...</p>
            </div>
        );
    }

    return (
        <div
            className="w-full h-full relative bg-olive-100"
            ref={reactFlowWrapper}
        >
            <FloatingNodeMenu />

            {/* CONTEXT MENU */}
            {menu && (
                <div
                    style={{ top: menu.top, left: menu.left }}
                    className="absolute z-50 bg-olive-50 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] flex flex-col w-40"
                >
                    {menu.type === "node" && (
                        <>
                            <button
                                onClick={actions.duplicateNode}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-olive-900 hover:bg-olive-200 border-b-2 border-olive-900 text-left cursor-pointer transition-colors"
                            >
                                <CopyPlus size={14} /> Duplikat
                            </button>
                            <button
                                onClick={actions.copyNode}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-olive-900 hover:bg-olive-200 border-b-2 border-olive-900 text-left cursor-pointer transition-colors"
                            >
                                <Copy size={14} /> Copy
                            </button>
                        </>
                    )}

                    <button
                        onClick={actions.pasteNode}
                        disabled={!copiedNode}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-bold text-left border-olive-900 transition-colors ${
                            copiedNode
                                ? "text-olive-900 hover:bg-olive-200 cursor-pointer"
                                : "text-olive-400 bg-olive-100 cursor-not-allowed opacity-60"
                        } ${menu.type === "node" ? "border-b-2" : ""}`}
                    >
                        <ClipboardPaste size={14} /> Paste
                    </button>

                    {menu.type === "node" && (
                        <button
                            onClick={actions.deleteNode}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 text-left cursor-pointer transition-colors"
                        >
                            <Trash2 size={14} /> Hapus
                        </button>
                    )}
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={interactions.onNodeClick}
                onPaneClick={interactions.onPaneClick}
                onNodeContextMenu={onNodeContextMenu}
                onPaneContextMenu={onPaneContextMenu}
                fitView
            >
                <Controls className="bg-white border-2 border-olive-900 rounded-xs shadow-[2px_2px_0px_rgba(54,69,79,1)]" />
                <MiniMap
                    nodeStrokeWidth={3}
                    className="border-2 border-olive-900 rounded-xs overflow-hidden shadow-[4px_4px_0px_rgba(54,69,79,1)] bg-olive-50"
                />
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={16}
                    size={1}
                    color="#cbd5e1"
                />
            </ReactFlow>
        </div>
    );
}