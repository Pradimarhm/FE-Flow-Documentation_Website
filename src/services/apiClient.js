import axios from 'axios';
import { useAuthStore } from '../store/authStore'; 

const apiClient = axios.create({
    baseURL: 'https://api.flowforge.app/v1', //[cite: 1]
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Flag untuk mencegah infinite loop jika refresh token juga gagal
let isRefreshing = false;
// Array untuk menampung request yang tertunda selama proses refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
        prom.reject(error);
        } else {
        prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 1. Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
    );

// 2. Response Interceptor (Mekanisme Jantung Reactive Refresh)
apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        // Jika error 401 dan belum pernah di-retry
        if (error.response?.status === 401 && !originalRequest._retry) {
        
            // Jika proses refresh sedang berjalan, masukkan request ini ke antrean
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return apiClient(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            // Tandai bahwa request ini sedang di-retry
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // PERINGATAN: Endpoint ini belum ada di dokumenmu![cite: 1]
                // Kamu harus mendefinisikannya di backend.
                const response = await axios.post('https://api.flowforge.app/v1/auth/refresh', {
                // Biasanya kamu harus mengirimkan refresh_token yang valid di sini
                });

                const newToken = response.data.data.token;
                
                // Simpan token baru ke Zustand
                useAuthStore.getState().login(newToken, useAuthStore.getState().user);
                
                // Ubah header untuk request asli yang tertunda
                originalRequest.headers.Authorization = 'Bearer ' + newToken;
                
                // Jalankan ulang semua antrean dengan token baru
                processQueue(null, newToken);
                
                // Jalankan ulang request asli
                return apiClient(originalRequest);
                
            } catch (err) {
                // Jika refresh token gagal (misal: refresh token juga expired), buang antrean dan tendang user
                processQueue(err, null);
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                // Lepaskan flag
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;