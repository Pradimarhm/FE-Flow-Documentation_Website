import apiClient from './apiClient';
import { AUTH_ENDPOINTS } from '../constants/authContants';

export const authService = {
    async register(userData) {
        try {
            return await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network Error" };
        }
    },

    async login(credentials) {
        try {
            return await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network Error" };
        }
    },

    async logout() {
        try {
            return await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network Error" };
        }
    },

    async getProfile() {
        try {
            return await apiClient.get(AUTH_ENDPOINTS.ME);
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network Error" };
        }
    },

    // --- FITUR INTEGRASI FORGOT & RESET PASSWORD ---
    async forgotPassword(data) {
        // Payload: { email }[cite: 10]
        try {
            return await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
        } catch (error) {
            throw error.response ? error.response.data : { message: "Gagal mengirim OTP ke email" };
        }
    },

    async resetPassword(data) {
        // Payload: { email, otp, password, password_confirmation }[cite: 10]
        try {
            return await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
        } catch (error) {
            throw error.response ? error.response.data : { message: "Gagal mereset password" };
        }
    },

    async changePassword(data) {
        // Payload: { current_password, new_password, new_password_confirmation }[cite: 10]
        try {
            return await apiClient.put(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
        } catch (error) {
            throw error.response ? error.response.data : { message: "Gagal mengubah password" };
        }
    }
};