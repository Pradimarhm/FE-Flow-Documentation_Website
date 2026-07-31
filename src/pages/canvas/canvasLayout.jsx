import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import {
    Rocket,
    Save,
    PanelBottomOpen,
    PanelTopOpen,
    ArrowLeft,
    Loader2,
} from "lucide-react";

import FlowCanvas from "./flowCanvas";
import RightSidebar from "./rightSidebar";
import ExecutionLog from "./executionLog";
import { flowService } from "@/services/flowService";

export default function CanvasLayout() {
    const { flowId } = useParams();
    const [flowDetail, setFlowDetail] = useState(null);
    const [isFlowLoading, setIsFlowLoading] = useState(true);
    const [isBottomOpen, setIsBottomOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [executionStatus, setExecutionStatus] = useState({});
    // Edge yang SEDANG dilewati "token" eksekusi (animasi bergerak)
    const [activeEdgeIds, setActiveEdgeIds] = useState(new Set());
    // Edge yang SUDAH dilewati sebelumnya (jejak jalur, statis)
    const [completedEdgeIds, setCompletedEdgeIds] = useState(new Set());

    // Dipakai untuk membatalkan animasi replay yang sedang berjalan kalau
    // user klik "Run Simulation" lagi sebelum animasi sebelumnya selesai.
    const animationTokenRef = useRef(0);

    const [editorApi, setEditorApi] = useState({
        isDirty: false,
        isSaving: false,
        lastSavedAt: null,
        saveFlow: async () => {},
        markNodeDirty: () => {},
        getEdges: () => [],
        getNodes: () => [],
    });

    const handleEditorReady = useCallback((api) => {
        setEditorApi(api);
    }, []);

    useEffect(() => {
        const fetchFlowDetail = async () => {
            if (!flowId) return;
            try {
                setIsFlowLoading(true);
                const res = await flowService.getFlowById(flowId);
                setFlowDetail(res?.data || res);
            } catch (error) {
                console.error(`Gagal mengambil detail Flow #${flowId}:`, error);
            } finally {
                setIsFlowLoading(false);
            }
        };
        fetchFlowDetail();
    }, [flowId]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!editorApi.isDirty) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [editorApi.isDirty]);

    // Matikan animasi yang sedang berjalan kalau komponen unmount
    useEffect(() => {
        return () => {
            animationTokenRef.current += 1;
        };
    }, []);

    const handleSaveFlow = async () => {
        const result = await editorApi.saveFlow();
        if (result?.errors) {
            console.warn("Sebagian perubahan gagal disimpan:", result.errors);
        }
    };

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const formatTime = (dateLike) => {
        const d = dateLike ? new Date(dateLike) : new Date();
        return d.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const pushLog = (entry) => {
        setLogs((prev) => [...prev, entry]);
    };

    // -----------------------------------------------------------------
    // SIMULASI EKSEKUSI LOKAL (FALLBACK)
    // -----------------------------------------------------------------
    // Backend ternyata cuma MENYIMPAN data yang dikirim, tidak benar-benar
    // menelusuri graph node satu-satu (`node_executions` bisa kosong, atau
    // isinya tidak match dengan node yang ada di canvas). Supaya animasi
    // "node mana yang sedang jalan" tetap bisa ditunjukkan ke user, FE
    // menelusuri graph-nya SENDIRI:
    //   1. Cari node awal (kategori "start", atau node tanpa edge masuk).
    //   2. Urutkan node lain via topological sort (Kahn's algorithm)
    //      mengikuti arah edge -> node yang dependensinya belum "selesai"
    //      belum boleh dieksekusi duluan.
    //   3. Hasilnya dibentuk PERSIS seperti shape `node_executions` dari
    //      backend, supaya bisa langsung dipakai ulang oleh
    //      `animateExecution()` tanpa perlu fungsi animasi terpisah.
    const buildLocalExecutions = (nodesSnapshot, edgesSnapshot) => {
        const indegree = new Map();
        const outgoing = new Map();

        nodesSnapshot.forEach((n) => {
            indegree.set(n.id, 0);
            outgoing.set(n.id, []);
        });

        edgesSnapshot.forEach((e) => {
            if (!outgoing.has(e.source)) outgoing.set(e.source, []);
            if (!indegree.has(e.target)) indegree.set(e.target, 0);
            outgoing.get(e.source).push(e);
            indegree.set(e.target, (indegree.get(e.target) || 0) + 1);
        });

        const initialQueue = nodesSnapshot
            .filter((n) => (indegree.get(n.id) || 0) === 0)
            .sort((a, b) => {
                const aIsStart = a.data?.category === "start" ? -1 : 0;
                const bIsStart = b.data?.category === "start" ? -1 : 0;
                if (aIsStart !== bIsStart) return aIsStart - bIsStart;
                return (a.position?.y ?? 0) - (b.position?.y ?? 0);
            });

        const remainingIndegree = new Map(indegree);
        const visited = new Set();
        const order = [];
        const queue = [...initialQueue];

        while (queue.length > 0) {
            const node = queue.shift();
            if (visited.has(node.id)) continue;
            visited.add(node.id);
            order.push(node);

            const category = (
                node.data?.category ||
                node.data?.type ||
                ""
            ).toLowerCase();
            let edgesToFollow = outgoing.get(node.id) || [];

            // -------------------------------------------------------------
            // LOGIKA BARU: FILTER KHUSUS NODE CONDITION
            // -------------------------------------------------------------
            if (category === "condition" && edgesToFollow.length > 0) {
                // Cari edge yang label-nya 'true'
                const trueEdge = edgesToFollow.find(
                    (e) =>
                        String(e.label || "")
                            .toLowerCase()
                            .trim() === "true",
                );

                if (trueEdge) {
                    // Jika ketemu cabang true, HANYA lewati jalur true!
                    edgesToFollow = [trueEdge];
                } else {
                    // Fallback: Jika user belum set label 'true' di edge manapun,
                    // ambil edge pertama saja agar tidak jalan dua-duanya.
                    edgesToFollow = [edgesToFollow[0]];
                }
            }

            for (const edge of edgesToFollow) {
                const targetId = edge.target;
                const remaining = (remainingIndegree.get(targetId) || 0) - 1;
                remainingIndegree.set(targetId, remaining);
                if (remaining <= 0 && !visited.has(targetId)) {
                    const targetNode = nodesSnapshot.find(
                        (n) => n.id === targetId,
                    );
                    if (targetNode) queue.push(targetNode);
                }
            }
        }

        // CATATAN: Bagian loop di bawah ini (node terputus/unvisited) DIBUANG
        // agar node di cabang "false" BENAR-BENAR MATI (tidak diikutkan dianimasikan).

        const baseTime = Date.now();
        return order.map((node, idx) => ({
            id: `local-${node.id}`,
            flow_node_id: node.id,
            node_label: node.data?.label || node.id,
            node_type: node.data?.category || node.data?.type || "process",
            status: "success",
            input_data: node.data?.config || {},
            executed_at: new Date(baseTime + idx * 1000).toISOString(),
        }));
    };

    // -----------------------------------------------------------------
    // ANIMASI EKSEKUSI (gaya n8n)
    // -----------------------------------------------------------------
    // Backend menjalankan simulasi SECARA SINKRON: satu request POST
    // langsung mengembalikan seluruh `node_executions` yang sudah selesai
    // (lihat url_flow.docx — tidak ada status transisi pending -> running
    // yang bisa di-polling, hasilnya sudah final saat response diterima).
    //
    // Supaya tetap terasa "hidup" seperti n8n (node menyala satu-satu,
    // garis edge mengalir mengikuti urutan eksekusi), animasi ini di-REPLAY
    // di frontend: node & edge di-highlight satu per satu sesuai urutan
    // `node_executions`, dengan jeda buatan di antaranya.
    const animateExecution = useCallback(async (simData, edgesSnapshot) => {
        const myToken = ++animationTokenRef.current;

        const rawExecutions =
            simData?.node_executions ||
            simData?.data?.node_executions ||
            simData?.executions ||
            [];

        const executions = [...rawExecutions].sort((a, b) => {
            const ta = a.executed_at ? new Date(a.executed_at).getTime() : 0;
            const tb = b.executed_at ? new Date(b.executed_at).getTime() : 0;
            return ta - tb;
        });

        if (executions.length === 0) {
            pushLog({
                id: `empty-${Date.now()}`,
                time: formatTime(),
                runId: simData?.id,
                node: "System",
                type: "Info",
                status: "FAILED",
                message:
                    "Flow ini belum punya node, tidak ada yang dieksekusi.",
                duration: null,
                data: null,
            });
            setIsRunning(false);
            return;
        }

        const STEP_DELAY_MS = 1500;
        let prevNodeId = null;
        let prevExecutedAt = null;

        for (const exec of executions) {
            // Kalau ada run baru yang dimulai (token berubah) atau komponen
            // unmount, hentikan animasi lama supaya tidak tabrakan.
            if (animationTokenRef.current !== myToken) return;

            const nodeId = String(exec.flow_node_id);
            const status = (exec.status || "success").toLowerCase();

            // Edge yang menuju node ini (kalau ada node sebelumnya)
            const incomingEdge = prevNodeId
                ? edgesSnapshot.find(
                      (e) =>
                          String(e.source) === prevNodeId &&
                          String(e.target) === nodeId,
                  )
                : null;

            // 1) Tandai node ini "running" + edge menuju kesini "traveling"
            setExecutionStatus((prev) => ({ ...prev, [nodeId]: "running" }));
            // if (incomingEdge) {
            //     setActiveEdgeIds(new Set([incomingEdge.id]));
            // }

            // 1) Set active edge
            if (incomingEdge) {
                setActiveEdgeIds(new Set([incomingEdge.id])); // Ini membuang activeEdge sebelumnya, OK
            }

            pushLog({
                id: `${exec.id ?? nodeId}-running`,
                time: formatTime(exec.executed_at),
                runId: simData?.id,
                node: exec.node_label || nodeId,
                type: exec.node_type || "-",
                status: "RUNNING",
                message: "Menjalankan node...",
                duration: null,
                data: exec.input_data ?? null,
            });

            await sleep(STEP_DELAY_MS);
            if (animationTokenRef.current !== myToken) return;

            // 2) Node selesai -> tandai status final (success/failed), edge
            //    yang baru dilewati pindah dari "traveling" ke "completed"
            setExecutionStatus((prev) => ({ ...prev, [nodeId]: status }));
            if (incomingEdge) {
                setActiveEdgeIds(new Set());
                setCompletedEdgeIds((prev) =>
                    new Set(prev).add(incomingEdge.id),
                );
            }

            const durationMs =
                prevExecutedAt && exec.executed_at
                    ? Math.max(
                          0,
                          new Date(exec.executed_at).getTime() -
                              new Date(prevExecutedAt).getTime(),
                      )
                    : null;

            pushLog({
                id: exec.id ?? `${nodeId}-${exec.executed_at}`,
                time: formatTime(exec.executed_at),
                runId: simData?.id,
                node: exec.node_label || nodeId,
                type: exec.node_type || "-",
                status: status.toUpperCase(),
                message:
                    status === "failed"
                        ? "Node gagal dieksekusi."
                        : "Node berhasil dieksekusi.",
                duration: durationMs,
                data: exec.input_data ?? null,
            });

            // n8n menghentikan propagasi visual kalau satu node gagal
            if (status === "failed") break;

            prevNodeId = nodeId;
            prevExecutedAt = exec.executed_at;
        }

        if (animationTokenRef.current === myToken) {
            setIsRunning(false);
        }
    }, []);

    const handleRunSimulation = async () => {
        if (editorApi.isDirty) {
            const proceed = window.confirm(
                "Masih ada perubahan yang belum disimpan. Simpan flow dulu sebelum menjalankan simulasi?",
            );
            if (proceed) {
                await handleSaveFlow();
            } else {
                return;
            }
        }

        // Batalkan animasi run sebelumnya (kalau ada) & reset canvas
        animationTokenRef.current += 1;
        setIsRunning(true);
        setIsBottomOpen(true);
        setLogs([]);
        setExecutionStatus({});
        setActiveEdgeIds(new Set());
        setCompletedEdgeIds(new Set());

        const nodesSnapshot = editorApi.getNodes ? editorApi.getNodes() : [];
        const edgesSnapshot = editorApi.getEdges ? editorApi.getEdges() : [];

        // DEBUG SEMENTARA: kalau nodesSnapshot kosong padahal canvas keliatan
        // ada node, cek 2 baris ini di console -- kalau "getNodes tersedia?"
        // FALSE, berarti FlowCanvas.jsx yang aktif belum versi yang expose
        // getNodes lewat onEditorReady (file-nya belum ke-update). Hapus
        // log ini setelah dipastikan beres.
        console.log("[CanvasLayout] Run Simulation diklik ->", {
            "getNodes tersedia?": typeof editorApi.getNodes === "function",
            "getEdges tersedia?": typeof editorApi.getEdges === "function",
            "jumlah node terbaca": nodesSnapshot.length,
            "jumlah edge terbaca": edgesSnapshot.length,
        });

        if (nodesSnapshot.length === 0) {
            const getNodesMissing = typeof editorApi.getNodes !== "function";
            pushLog({
                id: `empty-${Date.now()}`,
                time: formatTime(),
                node: "System",
                type: "Info",
                status: "FAILED",
                message: getNodesMissing
                    ? "editorApi.getNodes belum tersedia — kemungkinan FlowCanvas.jsx yang aktif belum versi terbaru (belum expose getNodes lewat onEditorReady). Cek console untuk detail."
                    : "Flow ini belum punya node, tidak ada yang bisa disimulasikan.",
                duration: null,
                data: null,
            });
            setIsRunning(false);
            return;
        }

        // Tetap coba panggil backend dulu (buat catatan riwayat simulasi di
        // DB), tapi TIDAK menggantungkan animasi ke sana kalau ternyata
        // backend tidak benar-benar memprosesnya.
        let fullSimData = {};
        try {
            const res = await flowService.runSimulation(flowId, {
                employee_id: 12,
            });
            const simData = res?.data || res || {};

            const simId = simData?.id ?? simData?.simulation_id ?? null;
            const hasExecutionsFromCreate =
                Array.isArray(simData?.node_executions) &&
                simData.node_executions.length > 0;

            fullSimData = simData;
            if (!hasExecutionsFromCreate && simId) {
                const detail = await flowService.getSimulationById(simId);
                fullSimData = detail?.data || detail || simData;
            }
        } catch (err) {
            // Backend gagal / belum siap -> tetap lanjut, nanti fallback ke
            // simulasi lokal di bawah.
            console.warn(
                "⚠️ Backend simulasi gagal dipanggil, pakai simulasi lokal:",
                err,
            );
            fullSimData = {};
        }

        // Backend dianggap "beneran mengeksekusi node" hanya kalau
        // node_executions-nya ADA dan flow_node_id di dalamnya benar-benar
        // cocok dengan node yang ada di canvas ini. Kalau backend cuma
        // menyimpan data tanpa memproses graph-nya (node_executions kosong,
        // atau isinya tidak nyambung ke node manapun), FE akan menelusuri
        // graph-nya sendiri lewat buildLocalExecutions().
        const backendExecutions = Array.isArray(fullSimData?.node_executions)
            ? fullSimData.node_executions
            : [];
        const hasRealExecutions = backendExecutions.some((exec) =>
            nodesSnapshot.some(
                (n) => String(n.id) === String(exec.flow_node_id),
            ),
        );

        let executionSource = fullSimData;
        if (!hasRealExecutions) {
            executionSource = {
                ...fullSimData,
                node_executions: buildLocalExecutions(
                    nodesSnapshot,
                    edgesSnapshot,
                ),
            };
            pushLog({
                id: `notice-${Date.now()}`,
                time: formatTime(),
                runId: fullSimData?.id,
                node: "System",
                type: "Info",
                status: "PENDING",
                message:
                    "Backend belum mengembalikan hasil eksekusi per-node yang valid — menjalankan simulasi visual berdasarkan urutan node di canvas (Start → ... → End).",
                duration: null,
                data: null,
            });
        }

        await animateExecution(executionSource, edgesSnapshot);
    };

    return (
        <ReactFlowProvider>
            <div className="w-full h-full flex flex-col bg-olive-100 overflow-hidden">
                {/* Header */}
                <div className="flex flex-row p-2 gap-4 justify-between items-center border-b-2 border-olive-900 bg-olive-50 z-20">
                    <div className="flex flex-row gap-4 items-center">
                        <Link
                            to="/flows"
                            className="flex items-center gap-2 p-2 hover:bg-olive-200 border border-transparent hover:border-black"
                        >
                            <ArrowLeft size={18} />
                            <p className="text-xs font-bold text-olive-900">
                                Kembali
                            </p>
                        </Link>
                        <span className="w-px h-8 bg-olive-400"></span>
                        {isFlowLoading ? (
                            <div className="flex items-center gap-2 text-olive-600">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-xs font-semibold">
                                    Memuat info flow...
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div>
                                    <h2 className="font-semibold text-lg text-olive-900 leading-tight uppercase">
                                        {flowDetail?.name || `Flow #${flowId}`}
                                    </h2>
                                </div>
                                <span
                                    className={`text-[10px] font-black px-2 py-0.5 border border-black uppercase ${
                                        flowDetail?.status === "active"
                                            ? "bg-green-300"
                                            : "bg-amber-200"
                                    }`}
                                >
                                    {flowDetail?.status || "draft"}
                                </span>
                                {editorApi.isDirty && (
                                    <span className="text-[10px] font-black px-2 py-0.5 border border-amber-700 text-amber-800 bg-amber-100 uppercase animate-pulse">
                                        Ada perubahan belum disimpan
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSaveFlow}
                            disabled={editorApi.isSaving || !editorApi.isDirty}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-olive-900 bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-olive-100 active:translate-y-1 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editorApi.isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Simpan Flow
                        </button>
                        <button
                            type="button"
                            onClick={handleRunSimulation}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-green-600 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-green-500 active:translate-y-1 active:shadow-none cursor-pointer disabled:opacity-50"
                        >
                            {isRunning ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Rocket size={16} />
                            )}
                            Run Simulation
                        </button>
                    </div>
                </div>

                {/* Workspace */}
                <div className="flex-1 flex h-full relative overflow-hidden">
                    <div className="flex-1 h-full relative">
                        <FlowCanvas
                            flowId={flowId}
                            setSelectedNode={setSelectedNode}
                            onEditorReady={handleEditorReady}
                            executionStatus={executionStatus}
                            activeEdgeIds={activeEdgeIds}
                            completedEdgeIds={completedEdgeIds}
                        />
                    </div>
                    {selectedNode && (
                        <div className="w-80 h-full border-l-2 border-olive-900 bg-white z-10 flex flex-col">
                            <RightSidebar
                                flowId={flowId}
                                selectedNode={selectedNode}
                                setSelectedNode={setSelectedNode}
                                onNodeDataChange={editorApi.markNodeDirty}
                            />
                        </div>
                    )}
                </div>

                {/* Logs Drawer */}
                <div
                    className={`w-full border-t-2 border-olive-900 bg-white transition-all duration-300 flex flex-col ${
                        isBottomOpen ? "h-64" : "h-10"
                    }`}
                >
                    <div className="flex justify-between items-center p-2 bg-olive-200 border-b border-olive-900 shrink-0">
                        <div className="pl-2 text-xs font-black text-olive-900 uppercase tracking-wider flex items-center gap-2">
                            <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                    isRunning
                                        ? "bg-amber-500 animate-pulse"
                                        : "bg-green-500"
                                }`}
                            ></span>
                            Execution Logs
                            {isRunning && (
                                <span className="text-amber-600 font-bold text-[10px]">
                                    (Running...)
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsBottomOpen(!isBottomOpen)}
                            className="p-1 hover:bg-olive-300 cursor-pointer"
                        >
                            {isBottomOpen ? (
                                <PanelTopOpen size={20} />
                            ) : (
                                <PanelBottomOpen size={20} />
                            )}
                        </button>
                    </div>
                    {isBottomOpen && (
                        <div className="flex-1 overflow-hidden">
                            <ExecutionLog logs={logs} />
                        </div>
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
}
