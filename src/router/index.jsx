import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

import AuthLayout from '../components/layouts/authLayout';

import Login from '../pages/login';

// Placeholder komponen (nanti kamu ganti dengan file aslinya)
// const Login = () => <div>Halaman Login (Belum Dibangun)</div>;
const Register = () => <div>Halaman Register (Belum Dibangun)</div>;
const DashboardLayout = () => <div>Layout Utama (Sidebar + Navbar) <br/> <Outlet /></div>;
const FlowCanvas = () => <div>Kanvas Simulasi FlowDoc</div>;

export const router = createBrowserRouter([
    {
        // Zona Publik
        element: <PublicRoute />,
        children: [
            {
                element: <AuthLayout />, // Bungkus rute publik dengan layout ini
                children: [
                    { path: '/login', element: <Login /> },
                    { path: '/register', element: <Register /> },
                ],
            },
            // {
            //     path: '/login',
            //     element: <Login />,
            // },
            // {
            //     path: '/register',
            //     element: <Register />,
            // },
        ],
    },
    {
        // Zona Terlindungi
        element: <ProtectedRoute />,
        children: [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
            {
                index: true,
                element: <FlowCanvas />, // Halaman default saat masuk
            },
            // Nanti tambahkan route lain di sini seperti /orders, /database, dll
            ],
        },
        ],
    },
]);