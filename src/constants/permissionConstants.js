// Aksi yang tersedia
export const AVAILABLE_ACTIONS = [
    { key: "read", label: "Read / View" },
    { key: "create", label: "Create" },
    { key: "update", label: "Update" },
    { key: "delete", label: "Delete" },
];

// Default JSON Object untuk database
export const DEFAULT_PERMISSION_OBJECT = {
    read: true,
    create: false,
    update: false,
    delete: false,
};

// Data Master Role (Sesuai DB)
export const MASTER_ROLES = [
    { id: 1, name: "Admin", description: "Memiliki akses penuh ke seluruh sistem" },
    { id: 2, name: "User", description: "Mengelola data master dan operasional" },
];

// Data Master Module (Sesuai DB)
export const MASTER_MODULES = [
    { id: 1, name: "Canvas", slug: "canvas", url: "/canvas" },
    { id: 2, name: "Nodes", slug: "nodes", url: "/nodes" },
    { id: 3, name: "Connection", slug: "connection", url: "/connections" },
    { id: 4, name: "Templates", slug: "templates", url: "/templates" },
    { id: 5, name: "Flows", slug: "flows", url: "/flows" },
    { id: 6, name: "Permissions", slug: "permissions", url: "/permissions" },
    { id: 7, name: "Users", slug: "users", url: "/users" },
];