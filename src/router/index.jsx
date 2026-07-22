import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import Layout Global
import AppLayout from '../components/layouts/appLayout';
// import CanvasPage from '../pages/canvasPage';
import CanvasLayout from '../pages/canvas/canvasLayout'
import FlowListPage from '../pages/flowListPage'
import Dashboard from '../pages/dashboardPage'
import Login from '../pages/login.jsx'

// Import Halaman (Mockup sementara)
// const Dashboard = () => <div className="p-6 bg-white h-full">Konten Dashboard</div>;
const CanvasTest = () => <div className="p-6 bg-white h-full">Konten Canvas</div>;
const Nodes = () => <div className="p-6 bg-white h-full">Daftar Node</div>;
const ApiTest = () => <div className="p-6 bg-white h-full">API & EndPoints</div>;
const ExecutionLogs = () => <div className="p-6 bg-white h-full">Execution Logs</div>;
// const Login = () => <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Halaman Login (Publik)</div>;

const router = createBrowserRouter([
    {
        // PARENT ROUTE: Membungkus semua halaman yang butuh Sidebar & Header
        path: '/',
        // Untuk sementara, kita bypass ProtectedRoute dan langsung render AppLayout
        element: <AppLayout />, 
        children: [
            {
                index: true, // Akan dirender saat user mengakses '/'
                element: <Dashboard />,
            },
            {
                path: '/flow', // Akan dirender saat user mengakses '/canvas'
                element: <FlowListPage />,
            },
            {
                path: '/flow/canvas', // Akan dirender saat user mengakses '/canvas'
                element: <CanvasLayout />,
            },
            {
                path: '/nodes', // Akan dirender saat user mengakses '/canvas'
                element: <Nodes />,
            },
            {
                path: '/api-endpoints', // Akan dirender saat user mengakses '/canvas'
                element: <ApiTest />,
            },
            {
                path: '/logs', // Akan dirender saat user mengakses '/canvas'
                element: <ExecutionLogs />,
            },
            // Tambahkan rute halaman lain di sini
        ],
    },
    {
        // RUTE PUBLIK: Di luar AppLayout, mengambil alih 100% layar
        path: '/auth',
        element: <Login />,
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;


// import { createBrowserRouter } from 'react-router-dom';
// import ProtectedRoute from './ProtectedRoute';
// import PublicRoute from './PublicRoute';

// import AuthLayout from '../components/layouts/authLayout';

// import Login from '../pages/login';

// // Placeholder komponen (nanti kamu ganti dengan file aslinya)
// // const Login = () => <div>Halaman Login (Belum Dibangun)</div>;
// const Register = () => <div>Halaman Register (Belum Dibangun)</div>;
// const DashboardLayout = () => <div>Layout Utama (Sidebar + Navbar) <br/> <Outlet /></div>;
// const FlowCanvas = () => <div>Kanvas Simulasi FlowDoc</div>;

// export const router = createBrowserRouter([
//     {
//         // Zona Publik
//         element: <PublicRoute />,
//         children: [
//             {
//                 element: <AuthLayout />, // Bungkus rute publik dengan layout ini
//                 children: [
//                     { path: '/login', element: <Login /> },
//                     { path: '/register', element: <Register /> },
//                 ],
//             },
//             // {
//             //     path: '/login',
//             //     element: <Login />,
//             // },
//             // {
//             //     path: '/register',
//             //     element: <Register />,
//             // },
//         ],
//     },
//     {
//         // Zona Terlindungi
//         element: <ProtectedRoute />,
//         children: [
//         {
//             path: '/',
//             element: <DashboardLayout />,
//             children: [
//             {
//                 index: true,
//                 element: <FlowCanvas />, // Halaman default saat masuk
//             },
//             // Nanti tambahkan route lain di sini seperti /orders, /database, dll
//             ],
//         },
//         ],
//     },
// ]);