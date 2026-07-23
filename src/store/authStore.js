import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null, // Pastikan ada state user
            isAuthenticated: false,
            
            login: (token, user) => set({ token, user, isAuthenticated: true }),
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
            setUser: (user) => set({ user }),
        }),
        {
        name: 'flowTech-storage', 
        }
    )
);