import { useCallback, useState, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
// import { type } from 'node:os';

const initialNodes = [];
const initialEdges = [];
let id = 2; 
const getId = () => `${id++}`;

export function useFlowEditor(setSelectedNode) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow(); 
    
    const reactFlowWrapper = useRef(null);
    const [menu, setMenu] = useState(null);
    const [copiedNode, setCopiedNode] = useState(null);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ 
            ...params, 
            animated: false, 
            type: 'step',
            style: { 
                stroke: '#474739', 
                strokeWidth: 2,    
            } 
        }, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow/type');
            const label = event.dataTransfer.getData('application/reactflow/label');

            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type: 'customApi', 
                position,
                data: { 
                    label: label,
                    category: type, 
                    method: type === 'trigger' ? 'POST' : null 
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes]
    );

    // --- LOGIKA KLIK KANAN BARU ---

    // 1. Klik Kanan di Node
    const onNodeContextMenu = useCallback(
        (event, node) => {
            event.preventDefault();
            const bounds = reactFlowWrapper.current.getBoundingClientRect();
            setMenu({
                type: 'node',
                id: node.id,
                top: event.clientY - bounds.top,
                left: event.clientX - bounds.left,
                mouseX: event.clientX, // Simpan kordinat mouse asli
                mouseY: event.clientY,
                node: node,
            });
        },
        []
    );

    // 2. Klik Kanan di Area Kosong (Canvas/Pane)
    const onPaneContextMenu = useCallback(
        (event) => {
            event.preventDefault();
            const bounds = reactFlowWrapper.current.getBoundingClientRect();
            setMenu({
                type: 'pane', // Penanda bahwa ini klik di kanvas
                id: 'pane',
                top: event.clientY - bounds.top,
                left: event.clientX - bounds.left,
                mouseX: event.clientX,
                mouseY: event.clientY,
                node: null,
            });
            setSelectedNode(null); // Deselect node jika ada
        },
        [setSelectedNode]
    );

    const actions = {
        deleteNode: useCallback(() => {
            if (menu?.type !== 'node') return;
            setNodes((nds) => nds.filter((n) => n.id !== menu.id));
            setEdges((eds) => eds.filter((e) => e.source !== menu.id && e.target !== menu.id));
            setMenu(null);
            setSelectedNode(null); 
        }, [menu, setNodes, setEdges, setSelectedNode]),

        duplicateNode: useCallback(() => {
            if (menu?.type !== 'node' || !menu?.node) return;
            const newNode = {
                ...menu.node,
                id: getId(),
                position: { x: menu.node.position.x + 50, y: menu.node.position.y + 50 },
                selected: false,
            };
            setNodes((nds) => nds.concat(newNode));
            setMenu(null);
        }, [menu, setNodes]),

        copyNode: useCallback(() => {
            if (menu?.type !== 'node') return;
            setCopiedNode(menu.node);
            setMenu(null);
        }, [menu]),

        pasteNode: useCallback(() => {
            if (!copiedNode || !menu) return;
            
            // Kalkulasi posisi paste pintar:
            // Jika paste via klik kanan di kanvas -> gunakan posisi mouse
            // Jika paste via klik kanan di node lain -> offset dari node tersebut
            const pastePosition = menu.type === 'pane' 
                ? screenToFlowPosition({ x: menu.mouseX, y: menu.mouseY })
                : { x: menu.node.position.x + 50, y: menu.node.position.y + 100 };

            const newNode = {
                ...copiedNode,
                id: getId(),
                position: pastePosition,
                selected: false,
            };
            setNodes((nds) => nds.concat(newNode));
            setMenu(null);
        }, [copiedNode, menu, setNodes, screenToFlowPosition])
    };

    const interactions = {
        onNodeClick: useCallback((event, node) => {
            setMenu(null);
            setSelectedNode(node); 
        }, [setSelectedNode]),

        onPaneClick: useCallback(() => {
            setMenu(null);
            setSelectedNode(null); 
        }, [setSelectedNode]),

        onMoveStart: useCallback(() => {
            setMenu(null);
        }, [])
    };

    return {
        nodes, edges, onNodesChange, onEdgesChange,
        onConnect, onDrop, onDragOver,
        menu, copiedNode, reactFlowWrapper,
        onNodeContextMenu, onPaneContextMenu, // Expose fungsi baru
        actions, interactions
    };
}