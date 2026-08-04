// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null, 
            modules: [], // Menggantikan permissions mentah
            isAuthenticated: false,
            
            login: (token, user, modules = []) => set({ 
                token, 
                user, 
                modules: user?.modules || modules, 
                isAuthenticated: true 
            }),
            
            logout: () => set({ 
                token: null, 
                user: null, 
                modules: [], 
                isAuthenticated: false 
            }),
            
            setUser: (user) => set({ 
                user,
                modules: user?.modules || get().modules 
            }),

            // HELPER FUNCTION: Cek apakah user punya akses ke action tertentu di module tertentu
            // Contoh pakai di komponen: hasPermission('flow-builder', 'create')
            hasPermission: (moduleSlug, action = 'read') => {
                const userModules = get().modules || [];
                const targetModule = userModules.find((m) => m.slug === moduleSlug);
                
                if (!targetModule || !targetModule.permission) return false;
                
                // Jika permission berupa objek { create: true, read: true, ... }
                return Boolean(targetModule.permission[action]);
            },
        }),
        {
            name: 'flowTech-storage', 
        }
    )
);