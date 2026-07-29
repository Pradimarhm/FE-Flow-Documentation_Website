// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// // Import logo - sesuaikan dengan path logo Anda
// import logo from "../assets/logo_tff.png"; // atau logo.svg

// // service
// import { authService } from "../services/authService";

// // error popup
// import ErrorPopup from "../components/error/ErrorPopup";

// // CSS custom properties (sama seperti di Login.jsx, supaya tema neo-brutalism konsisten)
// const cssVars = {
//   "--input-focus": "#2d8cf0",
//   "--font-color": "#323232",
//   "--font-color-sub": "#666",
//   "--bg-color": "#fff",
//   "--bg-color-alt": "#666",
//   "--main-color": "#323232",
// };

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSent, setIsSent] = useState(false);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   const wrapperRef = useRef(null);
//   const navigate = useNavigate();

//   const [errorPopup, setErrorPopup] = useState({
//     isOpen: false,
//     title: "",
//     message: "",
//     errors: null,
//   });

//   // Efek parallax dot-grid, sama seperti di Login.jsx supaya konsisten
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

//   const handleForgotPassword = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       // Panggil API forgot password.
//       // Sesuaikan nama method ini dengan yang tersedia di authService (mis. authService.forgotPassword)
//       await authService.forgotPassword({ email });
//       setIsSent(true);
//     } catch (err) {
//       setErrorPopup({
//         isOpen: true,
//         title: "Gagal Mengirim Email",
//         message: err.message || "Terjadi kesalahan pada sistem.",
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
//           <div className="text-[28px] font-black text-center text-[var(--main-color)]">
//             Forgot your password?
//           </div>
//           <p className="-mt-3 text-sm font-semibold text-center text-[var(--font-color-sub)]">
//             Don't worry! It happens. Please enter your email
//           </p>

//           {isSent ? (
//             <div className="bg-[#dcfce7] text-[#16a34a] px-[15px] py-[10px] rounded-lg text-base font-semibold w-full text-center border-2 border-[#16a34a] box-border">
//               Link reset password telah dikirim ke email Anda. Silakan cek
//               inbox (atau folder spam).
//             </div>
//           ) : (
//             <form
//               className="flex flex-col items-center gap-[26px]"
//               onSubmit={handleForgotPassword}
//             >
//               <input
//                 className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
//                 name="email"
//                 placeholder="Email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <button
//                 className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-[var(--font-color)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
//                 type="submit"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Sending..." : "Submit"}
//               </button>
//             </form>
//           )}

//           {/* Kembali ke halaman Login */}
//           <button
//             type="button"
//             onClick={() => navigate("/login")}
//             className="bg-transparent border-none p-0 cursor-pointer text-sm font-semibold text-[var(--input-focus)] underline text-center hover:opacity-80"
//           >
//             Back to Login
//           </button>
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
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo_tff.png";
import { authService } from "../services/authService";
import ErrorPopup from "../components/error/ErrorPopup";

const cssVars = {
  "--input-focus": "#2d8cf0",
  "--font-color": "#323232",
  "--font-color-sub": "#666",
  "--bg-color": "#fff",
  "--bg-color-alt": "#666",
  "--main-color": "#323232",
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    errors: null,
  });

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Panggil API forgot-password[cite: 8, 10]
      await authService.forgotPassword({ email });

      // 2. Redirect ke Halaman Reset Password dengan melempar state email[cite: 8, 9]
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      // Menangkap error 404 (Email tidak ditemukan) atau 422 (Format tidak valid)[cite: 10]
      setErrorPopup({
        isOpen: true,
        title: "Gagal Mengirim OTP",
        message: err.message || "Email tidak ditemukan atau format tidak valid.",
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

          <div className="text-[28px] font-black text-center text-[var(--main-color)]">
            Forgot your password?
          </div>
          <p className="-mt-3 text-sm font-semibold text-center text-[var(--font-color-sub)]">
            Don't worry! Enter your email to receive an OTP code.
          </p>

          <form
            className="flex flex-col items-center gap-[26px]"
            onSubmit={handleForgotPassword}
          >
            <input
              className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-lg font-semibold text-[var(--font-color)] px-[15px] outline-none box-border placeholder:text-[var(--font-color-sub)] placeholder:opacity-80 focus:border-[var(--input-focus)]"
              name="email"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              className="w-full h-[52px] rounded-lg border-[3px] border-[var(--main-color)] bg-[var(--bg-color)] shadow-[6px_6px_var(--main-color)] text-xl font-semibold text-[var(--font-color)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:shadow-[0px_0px_var(--main-color)] active:translate-x-1 active:translate-y-1"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="bg-transparent border-none p-0 cursor-pointer text-sm font-semibold text-[var(--input-focus)] underline text-center hover:opacity-80"
          >
            Back to Login
          </button>
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