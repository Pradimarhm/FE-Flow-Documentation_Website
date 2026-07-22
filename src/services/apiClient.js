import axios from 'axios';
import { useAuthStore } from '../store/authStore'; 

const apiClient = axios.create({
    baseURL: 'https://api.flowforge.app/v1', // Sesuaikan URL backend-mu
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor: Otomatis sisipkan Token di setiap pengiriman request
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

// Response Interceptor: Tangkap error global (seperti 401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response.data, // Langsung ambil properti .data dari axios
    (error) => {
        // Jika token kedaluwarsa atau tidak valid (401)
        if (error.response && error.response.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;