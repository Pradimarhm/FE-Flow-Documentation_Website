import apiClient from './apiClient'; // Menggunakan instance axios yang sudah kamu buat

export const authService = {
    // 1. Registrasi
    async register(userData) {
        try {
            // userData mencakup: name, email, password, password_confirmation
            const response = await apiClient.post('/auth/register', userData);
            return response.data; // Mengembalikan struktur data user & access_token
        } catch (error) {
            // Melempar error agar bisa ditangkap oleh komponen UI/Popup
            throw error.response ? error.response.data : { message: "Network Error / Server tidak merespons" };
        }
    },

    // 2. Login
    async login(credentials) {
        try {
            // credentials mencakup: email, password
            const response = await apiClient.post('/auth/login', credentials);
            return response.data; // Mengembalikan struktur data user & access_token
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network Error / Server tidak merespons" };
        }
    }
};