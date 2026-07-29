// src/store/templateStore.js
//
// Cache untuk node_templates (GET /templates).
// Tujuan: floating menu (dan halaman lain yang butuh daftar template) TIDAK
// perlu call API setiap kali di-mount. Data disimpan di memory (Zustand) +
// IndexedDB (idb-keyval, pola yang sama dengan flowStore.js) supaya:
//   1. Antar mount komponen dalam sesi yang sama -> cukup 1x fetch.
//   2. Reload browser -> menu langsung tampil dari cache sambil di-refresh
//      di background (stale-while-revalidate), tidak nge-blank/loading lama.
//
// Pemakaian di komponen:
//   const templates = useTemplateStore((s) => s.templates);
//   const isLoading = useTemplateStore((s) => s.isLoading && s.templates.length === 0);
//   const fetchTemplates = useTemplateStore((s) => s.fetchTemplates);
//   useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

import { create } from "zustand";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { templateService } from "@/services/templateService";

const CACHE_KEY = "flowdoc:templates:cache";
const TTL_MS = 5 * 60 * 1000; // anggap "segar" selama 5 menit

// single-flight guard: kalau ada beberapa komponen manggil fetchTemplates()
// bersamaan, cukup 1 request yang jalan ke backend.
let inFlightFetch = null;

export const useTemplateStore = create((set, get) => ({
    templates: [],
    isLoading: false,
    error: null,
    fetchedAt: null,
    hasHydratedCache: false,

    // Ambil cache dari IndexedDB (dipanggil sekali saat app/menu pertama kali render)
    hydrateFromCache: async () => {
        if (get().hasHydratedCache) return;
        try {
            const cached = await idbGet(CACHE_KEY);
            if (cached?.templates?.length) {
                set({ templates: cached.templates, fetchedAt: cached.fetchedAt });
            }
        } catch (error) {
            console.error("Gagal membaca cache template dari IndexedDB:", error);
        } finally {
            set({ hasHydratedCache: true });
        }
    },

    // Fetch dengan strategi stale-while-revalidate.
    // force=true dipakai setelah create/update/delete template (dari TemplatesPage)
    // supaya cache langsung invalid dan data baru diambil.
    fetchTemplates: async (force = false) => {
        const state = get();
        const hasData = state.templates.length > 0;
        const isFresh = state.fetchedAt && Date.now() - state.fetchedAt < TTL_MS;

        if (hasData && isFresh && !force) {
            return state.templates; // masih segar, ga perlu call API sama sekali
        }

        if (hasData && !force) {
            // Data lama masih dipakai untuk ditampilkan, refresh jalan di belakang layar
            get()._doFetch();
            return state.templates;
        }

        return get()._doFetch();
    },

    _doFetch: async () => {
        if (inFlightFetch) return inFlightFetch;

        set({ isLoading: true, error: null });
        inFlightFetch = (async () => {
            try {
                const response = await templateService.getTemplates();
                const data = Array.isArray(response) ? response : response?.data || [];
                const fetchedAt = Date.now();

                set({ templates: data, fetchedAt, isLoading: false });
                idbSet(CACHE_KEY, { templates: data, fetchedAt }).catch((e) =>
                    console.error("Gagal menyimpan cache template:", e),
                );

                return data;
            } catch (error) {
                console.error("Gagal mengambil daftar template node:", error);
                set({ isLoading: false, error });
                return get().templates;
            } finally {
                inFlightFetch = null;
            }
        })();

        return inFlightFetch;
    },

    // Dipanggil dari TemplatesPage setelah create/update/delete template
    invalidate: () => set({ fetchedAt: null }),
}));