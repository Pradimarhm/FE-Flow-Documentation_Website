import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import PublicRoute from '../router/publicRoute'
import ProtectedRoute from '../router/protectedRoute'

// Import Layout Global
import AppLayout from '../components/layouts/appLayout';
// import CanvasPage from '../pages/canvasPage';
import CanvasLayout from '../pages/canvas/canvasLayout'
import FlowListPage from '../pages/flowListPage'
import Dashboard from '../pages/dashboardPage'
import Login from '../pages/login.jsx'
import TemplatesPage from '../pages/templatePages'
// import NodesPage from '../pages/nodePages'

// Import Halaman (Mockup sementara)
// const Dashboard = () => <div className="p-6 bg-white h-full">Konten Dashboard</div>;
// const CanvasTest = () => <div className="p-6 bg-white h-full">Konten Canvas</div>;
const Nodes = () => <div className="p-6 bg-white h-full">Daftar Node</div>;
const ApiTest = () => <div className="p-6 bg-white h-full">API & EndPoints</div>;
const ExecutionLogs = () => <div className="p-6 bg-white h-full">Execution Logs</div>;
// const Login = () => <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Halaman Login (Publik)</div>;

// const router = createBrowserRouter([
//     {
//         // PARENT ROUTE: Membungkus semua halaman yang butuh Sidebar & Header
//         path: '/',
//         // Untuk sementara, kita bypass ProtectedRoute dan langsung render AppLayout
//         element: <AppLayout />, 
//         children: [
//             {
//                 index: true, // Akan dirender saat user mengakses '/'
//                 element: <Dashboard />,
//             },
//             {
//                 path: '/flow', // Akan dirender saat user mengakses '/canvas'
//                 element: <FlowListPage />,
//             },
//             {
//                 path: '/flow/canvas', // Akan dirender saat user mengakses '/canvas'
//                 element: <CanvasLayout />,
//             },
//             {
//                 path: '/nodes', // Akan dirender saat user mengakses '/canvas'
//                 element: <NodesPage />,
//             },
//             {
//                 path: '/api-endpoints', // Akan dirender saat user mengakses '/canvas'
//                 element: <ApiTest />,
//             },
//             {
//                 path: '/logs', // Akan dirender saat user mengakses '/canvas'
//                 element: <ExecutionLogs />,
//             },
//             // Tambahkan rute halaman lain di sini
//         ],
//     },
//     {
//         // RUTE PUBLIK: Di luar AppLayout, mengambil alih 100% layar
//         path: '/auth',
//         element: <Login />,
//     },
// ]);

// const AppRouter = () => {
//     return <RouterProvider router={router} />;
// };

// export default AppRouter;

export const router = createBrowserRouter([
    {
        // Zona Publik
        element: <PublicRoute />,
        children: [
            {
                path: '/login',
                element: <Login />,
            },
            // Jika ingin /register mengarah ke halaman yang sama (karena form login/register jadi satu di Login.jsx)
            {
                path: '/register',
                element: <Login />,
            }
        ],
    },
    {
        // Zona Terlindungi
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <AppLayout />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: 'flow',
                        element: <FlowListPage />,
                    },
                    /* 
                       ✅ FIX 1: Ubah {id} jadi :flowId
                       ✅ FIX 2: Sesuaikan path agar match dengan navigate('/flow/123')
                    */
                    {
                        path: 'flow/:flowId',
                        element: <CanvasLayout />,
                    },
                    {
                        path: 'template',
                        element: <TemplatesPage />,
                    },
                    {
                        path: 'api-endpoints',
                        element: <ApiTest />,
                    },
                    {
                        path: 'logs',
                        element: <ExecutionLogs />,
                    },
                ],
            },
        ],
    },
    // Fallback
    {
        path: '*',
        element: <Login />
    }
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;