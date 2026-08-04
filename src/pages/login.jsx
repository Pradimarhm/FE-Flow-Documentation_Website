import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Import logo - sesuaikan dengan path logo Anda
// import logo from "../assets/logo_tff.png"; // atau logo.svg
import logoApp from "../assets/logo_tff.png";

//service
import { authService } from "../services/authService";
import { userService } from "../services/userService";

import { useAuthStore } from "../store/authStore";

// error popup
import ErrorPopup from "../components/error/errorPopUp";

// CSS custom properties (dulu didefinisikan di dalam styled-components)
// tetap dipakai lewat notasi var(--nama) di className Tailwind (arbitrary value)
const cssVars = {
    "--input-focus": "#2d8cf0",
    "--font-color": "#323232",
    "--font-color-sub": "#666",
    "--bg-color": "#fff",
    "--bg-color-alt": "#666",
    "--main-color": "#323232",
};

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showSignupConfirmPassword, setShowSignupConfirmPassword] =
        useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const wrapperRef = useRef(null);

    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    // Handle mouse move untuk efek parallax
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

    const [errorPopup, setErrorPopup] = useState({
        isOpen: false,
        title: "",
        type: "",
        message: "",
        errors: null,
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Panggil API Login
            const response = await authService.login({ email, password });

            // Sesuai UserResource.php:
            // response.data berisi: { token, user: { id, name, email, role, modules: [...] } }
            const resData = response.data?.data || response.data || response;
            const token = resData.token || resData.access_token;
            const userData = resData.user || resData;

            // Ekstrak modules/permissions langsung dari UserResource
            const userModules = userData.modules || [];

            // Simpan langsung ke Zustand (token, user, permissions/modules)
            login(token, userData, userModules);

            // Redirect ke Dashboard / Canvas Flow
            navigate("/");
        } catch (err) {
            setErrorPopup({
                isOpen: true,
                title: "Gagal Masuk",
                type: "error",
                message:
                    err.message ||
                    "Email atau password yang kamu masukkan salah.",
                errors: err.errors || null,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // console.log("--- 1. MULAI REGISTRASI ---");

        // 1. Validasi Kecocokan Password di Frontend
        if (password !== confirmPassword) {
            setErrorPopup({
                isOpen: true,
                type: "error",
                title: "Validasi Gagal",
                message: "Password dan Konfirmasi Password tidak sama.",
                // errors: {
                //     password_confirmation: ["Konfirmasi password tidak cocok."],
                // },
            });
            setIsLoading(false);
            return;
        }

        try {
            const nameFromEmail = email.split("@")[0];
            const payload = {
                name:
                    nameFromEmail.charAt(0).toUpperCase() +
                    nameFromEmail.slice(1),
                email: email,
                password: password,
                password_confirmation: confirmPassword,
            };

            // console.log("--- 2. KIRIM PAYLOAD KE BACKEND ---", payload);
            const res = await authService.register(payload);

            // console.log("--- 3. RAW RESPONSE DARI SERVICE ---", res);

            // Parsing response (sesuai struktur JSON backend kamu: { success, message, data })
            const resBody = res.data || res;
            // console.log("--- 4. PARSED RESBODY ---", resBody);

            // console.log("--- 4. cetak payload success ---", res.success);

            if (res.success == true) {
                // A. TAMPILKAN POPUP SUKSES
                // console.log("--- 5. MEMANGGIL setErrorPopup ---");
                setErrorPopup({
                    isOpen: true, // Wajib true agar modal muncul
                    title: "Registrasi Berhasil!",
                    type: "success",
                    message: `Akun ${resBody.data?.email || email} berhasil terdaftar. Silakan masuk dengan akun kamu.`,
                    // errors: null,
                });

                // B. BERSIHKAN FORM PASSWORDS
                setPassword("");
                setConfirmPassword("");

                // C. OTOMATIS GESER CARD KE TAB "MASUK AKUN"
                const toggleSwitch = document.getElementById("toggle-auth");
                if (toggleSwitch) {
                    toggleSwitch.checked = false;
                }
            }
        } catch (err) {
            console.error("--- X. MASUK KE CATCH ERROR ---", err);
            // Tangani Error Jika Terjadi Failure / Validasi Backend
            let customMessage = err.message || "Data registrasi tidak valid.";
            if (err.errors) {
                const firstErrorKey = Object.keys(err.errors)[0];
                if (firstErrorKey && err.errors[firstErrorKey][0]) {
                    customMessage = err.errors[firstErrorKey][0];
                }
            }

            setErrorPopup({
                isOpen: true,
                title: "Gagal Registrasi",
                type: "error",
                message: customMessage,
                errors: err.errors || null,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            ref={wrapperRef}
            style={cssVars}
            className="flex flex-col min-h-screen bg-[#e8e8e8] relative overflow-hidden"
        >
            {/* Grid Dots layer 1 - dulu .wrapper::before */}
            <div
                className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,#b9b9b9_1.5px,transparent_2px)] bg-size-[32px_32px]"
                style={{
                    transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
                }}
            />
            {/* Grid Dots layer 2 (depth) - dulu .wrapper::after */}
            <div
                className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,#b9b9b9_1.5px,transparent_2px)] bg-size-[64px_64px]"
                style={{
                    transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px)`,
                }}
            />

            <div className="flex-1 flex justify-center items-center px-5 py-10 relative z-1">
                <div className="relative z-1">
                    <label className="relative flex flex-col justify-center items-center gap-10 w-17.5 h-7 -translate-y-62.5">
                        <input
                            type="checkbox"
                            className="peer opacity-0 w-0 h-0"
                        />
                        <span className="peer-checked:bg-(--input-focus) bg-transparent transition-colors duration-300 box-border rounded-lg border-[3px] border-(--main-color) shadow-[6px_6px_var(--main-color)] absolute cursor-pointer inset-0 w-17.5 h-7 before:content-[''] before:box-border before:absolute before:h-7 before:w-7 before:border-[3px] before:border-(--main-color) before:rounded-lg before:-left-0.75 before:-bottom-px before:bg-(--bg-color) before:shadow-[0_4px_0_var(--main-color)] before:transition-transform before:duration-300 peer-checked:before:translate-x-10.5" />
                        <span className="relative before:content-['Masuk_Akun'] before:absolute before:-left-45 before:top-0 before:w-35 before:underline before:text-(--font-color) before:font-semibold before:text-[23px] peer-checked:before:no-underline after:content-['Daftar_Akun'] after:absolute after:left-17.5 after:top-0 after:w-35 after:no-underline after:text-(--font-color) after:font-semibold after:text-[23px] peer-checked:after:underline" />
                        {/* Pembungkus Switch Toggle & Label yang Tertata Rapi */}
                        <div className="peer-checked:transform-[rotateY(180deg)] w-105 h-140 relative bg-transparent perspective-[1000px] text-center transition-transform duration-800 transform-3d">
                            <div className="flip-card-face p-8.75 absolute flex flex-col justify-center backface-hidden bg-[#f0f0f0] gap-5 rounded-[10px] border-[3px] border-(--main-color) shadow-[8px_8px_var(--main-color)]">
                                {/* Logo di atas Welcome */}
                                <div className="flex justify-center items-center mb-2">
                                    <img
                                        src={logoApp}
                                        alt="FlowDoc Logo"
                                        className="w-17.5 h-17.5 object-contain rounded-lg border-[3px] border-(--main-color) shadow-[4px_4px_0_var(--main-color)] bg-white p-2"
                                    />
                                </div>
                                <div className="mb-1.25 text-[32px] font-black text-center text-(--main-color)">
                                    Welcome FlowTech!
                                </div>
                                {error && (
                                    <div className="bg-[#fee2e2] text-[#dc2626] px-3.75 py-2.5 rounded-lg text-base font-semibold w-full text-center border-2 border-[#dc2626] box-border">
                                        {error}
                                    </div>
                                )}
                                <form
                                    className="flex flex-col items-center gap-6.5"
                                    onSubmit={handleLogin}
                                >
                                    <input
                                        className="w-full h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-(--font-color) px-3.75 pr-11.25 outline-none box-border placeholder:text-(--font-color-sub) placeholder:opacity-80 focus:border-(--input-focus)"
                                        name="email"
                                        placeholder="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                    <div className="relative w-85">
                                        <input
                                            className="w-full h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-(--font-color) px-3.75 pr-11.25 outline-none box-border placeholder:text-(--font-color-sub) placeholder:opacity-80 focus:border-(--input-focus)"
                                            name="password"
                                            placeholder="Password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-(--font-color-sub) p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    width="20"
                                                    height="20"
                                                >
                                                    <path
                                                        fill="currentColor"
                                                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    width="20"
                                                    height="20"
                                                >
                                                    <path
                                                        fill="currentColor"
                                                        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="w-85 text-right -mt-5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate("/forgot-password")
                                            }
                                            className="bg-transparent border-none p-0 cursor-pointer text-sm font-semibold text-(--input-focus) underline hover:opacity-80"
                                        >
                                            Lupa password?
                                        </button>
                                    </div>
                                    <button
                                        className="my-3.75 w-42.5 h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-(--font-color) cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Loading..." : "Masuk!"}
                                    </button>
                                </form>
                            </div>
                            {/* SIGN UP FACE */}
                            <div className="flip-card-face w-full transform-[rotateY(180deg)] p-8.75 absolute flex flex-col justify-center backface-hidden bg-[#f0f0f0] gap-5 rounded-[10px] border-[3px] border-(--main-color) shadow-[8px_8px_var(--main-color)]">
                                <div className="mb-1.25 text-[32px] font-black text-center text-(--main-color)">
                                    Pendaftaran Akun
                                </div>

                                <form
                                    className="flex flex-col items-center gap-6.5"
                                    onSubmit={handleSignUp}
                                >
                                    {/* Input Email */}
                                    <input
                                        className="w-full h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-(--font-color) px-3.75 pr-11.25 outline-none box-border placeholder:text-(--font-color-sub) placeholder:opacity-80 focus:border-(--input-focus)"
                                        name="email"
                                        placeholder="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />

                                    {/* Input Password */}
                                    <div className="relative w-85">
                                        <input
                                            className="w-full h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-(--font-color) px-3.75 pr-11.25 outline-none box-border placeholder:text-(--font-color-sub) placeholder:opacity-80 focus:border-(--input-focus)"
                                            name="password"
                                            placeholder="Password"
                                            type={
                                                showSignupPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-(--font-color-sub) p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                                            onClick={() =>
                                                setShowSignupPassword(
                                                    !showSignupPassword,
                                                )
                                            }
                                        >
                                            {/* SVG Icon */}
                                        </button>
                                    </div>

                                    {/* Input Confirm Password */}
                                    <div className="relative w-85">
                                        <input
                                            className="w-full h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-(--font-color) px-3.75 pr-11.25 outline-none box-border placeholder:text-(--font-color-sub) placeholder:opacity-80 focus:border-(--input-focus)"
                                            name="konfirmasiPassword"
                                            placeholder="Konfirmasi Password"
                                            type={
                                                showSignupConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-(--font-color-sub) p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                                            onClick={() =>
                                                setShowSignupConfirmPassword(
                                                    !showSignupConfirmPassword,
                                                )
                                            }
                                        >
                                            {/* SVG Icon */}
                                        </button>
                                    </div>

                                    <button
                                        className="my-3.75 w-42.5 h-13 rounded-lg border-[3px] border-(--main-color) bg-(--bg-color) shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-(--font-color) cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Loading..."
                                            : "Daftarkan!"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-1 w-full bg-[#e8e8e8] border-t-[3px] border-(--main-color) py-4 mt-auto">
                <div className="max-w-300 mx-auto px-10 text-center">
                    <p className="text-sm font-semibold text-(--font-color-sub) m-0">
                        © 2026 FlowTech. Jember State Polytechnic Internship
                        Team.
                    </p>
                </div>
            </footer>

            <div className="relative z-99999">
                <ErrorPopup
                    isOpen={errorPopup.isOpen}
                    onClose={() =>
                        setErrorPopup({ ...errorPopup, isOpen: false })
                    }
                    title={errorPopup.title}
                    type={errorPopup.type}
                    message={errorPopup.message}
                    errors={errorPopup.errors}
                />
            </div>
        </div>
    );
}
