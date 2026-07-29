import React, { useEffect, useState } from "react";
import { Settings, User, KeyRound, Loader2, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import ErrorPopup from "../components/error/errorPopUp"; 

export default function SettingsPage() {
    const userStore = useAuthStore((state) => state.user);
    const [profile, setProfile] = useState(userStore || null);
    const [isProfileLoading, setIsProfileLoading] = useState(!userStore);

    // Form Change Password State
    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [popupState, setPopupState] = useState({
        isOpen: false,
        title: "",
        message: "",
        errors: null,
    });

    // Ambil detail profil user dari API jika store belum ada
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await authService.getProfile();
                setProfile(res.data || res);
            } catch (err) {
                console.error("Gagal mengambil data profil:", err);
            } finally {
                setIsProfileLoading(false);
            }
        };

        if (!userStore) {
            fetchUserProfile();
        } else {
            setIsProfileLoading(false);
        }
    }, [userStore]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setSuccessMessage("");

        if (formData.new_password !== formData.new_password_confirmation) {
            setPopupState({
                isOpen: true,
                title: "Validasi Gagal",
                message: "Password baru dan konfirmasi password tidak cocok.",
                errors: { new_password_confirmation: ["Konfirmasi password tidak sesuai."] },
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // PUT /auth/change-password
            const res = await authService.changePassword(formData);
            setSuccessMessage(res.message || "Password berhasil diubah!");

            // Reset form setelah berhasil
            setFormData({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
        } catch (err) {
            setPopupState({
                isOpen: true,
                title: "Gagal Mengubah Password",
                message: err.message || "Password lama salah atau input tidak valid.",
                errors: err.errors || null,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-olive-100 p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-row justify-between items-center bg-olive-50 p-4 border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)]">
                <div>
                    <h1 className="text-xl font-black text-olive-900 uppercase tracking-wide flex items-center gap-2">
                        <Settings size={24} /> Pengaturan Akun
                    </h1>
                    <p className="text-xs font-semibold text-olive-700">
                        Kelola informasi profil dan keamanan kata sandi Anda
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* RINGKASAN PROFIL USER */}
                <div className="lg:col-span-1 bg-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] p-6 flex flex-col gap-4">
                    <h2 className="text-sm font-black uppercase text-olive-900 tracking-wider border-b-2 border-olive-900 pb-2 flex items-center gap-2">
                        <User size={18} /> Profil Saya
                    </h2>

                    {isProfileLoading ? (
                        <div className="p-6 flex justify-center items-center gap-2 text-olive-800 font-bold">
                            <Loader2 size={18} className="animate-spin" /> Memuat profil...
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 bg-olive-50 p-3 border-2 border-black">
                                <div className="w-12 h-12 bg-amber-300 border-2 border-black font-black text-xl flex items-center justify-center text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-bold text-sm text-olive-900 truncate">
                                        {profile?.name || "User Name"}
                                    </h3>
                                    <p className="text-xs font-semibold text-olive-700 flex items-center gap-1 truncate">
                                        <Mail size={12} /> {profile?.email || "user@example.com"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 text-xs font-bold uppercase">
                                <div className="flex justify-between items-center p-2 bg-olive-100 border border-black">
                                    <span className="text-olive-700 flex items-center gap-1">
                                        <ShieldCheck size={14} /> Role ID:
                                    </span>
                                    <span className="bg-olive-300 px-2 py-0.5 border border-black font-black">
                                        Role #{profile?.role_id || "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-olive-100 border border-black">
                                    <span className="text-olive-700">Status Akun:</span>
                                    <span className="text-green-700 font-black">AKTIF</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FORM UBAH PASSWORD */}
                <div className="lg:col-span-2 bg-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] p-6 flex flex-col gap-4">
                    <h2 className="text-sm font-black uppercase text-olive-900 tracking-wider border-b-2 border-olive-900 pb-2 flex items-center gap-2">
                        <KeyRound size={18} /> Ubah Password
                    </h2>

                    {successMessage && (
                        <div className="p-3 bg-green-200 border-2 border-black text-green-900 font-bold text-xs">
                            ✅ {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                        {/* Current Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-olive-900">
                                Password Saat Ini
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="current_password"
                                    required
                                    value={formData.current_password}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan password saat ini"
                                    className="w-full p-2 pr-10 border-2 border-black text-sm bg-white outline-none font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
                                >
                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-olive-900">
                                Password Baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="new_password"
                                    required
                                    value={formData.new_password}
                                    onChange={handleInputChange}
                                    placeholder="Minimal 8 karakter"
                                    className="w-full p-2 pr-10 border-2 border-black text-sm bg-white outline-none font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-olive-900">
                                Konfirmasi Password Baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="new_password_confirmation"
                                    required
                                    value={formData.new_password_confirmation}
                                    onChange={handleInputChange}
                                    placeholder="Ulangi password baru"
                                    className="w-full p-2 pr-10 border-2 border-black text-sm bg-white outline-none font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 bg-green-500 text-white font-bold text-xs border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-green-600 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                Simpan Perubahan Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ErrorPopup
                isOpen={popupState.isOpen}
                onClose={() => setPopupState({ ...popupState, isOpen: false })}
                title={popupState.title}
                message={popupState.message}
                errors={popupState.errors}
            />
        </div>
    );
}