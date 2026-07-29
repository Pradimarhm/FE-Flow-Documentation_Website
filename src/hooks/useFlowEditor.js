import { useState, useEffect, useCallback, useRef } from "react";
import {
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
} from "@xyflow/react";
import { nodeService } from "@/services/nodeService";
import { connectionService } from "@/services/connectionService";
import { canvasDraftStore } from "@/store/flowStore";

const genTempId = (prefix) =>
    `temp_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const BASIC_NODE_DEFAULT_CONFIG = {
    start: {
        inputParams: {},
        validationRules: "",
        processLogic: "// Titik awal alur, tidak memproses data",
        outputTemplate: {},
    },
    process: {
        inputParams: { input: "" },
        validationRules: "required:input",
        processLogic: "// Proses data input di sini",
        outputTemplate: { result: "" },
    },
    validation: {
        inputParams: { value: "" },
        validationRules: "value != null",
        processLogic: "// Validasi input sebelum lanjut ke node berikutnya",
        outputTemplate: { valid: true },
    },
    database: {
        inputParams: { query: "", table: "" },
        validationRules: "table != null",
        processLogic: "// Eksekusi query ke database",
        outputTemplate: { rows: [] },
    },
    api: {
        inputParams: { method: "GET", url: "", headers: {} },
        validationRules: "url != null",
        processLogic: "// Kirim request API ke endpoint eksternal",
        outputTemplate: { status: 200, body: {} },
    },
    end: {
        inputParams: {},
        validationRules: "",
        processLogic: "// Titik akhir alur",
        outputTemplate: {},
    },
};

const buildNodeContent = (rawPayload) => {
    const category = (
        rawPayload.category ||
        rawPayload.type ||
        "process"
    ).toLowerCase();
    const fallbackConfig =
        BASIC_NODE_DEFAULT_CONFIG[category] ||
        BASIC_NODE_DEFAULT_CONFIG.process;
    const sourceConfig = rawPayload.config || {};

    return {
        label: rawPayload.label || "Node Baru",
        category,
        template_id: rawPayload.template_id || null,
        config: {
            inputParams: sourceConfig.inputParams ?? fallbackConfig.inputParams,
            validationRules:
                sourceConfig.validationRules ?? fallbackConfig.validationRules,
            processLogic:
                sourceConfig.processLogic ?? fallbackConfig.processLogic,
            outputTemplate:
                sourceConfig.outputTemplate ?? fallbackConfig.outputTemplate,
        },
        description: sourceConfig.description || rawPayload.description || "",
    };
};

const toNodeApiPayload = (node, orderIndex = 0) => ({
    template_id: node.data?.template_id || null,
    node_type: node.data?.category || "process",
    label: node.data?.label || "Node Baru",
    pos_x: Math.round(node.position?.x ?? 0),
    pos_y: Math.round(node.position?.y ?? 0),
    order_index: orderIndex,
    input_params: node.data?.config?.inputParams || {},
    validation_rules: node.data?.config?.validationRules || "",
    process_logic: node.data?.config?.processLogic || "",
    output_template: node.data?.config?.outputTemplate || {},
});

export const useFlowEditor = (flowId, setSelectedNode) => {
    const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
    const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);

    const [menu, setMenu] = useState(null);
    const [copiedNode, setCopiedNode] = useState(null);
    const reactFlowWrapper = useRef(null);
    const { screenToFlowPosition } = useReactFlow();

    const dirtyRef = useRef({
        newNodeIds: new Set(),
        updatedNodeIds: new Set(),
        deletedNodeIds: new Set(),
        newEdgeIds: new Set(),
        deletedEdgeIds: new Set(),
    });

    const extractData = (res) => res?.data || res;
    const isTempId = (id) => String(id).startsWith("temp_");

    const markDirty = useCallback(() => {
        setIsDirty(true);
    }, []);

    const persistDraft = useCallback(
        (nextNodes, nextEdges) => {
            if (!flowId) return;
            const d = dirtyRef.current;
            canvasDraftStore.save(flowId, {
                nodes: nextNodes,
                edges: nextEdges,
                newNodeIds: [...d.newNodeIds],
                updatedNodeIds: [...d.updatedNodeIds],
                deletedNodeIds: [...d.deletedNodeIds],
                newEdgeIds: [...d.newEdgeIds],
                deletedEdgeIds: [...d.deletedEdgeIds],
            });
        },
        [flowId],
    );

    // -----------------------------------------------------------------
    // LOAD DATA
    // -----------------------------------------------------------------
    useEffect(() => {
        if (!flowId) return;

        const loadFlowData = async () => {
            try {
                setIsLoading(true);

                const draft = await canvasDraftStore.load(flowId);
                if (draft?.nodes?.length) {
                    dirtyRef.current = {
                        newNodeIds: new Set(draft.newNodeIds || []),
                        updatedNodeIds: new Set(draft.updatedNodeIds || []),
                        deletedNodeIds: new Set(draft.deletedNodeIds || []),
                        newEdgeIds: new Set(draft.newEdgeIds || []),
                        deletedEdgeIds: new Set(draft.deletedEdgeIds || []),
                    };
                    setNodes(draft.nodes);
                    setEdges(draft.edges || []);
                    setIsDirty(true);
                    setIsLoading(false);
                    return;
                }

                const [nodesRes, connRes] = await Promise.all([
                    nodeService.getNodesByFlow(flowId),
                    connectionService.getConnectionsByFlow(flowId),
                ]);

                const rawNodes = extractData(nodesRes) || [];
                const rawConns = extractData(connRes) || [];

                const formattedNodes = Array.isArray(rawNodes)
                    ? rawNodes.map((item) => ({
                          id: String(item.id),
                          type: "customApi",
                          position: {
                              x: Number(item.pos_x ?? item.position_x) || 0,
                              y: Number(item.pos_y ?? item.position_y) || 0,
                          },
                          data: buildNodeContent({
                              label: item.label,
                              category: item.node_type || item.type,
                              template_id: item.template_id,
                              config: {
                                  inputParams:
                                      item.input_params ??
                                      item.config?.inputParams,
                                  validationRules:
                                      item.validation_rules ??
                                      item.config?.validationRules,
                                  processLogic:
                                      item.process_logic ??
                                      item.config?.processLogic,
                                  outputTemplate:
                                      item.output_template ??
                                      item.config?.outputTemplate,
                                  description: item.config?.description,
                              },
                          }),
                      }))
                    : [];

                const formattedEdges = Array.isArray(rawConns)
                    ? rawConns.map((conn) => ({
                          id: String(conn.id),
                          source: String(conn.source_node_id),
                          target: String(conn.target_node_id),
                          label: conn.branch_label || conn.label || "",
                          type: "smoothstep",
                          pathOptions: { borderRadius: 15, offset: 20 },
                          animated: false,
                          interactionWidth: 25, // Memperlebar area sensor klik gantung (hit area)
                          deletable: true,
                          style: { stroke: "#36454F", strokeWidth: 2.5 },
                      }))
                    : [];

                dirtyRef.current = {
                    newNodeIds: new Set(),
                    updatedNodeIds: new Set(),
                    deletedNodeIds: new Set(),
                    newEdgeIds: new Set(),
                    deletedEdgeIds: new Set(),
                };
                setNodes(formattedNodes);
                setEdges(formattedEdges);
                setIsDirty(false);
            } catch (error) {
                console.error(`Gagal memuat data Flow #${flowId}:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        loadFlowData();
    }, [flowId]);

    // -----------------------------------------------------------------
    // NODE CHANGES
    // -----------------------------------------------------------------
    const onNodesChange = useCallback(
        (changes) => {
            onNodesChangeInternal(changes);

            let touched = false;
            const d = dirtyRef.current;
            for (const change of changes) {
                if (
                    change.type === "position" &&
                    change.id &&
                    !change.dragging
                ) {
                    if (!isTempId(change.id)) {
                        d.updatedNodeIds.add(change.id);
                    }
                    touched = true;
                } else if (change.type === "remove" && change.id) {
                    const nodeId = String(change.id);
                    if (d.newNodeIds.has(nodeId)) {
                        d.newNodeIds.delete(nodeId);
                    } else {
                        d.deletedNodeIds.add(nodeId);
                    }
                    d.updatedNodeIds.delete(nodeId);
                    touched = true;
                }
            }
            if (touched) markDirty();
        },
        [onNodesChangeInternal, markDirty],
    );

    const contentSnapshotRef = useRef(new Map());

    useEffect(() => {
        const prevSnapshot = contentSnapshotRef.current;
        const nextSnapshot = new Map();
        let changedAny = false;

        for (const node of nodes) {
            const signature = JSON.stringify({
                label: node.data?.label,
                category: node.data?.category,
                config: node.data?.config,
                description: node.data?.description,
            });
            nextSnapshot.set(node.id, signature);

            const prevSignature = prevSnapshot.get(node.id);
            if (
                prevSignature !== undefined &&
                prevSignature !== signature &&
                !isTempId(node.id) &&
                !dirtyRef.current.deletedNodeIds.has(node.id)
            ) {
                dirtyRef.current.updatedNodeIds.add(node.id);
                changedAny = true;
            }
        }

        contentSnapshotRef.current = nextSnapshot;
        if (changedAny) markDirty();
    }, [nodes]);

    // -----------------------------------------------------------------
    // CONNECT EDGES
    // -----------------------------------------------------------------
    const onConnect = useCallback(
        (params) => {
            if (!params.source || !params.target) return;

            const newEdgeId = genTempId("edge");
            const newEdge = {
                id: newEdgeId,
                source: String(params.source),
                target: String(params.target),
                label: "",
                type: "smoothstep",
                pathOptions: { borderRadius: 15, offset: 20 },
                animated: false,
                interactionWidth: 25, // Area sensor klik tebal 25px
                deletable: true,
                style: { stroke: "#36454F", strokeWidth: 2.5 },
            };

            dirtyRef.current.newEdgeIds.add(newEdgeId);
            setEdges((eds) => addEdge(newEdge, eds));
            markDirty();
        },
        [setEdges, markDirty],
    );

    // -----------------------------------------------------------------
    // HAPUS EDGE VIA KEYBOARD (DELETE / BACKSPACE)
    // -----------------------------------------------------------------
    const handleEdgesChange = useCallback(
        (changes) => {
            for (const change of changes) {
                if (change.type === "remove") {
                    const d = dirtyRef.current;
                    if (d.newEdgeIds.has(change.id)) {
                        d.newEdgeIds.delete(change.id);
                    } else {
                        d.deletedEdgeIds.add(change.id);
                    }
                    markDirty();
                }
            }
            onEdgesChangeInternal(changes);
        },
        [onEdgesChangeInternal, markDirty],
    );

    // -----------------------------------------------------------------
    // HELPER ANIMASI SIMULASI
    // -----------------------------------------------------------------
    const updateEdgesStatus = useCallback(
        (activeIds = new Set(), completedIds = new Set()) => {
            setEdges((eds) =>
                eds.map((edge) => {
                    const isTraveling = activeIds.has(edge.id);
                    const isCompleted = completedIds.has(edge.id);

                    return {
                        ...edge,
                        animated: isTraveling,
                        style: {
                            ...edge.style,
                            stroke: isTraveling
                                ? "#00FF66"
                                : isCompleted
                                  ? "#10B981"
                                  : "#36454F",
                            strokeWidth: isTraveling ? 4 : isCompleted ? 3 : 2.5,
                        },
                    };
                }),
            );
        },
        [setEdges],
    );

    // -----------------------------------------------------------------
    // DROP NODE
    // -----------------------------------------------------------------
    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const reactFlowType = event.dataTransfer.getData(
                "application/reactflow/type",
            );
            const rawNodeData = event.dataTransfer.getData(
                "application/reactflow/nodeData",
            );

            if (!reactFlowType || !rawNodeData) return;

            const nodePayload = JSON.parse(rawNodeData);
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newId = genTempId("node");
            const newNode = {
                id: newId,
                type: "customApi",
                position,
                data: buildNodeContent(nodePayload),
            };

            dirtyRef.current.newNodeIds.add(newId);
            setNodes((nds) => nds.concat(newNode));
            markDirty();
        },
        [screenToFlowPosition, setNodes, markDirty],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    // -----------------------------------------------------------------
    // CONTEXT MENU & ACTIONS
    // -----------------------------------------------------------------
    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        setMenu({
            type: "node",
            nodeId: String(node.id),
            top: event.clientY - 20,
            left: event.clientX - 20,
        });
    }, []);

    const onEdgeContextMenu = useCallback((event, edge) => {
        event.preventDefault();
        event.stopPropagation();
        setMenu({
            type: "edge",
            edgeId: String(edge.id),
            top: event.clientY - 20,
            left: event.clientX - 20,
        });
    }, []);

    const onPaneContextMenu = useCallback((event) => {
        event.preventDefault();
        setMenu({
            type: "pane",
            top: event.clientY - 20,
            left: event.clientX - 20,
        });
    }, []);

    const deleteNode = useCallback(() => {
        if (!menu?.nodeId) return;
        const targetNodeId = String(menu.nodeId);
        setMenu(null);

        const d = dirtyRef.current;
        if (d.newNodeIds.has(targetNodeId)) {
            d.newNodeIds.delete(targetNodeId);
        } else {
            d.deletedNodeIds.add(targetNodeId);
        }
        d.updatedNodeIds.delete(targetNodeId);

        setNodes((nds) =>
            nds.filter((node) => String(node.id) !== targetNodeId),
        );
        setEdges((eds) => {
            const remaining = eds.filter((edge) => {
                const touchesTarget =
                    String(edge.source) === targetNodeId ||
                    String(edge.target) === targetNodeId;
                if (touchesTarget) {
                    if (d.newEdgeIds.has(edge.id)) d.newEdgeIds.delete(edge.id);
                    else d.deletedEdgeIds.add(edge.id);
                }
                return !touchesTarget;
            });
            return remaining;
        });

        if (setSelectedNode) {
            setSelectedNode((prev) =>
                String(prev?.id) === targetNodeId ? null : prev,
            );
        }
        markDirty();
    }, [menu, setNodes, setEdges, setSelectedNode, markDirty]);

    const deleteEdge = useCallback(() => {
        const targetEdgeId = menu?.edgeId ? String(menu.edgeId) : null;
        if (!targetEdgeId) return;

        setMenu(null);

        const d = dirtyRef.current;
        if (d.newEdgeIds.has(targetEdgeId)) {
            d.newEdgeIds.delete(targetEdgeId);
        } else {
            d.deletedEdgeIds.add(targetEdgeId);
        }

        setEdges((prevEdges) =>
            prevEdges.filter((e) => String(e.id) !== targetEdgeId),
        );

        markDirty();
    }, [menu, setEdges, markDirty]);

    const copyNode = useCallback(() => {
        if (!menu?.nodeId) return;
        const targetNodeId = String(menu.nodeId);
        const nodeToCopy = nodes.find((n) => String(n.id) === targetNodeId);

        if (nodeToCopy) setCopiedNode(nodeToCopy);
        setMenu(null);
    }, [menu, nodes]);

    const duplicateNode = useCallback(() => {
        if (!menu?.nodeId) return;
        const targetNodeId = String(menu.nodeId);
        const targetNode = nodes.find((n) => String(n.id) === targetNodeId);
        setMenu(null);
        if (!targetNode) return;

        const newId = genTempId("node");
        const newNode = {
            id: newId,
            type: "customApi",
            position: {
                x: Math.round(targetNode.position.x + 30),
                y: Math.round(targetNode.position.y + 30),
            },
            data: buildNodeContent({
                ...targetNode.data,
                label: `${targetNode.data?.label || "Node"} (Copy)`,
            }),
        };

        dirtyRef.current.newNodeIds.add(newId);
        setNodes((nds) => nds.concat(newNode));
        markDirty();
    }, [menu, nodes, setNodes, markDirty]);

    const pasteNode = useCallback(() => {
        if (!copiedNode) return;
        setMenu(null);

        const newId = genTempId("node");
        const newNode = {
            id: newId,
            type: "customApi",
            position: {
                x: Math.round(copiedNode.position.x + 50),
                y: Math.round(copiedNode.position.y + 50),
            },
            data: buildNodeContent({
                ...copiedNode.data,
                label: `${copiedNode.data?.label || "Node"} (Paste)`,
            }),
        };

        dirtyRef.current.newNodeIds.add(newId);
        setNodes((nds) => nds.concat(newNode));
        markDirty();
    }, [copiedNode, setNodes, markDirty]);

    const markNodeDirty = useCallback((nodeId) => {
        if (!isTempId(nodeId)) {
            dirtyRef.current.updatedNodeIds.add(String(nodeId));
        }
        setIsDirty(true);
    }, []);

    // -----------------------------------------------------------------
    // SIMPAN FLOW
    // -----------------------------------------------------------------
    const saveFlow = useCallback(async () => {
        if (!flowId || isSaving) return { success: false };
        setIsSaving(true);

        const d = dirtyRef.current;
        const idMap = new Map();
        const errors = [];

        try {
            for (const tempId of d.newNodeIds) {
                const node = nodes.find((n) => n.id === tempId);
                if (!node) continue;
                try {
                    const orderIndex =
                        nodes.findIndex((n) => n.id === tempId) + 1;
                    const response = await nodeService.createNode(
                        flowId,
                        toNodeApiPayload(node, orderIndex),
                    );
                    const saved = extractData(response);
                    if (saved?.id) idMap.set(tempId, String(saved.id));
                } catch (error) {
                    errors.push({ type: "node-create", tempId, error });
                }
            }

            for (const nodeId of d.updatedNodeIds) {
                const node = nodes.find((n) => n.id === nodeId);
                if (!node) continue;
                try {
                    await nodeService.updateNode(
                        nodeId,
                        toNodeApiPayload(node),
                    );
                } catch (error) {
                    errors.push({ type: "node-update", nodeId, error });
                }
            }

            for (const nodeId of d.deletedNodeIds) {
                try {
                    await nodeService.deleteNode(nodeId);
                } catch (error) {
                    errors.push({ type: "node-delete", nodeId, error });
                }
            }

            const resolveId = (id) => idMap.get(id) || id;
            for (const tempEdgeId of d.newEdgeIds) {
                const edge = edges.find((e) => e.id === tempEdgeId);
                if (!edge) continue;
                try {
                    const sourceId = resolveId(edge.source);
                    const targetId = resolveId(edge.target);
                    if (!sourceId || !targetId) {
                        errors.push({
                            type: "edge-create",
                            tempEdgeId,
                            error: new Error(
                                `Source or target node ID invalid: source=${sourceId}, target=${targetId}`,
                            ),
                        });
                        continue;
                    }
                    const payload = {
                        source_node_id: Number(sourceId),
                        target_node_id: Number(targetId),
                        branch_label: edge.label || "",
                    };
                    await connectionService.createConnection(flowId, payload);
                } catch (error) {
                    errors.push({ type: "edge-create", tempEdgeId, error });
                }
            }

            for (const edgeId of d.deletedEdgeIds) {
                try {
                    await connectionService.deleteConnection(edgeId);
                } catch (error) {
                    errors.push({ type: "edge-delete", edgeId, error });
                }
            }

            if (idMap.size > 0) {
                setNodes((nds) =>
                    nds.map((n) =>
                        idMap.has(n.id) ? { ...n, id: idMap.get(n.id) } : n,
                    ),
                );
                setEdges((eds) =>
                    eds.map((e) => ({
                        ...e,
                        source: resolveId(e.source),
                        target: resolveId(e.target),
                    })),
                );
            }

            if (errors.length > 0) {
                console.error("Sebagian perubahan gagal disimpan:", errors);
                return { success: false, errors };
            }

            dirtyRef.current = {
                newNodeIds: new Set(),
                updatedNodeIds: new Set(),
                deletedNodeIds: new Set(),
                newEdgeIds: new Set(),
                deletedEdgeIds: new Set(),
            };
            setIsDirty(false);
            setLastSavedAt(Date.now());
            await canvasDraftStore.clear(flowId);

            return { success: true };
        } finally {
            setIsSaving(false);
        }
    }, [flowId, isSaving, nodes, edges, setNodes, setEdges]);

    useEffect(() => {
        if (!flowId || isLoading) return;
        persistDraft(nodes, edges);
    }, [nodes, edges, isDirty]);

    return {
        nodes,
        edges,
        isLoading,
        isSaving,
        isDirty,
        lastSavedAt,
        onNodesChange,
        onEdgesChange: handleEdgesChange,
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
        actions: {
            deleteNode,
            deleteEdge,
            copyNode,
            duplicateNode,
            pasteNode,
        },
        interactions: {
            onNodeClick: (_, node) => setSelectedNode(node),
            onPaneClick: () => {
                setMenu(null);
                setSelectedNode(null);
            },
        },
    };
};