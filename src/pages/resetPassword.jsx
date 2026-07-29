// import { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// // Import logo - sesuaikan dengan path logo Anda
// import logo from "../assets/logo_tff.png"; // atau logo.svg

// // service
// import { authService } from "../services/authService";

// // error popup
// import ErrorPopup from "../components/error/ErrorPopup";

// // CSS custom properties (sama seperti Login.jsx & ForgotPassword.jsx, supaya tema neo-brutalism konsisten)
// const cssVars = {
//   "--input-focus": "#2d8cf0",
//   "--font-color": "#323232",
//   "--font-color-sub": "#666",
//   "--bg-color": "#fff",
//   "--bg-color-alt": "#666",
//   "--main-color": "#323232",
// };

// const CODE_LENGTH = 6;

// export default function ResetPassword() {
//   // Email dikirim dari ForgotPassword.jsx lewat navigate(path, { state: { email } })
//   const location = useLocation();
//   const email = location.state?.email || "";

//   const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   const wrapperRef = useRef(null);
//   const codeInputRefs = useRef([]);
//   const navigate = useNavigate();

//   const [errorPopup, setErrorPopup] = useState({
//     isOpen: false,
//     title: "",
//     message: "",
//     errors: null,
//   });

//   // Efek parallax dot-grid, sama seperti Login.jsx & ForgotPassword.jsx
//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       if (wrapperRef.current) {
//         const rect = wrapperRef.current.getBoundingClientRect();
//         const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
//         const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
//         setMousePosition({ x, y });
//       }
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   // Ubah 1 karakter di posisi `index`, lalu pindah fokus ke kotak berikutnya
//   const handleCodeChange = (index, value) => {
//     // Hanya izinkan 1 digit angka per kotak
//     const digit = value.replace(/[^0-9]/g, "").slice(-1);

//     const newCode = [...code];
//     newCode[index] = digit;
//     setCode(newCode);

//     if (digit && index < CODE_LENGTH - 1) {
//       codeInputRefs.current[index + 1]?.focus();
//     }
//   };

//   // Backspace pada kotak kosong -> pindah & hapus kotak sebelumnya
//   const handleCodeKeyDown = (index, e) => {
//     if (e.key === "Backspace" && !code[index] && index > 0) {
//       const newCode = [...code];
//       newCode[index - 1] = "";
//       setCode(newCode);
//       codeInputRefs.current[index - 1]?.focus();
//     }
//   };

//   // Dukungan paste kode sekaligus (mis. copy dari email) ke kotak pertama
//   const handleCodePaste = (e) => {
//     e.preventDefault();
//     const pasted = e.clipboardData
//       .getData("text")
//       .replace(/[^0-9]/g, "")
//       .slice(0, CODE_LENGTH);
//     if (!pasted) return;

//     const newCode = Array(CODE_LENGTH).fill("");
//     for (let i = 0; i < pasted.length; i++) {
//       newCode[i] = pasted[i];
//     }
//     setCode(newCode);
//     const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
//     codeInputRefs.current[focusIndex]?.focus();
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();

//     const verificationCode = code.join("");

