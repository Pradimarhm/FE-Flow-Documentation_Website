import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Jika tidak punya akses, tendang kembali ke pintu depan
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika aman, persilakan masuk ke layout/komponen anak
  return <Outlet />;
}