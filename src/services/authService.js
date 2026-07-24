// authService.js
import apiClient from './apiClient';

export const authService = {
    async register(userData) {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response; 
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network Error" };
        }
    },
    async login(credentials) {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response; 
        } catch (error) {
            throw error.response ? error.response.data : { message: "Network Error" };
        }
    },
    // Tambahkan ini
    async logout() {
        try {
            const response = await apiClient.post('/auth/logout');
            return response;
        } catch (error) {
             throw error.response ? error.response.data : { message: "Network Error" };
        }
    },
    // Tambahkan ini
    async getProfile() {
        try {
            const response = await apiClient.get('/auth/me');
            return response;
        } catch (error) {
             throw error.response ? error.response.data : { message: "Network Error" };
        }
    }
};