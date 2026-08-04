// src/components/layout/Header.jsx
import React, { useEffect } from 'react';
import { User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

const Header = () => {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // GET /auth/me mengembalikan UserResource (id, name, email, role, modules)
                const response = await authService.getProfile();
                const userData = response?.data || response;
                if (userData) {
                    setUser(userData);
                }
            } catch (err) {
                console.error("Gagal mengambil data user di Header:", err);
            }
        };

        if (!user) {
            fetchUserData();
        }
    }, [user, setUser]);

    // Mengambil role string langsung dari UserResource.php (misal "Admin" atau "User")
    const displayRole = user?.role || 'Pengguna';

    return (
        <header className="h-16 flex px-4 items-center justify-end border-b-2 border-olive-900 bg-white shrink-0">
            <div className="h-full flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-black uppercase leading-none mb-1">
                        {user?.name || 'Loading...'}
                    </span>
                    <span className="text-xs font-normal text-slate-500 leading-none">
                        {displayRole}
                    </span>
                </div>
                
                <div className="h-fit w-auto p-3 aspect-square rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
                    <User size={20} />
                </div>
            </div>
        </header>
    );
};

export default Header;