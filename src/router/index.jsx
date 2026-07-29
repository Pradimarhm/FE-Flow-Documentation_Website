import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";

import PublicRoute from "../router/publicRoute";
import ProtectedRoute from "../router/protectedRoute";
import RoleProtectedRoute from "../router/roleProtectedRoute";

// Import Layout & Pages
import AppLayout from "../components/layouts/appLayout";
import CanvasLayout from "../pages/canvas/canvasLayout";
import FlowListPage from "../pages/flowListPage";
import Dashboard from "../pages/dashboardPage";
import Login from "../pages/login.jsx";
import TemplatesPage from "../pages/templatePages";
import ForgotPassword from "../pages/forgotPassword";
import PermissionsPage from "../pages/permissionsPage"; 
import UsersPage from '../pages/usersPage';
import ResetPassword from '../pages/ResetPassword';
import SettingsPage from '../pages/settingsPage';

// Mockup pages
const ApiTest = () => (
    <div className="p-6 bg-white h-full">API & EndPoints</div>
);
const Users = () => <div className="p-6 bg-white h-full">Users</div>;

export const router = createBrowserRouter([
    {
        // ZONA PUBLIK (Hanya bisa diakses jika BELUM login)
        element: <PublicRoute />,
        children: [
            {
                path: "/auth",
                element: <Login />,
            },
            {
                path: "/forgot-password",
                element: <ForgotPassword />,
            },
            {
                path: '/reset-password',
                element: <ResetPassword />, // Pasang di sini
            }
        ],
    },
    {
        // ZONA TERLINDUNGI (Wajib Login)
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <AppLayout />,
                children: [
                    {
                        element: <RoleProtectedRoute moduleSlug="dashboard" />,
                        children: [{ index: true, element: <Dashboard /> }],
                    },
                    {
                        path: "templates",
                        element: <RoleProtectedRoute moduleSlug="templates" />,
                        children: [{ index: true, element: <TemplatesPage /> }],
                    },
                    {
                        path: "flows",
                        element: <RoleProtectedRoute moduleSlug="flows" />,
                        children: [{ index: true, element: <FlowListPage /> }],
                    },
                    {
                        path: "flows/:flowId",
                        element: <RoleProtectedRoute moduleSlug="flows" />,
                        children: [{ index: true, element: <CanvasLayout /> }],
                    },
                    {
                        path: "permissions",
                        element: (
                            <RoleProtectedRoute moduleSlug="permissions" />
                        ),
                        children: [
                            { index: true, element: <PermissionsPage /> },
                        ], // <-- PASANG DI SINI
                    },
                    {
                        path: "users",
                        element: <RoleProtectedRoute moduleSlug="users" />,
                        children: [{ index: true, element: <UsersPage /> }],
                    },
                    {
                        path: "settings",
                        element: <SettingsPage />, 
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
