import { useEffect, useState } from "react";
import { useUserStore } from "../store/useUserStore";

const INITIAL_FORM = {
    role_id: 2,
    name: "",
    email: "",
    password: "",
};

export const useUser = () => {
    const {
        users,
        isLoading,
        error,
        validationErrors,
        fetchUsers,
        addUser,
        editUser,
        removeUser,
        resetErrors,
    } = useUserStore();

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchName, setSearchName] = useState("");

    // Debounce 300ms saat user mengetik nama
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(searchName);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchName, fetchUsers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "role_id" ? Number(value) : value,
        }));
    };

    const handleOpenCreateModal = () => {
        resetErrors();
        setFormData(INITIAL_FORM);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        resetErrors();
        setFormData({
            role_id: user.role_id,
            name: user.name,
            email: user.email,
            password: "",
        });
        setEditingId(user.id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetErrors();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Hapus password jika sedang mode edit dan password tidak diisi
        const payload = { ...formData };
        if (editingId && !payload.password) {
            delete payload.password;
        }

        let res;
        if (editingId) {
            res = await editUser(editingId, payload);
        } else {
            res = await addUser(payload);
        }

        if (res.success) {
            handleCloseModal();
        } else {
            // Lempar error agar ditangkap oleh ErrorPopup di halaman
            throw (
                res.error || new Error(res.message || "Gagal menyimpan data.")
            );
        }
    };

    // ✅ FIX: Hapus window.confirm bawaan browser!
    const handleDelete = async (id) => {
        const res = await removeUser(id);

        // Jika dari store mengembalikan status/object success/error:
        if (res && res.success === false) {
            throw new Error(res.message || "Gagal menghapus user.");
        }
        return res;
    };

    return {
        users,
        isLoading,
        error,
        validationErrors,
        formData,
        editingId,
        isModalOpen,
        searchName, // Expose state pencarian ke UI
        setSearchName, // Expose setter untuk input onChange UI
        handleInputChange,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
    };
};
