import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// 1. Buat Wrapper Storage untuk IndexedDB
// Zustand membutuhkan fungsi getItem, setItem, dan removeItem yang terstandarisasi
const indexedDBStorage = {
  getItem: async (name) => {
    const value = await get(name);
    // Zustand mengharapkan string dari storage, idb-keyval mengembalikan object
    // JSON.stringify diperlukan di sini jika data berupa object
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name, value) => {
    // Zustand mengirimkan string, kita simpan kembali sebagai string
    await set(name, JSON.stringify(value));
  },
  removeItem: async (name) => {
    await del(name);
  },
};

// 2. Inisialisasi Store Kanvas
export const useFlowStore = create(
  persist(
    (set, get) => ({
      // State utama untuk React Flow
      nodes: [],
      edges: [],
      activeFlowId: null,

      // Actions standar React Flow
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      
      // Reset kanvas (berguna jika user membuka flow lain)
      resetCanvas: () => set({ nodes: [], edges: [], activeFlowId: null }),

      // Nanti kamu bisa tambahkan logika onNodesChange / onEdgesChange di sini
      // agar terintegrasi langsung dengan <ReactFlow /> component
    }),
    {
      name: 'flowDoc-canvas-draft', // Nama key di IndexedDB
      storage: indexedDBStorage, // Gunakan engine IndexedDB yang kita buat di atas
      
      // Opsional: partialize berguna jika ada state di dalam store ini 
      // yang tidak ingin kamu simpan ke IndexedDB (misalnya state loading UI)
      // partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    }
  )
);