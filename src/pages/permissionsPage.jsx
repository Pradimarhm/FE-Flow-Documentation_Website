import React, { useEffect, useState } from "react";
import { usePermissionStore } from "@/store/permissionStore";
import {
    AVAILABLE_ACTIONS,
    DEFAULT_PERMISSION_OBJECT,
    MASTER_ROLES,
    MASTER_MODULES,
} from "@/constants/permissionConstants";
import {
    Plus,
    Trash2,
    Edit3,
    Loader2,
    ShieldCheck,
    RefreshCw,
} from "lucide-react";

export default function PermissionsPage() {
    const {
        permissions,
        isLoading,
        error,
        fetchPermissions,
        isModalOpen,
        editingPermission,
        openCreateModal,
        openEditModal,
        closeModal,
        addPermission,
        updatePermission,
        deletePermission,
    } = usePermissionStore();

    const [formData, setFormData] = useState({
        role_id: "",
        module_id: "",
        permission: DEFAULT_PERMISSION_OBJECT,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const parsePermissionObject = (rawPerm) => {
        if (
            typeof rawPerm === "object" &&
            rawPerm !== null &&
            !Array.isArray(rawPerm)
        ) {
            return {
                read: Boolean(rawPerm.read),
                create: Boolean(rawPerm.create),
                update: Boolean(rawPerm.update),
                delete: Boolean(rawPerm.delete),
            };
        }
        if (Array.isArray(rawPerm)) {
            return {
                read: rawPerm.includes("read"),
                create: rawPerm.includes("create"),
                update: rawPerm.includes("update"),
                delete: rawPerm.includes("delete"),
            };
        }
        return DEFAULT_PERMISSION_OBJECT;
    };

    useEffect(() => {
        if (editingPermission) {
            setFormData({
                role_id: String(editingPermission.role_id || ""),
                module_id: String(editingPermission.module_id || ""),
                permission: parsePermissionObject(editingPermission.permission),
            });
        } else {
            setFormData({
                role_id: "",
                module_id: "",
                permission: DEFAULT_PERMISSION_OBJECT,
            });
        }
    }, [editingPermission]);

    const handleCheckboxChange = (actionKey) => {
        setFormData((prev) => ({
            ...prev,
            permission: {
                ...prev.permission,
                [actionKey]: !prev.permission[actionKey],
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                role_id: Number(formData.role_id),
                module_id: Number(formData.module_id),
                permission: formData.permission,
            };

            if (editingPermission) {
                await updatePermission(editingPermission.id, payload);
            } else {
                const existing = permissions.find(
                    (p) =>
                        Number(p.role_id) === payload.role_id &&
                        Number(p.module_id) === payload.module_id,
                );

                if (existing) {
                    if (
                        window.confirm(
                            `Permission untuk Role & Module ini sudah ada. Ingin memperbaruinya?`,
                        )
                    ) {
                        await updatePermission(existing.id, payload);
                    } else {
                        setIsSubmitting(false);
                        return;
                    }
                } else {
                    await addPermission(payload);
                }
            }
            closeModal();
        } catch (err) {
            alert(
                err?.response?.data?.message ||
                    err?.message ||
                    "Terjadi kesalahan saat menyimpan.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus permission ini?")) return;
        try {
            await deletePermission(id);
        } catch (err) {
            alert(
                err?.response?.data?.message || "Gagal menghapus permission.",
            );
        }
    };

    const getRoleName = (roleId) => {
        const found = MASTER_ROLES.find((r) => r.id === Number(roleId));
        return found ? found.name : `Role #${roleId}`;
    };

    const getModuleName = (moduleId) => {
        const found = MASTER_MODULES.find((m) => m.id === Number(moduleId));
        return found ? found.name : `Module #${moduleId}`;
    };

    const renderActiveBadges = (rawPerm) => {
        const permObj = parsePermissionObject(rawPerm);
        const activeActions = Object.keys(permObj).filter(
            (key) => permObj[key] === true,
        );

        if (activeActions.length === 0) {
            return (
                <span className="text-xs text-gray-400 italic">No access</span>
            );
        }

        return activeActions.map((act) => (
            <span
                key={act}
                className="text-[10px] font-black uppercase px-2 py-0.5 bg-olive-200 border border-black"
            >
                {act}
            </span>
        ));
    };

    return (
        /* Menggunakan h-screen & overflow-hidden agar halaman pas 1 layar */
        <div className="w-full h-full bg-olive-100 p-6 flex flex-col gap-6 overflow-hidden">
            {/* Header (Ukuran Tetap) */}
            <div className="flex-none flex flex-row justify-between items-center bg-olive-50 p-4 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)]">
                <div>
                    <h1 className="text-xl font-black text-olive-900 uppercase tracking-wide flex items-center gap-2">
                        <ShieldCheck size={24} /> Manajemen Permission
                    </h1>
                    <p className="text-xs font-semibold text-olive-700">
                        Atur hak akses role terhadap modul sistem
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchPermissions()}
                        className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-olive-200 cursor-pointer"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold text-xs border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-green-600 active:translate-y-0.5 active:shadow-none cursor-pointer"
                    >
                        <Plus size={16} /> Tambah Permission
                    </button>
                </div>
            </div>

            {/* Area Tabel fleksibel mengisi sisa tinggi layar & bisa discroll internal */}
            <div className="flex bg-white p-5 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] overflow-y-auto">
                {isLoading ? (
                    <div className="flex w-full justify-center items-center gap-2 text-olive-800 font-bold">
                        <Loader2 size={20} className="animate-spin" /> Memuat
                        data permission...
                    </div>
                ) : error ? (
                    <div className="w-full p-4 bg-red-100 border-l-4 border-red-500 text-red-700 font-bold text-sm">
                        {error}
                    </div>
                ) : (
                    <div className="relative flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            {/* Header Sticky Tepat di Top Wrapper Scroll */}
                            <thead className="sticky top-0 z-20 bg-olive-200 border-b-2 border-olive-900 text-xs uppercase font-black">
                                <tr>
                                    <th className="p-3 w-16 bg-olive-200">
                                        ID
                                    </th>
                                    <th className="p-3 bg-olive-200">Role</th>
                                    <th className="p-3 bg-olive-200">Module</th>
                                    <th className="p-3 bg-olive-200">
                                        Allowed Actions
                                    </th>
                                    <th className="p-3 text-center w-28 bg-olive-200">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-semibold text-olive-900 divide-y-2 divide-olive-200">
                                {permissions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-4 text-center text-olive-500 font-semibold italic"
                                        >
                                            Belum ada data permission.
                                        </td>
                                    </tr>
                                ) : (
                                    permissions.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-olive-500 hover:bg-olive-50 transition-colors"
                                        >
                                            <td className="p-3 font-mono text-xs font-bold">
                                                #{item.id}
                                            </td>
                                            <td className="p-3 font-bold">
                                                {item.role?.name ||
                                                    getRoleName(item.role_id)}
                                            </td>
                                            <td className="p-3 font-bold">
                                                {item.module?.name ||
                                                    getModuleName(
                                                        item.module_id,
                                                    )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {renderActiveBadges(
                                                        item.permission,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            openEditModal(item)
                                                        }
                                                        className="p-1.5 bg-amber-300 border border-black hover:bg-amber-400 cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        className="p-1.5 bg-rose-400 text-white border border-black hover:bg-rose-500 cursor-pointer"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Create / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-olive-50 border-4 border-olive-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 flex flex-col gap-4">
                        <h2 className="text-lg font-black uppercase tracking-wider border-b-2 border-olive-900 pb-2">
                            {editingPermission
                                ? "Edit Permission"
                                : "Tambah Permission"}
                        </h2>

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase">
                                    Role
                                </label>
                                <select
                                    required
                                    value={formData.role_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            role_id: e.target.value,
                                        })
                                    }
                                    className="p-2 border-2 border-black text-sm bg-white outline-none font-semibold cursor-pointer"
                                >
                                    <option value="">-- Pilih Role --</option>
                                    {MASTER_ROLES.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase">
                                    Module
                                </label>
                                <select
                                    required
                                    value={formData.module_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            module_id: e.target.value,
                                        })
                                    }
                                    className="p-2 border-2 border-black text-sm bg-white outline-none font-semibold cursor-pointer"
                                >
                                    <option value="">-- Pilih Module --</option>
                                    {MASTER_MODULES.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} ({m.slug})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase mb-1">
                                    Actions Allowed
                                </label>
                                <div className="grid grid-cols-2 gap-2 bg-white p-3 border-2 border-black">
                                    {AVAILABLE_ACTIONS.map((action) => (
                                        <label
                                            key={action.key}
                                            className="flex items-center gap-2 cursor-pointer text-xs font-bold"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={Boolean(
                                                    formData.permission[
                                                        action.key
                                                    ],
                                                )}
                                                onChange={() =>
                                                    handleCheckboxChange(
                                                        action.key,
                                                    )
                                                }
                                                className="w-4 h-4 accent-olive-800"
                                            />
                                            {action.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border-2 border-black bg-white font-bold text-xs hover:bg-gray-100 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border-2 border-black bg-green-500 text-white font-bold text-xs hover:bg-green-600 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {isSubmitting && (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    )}
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
