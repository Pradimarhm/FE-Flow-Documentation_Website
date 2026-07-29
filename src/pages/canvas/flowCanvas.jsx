import React, { useMemo, useEffect } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import FloatingNodeMenu from "./FloatingNodeMenu";
import ApiNode from "./ApiNode";
import { Copy, CopyPlus, Trash2, ClipboardPaste, Loader2 } from "lucide-react";
import { useFlowEditor } from "@/hooks/useFlowEditor";

export default function FlowCanvas({
    flowId,
    setSelectedNode,
    onEditorReady,
    executionStatus = {},
    activeEdgeIds = new Set(),
    completedEdgeIds = new Set(),
}) {
    const editor = useFlowEditor(flowId, setSelectedNode);
    const {
        nodes,
        edges,
        isLoading,
        isSaving,
        isDirty,
        lastSavedAt,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDrop,
        onDragOver,
        menu,
        copiedNode,
        reactFlowWrapper,
        onNodeContextMenu,
        onEdgeContextMenu,
        onPaneContextMenu,
        saveFlow,
        markNodeDirty,
        updateEdgesStatus,
        actions,
        interactions,
    } = editor;

    useEffect(() => {
        onEditorReady?.({
            isSaving,
            isDirty,
            lastSavedAt,
            saveFlow,
            markNodeDirty,
            getEdges: () => edges,
            getNodes: () => nodes,
        });
    }, [
        onEditorReady,
        isSaving,
        isDirty,
        lastSavedAt,
        saveFlow,
        markNodeDirty,
        edges,
        nodes,
    ]);

    useEffect(() => {
        updateEdgesStatus(activeEdgeIds, completedEdgeIds);
    }, [activeEdgeIds, completedEdgeIds, updateEdgesStatus]);

    const nodeTypes = useMemo(() => ({ customApi: ApiNode }), []);

    const nodesWithStatus = useMemo(() => {
        return nodes.map((node) => {
            const status = executionStatus[node.id];

            let borderColor = "";
            let boxShadow = "";
            if (status === "running") {
                borderColor = "#10b981";
                boxShadow = "0 0 0 0 rgba(16, 185, 129, 0.7)";
            } else if (status === "success" || status === "completed") {
                borderColor = "#10b981";
                boxShadow = "0 0 12px rgba(16, 185, 129, 1)";
            } else if (status === "failed") {
                borderColor = "#ef4444";
                boxShadow = "0 0 12px rgba(239, 68, 68, 1)";
            }

            return {
                ...node,
                data: {
                    ...node.data,
                    executionStatus: status,
                },
                style: borderColor
                    ? {
                          ...node.style,
                          borderColor,
                          borderStyle: "solid",
                          borderWidth: status === "running" ? 3 : 2,
                          boxShadow,
                      }
                    : {
                          ...node.style,
                          borderStyle: undefined,
                          borderWidth: undefined,
                      },
                className: status === "running" ? "animate-pulse-ring" : "",
            };
        });
    }, [nodes, executionStatus]);

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
            <style>{`
                @keyframes pulse-ring {
                    0% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 12px rgba(16, 185, 129, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                    }
                }
                .animate-pulse-ring {
                    animation: pulse-ring 1.5s ease-in-out infinite;
                }
            `}</style>

            <FloatingNodeMenu />

            {menu && (
                <div
                    style={{ top: menu.top, left: menu.left }}
                    className="absolute z-50 bg-olive-50 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] flex flex-col w-44"
                    onClick={(e) => e.stopPropagation()}
                >
                    {menu.type === "node" && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    actions.duplicateNode();
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-olive-900 hover:bg-olive-200 border-b-2 border-olive-900 text-left cursor-pointer transition-colors"
                            >
                                <CopyPlus size={14} /> Duplikat
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    actions.copyNode();
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-olive-900 hover:bg-olive-200 border-b-2 border-olive-900 text-left cursor-pointer transition-colors"
                            >
                                <Copy size={14} /> Copy
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    actions.deleteNode();
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 text-left cursor-pointer transition-colors"
                            >
                                <Trash2 size={14} /> Hapus Node
                            </button>
                        </>
                    )}

                    {menu.type === "edge" && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                actions.deleteEdge();
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 text-left cursor-pointer transition-colors"
                        >
                            <Trash2 size={14} /> Hapus Koneksi
                        </button>
                    )}

                    {menu.type === "pane" && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                actions.pasteNode();
                            }}
                            disabled={!copiedNode}
                            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold text-left border-olive-900 transition-colors ${
                                copiedNode
                                    ? "text-olive-900 hover:bg-olive-200 cursor-pointer"
                                    : "text-olive-400 bg-olive-100 cursor-not-allowed opacity-60"
                            }`}
                        >
                            <ClipboardPaste size={14} /> Paste
                        </button>
                    )}
                </div>
            )}

            <ReactFlow
                nodes={nodesWithStatus}
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
                onEdgeContextMenu={onEdgeContextMenu}
                onPaneContextMenu={onPaneContextMenu}
                edgesFocusable={true}
                edgesUpdatable={true}
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