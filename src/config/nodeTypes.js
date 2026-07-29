// src/config/nodeTypes.js
import { Play, Square, Settings2, CheckCircle2, Database, Webhook } from "lucide-react";

export const NODE_TYPE_CONFIG = {
    start: {
        label: "Start",
        bg: "bg-emerald-300",
        badgeColor: "bg-emerald-400",
        border: "border-black",
        text: "text-black",
        icon: Play,
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