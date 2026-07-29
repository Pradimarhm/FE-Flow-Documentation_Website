import { useState } from "react";
import { authService } from "../services/authService";

export const useAuthActions = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorPopup, setErrorPopup] = useState({
        isOpen: false,
        title: "",
        message: "",
        errors: null,
    });

    const closeErrorPopup = () => {
        setErrorPopup((prev) => ({ ...prev, isOpen: false }));
    };

    const handleForgotPassword = async (email, onSuccess) => {
        setIsLoading(true);
        try {
            const res = await authService.forgotPassword({ email });
            if (onSuccess) onSuccess(res);
        } catch (err) {
            // Menagkap Error 404 (Email tidak terdaftar) / 422 (Format tidak valid)
            setErrorPopup({
                isOpen: true,
                title: "Gagal Kirim OTP",
                message:
                    err.message || "Email tidak ditemukan atau format salah.",
                errors: err.errors || null,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (payload, onSuccess) => {
        setIsLoading(true);
        try {
            // Payload sesuai API Swagger: { email, otp, password, password_confirmation }[cite: 10]
            const res = await authService.resetPassword(payload);
            if (onSuccess) onSuccess(res);
        } catch (err) {
            // Menangkap Error 400 (OTP tidak valid/kadaluarsa) / 404 / 422[cite: 10]
            setErrorPopup({
                isOpen: true,
                title: "Gagal Reset Password",
                message: err.message || "OTP salah atau telah kedaluwarsa.",
                errors: err.errors || null,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (payload, onSuccess) => {
        setIsLoading(true);
        try {
            const res = await authService.changePassword(payload);
            if (onSuccess) onSuccess(res);
        } catch (err) {
            // Menangkap Error 400 (Password lama tidak sesuai) / 401 / 422[cite: 10]
            setErrorPopup({
                isOpen: true,
                title: "Gagal Mengubah Password",
                message: err.message || "Password lama tidak sesuai.",
                errors: err.errors || null,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        errorPopup,
        closeErrorPopup,
        handleForgotPassword,
        handleResetPassword,
        handleChangePassword,
    };
};
