
import { create } from "zustand";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";

const draftKey = (flowId) => `flowDoc:canvas-draft:${flowId}`;

export const useFlowStore = create((set, get) => ({
    // State lokal per flow yang sedang aktif
    activeFlowId: null,
    draftData: null,
    isSavingDraft: false,

    /**
     * Sanitasi internal agar format data selalu konsisten dengan kontrak Laravel BE
     */
    _sanitizeNodes: (nodes = []) => {
        return nodes.map((node) => {
            const cfg = node.data?.config || {};
            return {
                ...node,
                data: {
                    ...node.data,
                    // Wajib pertahankan order_index untuk syarat validation PUT /nodes/{id}
                    order_index: node.data?.order_index ?? 1,
                    config: {
                        // Paksa konsisten ke snake_case murni
                        input_params: cfg.input_params ?? cfg.inputParams ?? {},
                        validation_rules: cfg.validation_rules ?? cfg.validationRules ?? "",
                        process_logic: cfg.process_logic ?? cfg.processLogic ?? "",
                        condition_expression: cfg.condition_expression ?? cfg.conditionExpression ?? "",
                        output_template: cfg.output_template ?? cfg.outputTemplate ?? {},
                    },
                },
            };
        });
    },

    /**
     * Simpan snapshot draft canvas untuk satu flow ke Memory Zustand & IndexedDB
     */
    saveDraft: async (flowId, payload) => {
        if (!flowId) return;
        set({ isSavingDraft: true });

        try {
            const sanitizedNodes = get()._sanitizeNodes(payload.nodes || []);
            const sanitizedPayload = {
                ...payload,
                nodes: sanitizedNodes,
                savedAt: Date.now(),
            };

            // 1. Simpan ke React State (Zustand Memory)
            set({
                activeFlowId: flowId,
                draftData: sanitizedPayload,
            });

            // 2. Persist ke IndexedDB di background
            await idbSet(draftKey(flowId), sanitizedPayload);
        } catch (error) {
            console.error("Gagal menyimpan draft canvas ke IndexedDB:", error);
        } finally {
            set({ isSavingDraft: false });
        }
    },

    /**
     * Muat draft canvas dari Memory Zustand / IndexedDB
     */
    loadDraft: async (flowId) => {
        if (!flowId) return null;

        // Jika sudah ada di memory Zustand dan match ID-nya, pakai yang di memory
        const currentMemory = get().draftData;
        if (get().activeFlowId === flowId && currentMemory) {
            return currentMemory;
        }

        try {
            const cached = await idbGet(draftKey(flowId));
            if (cached) {
                set({ activeFlowId: flowId, draftData: cached });
                return cached;
            }
            return null;
        } catch (error) {
            console.error("Gagal memuat draft canvas dari IndexedDB:", error);
            return null;
        }
    },

    /**
     * Hapus draft canvas setelah berhasil "Simpan Flow" ke backend
     */
    clearDraft: async (flowId) => {
        if (!flowId) return;
        try {
            await idbDel(draftKey(flowId));
            if (get().activeFlowId === flowId) {
                set({ activeFlowId: null, draftData: null });
            }
        } catch (error) {
            console.error("Gagal menghapus draft canvas dari IndexedDB:", error);
        }
    },
}));

// Backward Compatibility Wrapper untuk useFlowEditor.js (agar tidak breaking change)
export const canvasDraftStore = {
    save: (flowId, payload) => useFlowStore.getState().saveDraft(flowId, payload),
    load: (flowId) => useFlowStore.getState().loadDraft(flowId),
    clear: (flowId) => useFlowStore.getState().clearDraft(flowId),
};