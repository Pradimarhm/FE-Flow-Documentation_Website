// src/config/nodeTypes.js
import { Play, Square, Settings2, CheckCircle2, Database, Webhook, GitFork } from "lucide-react";

export const NODE_TYPE_CONFIG = {
    start: {
        label: "Start",
        bg: "bg-emerald-300",
        badgeColor: "bg-emerald-400",
        border: "border-black",
        text: "text-black",
        icon: Play,
    },
    condition: {
        label: "Condition",
        bg: "bg-orange-100",
        badgeColor: "bg-orange-300",
        border: "border-black",
        text: "text-orange-950",
        icon: GitFork,
    },
    process: {
        label: "Process",
        bg: "bg-sky-100",
        badgeColor: "bg-sky-300",
        border: "border-black",
        text: "text-sky-950",
        icon: Settings2,
    },
    validation: {
        label: "Validation",
        bg: "bg-amber-100",
        badgeColor: "bg-amber-300",
        border: "border-black",
        text: "text-amber-950",
        icon: CheckCircle2,
    },
    database: {
        label: "Database",
        bg: "bg-purple-100",
        badgeColor: "bg-purple-300",
        border: "border-black",
        text: "text-purple-950",
        icon: Database,
    },
    api: {
        label: "API / Webhook",
        bg: "bg-indigo-100",
        badgeColor: "bg-indigo-300",
        border: "border-black",
        text: "text-indigo-950",
        icon: Webhook,
    },
    end: {
        label: "End",
        bg: "bg-rose-300",
        badgeColor: "bg-rose-400",
        border: "border-black",
        text: "text-black",
        icon: Square,
    },
};

// Konfigurasi warna & style garis koneksi (Edge) berdasarkan cabang
export const EDGE_BRANCH_CONFIG = {
    true: {
        stroke: "#10B981", // Hijau Emerald
        strokeWidth: 3,
        labelBg: "#A7F3D0", // Emerald 200
        labelText: "#064E3B",
    },
    false: {
        stroke: "#F43F5E", // Merah Rose
        strokeWidth: 3,
        labelBg: "#FECDD3", // Rose 200
        labelText: "#881337",
    },
    default: {
        stroke: "#36454F", // Charcoal / Slate
        strokeWidth: 2.5,
        labelBg: "#E2E8F0", // Slate 200
        labelText: "#0F172A",
    },
};