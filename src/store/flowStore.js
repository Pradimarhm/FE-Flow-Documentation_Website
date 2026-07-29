// src/store/flowStore.js
//
// Sebelumnya file ini adalah Zustand store yang di-persist ke IndexedDB tapi
// TIDAK PERNAH DIPAKAI di komponen manapun (dead code). Sekarang dipakai
// sebagai "draft autosave" untuk canvas:
//
//   - Setiap perubahan node/edge di canvas (drag, connect, edit, hapus)
//     otomatis disimpan ke IndexedDB per flowId, TANPA call API.
//   - Kalau user reload/browser crash sebelum sempat klik "Simpan Flow",
//     draft ini dipakai untuk restore canvas persis seperti terakhir kali,
//     termasuk state mana yang belum ter-sync ke backend.
//   - Setelah "Simpan Flow" berhasil, draft dihapus (state sudah sama
//     dengan backend, ga perlu disimpan lokal lagi).
//
// Ini murni helper async biasa (bukan React state) karena dipakai dari
// dalam useFlowEditor.js sebagai side-effect, bukan sebagai sumber data
// yang dibaca komponen. React Flow tetap pegang source-of-truth render
// lewat useNodesState/useEdgesState seperti biasa.

import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";

const draftKey = (flowId) => `flowDoc:canvas-draft:${flowId}`;

export const canvasDraftStore = {
    /**
     * Simpan snapshot draft canvas untuk satu flow.
     * payload: { nodes, edges, newNodeIds, updatedNodeIds, deletedNodeIds,
     *            newEdgeIds, deletedEdgeIds }
     * (semua id array, bukan Set, biar aman di-JSON-kan)
     */
    async save(flowId, payload) {
        if (!flowId) return;
        try {
            await idbSet(draftKey(flowId), { ...payload, savedAt: Date.now() });
        } catch (error) {
            console.error("Gagal menyimpan draft canvas ke IndexedDB:", error);
        }
    },

    async load(flowId) {
        if (!flowId) return null;
        try {
            return (await idbGet(draftKey(flowId))) || null;
        } catch (error) {
            console.error("Gagal memuat draft canvas dari IndexedDB:", error);
            return null;
        }
    },

    async clear(flowId) {
        if (!flowId) return;
        try {
            await idbDel(draftKey(flowId));
        } catch (error) {
            console.error("Gagal menghapus draft canvas dari IndexedDB:", error);
        }
    },
};