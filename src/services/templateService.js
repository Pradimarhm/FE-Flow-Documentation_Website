import apiClient from './apiClient';

export const templateService = {

    // searcing berdasarkan name
    getTemplates: async (name = "") => {
        const params = name ? { name } : {};
        const response = await apiClient.get('/templates', { params });
        return response;
    },

    // GET /templates
    getTemplates: async () => {
        const response = await apiClient.get('/templates');
        return response;
    },

    // POST /templates
    createTemplate: async (payload) => {
        const response = await apiClient.post('/templates', payload);
        return response;
    },

    // GET /templates/{template}
    getTemplateById: async (templateId) => {
        const response = await apiClient.get(`/templates/${templateId}`);
        return response;
    },

    // PUT /templates/{template}
    updateTemplate: async (templateId, payload) => {
        const response = await apiClient.put(`/templates/${templateId}`, payload);
        return response;
    },

    // DELETE /templates/{template}
    deleteTemplate: async (templateId) => {
        const response = await apiClient.delete(`/templates/${templateId}`);
        return response;
    }
};