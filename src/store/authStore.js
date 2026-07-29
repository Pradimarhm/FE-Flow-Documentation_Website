import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null, 
            permissions: [], // Tambahkan ini
            isAuthenticated: false,
            
            // Ubah fungsi login untuk menerima permissions
            login: (token, user, permissions) => set({ token, user, permissions, isAuthenticated: true }),
            logout: () => set({ token: null, user: null, permissions: [], isAuthenticated: false }),
            setUser: (user) => set({ user }),
            setPermissions: (permissions) => set({ permissions }),
        }),
        {
            name: 'flowTech-storage', 
        }
    )
);