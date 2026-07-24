import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
// Import logo - sesuaikan dengan path logo Anda
import logo from "../assets/logo_tff.png"; // atau logo.svg

//service
import { authService } from "../services/authService";

// error popup
import ErrorPopup from "../components/error/ErrorPopup";

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

  // Tambahan state error detail untuk popup
  const [errorPopup, setErrorPopup] = useState({ isOpen: false, title: "", message: "", errors: null });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Panggil API Login
      const response = await authService.login({ email, password });
      
      // Response sukses sesuai kontrak: response.data.access_token & response.data.user[cite: 15]
      const { access_token, user } = response.data;
      
      // Simpan ke Zustand Store
      login(access_token, user);
      
      // Arahkan ke dashboard/flow setelah berhasil
      navigate("/"); 
    } catch (err) {
      // Tangkap error API (baik invalid input maupun Unauthenticated[cite: 15])
      setErrorPopup({
        isOpen: true,
        title: "Gagal Masuk",
        message: err.message || "Terjadi kesalahan pada sistem.",
        errors: err.errors || null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setErrorPopup({
        isOpen: true,
        title: "Validasi Lokal Gagal",
        message: "Password dan Confirm Password tidak sama.",
        errors: { password_confirmation: ["Konfirmasi password tidak cocok."] }
      });
      setIsLoading(false);
      return;
    }

    try {
      // Karena kontrak registrasi memerlukan "name", untuk form awal kamu bisa menyertakan nama default atau menambahkan input Name di form Sign Up.
      // Di sini kita ambil string sebelum '@' dari email sebagai nama default, atau sediakan input name.
      const nameFromEmail = email.split('@')[0];
      const payload = {
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        email: email,
        password: password,
        password_confirmation: confirmPassword
      };

      const response = await authService.register(payload);
      
      const { access_token, user } = response.data;
      
      // Login otomatis setelah register sukses
      login(access_token, user);
      navigate("/flow");
    } catch (err) {
      setErrorPopup({
        isOpen: true,
        title: "Gagal Registrasi",
        message: err.message || "Data registrasi tidak valid.",
        errors: err.errors || null
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
        className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,_#b9b9b9_1.5px,_transparent_2px)] [background-size:32px_32px]"
        style={{
          transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
        }}
      />
      {/* Grid Dots layer 2 (depth) - dulu .wrapper::after */}
      <div
        className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,_#c9c9c9_1px,_transparent_1px)] [background-size:64px_64px]"
        style={{
          transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px)`,
        }}
      />

      <div className="flex-1 flex justify-center items-center px-5 py-10 relative z-[1]">
        <div className="relative z-[1]">
          <label className="relative flex flex-col justify-center items-center gap-10 w-[70px] h-7 -translate-y-[250px]">
            <input type="checkbox" className="peer opacity-0 w-0 h-0" />
            <span className="peer-checked:bg-[var(--input-focus)] bg-transparent transition-colors duration-300 box-border rounded-lg border-[3px] border-[var(--main-color)] shadow-[6px_6px_var(--main-color)] absolute cursor-pointer inset-0 w-[70px] h-7 before:content-[''] before:box-border before:absolute before:h-7 before:w-7 before:border-[3px] before:border-[var(--main-color)] before:rounded-lg before:left-[-3px] before:bottom-[-1px] before:bg-[var(--bg-color)] before:shadow-[0_4px_0_var(--main-color)] before:transition-transform before:duration-300 peer-checked:before:translate-x-[42px]" />
            <span className="relative before:content-['Log_in'] before:absolute before:-left-[130px] before:top-0 before:w-[140px] before:underline before:text-[var(--font-color)] before:font-semibold before:text-[23px] peer-checked:before:no-underline after:content-['Sign_up'] after:absolute after:left-[70px] after:top-0 after:w-[140px] after:no-underline after:text-[var(--font-color)] after:font-semibold after:text-[23px] peer-checked:after:underline" />
            <div className="peer-checked:[transform:rotateY(180deg)] w-[420px] h-[560px] relative bg-transparent [perspective:1000px] text-center transition-transform duration-[800ms] [transform-style:preserve-3d]">
              <div className="flip-card-face p-[35px] absolute flex flex-col justify-center [backface-visibility:hidden] bg-[#f0f0f0] gap-5 rounded-[10px] border-[3px] border-[var(--main-color)] shadow-[8px_8px_var(--main-color)]">
                {/* Logo di atas Welcome */}
                <div className="flex justify-center items-center mb-2">
                  <img
                    src={'./public/images/iconAppNoBg.png'}
                    alt="FlowDoc Logo"
                    className="w-[70px] h-[70px] object-contain rounded-lg border-[3px] border-[var(--main-color)] shadow-[4px_4px_0_var(--main-color)] bg-white p-2"
                  />
                </div>
                <div className="mb-[5px] text-[32px] font-black text-center text-[var(--main-color)]">
                  Welcome FlowTech!
                </div>
                {error && (
                  <div className="bg-[#fee2e2] text-[#dc2626] px-[15px] py-[10px] rounded-lg text-base font-semibold w-full text-center border-2 border-[#dc2626] box-border">
                    {error}
                  </div>
                )}
                <form
                  className="flex flex-col items-center gap-[26px]"
                  onSubmit={handleLogin}
                >
                  <input
                    className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="relative w-[340px]">
                    <input
                      className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
                      name="password"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--font-color-sub)] p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="currentColor"
                            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="currentColor"
                            d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    className="my-[15px] w-[170px] h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-[var(--font-color)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Let`s go!"}
                  </button>
                </form>
              </div>
              <div className="flip-card-face w-full [transform:rotateY(180deg)] p-[35px] absolute flex flex-col justify-center [backface-visibility:hidden] bg-[#f0f0f0] gap-5 rounded-[10px] border-[3px] border-[var(--main-color)] shadow-[8px_8px_var(--main-color)]">
                <div className="mb-[5px] text-[32px] font-black text-center text-[var(--main-color)]">
                  Sign up
                </div>
                {error && (
                  <div className="bg-[#fee2e2] text-[#dc2626] px-[15px] py-[10px] rounded-lg text-base font-semibold w-full text-center border-2 border-[#dc2626] box-border">
                    {error}
                  </div>
                )}
                <form
                  className="flex flex-col items-center gap-[26px]"
                  onSubmit={handleLogin}
                >
                  <input
                    className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="relative w-[340px]">
                    <input
                      className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
                      name="password"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--font-color-sub)] p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="currentColor"
                            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="currentColor"
                            d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    className="my-[15px] w-[170px] h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-[var(--font-color)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Let`s go!"}
                  </button>
                </form>
              </div>
              <div className="flip-card-face w-full [transform:rotateY(180deg)] p-[35px] absolute flex flex-col justify-center [backface-visibility:hidden] bg-[#f0f0f0] gap-5 rounded-[10px] border-[3px] border-[var(--main-color)] shadow-[8px_8px_var(--main-color)]">
                <div className="mb-[5px] text-[32px] font-black text-center text-[var(--main-color)]">
                  Sign up
                </div>
                {error && (
                  <div className="bg-[#fee2e2] text-[#dc2626] px-[15px] py-[10px] rounded-lg text-base font-semibold w-full text-center border-2 border-[#dc2626] box-border">
                    {error}
                  </div>
                )}
                <form
                  className="flex flex-col items-center gap-[26px]"
                  onSubmit={handleSignUp}
                >
                  <input
                    className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="relative w-[340px]">
                    <input
                      className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
                      name="password"
                      placeholder="Password"
                      type={showSignupPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--font-color-sub)] p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="currentColor"
                            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="currentColor"
                            d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="relative w-[340px]">
                    <input
                      className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      type={showSignupConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--font-color-sub)] p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                      onClick={() =>
                        setShowSignupConfirmPassword(!showSignupConfirmPassword)
                      }
                    >
                      {showSignupConfirmPassword ? (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="currentColor"
                            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="currentColor"
                            d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    className="my-[15px] w-[170px] h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-[var(--font-color)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Confirm!"}
                  </button>
                </form>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-[1] w-full bg-[#e8e8e8] border-t-[3px] border-[var(--main-color)] py-4 mt-auto">
        <div className="max-w-[1200px] mx-auto px-10 text-center">
          <p className="text-sm font-semibold text-[var(--font-color-sub)] m-0">
            © 2026 FlowTech. Jember State Polytechnic Internship Team.
          </p>
        </div>
      </footer>

      {/* Komponen Popup Error Neo-Brutalisme */}
      <ErrorPopup 
        isOpen={errorPopup.isOpen}
        onClose={() => setErrorPopup({ ...errorPopup, isOpen: false })}
        title={errorPopup.title}
        message={errorPopup.message}
        errors={errorPopup.errors}
      />
    </div>
  );
}
