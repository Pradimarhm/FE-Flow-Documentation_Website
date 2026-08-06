import React, { useState } from "react";
import { useUser } from "../hooks/useUser";
import {
    User,
    Plus,
    Trash2,
    Edit3,
    Loader2,
    RefreshCw,
    Search,
    AlertTriangle,
    UserX,
} from "lucide-react";
import { MASTER_ROLES } from "@/constants/permissionConstants";
import ErrorPopup from "../components/error/errorPopUp";

export default function UsersPage() {
    const {
        users,
        isLoading,
        error,
        validationErrors,
        formData,
        editingId,
        isModalOpen,
        searchName,
        setSearchName,
        handleInputChange,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
    } = useUser();

    const [actionPopup, setActionPopup] = useState({
        isOpen: false,
        title: "",
        type: "error",
        message: "",
        errors: null,
        onConfirm: null,
    });

    const getRoleName = (roleId) => {
        const found = MASTER_ROLES.find((r) => r.id === Number(roleId));
        return found ? found.name : `Role #${roleId}`;
    };

    const onFormSubmit = async (e) => {
        try {
            await handleSubmit(e);
            setActionPopup({
                isOpen: true,
                title: editingId
                    ? "Berhasil Mengubah User"
                    : "Berhasil Menambah User",
                type: "success",
                message: `Data user berhasil ${editingId ? "diperbarui" : "ditambahkan"}.`,
                onConfirm: null,
            });
        } catch (err) {
            setActionPopup({
                isOpen: true,
                title: "Gagal Menyimpan User",
                type: "error",
                message:
                    err?.message ||
                    "Terjadi kesalahan saat menyimpan data user.",
                errors: err?.errors || validationErrors || null,
                onConfirm: null,
            });
        }
    };

    const promptDeleteUser = (id, name) => {
        setActionPopup({
            isOpen: true,
            title: "Hapus User?",
            type: "confirm",
            message: `Apakah kamu yakin ingin menghapus user "${name}"? Tindakan ini tidak dapat dibatalkan.`,
            onConfirm: async () => {
                try {
                    await handleDelete(id);
                    setActionPopup({
                        isOpen: true,
                        title: "Berhasil Menghapus",
                        type: "success",
                        message: `User "${name}" telah berhasil dihapus dari sistem.`,
                        onConfirm: null,
                    });
                } catch (err) {
                    setActionPopup({
                        isOpen: true,
                        title: "Gagal Menghapus User",
                        type: "error",
                        message:
                            err?.message || "Tidak dapat menghapus user ini.",
                        errors: err?.errors || null,
                        onConfirm: null,
                    });
                }
            },
        });
    };

    return (
        <div className="w-full h-full bg-olive-50 p-6 flex flex-col gap-6 overflow-hidden">
            {/* Header Title & Controls */}
            <div className="flex-none flex flex-row justify-between items-center bg-white p-4 rounded-sm border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)]">
                <div>
                    <h1 className="text-xl font-black text-olive-900 uppercase tracking-wide flex items-center gap-2">
                        <User size={24} /> Manajemen User
                    </h1>
                    <p className="text-xs font-semibold text-olive-700">
                        Atur daftar pengguna sistem dan hak akses role
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex items-center">
                        <Search
                            size={16}
                            className="absolute left-3 text-olive-700 pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Cari user via nama..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="pl-9 pr-3 py-2.5 bg-white rounded-sm border-2 border-olive-900 text-xs font-semibold outline-none shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:bg-amber-50 transition-all w-48 md:w-64"
                        />
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2.5 rounded-sm bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-olive-200 cursor-pointer"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-sm bg-green-500 text-white font-bold text-xs border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-green-600 active:translate-y-0.5 active:shadow-none cursor-pointer"
                    >
                        <Plus size={16} /> Tambah User
                    </button>
                </div>
            </div>

            {/* Content Area Container */}
            <div className="flex flex-1 bg-white p-5 rounded-sm border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] overflow-y-auto relative">
                {isLoading && !isModalOpen ? (
                    /*  LOADING STATE STYLE CANVAS (BADGE NEOBRUTALISM + LUCIDE ICON) */
                    <div className="m-auto flex flex-col items-center justify-center gap-3 select-none">
                        <div className="relative flex items-center justify-center p-4 rounded-sm bg-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)]">
                            <User size={32} className="text-olive-900" />
                            <span className="absolute -top-2 -right-2 p-1 bg-amber-300 border border-olive-900 rounded-full shadow-[1px_1px_0px_rgba(54,69,79,1)]">
                                <Loader2
                                    size={16}
                                    className="animate-spin text-olive-900"
                                />
                            </span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-black text-olive-900 uppercase tracking-wider">
                                Memuat Data User
                            </h3>
                            <p className="text-xs font-bold text-olive-700 mt-0.5">
                                Mengambil daftar pengguna sistem dari server...
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    /*  ERROR STATE (CENTERED NEOBRUTALISM CARD) */
                    <div className="m-auto flex flex-col items-center justify-center p-8 bg-rose-50 border-4 border-olive-900 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md text-center gap-3">
                        <div className="p-3 bg-rose-200 border-2 border-olive-900 rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                            <AlertTriangle
                                size={32}
                                className="text-rose-700"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">
                                Gagal Memuat Data
                            </h3>
                            <p className="text-xs font-semibold text-rose-800 mt-1">
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-white border-2 border-olive-900 text-olive-900 font-bold text-xs rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-olive-100 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
                        >
                            <RefreshCw size={14} /> Muat Ulang Halaman
                        </button>
                    </div>
                ) : users.length === 0 ? (
                    /*  EMPTY STATE (CENTERED NEOBRUTALISM CARD) */
                    <div className="m-auto flex flex-col items-center justify-center p-8 bg-white border-4 border-olive-900 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md text-center gap-3">
                        <div className="p-3 bg-olive-200 border-2 border-olive-900 rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                            <UserX size={32} className="text-olive-900" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-olive-900 uppercase tracking-tight">
                                User Tidak Ditemukan
                            </h3>
                            <p className="text-xs font-semibold text-olive-600 mt-1">
                                {searchName
                                    ? `Tidak ada data user yang cocok dengan kata kunci "${searchName}".`
                                    : "Belum ada data user di dalam sistem. Klik tombol dibawah untuk menambahkan user."}
                            </p>
                        </div>
                        <button
                            onClick={handleOpenCreateModal}
                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-green-500 text-white border-2 border-olive-900 font-bold text-xs rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-green-600 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
                        >
                            <Plus size={16} /> Tambah User Sekarang
                        </button>
                    </div>
                ) : (
                    /*  TABEL DATA USER */
                    <div className="relative flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-olive-200 border-b-2 border-olive-900 text-xs uppercase font-black sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 w-16 bg-olive-200">
                                        ID
                                    </th>
                                    <th className="p-3 bg-olive-200">Nama</th>
                                    <th className="p-3 bg-olive-200">Email</th>
                                    <th className="p-3 bg-olive-200">Role</th>
                                    <th className="p-3 text-center w-28 bg-olive-200">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((item) => (
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
                                                    getRoleName(item.role_id)}
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
                                                        promptDeleteUser(
                                                            item.id,
                                                            item.name,
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-olive-50 rounded-md border-4 border-olive-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 flex flex-col gap-4">
                        <h2 className="text-lg font-black uppercase tracking-wider border-b-2 border-olive-900 pb-2">
                            {editingId ? "Edit User" : "Tambah User"}
                        </h2>

                        <form
                            onSubmit={onFormSubmit}
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
                                    className="p-2 border-2 rounded-sm border-black text-sm bg-white outline-none font-semibold cursor-pointer"
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
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="p-2 border-2 rounded-sm border-black text-sm bg-white outline-none font-semibold"
                                />
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
                                    className="p-2 rounded-sm border-2 border-black text-sm bg-white outline-none font-semibold"
                                />
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
                                    className="p-2 rounded-sm border-2 border-black text-sm bg-white outline-none font-semibold"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-sm border-2 border-black bg-white font-bold text-xs hover:bg-gray-100 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-sm border-2 border-black bg-green-500 text-white font-bold text-xs hover:bg-green-600 disabled:opacity-50 cursor-pointer flex items-center gap-2"
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

            <ErrorPopup
                isOpen={actionPopup.isOpen}
                onClose={() =>
                    setActionPopup({ ...actionPopup, isOpen: false })
                }
                title={actionPopup.title}
                type={actionPopup.type}
                message={actionPopup.message}
                errors={actionPopup.errors}
                onConfirm={actionPopup.onConfirm}
            />
        </div>
    );
}
