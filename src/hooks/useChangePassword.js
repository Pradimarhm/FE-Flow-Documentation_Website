import { useState } from 'react';
import { authService } from '../services/authService';

const INITIAL_STATE = {
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
};

export const useChangePassword = (onSuccessCallback) => {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData(INITIAL_STATE);
        setError(null);
        setValidationErrors(null);
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setValidationErrors(null);
        setSuccessMessage('');

        // Validasi Lokal
        if (formData.new_password !== formData.new_password_confirmation) {
            setValidationErrors({
                new_password_confirmation: ['Konfirmasi password baru tidak cocok.']
            });
            setIsLoading(false);
            return;
        }

        try {
            // Memanggil Endpoint PUT /auth/change-password[cite: 10]
            const response = await authService.changePassword(formData);
            
            // Swagger Response 200: { "message": "Password berhasil diubah" }[cite: 10]
            setSuccessMessage(response.message || 'Password berhasil diubah!');
            resetForm();
            
            if (onSuccessCallback) onSuccessCallback();
        } catch (err) {
            // Response Error Handling berdasarkan Swagger:[cite: 10]
            // 400 Bad Request: "Password lama tidak sesuai"[cite: 10]
            // 422 Unprocessable Entity: Error validasi Laravel[cite: 10]
            if (err.errors) {
                setValidationErrors(err.errors);
            } else {
                setError(err.message || 'Gagal mengubah password.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        isLoading,
        error,
        validationErrors,
        successMessage,
        handleInputChange,
        handleSubmit,
        resetForm,
    };
};