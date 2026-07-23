import { useState, useEffect, useCallback, useRef } from "react";
import {
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
} from "@xyflow/react";
import { nodeService } from "@/services/nodeService";
import { connectionService } from "@/services/connectionService";

export const useFlowEditor = (flowId, setSelectedNode) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [menu, setMenu] = useState(null);
    const [copiedNode, setCopiedNode] = useState(null);
    const reactFlowWrapper = useRef(null);
    const { screenToFlowPosition } = useReactFlow();

    // Helper Unwrapping Data API yang Aman
    const extractData = (res) => res?.data || res;

    // -----------------------------------------------------------------
    // 1. LOAD NODES & CONNECTIONS PARALEL DARI BACKEND
    // -----------------------------------------------------------------
    useEffect(() => {
        if (!flowId) return;

        const loadFlowData = async () => {
            try {
                setIsLoading(true);

                const [nodesRes, connRes] = await Promise.all([
                    nodeService.getNodesByFlow(flowId),
                    connectionService.getConnectionsByFlow(flowId),
                ]);

                const rawNodes = extractData(nodesRes) || [];
                const rawConns = extractData(connRes) || [];

                // Mapping Nodes ke format React Flow
                const formattedNodes = Array.isArray(rawNodes)
                    ? rawNodes.map((item) => ({
                          id: String(item.id),
                          type: "customApi",
                          position: {
                              x: Number(item.position_x) || 0,
                              y: Number(item.position_y) || 0,
                          },
                          data: {
                              label: item.label || "Node Baru",
                              category: item.type || "process",
                              template_id: item.template_id || null,
                              config: item.config || {},
                              description: item.config?.description || "",
                          },
                      }))
                    : [];

                // Mapping Connections/Edges ke format React Flow
                const formattedEdges = Array.isArray(rawConns)
                    ? rawConns.map((conn) => ({
                          id: String(conn.id),
                          source: String(conn.source_node_id),
                          target: String(conn.target_node_id),
                          label: conn.label || "",
                          animated: true,
                          style: { stroke: "#36454F", strokeWidth: 2 },
                      }))
                    : [];

                setNodes(formattedNodes);
                setEdges(formattedEdges);
            } catch (error) {
                console.error(`Gagal memuat data Flow #${flowId}:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        loadFlowData();
    }, [flowId, setNodes, setEdges]);

    // -----------------------------------------------------------------
    // 2. CONNECT EDGES (HUBUNGKAN NODE VIA API)
    // -----------------------------------------------------------------
    const onConnect = useCallback(
        async (params) => {
            if (!flowId || !params.source || !params.target) return;

            const payload = {
                source_node_id: Number(params.source),
                target_node_id: Number(params.target),
                label: "",
            };

            try {
                const response = await connectionService.createConnection(flowId, payload);
                const savedConn = extractData(response);

                const newEdge = {
                    id: String(savedConn.id),
                    source: String(savedConn.source_node_id),
                    target: String(savedConn.target_node_id),
                    label: savedConn.label || "",
                    animated: true,
                    style: { stroke: "#36454F", strokeWidth: 2 },
                };

                setEdges((eds) => addEdge(newEdge, eds));
            } catch (error) {
                console.error("Gagal membuat koneksi antar node:", error);
            }
        },
        [flowId, setEdges]
    );

    // -----------------------------------------------------------------
    // 3. DELETE EDGE (SAAT USER TEKAN BACKSPACE / DELETE DI GARIS)
    // -----------------------------------------------------------------
    const handleEdgesChange = useCallback(
        async (changes) => {
            for (const change of changes) {
                if (change.type === "remove") {
                    try {
                        await connectionService.deleteConnection(change.id);
                    } catch (error) {
                        console.error(`Gagal menghapus koneksi #${change.id}:`, error);
                    }
                }
            }
            onEdgesChange(changes);
        },
        [onEdgesChange]
    );

    // -----------------------------------------------------------------
    // 4. DROP NODE (CREATE VIA API)
    // -----------------------------------------------------------------
    const onDrop = useCallback(
        async (event) => {
            event.preventDefault();
            console.log("1. 🎯 DROP EVENT TERCETUS!");

            const nodeDataRaw = event.dataTransfer.getData("application/reactflow/nodeData");
            console.log("2. 📦 Data Raw dari DragStart:", nodeDataRaw);

            if (!nodeDataRaw) {
                console.error("❌ ERROR: Data drag kosong/undefined! Cek floatingNodeMenu.");
                return;
            }

            if (!flowId) {
                console.error("❌ ERROR: flowId tidak ditemukan! Cek URL / params.");
                return;
            }

            let nodeTemplate;
            try {
                nodeTemplate = JSON.parse(nodeDataRaw);
            } catch (err) {
                console.error("❌ ERROR: Gagal Parse JSON:", err);
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            console.log("3. 📍 Posisi Drop Terkalkulasi:", position);

            const category = (nodeTemplate.category || nodeTemplate.type || "process").toLowerCase();

            const payload = {
                template_id: nodeTemplate.template_id || null,
                type: category,
                label: nodeTemplate.label || "New Node",
                position_x: Math.round(position.x) || 100,
                position_y: Math.round(position.y) || 100,
                config: nodeTemplate.config || {},
            };

            console.log("4. 🚀 Mengirim Payload ke Backend:", payload);

            try {
                const response = await nodeService.createNode(flowId, payload);
                console.log("5. ✅ Respon Mentah Backend:", response);

                const savedNode = extractData(response);
                console.log("6. ✨ Data Node Ter-unwrap:", savedNode);

                if (!savedNode || !savedNode.id) {
                    console.error("❌ ERROR: Backend tidak mengembalikan ID node baru!", savedNode);
                    return;
                }

                const newNode = {
                    id: String(savedNode.id),
                    type: "customApi",
                    position: {
                        x: Number(savedNode.position_x) || 100,
                        y: Number(savedNode.position_y) || 100,
                    },
                    data: {
                        label: savedNode.label || payload.label,
                        category: savedNode.type || payload.type,
                        template_id: savedNode.template_id || null,
                        config: savedNode.config || {},
                        description: savedNode.config?.description || "",
                    },
                };

                console.log("7. 🎉 Menambahkan Node ke Canvas UI:", newNode);
                setNodes((nds) => nds.concat(newNode));
            } catch (error) {
                console.error("❌ ERROR API: Gagal createNode di backend:", error?.response?.data || error);
            }
        },
        [flowId, screenToFlowPosition, setNodes]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    // -----------------------------------------------------------------
    // 5. CONTEXT MENU & NODE ACTIONS
    // -----------------------------------------------------------------
    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        setMenu({
            type: "node",
            nodeId: node.id,
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

    const deleteNode = useCallback(async () => {
        const targetNodeId = menu?.nodeId;
        if (!targetNodeId) return;

        try {
            await nodeService.deleteNode(targetNodeId);

            setNodes((nds) => nds.filter((node) => node.id !== targetNodeId));
            setEdges((eds) =>
                eds.filter(
                    (edge) =>
                        edge.source !== targetNodeId && edge.target !== targetNodeId
                )
            );

            if (setSelectedNode) {
                setSelectedNode((prev) => (prev?.id === targetNodeId ? null : prev));
            }
        } catch (error) {
            console.error("Gagal menghapus node dari DB:", error);
        } finally {
            setMenu(null);
        }
    }, [menu, setNodes, setEdges, setSelectedNode]);

    const copyNode = useCallback(() => {
        if (!menu?.nodeId) return;
        const nodeToCopy = nodes.find((n) => n.id === menu.nodeId);
        if (nodeToCopy) setCopiedNode(nodeToCopy);
        setMenu(null);
    }, [menu, nodes]);

    const duplicateNode = useCallback(async () => {
        if (!menu?.nodeId || !flowId) return;
        const targetNode = nodes.find((n) => n.id === menu.nodeId);
        if (!targetNode) return;

        const payload = {
            template_id: targetNode.data.template_id || null, // Dinamis, bukan di-hardcode 1
            type: targetNode.data.category || "process",
            label: `${targetNode.data.label} (Copy)`,
            position_x: targetNode.position.x + 30,
            position_y: targetNode.position.y + 30,
            config: targetNode.data.config || {},
        };

        try {
            const response = await nodeService.createNode(flowId, payload);
            const savedNode = extractData(response);

            setNodes((nds) =>
                nds.concat({
                    id: String(savedNode.id),
                    type: "customApi",
                    position: {
                        x: Number(savedNode.position_x),
                        y: Number(savedNode.position_y),
                    },
                    data: {
                        label: savedNode.label,
                        category: savedNode.type,
                        template_id: savedNode.template_id || null,
                        config: savedNode.config || {},
                        description: savedNode.config?.description || "",
                    },
                })
            );
        } catch (error) {
            console.error("Gagal mengkloning node:", error);
        } finally {
            setMenu(null);
        }
    }, [menu, flowId, nodes, setNodes]);

    const pasteNode = useCallback(async () => {
        if (!copiedNode || !flowId) return;

        const payload = {
            template_id: copiedNode.data.template_id || null, // Dinamis
            type: copiedNode.data.category || "process",
            label: `${copiedNode.data.label} (Paste)`,
            position_x: copiedNode.position.x + 50,
            position_y: copiedNode.position.y + 50,
            config: copiedNode.data.config || {},
        };

        try {
            const response = await nodeService.createNode(flowId, payload);
            const savedNode = extractData(response);

            setNodes((nds) =>
                nds.concat({
                    id: String(savedNode.id),
                    type: "customApi",
                    position: {
                        x: Number(savedNode.position_x),
                        y: Number(savedNode.position_y),
                    },
                    data: {
                        label: savedNode.label,
                        category: savedNode.type,
                        template_id: savedNode.template_id || null,
                        config: savedNode.config || {},
                        description: savedNode.config?.description || "",
                    },
                })
            );
        } catch (error) {
            console.error("Gagal mentransfer node hasil paste:", error);
        } finally {
            setMenu(null);
        }
    }, [copiedNode, flowId, setNodes]);

    // useFlowEditor.js
    const fetchNodesAndEdges = async () => {
        try {
            setLoading(true);
            // Panggil service
            const response = await flowService.getFlowNodes(flowId);
            
            // Handling fleksibel: kalau response berbentuk { data: [...] } atau array langsung
            const nodesData = response?.data || response || [];
            
            if (Array.isArray(nodesData)) {
                setNodes(nodesData);
            } else {
                // Jika backend me-return object error dari JSON response
                console.warn("Backend me-return non-array node:", response);
                setNodes([]); // Set default array kosong agar canvas tetap aman
            }
        } catch (err) {
            console.error(`Gagal memuat data Flow #${flowId}:`, err?.response?.data || err.message);
            setNodes([]); // Fallback biar gak ngerusak React Flow instance
        } finally {
            setLoading(false);
        }
    };

    return {
        nodes,
        edges,
        isLoading,
        onNodesChange,
        onEdgesChange: handleEdgesChange,
        onConnect,
        onDrop,
        onDragOver,
        menu,
        copiedNode,
        reactFlowWrapper,
        onNodeContextMenu,
        onPaneContextMenu,
        actions: {
            deleteNode,
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