//     if (verificationCode.length < CODE_LENGTH) {
//       setErrorPopup({
//         isOpen: true,
//         title: "Kode Belum Lengkap",
//         message: `Masukkan semua ${CODE_LENGTH} digit kode verifikasi.`,
//         errors: null,
//       });
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setErrorPopup({
//         isOpen: true,
//         title: "Validasi Lokal Gagal",
//         message: "Password baru dan Confirm Password tidak sama.",
//         errors: { password_confirmation: ["Konfirmasi password tidak cocok."] },
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Sesuaikan nama method & payload ini dengan endpoint reset password di backend kamu
//       await authService.resetPassword({
//         email,
//         code: verificationCode,
//         password: newPassword,
//         password_confirmation: confirmPassword,
//       });

//       // Setelah berhasil, arahkan kembali ke Login supaya user login pakai password baru
//       navigate("/login");
//     } catch (err) {
//       setErrorPopup({
//         isOpen: true,
//         title: "Gagal Reset Password",
//         message: err.message || "Kode verifikasi salah atau sudah kedaluwarsa.",
//         errors: err.errors || null,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       ref={wrapperRef}
//       style={cssVars}
//       className="flex flex-col min-h-screen bg-[#e8e8e8] relative overflow-hidden"
//     >
//       {/* Grid Dots layer 1 */}
//       <div
//         className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,_#b9b9b9_1.5px,_transparent_2px)] [background-size:32px_32px]"
//         style={{
//           transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
//         }}
//       />
//       {/* Grid Dots layer 2 (depth) */}
//       <div
//         className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,_#c9c9c9_1px,_transparent_1px)] [background-size:64px_64px]"
//         style={{
//           transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px)`,
//         }}
//       />

//       <div className="flex-1 flex justify-center items-center px-5 py-10 relative z-[1]">
//         <div className="w-[420px] p-[35px] flex flex-col justify-center gap-5 rounded-[10px] border-[3px] border-[var(--main-color)] bg-[#f0f0f0] shadow-[8px_8px_var(--main-color)]">
//           {/* Logo */}
//           <div className="flex justify-center items-center mb-2">
//             <img
//               src={logo}
//               alt="FlowDoc Logo"
//               className="w-[70px] h-[70px] object-contain rounded-lg border-[3px] border-[var(--main-color)] shadow-[4px_4px_0_var(--main-color)] bg-white p-2"
//             />
//           </div>

//           {/* Judul & subjudul */}
//           <div className="text-[26px] font-black text-center text-[var(--main-color)]">
//             Enter Verification Code
//           </div>
//           <p className="-mt-3 text-sm font-semibold text-center text-[var(--font-color-sub)]">
//             We've sent a code to your email
//             {email ? ` (${email})` : ""}
//           </p>

//           <form
//             className="flex flex-col items-center gap-[26px]"
//             onSubmit={handleResetPassword}
//           >
//             {/* 6 kotak kode verifikasi */}
//             <div className="flex justify-center gap-2">
//               {code.map((digit, index) => (
//                 <input
//                   key={index}
//                   ref={(el) => (codeInputRefs.current[index] = el)}
//                   className="w-[48px] h-[56px] text-center rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[4px_4px_var(--main-color)] text-xl font-bold text-[var(--font-color)] outline-none box-border focus:border-[var(--input-focus)]"
//                   type="text"
//                   inputMode="numeric"
//                   maxLength={1}
//                   value={digit}
//                   onChange={(e) => handleCodeChange(index, e.target.value)}
//                   onKeyDown={(e) => handleCodeKeyDown(index, e)}
//                   onPaste={handleCodePaste}
//                 />
//               ))}
//             </div>

//             {/* Password baru */}
//             <div className="relative w-[340px]">
//               <input
//                 className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
//                 name="newPassword"
//                 placeholder="New Password"
//                 type={showNewPassword ? "text" : "password"}
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 required
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--font-color-sub)] p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
//                 onClick={() => setShowNewPassword(!showNewPassword)}
//               >
//                 {showNewPassword ? (
//                   <svg viewBox="0 0 24 24" width="20" height="20">
//                     <path
//                       fill="currentColor"
//                       d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
//                     />
//                   </svg>
//                 ) : (
//                   <svg viewBox="0 0 24 24" width="20" height="20">
//                     <path
//                       fill="currentColor"
//                       d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
//                     />
//                   </svg>
//                 )}
//               </button>
//             </div>

//             {/* Confirm password */}
//             <div className="relative w-[340px]">
//               <input
//                 className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
//                 name="confirmPassword"
//                 placeholder="Confirm Password"
//                 type={showConfirmPassword ? "text" : "password"}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 required
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--font-color-sub)] p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               >
//                 {showConfirmPassword ? (
//                   <svg viewBox="0 0 24 24" width="20" height="20">
//                     <path
//                       fill="currentColor"
//                       d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
//                     />
//                   </svg>
//                 ) : (
//                   <svg viewBox="0 0 24 24" width="20" height="20">
//                     <path
//                       fill="currentColor"
//                       d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
//                     />
//                   </svg>
//                 )}
//               </button>
//             </div>

