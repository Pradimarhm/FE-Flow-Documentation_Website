import React from "react";
import { useUser } from "../hooks/useUser";
import { User, Plus, Trash2, Edit3, Loader2, RefreshCw } from "lucide-react";
import { MASTER_ROLES } from "@/constants/permissionConstants";

export default function UsersPage() {
    const {
        users,
        isLoading,
        error,
        validationErrors,
        formData,
        editingId,
        isModalOpen,
        handleInputChange,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
    } = useUser();

    const getRoleName = (roleId) => {
        const found = MASTER_ROLES.find((r) => r.id === Number(roleId));
        return found ? found.name : `Role #${roleId}`;
    };

    return (
        /* Menggunakan h-screen & overflow-hidden agar halaman pas 1 layar */
        <div className="w-full h-full bg-olive-100 p-6 flex flex-col gap-6 overflow-hidden">
            {/* Header (Ukuran Tetap) */}
            <div className="flex-none flex flex-row justify-between items-center bg-olive-50 p-4 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)]">
                <div>
                    <h1 className="text-xl font-black text-olive-900 uppercase tracking-wide flex items-center gap-2">
                        <User size={24} /> Manajemen User
                    </h1>
                    <p className="text-xs font-semibold text-olive-700">
                        Atur daftar pengguna sistem dan hak akses role
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-olive-200 cursor-pointer"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold text-xs border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-green-600 active:translate-y-0.5 active:shadow-none cursor-pointer"
                    >
                        <Plus size={16} /> Tambah User
                    </button>
                </div>
            </div>

            {/* Area Tabel fleksibel mengisi sisa tinggi layar & bisa discroll internal */}
            <div className="flex bg-white p-5 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] overflow-y-auto relative">
                {isLoading && !isModalOpen ? (
                    <div className="flex w-full justify-center items-center gap-2 text-olive-800 font-bold">
                        <Loader2 size={20} className="animate-spin" /> Memuat
                        data user...
                    </div>
                ) : error ? (
                    <div className="w-full p-4 bg-red-100 border-l-4 border-red-500 text-red-700 font-bold text-sm">
                        {error}
                    </div>
                ) : (
                    <div className="relative flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            {/* Header Tabel Sticky di Atas */}
                            <thead className="bg-olive-200 border-b-2 border-olive-900 text-xs uppercase font-black sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 w-16 bg-olive-200">
                                        ID
                                    </th>
                                    <th className="p-3 bg-olive-200">
                                        Nama
                                    </th>
                                    <th className="p-3 bg-olive-200">
                                        Email
                                    </th>
                                    <th className="p-3 bg-olive-200">
                                        Role
                                    </th>
                                    <th className="p-3 text-center w-28 bg-olive-200">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-4 text-center text-olive-500 font-semibold italic"
                                        >
                                            Belum ada data user.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-olive-200 hover:bg-olive-50 transition-colors"
                                        >
                                            <td className="p-3 font-mono text-xs font-bold">
                                                #{item.id}
                                            </td>
                                            <td className="p-3 font-bold">
                                                {item.name}
                                            </td>
                                            <td className="p-3 font-medium text-olive-900">
                                                {item.email}
                                            </td>
                                            <td className="p-3 font-bold">
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-olive-200 border border-black">
                                                    {item.role?.name ||
                                                        getRoleName(
                                                            item.role_id,
                                                        )}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleOpenEditModal(
                                                                item,
                                                            )
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
                            {editingId ? "Edit User" : "Tambah User"}
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
                                    name="role_id"
                                    required
                                    value={formData.role_id}
                                    onChange={handleInputChange}
                                    className="p-2 border-2 border-black text-sm bg-white outline-none font-semibold cursor-pointer"
                                >
                                    <option value="">-- Pilih Role --</option>
                                    {MASTER_ROLES.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors?.role_id && (
                                    <span className="text-[11px] font-bold text-red-600">
                                        {validationErrors.role_id[0]}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="p-2 border-2 border-black text-sm bg-white outline-none font-semibold"
                                />
                                {validationErrors?.name && (
                                    <span className="text-[11px] font-bold text-red-600">
                                        {validationErrors.name[0]}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="p-2 border-2 border-black text-sm bg-white outline-none font-semibold"
                                />
                                {validationErrors?.email && (
                                    <span className="text-[11px] font-bold text-red-600">
                                        {validationErrors.email[0]}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase">
                                    Password{" "}
                                    {editingId && (
                                        <span className="text-[10px] text-gray-500 font-normal">
                                            (Opsional)
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required={!editingId}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="p-2 border-2 border-black text-sm bg-white outline-none font-semibold"
                                />
                                {validationErrors?.password && (
                                    <span className="text-[11px] font-bold text-red-600">
                                        {validationErrors.password[0]}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border-2 border-black bg-white font-bold text-xs hover:bg-gray-100 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 border-2 border-black bg-green-500 text-white font-bold text-xs hover:bg-green-600 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {isLoading && (
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
