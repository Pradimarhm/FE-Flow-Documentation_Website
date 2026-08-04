import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Import Icon Lucide
import logo from "../assets/logo_tff.png";
import { authService } from "../services/authService";
import ErrorPopup from "../components/error/errorPopUp";

const cssVars = {
    "--input-focus": "#2d8cf0",
    "--font-color": "#323232",
    "--font-color-sub": "#666",
    "--bg-color": "#fff",
    "--bg-color-alt": "#666",
    "--main-color": "#323232",
};

const CODE_LENGTH = 6;

export default function ResetPassword() {
    const location = useLocation();
    const email = location.state?.email || "";

    const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const wrapperRef = useRef(null);
    const codeInputRefs = useRef([]);
    const redirectTimerRef = useRef(null); // Ref untuk timer redirect
    const navigate = useNavigate();

    const [errorPopup, setErrorPopup] = useState({
        isOpen: false,
        title: "",
        type: "",
        message: "",
        errors: null,
    });

    // Cleanup timer ketika komponen unmount
    useEffect(() => {
        return () => {
            if (redirectTimerRef.current) {
                clearTimeout(redirectTimerRef.current);
            }
        };
    }, []);

    // Jika halaman diakses tanpa email dari ForgotPassword, kembalikan ke /forgot-password
    useEffect(() => {
        if (!email) {
            navigate("/forgot-password", { replace: true });
        }
    }, [email, navigate]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (wrapperRef.current) {
                const rect = wrapperRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                setMousePosition({ x, y });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleCodeChange = (index, value) => {
        const digit = value.replace(/[^0-9]/g, "").slice(-1);
        const newCode = [...code];
        newCode[index] = digit;
        setCode(newCode);

        if (digit && index < CODE_LENGTH - 1) {
            codeInputRefs.current[index + 1]?.focus();
        }
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const newCode = [...code];
            newCode[index - 1] = "";
            setCode(newCode);
            codeInputRefs.current[index - 1]?.focus();
        }
    };

    const handleCodePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/[^0-9]/g, "")
            .slice(0, CODE_LENGTH);
        if (!pasted) return;

        const newCode = Array(CODE_LENGTH).fill("");
        for (let i = 0; i < pasted.length; i++) {
            newCode[i] = pasted[i];
        }
        setCode(newCode);
        const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
        codeInputRefs.current[focusIndex]?.focus();
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const verificationCode = code.join("");

        if (verificationCode.length < CODE_LENGTH) {
            setErrorPopup({
                isOpen: true,
                title: "Kode Belum Lengkap",
                type: "error",
                message: `Masukkan semua ${CODE_LENGTH} digit kode OTP.`,
                errors: null,
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorPopup({
                isOpen: true,
                title: "Validasi Gagal",
                type: "error",
                message: "Password baru dan Konfirmasi Password tidak cocok.",
                errors: {
                    password_confirmation: ["Konfirmasi password tidak cocok."],
                },
            });
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({
                email,
                otp: verificationCode,
                password: newPassword,
                password_confirmation: confirmPassword,
            });

            // Tampilkan Popup Sukses
            setErrorPopup({
                isOpen: true,
                title: "Password berhasil diubah!",
                type: "success",
                message: "Silakan login menggunakan password baru.",
            });

            // ⏳ Delay 1.5 detik agar user sempat membaca popup sukses sebelum pindah
            redirectTimerRef.current = setTimeout(() => {
                navigate("/auth");
            }, 2000);

        } catch (err) {
            setErrorPopup({
                isOpen: true,
                title: "Gagal Reset Password",
                type: "error",
                message: err.message || "OTP tidak valid atau sudah kedaluwarsa.",
                errors: err.errors || null,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClosePopup = () => {
        setErrorPopup((prev) => ({ ...prev, isOpen: false }));
        // Jika user menutup popup sukses secara manual sebelum timer selesai, langsung pindah
        if (errorPopup.type === "success") {
            if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
            navigate("/auth");
        }
    };

    return (
        <div
            ref={wrapperRef}
            style={cssVars}
            className="flex flex-col min-h-screen bg-[#e8e8e8] relative overflow-hidden"
        >
            <div
                className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,#b9b9b9_1.5px,transparent_2px)] bg-size-[32px_32px]"
                style={{
                    transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
                }}
            />
            <div
                className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,#c9c9c9_1px,transparent_1px)] bg-size-[64px_64px]"
                style={{
                    transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px)`,
                }}
            />

            <div className="flex-1 flex justify-center items-center px-5 py-10 relative z-1">
                <div className="w-105 p-8.75 flex flex-col justify-center gap-5 rounded-[10px] border-[3px] border-(--main-color) bg-[#f0f0f0] shadow-[8px_8px_var(--main-color)]">
                    <div className="flex justify-center items-center mb-2">
                        <img
                            src={logo}
                            alt="FlowDoc Logo"
                            className="w-17.5 h-17.5 object-contain rounded-lg border-[3px] border-(--main-color) shadow-[4px_4px_0_var(--main-color)] bg-white p-2"
                        />
                    </div>

                    <div className="text-[26px] font-black text-center text-(--main-color)">
                        Enter OTP Code
                    </div>
                    <p className="-mt-3 text-sm font-semibold text-center text-(--font-color-sub)">
                        We've sent a code to{" "}
                        <span className="font-bold text-black">{email}</span>
                    </p>

                    <form
                        className="flex flex-col items-center gap-5"
                        onSubmit={handleResetPassword}
                    >
                        {/* 6 Kotak OTP */}
                        <div className="flex justify-center gap-2">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) =>
                                        (codeInputRefs.current[index] = el)
                                    }
                                    className="w-12 h-14 text-center rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[4px_4px_var(--main-color)] text-xl font-bold text-(--font-color) outline-none box-border focus:border-(--input-focus)"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) =>
                                        handleCodeChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        handleCodeKeyDown(index, e)
                                    }
                                    onPaste={handleCodePaste}
                                />
                            ))}
                        </div>

                        {/* Input New Password */}
                        <div className="relative w-full">
                            <input
                                className="w-full h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-(--font-color) px-3.75 pr-11.25 outline-none box-border placeholder:text-(--font-color-sub) placeholder:opacity-80 focus:border-(--input-focus)"
                                name="newPassword"
                                placeholder="New Password"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-(--font-color-sub) p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                                onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                }
                            >
                                {showNewPassword ? (
                                    <EyeOff size={20} className="stroke-[2.5]" />
                                ) : (
                                    <Eye size={20} className="stroke-[2.5]" />
                                )}
                            </button>
                        </div>

                        {/* Input Confirm Password */}
                        <div className="relative w-full">
                            <input
                                className="w-full h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-(--font-color) px-3.75 pr-11.25 outline-none box-border placeholder:text-(--font-color-sub) placeholder:opacity-80 focus:border-(--input-focus)"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-(--font-color-sub) p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} className="stroke-[2.5]" />
                                ) : (
                                    <Eye size={20} className="stroke-[2.5]" />
                                )}
                            </button>
                        </div>

                        <button
                            className="mt-2 w-full h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-(--font-color) cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>

            <ErrorPopup
                isOpen={errorPopup.isOpen}
                onClose={handleClosePopup}
                title={errorPopup.title}
                type={errorPopup.type}
                message={errorPopup.message}
                errors={errorPopup.errors}
            />
        </div>
    );
}