//             <button
//               className="my-[10px] w-[260px] h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-[var(--font-color)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
//               type="submit"
//               disabled={isLoading}
//             >
//               {isLoading ? "Processing..." : "Reset & Confirm"}
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* Komponen Popup Error Neo-Brutalisme */}
//       <ErrorPopup
//         isOpen={errorPopup.isOpen}
//         onClose={() => setErrorPopup({ ...errorPopup, isOpen: false })}
//         title={errorPopup.title}
//         message={errorPopup.message}
//         errors={errorPopup.errors}
//       />
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo_tff.png";
import { authService } from "../services/authService";
import ErrorPopup from "../components/error/ErrorPopUp";

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
  const navigate = useNavigate();

  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    errors: null,
  });

  // Jika halaman ini diakses langsung tanpa email dari ForgotPassword, kembalikan ke /forgot-password
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
        message: `Masukkan semua ${CODE_LENGTH} digit kode OTP.`,
        errors: null,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorPopup({
        isOpen: true,
        title: "Validasi Gagal",
        message: "Password baru dan Konfirmasi Password tidak cocok.",
        errors: { password_confirmation: ["Konfirmasi password tidak cocok."] },
      });
      return;
    }

    setIsLoading(true);
    try {
      // PAYLOAD DISESUAIKAN DENGAN SWAGGER (otp):[cite: 9, 10]
      await authService.resetPassword({
        email,
        otp: verificationCode,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      alert("Password berhasil diubah! Silakan login menggunakan password baru.");
      navigate("/auth");
    } catch (err) {
      setErrorPopup({
        isOpen: true,
        title: "Gagal Reset Password",
        message: err.message || "OTP tidak valid atau sudah kedaluwarsa.",
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
      <div
        className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,_#b9b9b9_1.5px,_transparent_2px)] [background-size:32px_32px]"
        style={{
          transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
        }}
      />
      <div
        className="fixed inset-0 opacity-100 z-0 pointer-events-none transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform bg-[radial-gradient(circle,_#c9c9c9_1px,_transparent_1px)] [background-size:64px_64px]"
        style={{
          transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px)`,
        }}
      />

      <div className="flex-1 flex justify-center items-center px-5 py-10 relative z-[1]">
        <div className="w-[420px] p-[35px] flex flex-col justify-center gap-5 rounded-[10px] border-[3px] border-[var(--main-color)] bg-[#f0f0f0] shadow-[8px_8px_var(--main-color)]">
          <div className="flex justify-center items-center mb-2">
            <img
              src={logo}
              alt="FlowDoc Logo"
              className="w-[70px] h-[70px] object-contain rounded-lg border-[3px] border-[var(--main-color)] shadow-[4px_4px_0_var(--main-color)] bg-white p-2"
            />
          </div>

          <div className="text-[26px] font-black text-center text-[var(--main-color)]">
            Enter OTP Code
          </div>
          <p className="-mt-3 text-sm font-semibold text-center text-[var(--font-color-sub)]">
            We've sent a code to <span className="font-bold text-black">{email}</span>
          </p>

          <form
            className="flex flex-col items-center gap-[20px]"
            onSubmit={handleResetPassword}
          >
            {/* 6 Kotak OTP */}
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (codeInputRefs.current[index] = el)}
                  className="w-[48px] h-[56px] text-center rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[4px_4px_var(--main-color)] text-xl font-bold text-[var(--font-color)] outline-none box-border focus:border-[var(--input-focus)]"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={handleCodePaste}
                />
              ))}
            </div>

            {/* Input New Password */}
            <div className="relative w-full">
              <input
                className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
                name="newPassword"
                placeholder="New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--font-color-sub)] p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "👁️" : "🙈"}
              </button>
            </div>

            {/* Input Confirm Password */}
            <div className="relative w-full">
              <input
                className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] pr-[45px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
                name="confirmPassword"
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--font-color-sub)] p-1 flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "🙈"}
              </button>
            </div>

            <button
              className="mt-2 w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-[var(--font-color)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
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
        onClose={() => setErrorPopup({ ...errorPopup, isOpen: false })}
        title={errorPopup.title}
        message={errorPopup.message}
        errors={errorPopup.errors}
      />
    </div>
  );
}