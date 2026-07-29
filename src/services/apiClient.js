// src/services/apiClient.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore'; 

const BASE_URL = import.meta.env.VITE_BASE_API_URL

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 20000,
});

// Request Interceptor: Ambil token dari Zustand atau Fallback ke localStorage
apiClient.interceptors.request.use(
    (config) => {
        let token = useAuthStore.getState().token;
        
        // Fallback jika store Zustand belum selesai rehydrate
        if (!token) {
            try {
                const persisted = localStorage.getItem('auth-storage'); // sesuaikan key Zustand persist lu
                if (persisted) {
                    const parsed = JSON.parse(persisted);
                    token = parsed?.state?.token;
                }
            } catch (e) {
                console.error("Gagal membaca token dari localStorage", e);
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


// Response Interceptor: Langsung kembalikan response.data
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("🔥 ERROR 401 UNAUTHORIZED:", {
                url: error.config?.url,
                method: error.config?.method,
                response: error.response?.data
            });
        }
        return Promise.reject(error);
    }
);

export default apiClient;