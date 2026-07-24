// import { useRef, useEffect } from 'react';
// import { Outlet } from 'react-router-dom';

// export default function AuthLayout() {
//   const videoRef = useRef(null);

//   useEffect(() => {
//     const video = videoRef.current;
//     let timeoutId = null;

//     const handleVideoEnd = () => {
//       timeoutId = setTimeout(() => {
//         if (video) {
//           video.currentTime = 0;
//           video.play().catch(err => {
//             console.log('Video play error:', err);
//           });
//         }
//       }, 2000);
//     };

//     if (video) {
//       video.addEventListener('ended', handleVideoEnd);
//       video.play().catch(err => {
//         console.log('Video autoplay error:', err);
//       });
//     }

//     return () => {
//       if (video) {
//         video.removeEventListener('ended', handleVideoEnd);
//       }
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//       }
//     };
//   }, []);

//   return (
//     <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
//       {/* Left Side - Video Section */}
//       <div className="hidden lg:flex lg:w-1/2 relative">
//         {/* Background gradient untuk sisi kiri */}
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"></div>
        
//         {/* Video dengan efek transparansi */}
//         <video 
//           ref={videoRef}
//           muted 
//           playsInline
//           autoPlay
//           className="w-full h-full object-cover mix-blend-multiply"
//           style={{
//             // Jika video background hitam, gunakan screen
//             // Jika video background putih, gunakan multiply
//             mixBlendMode: 'multiply' // atau 'screen'
//           }}
//           onError={(e) => {
//             console.log('Video error:', e);
//             e.target.style.display = 'none';
//           }}
//         >
//           <source src="/videos/login_bg1.mp4" type="video/mp4" />
//           {/* Fallback ke MP4 jika WebM tidak support */}
//           {/* <source src="/videos/login_bg.mp4" type="video/mp4" /> */}
//         </video>
        
//         {/* Overlay tipis untuk blending */}
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5"></div>
//       </div>

//       {/* Right Side - Login Card */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10">
//         <div className="w-full max-w-md">
//           {/* Glassmorphism Card */}
//           <div className="backdrop-blur-xl bg-white/40 rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 lg:p-12">
//             <div className="text-center mb-8">
//               <div className="lg:hidden inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
//                 <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
//                 </svg>
//               </div>
//               <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
//                 Welcome Back
//               </h2>
//               <p className="mt-2 text-gray-600 text-sm">
//                 Sign in to continue to FlowDoc
//               </p>
//             </div>
            
//             <Outlet />
//           </div>
          
//           <div className="mt-6 text-center">
//             <p className="text-gray-500/60 text-xs">
//               © 2024 FlowDoc. All rights reserved.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

    import { Outlet } from 'react-router-dom';

    export default function AuthLayout() {
    return (
        <div className="min-h-screen">
        <Outlet />
        </div>
    );
    }