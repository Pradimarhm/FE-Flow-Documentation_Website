// src/router/RoleProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RoleProtectedRoute({ moduleSlug }) {
    const { isAuthenticated, permissions } = useAuthStore();

    // 1. Lapis pertama: Cek Login (Sama seperti sebelumnya)
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    // 2. Jika modul ini adalah dashboard (publik untuk semua user login), langsung izinkan
    if (moduleSlug === 'dashboard') {
        return <Outlet />;
    }

    // 3. Lapis kedua: RBAC Macro-Protection
    // Cari apakah user memiliki akses 'read' ke modul slug yang diminta
    const hasAccess = permissions?.some(
        (p) => p.module === moduleSlug && p.actions.includes('read')
    );

    // Jika user memaksa masuk via URL tanpa permission, tendang kembali ke Dashboard
    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}