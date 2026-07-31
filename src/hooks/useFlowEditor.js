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
import { EDGE_BRANCH_CONFIG } from "@/config/nodeTypes";

const genTempId = (prefix) =>
    `temp_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const isTempId = (id) => String(id).startsWith("temp_");

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
    condition: {
        inputParams: { variable: "" },
        validationRules: "variable == true",
        processLogic: "// Evaluasi kondisi boolean (True / False)",
        outputTemplate: { branch: "true" },
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

    const getEdgeStyleByLabel = (label) => {
        const cleanLabel = String(label || "")
            .toLowerCase()
            .trim();
        if (cleanLabel === "true") return EDGE_BRANCH_CONFIG.true;
        if (cleanLabel === "false") return EDGE_BRANCH_CONFIG.false;
        return EDGE_BRANCH_CONFIG.default;
    };

    // -----------------------------------------------------------------
    // LOAD DATA
    // -----------------------------------------------------------------
    useEffect(() => {
        if (!flowId) return;
        let ignore = false;

        const loadFlowData = async () => {
            try {
                setIsLoading(true);

                const draft = await canvasDraftStore.load(flowId);
                if (ignore) return;

                if (draft?.nodes?.length) {
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
                if (ignore) return;

                const loadedNodes = extractData(nodesRes) || [];
                const loadedConns = extractData(connRes) || [];

                setNodes(
                    loadedNodes.map((n) => ({
                        id: String(n.id),
                        type: "customApi",
                        position: { x: n.pos_x, y: n.pos_y },
                        data: {
                            label: n.label,
                            category: n.node_type,
                            template_id: n.template_id,
                            config: {
                                inputParams: n.input_params || {},
                                validationRules: n.validation_rules || "",
                                processLogic: n.process_logic || "",
                                outputTemplate: n.output_template || {},
                            },
                        },
                    })),
                );

                setEdges(
                    loadedConns.map((c) => {
                        const styleConfig = getEdgeStyleByLabel(c.branch_label);
                        return {
                            id: String(c.id),
                            source: String(c.source_node_id),
                            target: String(c.target_node_id),
                            label: c.branch_label || "",
                            type: "smoothstep",
                            pathOptions: { borderRadius: 15, offset: 20 },
                            animated: false,
                            interactionWidth: 25,
                            deletable: true,
                            labelBgPadding: [8, 4],
                            labelBgBorderRadius: 4,
                            labelBgStyle: {
                                fill: styleConfig.labelBg,
                                stroke: "#000000",
                                strokeWidth: 1.5,
                            },
                            labelStyle: {
                                fill: styleConfig.labelText,
                                fontWeight: 800,
                                fontSize: 10,
                                textTransform: "uppercase",
                            },
                            style: {
                                stroke: styleConfig.stroke,
                                strokeWidth: styleConfig.strokeWidth,
                            },
                        };
                    }),
                );
            } catch (error) {
                if (!ignore) {
                    console.error(`Gagal memuat data Flow #${flowId}:`, error);
                }
            } finally {
                if (!ignore) setIsLoading(false);
            }
        };

        loadFlowData();

        return () => {
            ignore = true;
        };
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
                        d.updatedNodeIds.add(String(change.id));
                    }
                    touched = true;
                } else if (change.type === "remove" && change.id) {
                    const nodeId = String(change.id);
                    if (d.newNodeIds.has(nodeId)) {
                        // Jika temporary, hapus dari list create tanpa masuk list delete BE
                        d.newNodeIds.delete(nodeId);
                    } else if (!isTempId(nodeId)) {
                        // Hanya tambahkan ke list delete jika ID database asli!
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
                !dirtyRef.current.deletedNodeIds.has(String(node.id))
            ) {
                dirtyRef.current.updatedNodeIds.add(String(node.id));
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

            const sourceNode = nodes.find(
                (n) => String(n.id) === String(params.source),
            );
            const isConditionNode =
                (
                    sourceNode?.data?.category ||
                    sourceNode?.data?.type ||
                    ""
                ).toLowerCase() === "condition";

            let branchLabel = "";

            if (isConditionNode) {
                const existingEdgesFromSource = edges.filter(
                    (e) => String(e.source) === String(params.source),
                );
                const usedLabels = existingEdgesFromSource.map((e) =>
                    String(e.label || "")
                        .toLowerCase()
                        .trim(),
                );

                let defaultChoice = "true";
                if (
                    usedLabels.includes("true") &&
                    !usedLabels.includes("false")
                ) {
                    defaultChoice = "false";
                }

                const userInput = window.prompt(
                    "Koneksi dari Condition Node. Tentukan cabang (ketik 'true' atau 'false'):",
                    defaultChoice,
                );

                if (userInput === null) return;
                const formatted = userInput.toLowerCase().trim();
                branchLabel =
                    formatted === "true" || formatted === "false"
                        ? formatted
                        : userInput.trim();
            }

            const styleConfig = getEdgeStyleByLabel(branchLabel);
            const newEdgeId = genTempId("edge");

            const newEdge = {
                id: newEdgeId,
                source: String(params.source),
                target: String(params.target),
                label: branchLabel,
                type: "smoothstep",
                pathOptions: { borderRadius: 15, offset: 20 },
                animated: false,
                interactionWidth: 25,
                deletable: true,
                labelBgPadding: [8, 4],
                labelBgBorderRadius: 4,
                labelBgStyle: {
                    fill: styleConfig.labelBg,
                    stroke: "#000000",
                    strokeWidth: 1.5,
                },
                labelStyle: {
                    fill: styleConfig.labelText,
                    fontWeight: 800,
                    fontSize: 10,
                    textTransform: "uppercase",
                },
                style: {
                    stroke: styleConfig.stroke,
                    strokeWidth: styleConfig.strokeWidth,
                },
            };

            dirtyRef.current.newEdgeIds.add(newEdgeId);
            setEdges((eds) => addEdge(newEdge, eds));
            markDirty();
        },
        [nodes, edges, setEdges, markDirty],
    );

    const updateEdgeLabel = useCallback(
        (edgeId, newLabel) => {
            setEdges((eds) =>
                eds.map((edge) => {
                    if (String(edge.id) !== String(edgeId)) return edge;

                    const styleConfig = getEdgeStyleByLabel(newLabel);
                    return {
                        ...edge,
                        label: newLabel,
                        labelBgStyle: {
                            fill: styleConfig.labelBg,
                            stroke: "#000000",
                            strokeWidth: 1.5,
                        },
                        labelStyle: {
                            fill: styleConfig.labelText,
                            fontWeight: 800,
                            fontSize: 10,
                            textTransform: "uppercase",
                        },
                        style: {
                            ...edge.style,
                            stroke: styleConfig.stroke,
                            strokeWidth: styleConfig.strokeWidth,
                        },
                    };
                }),
            );

            markDirty();
        },
        [setEdges, markDirty],
    );

    // -----------------------------------------------------------------
    // HAPUS EDGE VIA KEYBOARD
    // -----------------------------------------------------------------
    const handleEdgesChange = useCallback(
        (changes) => {
            for (const change of changes) {
                if (change.type === "remove") {
                    const edgeId = String(change.id);
                    const d = dirtyRef.current;
                    if (d.newEdgeIds.has(edgeId)) {
                        d.newEdgeIds.delete(edgeId);
                    } else if (!isTempId(edgeId)) {
                        // Hanya catat ke DB jika ID edge bukan temp
                        d.deletedEdgeIds.add(edgeId);
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
                            strokeWidth: isTraveling
                                ? 4
                                : isCompleted
                                  ? 3
                                  : 2.5,
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
    // TAMBAH NODE VIA KLIK (dari FloatingNodeMenu)
    // -----------------------------------------------------------------
    // Sengaja disamakan persis dengan onDrop di atas (termasuk daftarkan
    // ke dirtyRef.current.newNodeIds + markDirty), supaya node yang
    // ditambahkan lewat klik ikut ke-track dan benar-benar terkirim ke
    // backend saat "Simpan Flow". Sebelumnya FloatingNodeMenu manggil
    // setNodes miliknya sendiri langsung, sehingga node yang ditambah
    // lewat klik TIDAK PERNAH terdaftar dirty -> gagal dikirim ke BE saat
    // save, dan edge yang menyambung ke node itu ikut gagal karena
    // source/target masih berupa temp_node_... yang tidak pernah resolve
    // ke ID asli dari database.
    const addNodeAtPosition = useCallback(
        (nodePayload, position) => {
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
        [setNodes, markDirty],
    );

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
        } else if (!isTempId(targetNodeId)) {
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
                    const edgeId = String(edge.id);
                    if (d.newEdgeIds.has(edgeId)) d.newEdgeIds.delete(edgeId);
                    else if (!isTempId(edgeId)) d.deletedEdgeIds.add(edgeId);
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
        } else if (!isTempId(targetEdgeId)) {
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
    // SIMPAN FLOW (SAVE) - REVISED & FIXED
    // -----------------------------------------------------------------
    const saveFlow = useCallback(async () => {
        if (!flowId || isSaving) return { success: false };
        setIsSaving(true);

        const d = dirtyRef.current;
        const idMap = new Map();
        const errors = [];

        try {
            // 1. TAMBAH NODE BARU TERLEBIH DAHULU
            for (const tempId of Array.from(d.newNodeIds)) {
                const node = nodes.find((n) => String(n.id) === String(tempId));
                if (!node) continue;
                try {
                    const orderIndex =
                        nodes.findIndex(
                            (n) => String(n.id) === String(tempId),
                        ) + 1;
                    const response = await nodeService.createNode(
                        flowId,
                        toNodeApiPayload(node, orderIndex),
                    );
                    const saved = extractData(response);

                    if (saved?.id) {
                        idMap.set(String(tempId), String(saved.id));
                    } else {
                        throw new Error(
                            `Server tidak mengembalikan ID valid untuk node ${tempId}`,
                        );
                    }
                } catch (error) {
                    console.error(`Gagal membuat node ${tempId}:`, error);
                    errors.push({ type: "node-create", tempId, error });
                }
            }

            // 2. UPDATE NODE EKSISTING
            for (const nodeId of Array.from(d.updatedNodeIds)) {
                if (isTempId(nodeId) || d.deletedNodeIds.has(nodeId)) continue;

                const node = nodes.find((n) => String(n.id) === String(nodeId));
                if (!node) continue;
                try {
                    await nodeService.updateNode(
                        nodeId,
                        toNodeApiPayload(node),
                    );
                } catch (error) {
                    console.error(`Gagal update node ${nodeId}:`, error);
                    errors.push({ type: "node-update", nodeId, error });
                }
            }

            // 3. HAPUS NODE DI BE (Hanya yang BUKAN temp_node)
            for (const nodeId of Array.from(d.deletedNodeIds)) {
                if (isTempId(nodeId)) continue;
                try {
                    await nodeService.deleteNode(nodeId);
                } catch (error) {
                    console.error(`Gagal hapus node ${nodeId}:`, error);
                    errors.push({ type: "node-delete", nodeId, error });
                }
            }

            const resolveId = (id) => idMap.get(String(id)) || String(id);

            // 4. BUAT KONEKSI (EDGE) BARU - DENGAN VALIDASI STRICT ID DB
            for (const tempEdgeId of Array.from(d.newEdgeIds)) {
                const edge = edges.find(
                    (e) => String(e.id) === String(tempEdgeId),
                );
                if (!edge) continue;

                const sourceId = resolveId(edge.source);
                const targetId = resolveId(edge.target);

                // CEK KRUSIAL: Cegah pengiriman jika source atau target MASIH berupa temp_node
                if (
                    !sourceId ||
                    !targetId ||
                    isTempId(sourceId) ||
                    isTempId(targetId)
                ) {
                    console.warn(
                        `[FlowEditor] Abort edge creation ${tempEdgeId}: Source/Target belum ter-persist di DB (source=${sourceId}, target=${targetId})`,
                    );
                    errors.push({
                        type: "edge-create",
                        tempEdgeId,
                        error: new Error(
                            `Source or target node ID invalid: source=${sourceId}, target=${targetId}`,
                        ),
                    });
                    continue; // Skip, jangan panggil connectionService.createConnection
                }

                try {
                    const payload = {
                        source_node_id: String(sourceId),
                        target_node_id: String(targetId),
                        branch_label: edge.label || "",
                    };
                    const connResponse =
                        await connectionService.createConnection(
                            flowId,
                            payload,
                        );
                    const savedConn = extractData(connResponse);

                    if (savedConn?.id) {
                        idMap.set(String(tempEdgeId), String(savedConn.id));
                    }
                } catch (error) {
                    console.error(
                        `Gagal membuat connection untuk edge ${tempEdgeId}:`,
                        error,
                    );
                    errors.push({ type: "edge-create", tempEdgeId, error });
                }
            }

            // 5. HAPUS KONEKSI (EDGE) DI BE (Hanya yang BUKAN temp_edge)
            for (const edgeId of Array.from(d.deletedEdgeIds)) {
                if (isTempId(edgeId)) continue;
                try {
                    await connectionService.deleteConnection(edgeId);
                } catch (error) {
                    console.error(`Gagal hapus connection ${edgeId}:`, error);
                    errors.push({ type: "edge-delete", edgeId, error });
                }
            }

            // Remap ID di canvas lokal jika ada ID temp yang sukses terkonversi ke ID DB
            if (idMap.size > 0) {
                setNodes((nds) =>
                    nds.map((n) =>
                        idMap.has(String(n.id))
                            ? { ...n, id: idMap.get(String(n.id)) }
                            : n,
                    ),
                );
                setEdges((eds) =>
                    eds.map((e) => ({
                        ...e,
                        id: idMap.get(String(e.id)) || e.id,
                        source: resolveId(e.source),
                        target: resolveId(e.target),
                    })),
                );
            }

            // Clean up dirty state hanya untuk entitas yang BERSINAR SUKSES
            if (errors.length > 0) {
                console.warn(
                    `Sebagian perubahan gagal disimpan: (${errors.length})`,
                    errors,
                );

                // Hapus item yang sukses dari dirty state agar tidak tersimpan ulang
                errors.forEach((err) => {
                    if (err.type === "node-create")
                        d.newNodeIds.add(err.tempId);
                    if (err.type === "edge-create")
                        d.newEdgeIds.add(err.tempEdgeId);
                });

                return { success: false, errors };
            }

            // Bersihkan semua dirty tracker jika 100% sukses
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
        } catch (globalError) {
            console.error("Critical error inside saveFlow:", globalError);
            return { success: false, error: globalError };
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
        addNodeAtPosition,
        screenToFlowPosition,
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
            updateEdgeLabel,
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
